import cron from 'node-cron';
import prisma from './database';
import { calculateMatchScore } from '../services/matching.service';
import { runDailyComplianceCheck } from '../services/compliance.service';
import { calculateRepTrustScore, updateRepTier } from '../services/rep.service';
import { calculateMonthlyPayouts } from '../services/billing.service';

export function startCronJobs() {
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

  cron.schedule('0 23 * * *', async () => {
    try {
      await runDailyComplianceCheck();
      console.log('[cron] Daily compliance checks completed');
    } catch (err) {
      console.error('[cron] Compliance check failed:', err);
    }
  });

  cron.schedule('0 0 1 * *', async () => {
    try {
      const reps = await prisma.repProfile.findMany({ select: { id: true } });
      for (const rep of reps) {
        await calculateRepTrustScore(rep.id);
        await updateRepTier(rep.id);
      }

      console.log('[cron] Monthly Trust Score & Tier recalculation completed');
      await calculateMonthlyPayouts();
      console.log('[cron] Monthly payout calculation completed');
    } catch (err) {
      console.error('[cron] Monthly maintenance failed:', err);
    }
  });

  cron.schedule('30 * * * *', async () => {
    try {
      const pendingCampaigns = await prisma.campaign.findMany({
        where: { status: 'PENDING_MATCH' as any, repId: null },
      });

      for (const campaign of pendingCampaigns) {
        const availableReps = await prisma.repProfile.findMany({
          where: { idVerified: true, availabilityStatus: 'available' },
          include: { _count: { select: { campaigns: true } } },
        });

        const prefs = {
          targetIndustry: (campaign.targetIcp as any)?.industry,
          targetCountry: (campaign.targetIcp as any)?.country,
        };

        const matches = availableReps
          .map((rep: any) => ({
            id: rep.id,
            score: calculateMatchScore(rep, prefs as any).score,
            load: rep._count.campaigns,
          }))
          .filter((match: any) => match.score >= 80 && match.load < 3)
          .sort((a: any, b: any) => b.score - a.score);

        if (matches.length > 0) {
          const bestRep = matches[0];
          await prisma.campaign.update({
            where: { id: campaign.id },
            data: {
              repId: bestRep.id,
              status: 'ACTIVE' as any,
              startDate: new Date(),
            },
          });
          console.log(`[cron] AUTO-ASSIGN: Campaign "${campaign.name}" assigned to rep ${bestRep.id} (Score: ${bestRep.score})`);
        }
      }
    } catch (err) {
      console.error('[cron] Auto-assignment failed:', err);
    }
  });

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

        await prisma.repEarning.create({
          data: {
            repId: campaign.rep.id,
            campaignId: campaign.id,
            clientId: campaign.client.id,
            amountUsd: Number(campaign.rep.hourlyRateUsd) * 10,
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

  console.log('[cron] Cron jobs started');
}
