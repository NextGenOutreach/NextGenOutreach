import cron from 'node-cron';
import prisma from './database';
import { logger } from './logger';
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
          logger.warn(`[cron] ALERT: Campaign "${campaign.name}" (${campaign.id}) is stale. No activity in 24h.`);
          staleCount++;
        }
      }

      if (staleCount > 0) logger.info(`[cron] Identified ${staleCount} stale campaign(s)`);
    } catch (err) {
      logger.error('[cron] Stale check failed:', { error: err });
    }
  });

  cron.schedule('0 23 * * *', async () => {
    try {
      await runDailyComplianceCheck();
      logger.info('[cron] Daily compliance checks completed');
    } catch (err) {
      logger.error('[cron] Compliance check failed:', { error: err });
    }
  });

  cron.schedule('0 0 1 * *', async () => {
    try {
      const reps = await prisma.repProfile.findMany({ select: { id: true } });
      for (const rep of reps) {
        await calculateRepTrustScore(rep.id);
        await updateRepTier(rep.id);
      }

      logger.info('[cron] Monthly Trust Score & Tier recalculation completed');
      await calculateMonthlyPayouts();
      logger.info('[cron] Monthly payout calculation completed');
    } catch (err) {
      logger.error('[cron] Monthly maintenance failed:', { error: err });
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
          logger.info(`[cron] AUTO-ASSIGN: Campaign "${campaign.name}" assigned to rep ${bestRep.id} (Score: ${bestRep.score})`);
        }
      }
    } catch (err) {
      logger.error('[cron] Auto-assignment failed:', { error: err });
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
        logger.info(`[cron] Auto-completed ${result.count} expired campaign(s)`);
      }
    } catch (err) {
      logger.error('[cron] Failed to auto-complete campaigns:', { error: err });
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
        logger.info(`[cron] Activated ${result.count} campaign(s)`);
      }
    } catch (err) {
      logger.error('[cron] Failed to activate campaigns:', { error: err });
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
        logger.info(`[cron] Generated ${createdCount} weekly earning record(s)`);
      }
    } catch (err) {
      logger.error('[cron] Failed to generate earnings:', { error: err });
    }
  });

  // ─── Proxy health check — daily at 06:00 ──────────────────────────────────
  cron.schedule('0 6 * * *', async () => {
    try {
      const proxies: Array<{ id: string; host: string; port: number }> = await (prisma as any).proxy.findMany({
        where: { status: { not: 'DEAD' } },
        select: { id: true, host: true, port: true },
      });

      let dead = 0;
      for (const proxy of proxies) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          await fetch(`http://${proxy.host}:${proxy.port}`, { signal: controller.signal });
          clearTimeout(timeout);
          await (prisma as any).proxy.update({
            where: { id: proxy.id },
            data: { lastChecked: new Date() },
          });
        } catch {
          await (prisma as any).proxy.update({
            where: { id: proxy.id },
            data: { status: 'DEAD', lastChecked: new Date() },
          });
          dead++;
          logger.warn(`[cron] Proxy ${proxy.id} (${proxy.host}:${proxy.port}) marked DEAD`);
        }
      }

      logger.info(`[cron] Proxy health check complete — ${dead} dead of ${proxies.length}`);
    } catch (err) {
      logger.error('[cron] Proxy health check failed:', { error: err });
    }
  });

  // ─── LinkedIn health score recalculation — nightly at 02:00 ──────────────
  cron.schedule('0 2 * * *', async () => {
    try {
      const reps: Array<{ id: string; campaigns: Array<{ activities: Array<{ activityType: string; occurredAt: Date }> }> }> =
        await prisma.repProfile.findMany({
          include: {
            campaigns: {
              include: {
                activities: {
                  where: { occurredAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                  select: { activityType: true, occurredAt: true },
                },
              },
            },
          },
        });

      for (const rep of reps) {
        const sent = rep.campaigns.flatMap((c) =>
          c.activities.filter((a) => a.activityType === 'CONNECTION_SENT')
        ).length;
        const accepted = rep.campaigns.flatMap((c) =>
          c.activities.filter((a) => a.activityType === 'CONNECTION_ACCEPTED')
        ).length;
        const rate = sent > 0 ? accepted / sent : null;

        const existing: any = await (prisma as any).linkedInHealthScore.findUnique({ where: { repId: rep.id } });
        if (existing) {
          const score = Math.max(0, Math.min(100, existing.score + (rate !== null && rate < 0.25 ? -5 : 0)));
          await (prisma as any).linkedInHealthScore.update({
            where: { repId: rep.id },
            data: {
              acceptanceRate7d: rate !== null ? rate : undefined,
              score,
              lastCalculatedAt: new Date(),
            },
          });
        }
      }

      logger.info('[cron] LinkedIn health scores updated');
    } catch (err) {
      logger.error('[cron] LinkedIn health recalc failed:', { error: err });
    }
  });

  logger.info('[cron] Cron jobs started');
}
