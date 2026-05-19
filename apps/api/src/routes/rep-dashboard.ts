import express, { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ok } from '../lib/response';
import { requireRole, FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import prisma from '../lib/database';

const router = express.Router();

// ─── Tasks ────────────────────────────────────────────────────────────────────
// A "task" for a rep = an active campaign assigned to them.
// The campaign's CampaignActivities feed the completed count.
router.get('/tasks', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const repProfile = await prisma.repProfile.findUnique({ where: { userId: req.user!.id } });
  if (!repProfile) return ok(res, []);

  const campaigns = await prisma.campaign.findMany({
    where: { repId: repProfile.id },
    orderBy: { createdAt: 'desc' },
    include: {
      client: {
        include: { user: { select: { email: true } } },
      },
      browserSessions: { orderBy: { lastActiveAt: 'desc' }, take: 1 },
      _count: { select: { activities: true } },
    },
  });

  const tasks = campaigns.map((c: typeof campaigns[number]) => ({
    id: c.id,
    campaignId: c.id,
    campaignName: c.name,
    clientName: c.client.companyName ?? c.client.user.email,
    type: c.type.toLowerCase(),
    status: c.status.toLowerCase(),
    dailyLimit: c.dailyLimit,
    completedCount: c._count.activities,
    prospectCount: c.dailyLimit,
    startDate: c.startDate,
    endDate: c.endDate,
    notes: c.notes ?? null,
    technicalStatus: c.browserSessions[0]?.status || 'IDLE',
  }));

  return ok(res, tasks);
}));

// ─── Earnings ─────────────────────────────────────────────────────────────────
router.get('/earnings', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const repProfile = await prisma.repProfile.findUnique({ where: { userId: req.user!.id } });
  if (!repProfile) return ok(res, { earnings: [], monthly: [] });

  const { status } = req.query as { status?: string };
  const where = { repId: repProfile.id } as { repId: string; status?: string };
  if (status && status !== 'all') where.status = status;

  const earnings = await prisma.repEarning.findMany({
    where,
    orderBy: { periodEnd: 'desc' },
    include: {
      campaign: { select: { name: true } },
      client: {
        include: { user: { select: { email: true } } },
      },
    },
  });

  const rows = earnings.map((e: typeof earnings[number]) => ({
    id: e.id,
    campaignId: e.campaignId,
    campaignName: e.campaign.name,
    clientName: e.client.companyName ?? e.client.user.email,
    amount: Number(e.amountUsd),
    currency: 'USD',
    periodStart: e.periodStart.toISOString(),
    periodEnd: e.periodEnd.toISOString(),
    status: e.status,
    paidAt: e.paidAt?.toISOString() ?? null,
  }));

  // Aggregate by month for the chart
  const byMonth: Record<string, { earnings: number; campaigns: Set<string> }> = {};
  earnings.forEach((e: typeof earnings[number]) => {
    const month = e.periodStart.toISOString().slice(0, 7);
    if (!byMonth[month]) byMonth[month] = { earnings: 0, campaigns: new Set() };
    byMonth[month].earnings += Number(e.amountUsd);
    byMonth[month].campaigns.add(e.campaignId);
  });

  const monthly = Object.entries(byMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)
    .map(([month, data]) => ({
      month,
      earnings: data.earnings,
      campaigns: data.campaigns.size,
    }));

  return ok(res, { earnings: rows, monthly });
}));

export default router;
