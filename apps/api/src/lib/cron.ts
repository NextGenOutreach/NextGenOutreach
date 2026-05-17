import cron from 'node-cron';
import prisma from './database';
import { calculateMatchScore } from '../services/matching.service';
import { runDailyComplianceCheck } from '../services/compliance.service';
import { calculateRepTrustScore, updateRepTier } from '../services/rep.service';
import { calculateMonthlyPayouts } from '../services/billing.service';

export function startCronJobs() {
  // ─── Operational Logic ──────────────────────────────────────────────────────

  // Every 4 hours: check for stale active campaigns (no activity in 24h)
  cron.schedule('0 */4 * * *', async () => {
    try {
      const activeCampaigns = await prisma.campaign.findMany({
        where: { status: 'ACTIVE' as any },
        include: { activities: { orderBy: { occurredAt: 'desc' }, take: 1 } },
      });

      const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
      let staleCount = 0;

      for (const campaign of activeCampaigns) {
        const lastActivity = campaign.activities[0]?.occurredAt;
        if (!lastActivity || lastActivity < threshold) {
          console.warn(`[cron] ALERT: Campaign "${campaign.name}" (${campaign.id}) is stale. No activity in 24h.`);
          staleCount++;
        }
      }
      if (staleCount > 0) console.log(`[cron] Identified ${staleCount} stale campaign(s)`);
    } catch (err) {
      console.error('[cron] Stale check failed:', err);
    }
  });

  // Daily at 23:00: Run compliance checks (Section 6.3)
  cron.schedule('0 23 * * *', async () => {
    try {
      await runDailyComplianceCheck();
      console.log('[cron] Daily compliance checks completed');
    } catch (err) {
      console.error('[cron] Compliance check failed:', err);
    }
  });

  // 1st of every month at 00:00: Trust Score & Tier Review (Section 5.4, 5.5)
  cron.schedule('0 0 1 * *', async () => {
    try {
      const reps = await prisma.repProfile.findMany({ select: { id: true } });
      for (const rep of reps) {
        await calculateRepTrustScore(rep.id);
        await updateRepTier(rep.id);
      }
      console.log('[cron] Monthly Trust Score & Tier recalculation completed');
      
      // Also calculate payouts for previous month (Section 7.3)
      await calculateMonthlyPayouts();
      console.log('[cron] Monthly payout calculation completed');
    } catch (err) {
      console.error('[cron] Monthly maintenance failed:', err);
    }
  });

  // ─── Campaign Matching & Lifecycle ──────────────────────────────────────────

  // Every hour: auto-assign top rep for pending campaigns if score > 80
  cron.schedule('30 * * * *', async () => {
...
  });

  console.log('✅ Cron jobs started');
}

  // Every hour: auto-assign top rep for pending campaigns if score > 80
  cron.schedule('30 * * * *', async () => {
    try {
      const pendingCampaigns = await prisma.campaign.findMany({
        where: { status: 'PENDING_MATCH' as any, repId: null },
      });

      for (const campaign of pendingCampaigns) {
        const availableReps = await prisma.repProfile.findMany({
          where: { idVerified: true, availabilityStatus: 'available' },
          include: { _count: { select: { campaigns: true } } }
        });

        const prefs = {
          targetIndustry: (campaign.targetIcp as any)?.industry,
          targetCountry: (campaign.targetIcp as any)?.country,
        };

        const matches = availableReps
          .map((r: any) => ({
            id: r.id,
            score: calculateMatchScore(r, prefs as any).score,
            load: r._count.campaigns
          }))
          .filter((m: any) => m.score >= 80 && m.load < 3)
          .sort((a: any, b: any) => b.score - a.score);

        if (matches.length > 0) {
          const bestRep = matches[0];
          await prisma.campaign.update({
            where: { id: campaign.id },
            data: { 
              repId: bestRep.id,
              status: 'ACTIVE' as any,
              startDate: new Date()
            }
          });
          console.log(`[cron] AUTO-ASSIGN: Campaign "${campaign.name}" assigned to rep ${bestRep.id} (Score: ${bestRep.score})`);
        }
      }
    } catch (err) {
      console.error('[cron] Auto-assignment failed:', err);
    }
  });

  // Every hour: auto-complete campaigns past their end date
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await prisma.campaign.updateMany({
        where: {
          status: 'ACTIVE' as any,
          endDate: { lt: new Date() },
        },
        data: { status: 'COMPLETED' as any },
      });
      if (result.count > 0) {
        console.log(`[cron] Auto-completed ${result.count} expired campaign(s)`);
      }
    } catch (err) {
      console.error('[cron] Failed to auto-complete campaigns:', err);
    }
  });

  // Every hour: activate campaigns that have reached their start date
  cron.schedule('5 * * * *', async () => {
    try {
      const result = await prisma.campaign.updateMany({
        where: {
          status: 'PENDING_MATCH' as any,
          startDate: { lte: new Date() },
          repId: { not: null },
        },
        data: { status: 'ACTIVE' as any },
      });
      if (result.count > 0) {
        console.log(`[cron] Activated ${result.count} campaign(s)`);
      }
    } catch (err) {
      console.error('[cron] Failed to activate campaigns:', err);
    }
  });

  // Every Monday at 01:00: generate weekly earnings for active campaigns
  cron.schedule('0 1 * * 1', async () => {
    try {
      const activeCampaigns = await prisma.campaign.findMany({
        where: {
          status: 'ACTIVE' as any,
          repId: { not: null },
        },
        include: {
          rep: { select: { id: true, hourlyRateUsd: true } },
          client: { select: { id: true } },
        },
      });

      let createdCount = 0;
      for (const campaign of activeCampaigns) {
        if (!campaign.rep?.hourlyRateUsd) continue;

        // Simple logic: 10 hours per week for an active campaign
        const amount = Number(campaign.rep.hourlyRateUsd) * 10;
        
        await prisma.repEarning.create({
          data: {
            repId: campaign.rep.id,
            campaignId: campaign.id,
            clientId: campaign.client.id,
            amountUsd: amount,
            periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            periodEnd: new Date(),
            status: 'pending',
          },
        });
        createdCount++;
      }
      
      if (createdCount > 0) {
        console.log(`[cron] Generated ${createdCount} weekly earning record(s)`);
      }
    } catch (err) {
      console.error('[cron] Failed to generate earnings:', err);
    }
  });

  console.log('✅ Cron jobs started');
}
