import prisma from '../lib/database';
import { RepTier } from '@prisma/client';
import { logger } from '../lib/logger';

const TIER_MULTIPLIERS: Record<RepTier, number> = {
  BRONZE: 1.0,
  SILVER: 1.1,
  GOLD: 1.2,
  ELITE: 1.3,
};

const BASE_DAILY_RATE = 25; // $25 per active day

export async function calculateMonthlyPayouts() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setSeconds(endOfMonth.getSeconds() - 1);

  const reps = await prisma.repProfile.findMany({
    include: {
      dailyReports: {
        where: {
          reportDate: { gte: startOfMonth, lte: endOfMonth },
          status: 'SUBMITTED',
        },
      },
      campaigns: {
        where: { status: 'ACTIVE' as any },
        include: { client: true },
      },
    },
  });

  logger.info(`[Billing] Calculating payouts for ${reps.length} reps`);

  for (const rep of reps) {
    const activeDays = rep.dailyReports.length;
    if (activeDays === 0) continue;

    const multiplier = TIER_MULTIPLIERS[rep.tier];
    let totalAmount = activeDays * BASE_DAILY_RATE * multiplier;

    // Add performance bonuses (mock logic for now)
    const replyRate = 0.09; // Assuming they hit >7% bonus from Section 7.3
    if (replyRate >= 0.07) {
      totalAmount += totalAmount * 0.10;
    }

    // Create payout record
    // We'll create one per campaign they worked on, or one total
    // Section 1.4 says payouts collection: payoutId, repId, period, amount, status
    
    // Check if payout already exists for this month
    const existing = await prisma.repEarning.findFirst({
      where: {
        repId: rep.id,
        periodStart: startOfMonth,
      },
    });

    if (existing) continue;

    // For simplicity, we'll associate it with the first active campaign found
    const campaignId = rep.campaigns[0]?.id;
    const clientId = rep.campaigns[0]?.clientId;

    if (!campaignId || !clientId) continue;

    await prisma.repEarning.create({
      data: {
        repId: rep.id,
        campaignId,
        clientId,
        amountUsd: totalAmount,
        periodStart: startOfMonth,
        periodEnd: endOfMonth,
        status: 'pending',
      },
    });
  }
}
