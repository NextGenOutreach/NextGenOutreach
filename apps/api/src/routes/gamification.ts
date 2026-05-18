import express, { Response } from 'express';
import prisma from '../lib/database';
import { ok, created, badRequest, notFound } from '../lib/response';
import { requireRole, FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';

const router = express.Router();

// ─── GET /gamification/leaderboard ───────────────────────────────────────────
router.get('/leaderboard', async (_req: FirebaseAuthRequest, res: Response) => {
  const reps = await (prisma as any).repProfile.findMany({
    select: {
      id: true,
      trustScore: true,
      tier: true,
      user: { select: { email: true } },
      repBadges: { select: { badge: true, awardedAt: true } },
    },
    orderBy: { trustScore: 'desc' },
    take: 20,
  });

  const replyRates: any[] = await (prisma as any).activityLog?.findMany
    ? []
    : [];

  return ok(res, reps.map((r: any, i: number) => ({
    rank: i + 1,
    repId: r.id,
    email: r.user.email,
    trustScore: r.trustScore,
    tier: r.tier,
    badges: r.repBadges.map((b: any) => b.badge),
  })));
});

// ─── GET /gamification/badges ─────────────────────────────────────────────────
router.get('/badges', async (_req: FirebaseAuthRequest, res: Response) => {
  const badges: any[] = await (prisma as any).badge.findMany({ orderBy: { name: 'asc' } });
  return ok(res, badges);
});

// ─── GET /gamification/my-badges ─────────────────────────────────────────────
router.get('/my-badges', requireRole('rep'), async (req: FirebaseAuthRequest, res: Response) => {
  const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
  if (!rp) return ok(res, []);

  const repBadges: any[] = await (prisma as any).repBadge.findMany({
    where: { repId: rp.id },
    include: { badge: true },
    orderBy: { awardedAt: 'desc' },
  });

  return ok(res, repBadges);
});

// ─── POST /gamification/badges  (admin seeds/creates badge definitions) ───────
router.post('/badges', requireRole('admin', 'super_admin'), async (req: FirebaseAuthRequest, res: Response) => {
  const { key, name, description, icon } = req.body as {
    key: string; name: string; description: string; icon: string;
  };

  if (!key || !name || !icon) return badRequest(res, 'key, name, icon required');

  const badge = await (prisma as any).badge.upsert({
    where: { key },
    create: { key, name, description: description ?? '', icon },
    update: { name, description: description ?? '', icon },
  });

  return created(res, badge);
});

// ─── POST /gamification/award ─────────────────────────────────────────────────
router.post('/award', requireRole('admin', 'super_admin'), async (req: FirebaseAuthRequest, res: Response) => {
  const { repId, badgeKey } = req.body as { repId: string; badgeKey: string };
  if (!repId || !badgeKey) return badRequest(res, 'repId and badgeKey required');

  const badge: any = await (prisma as any).badge.findUnique({ where: { key: badgeKey } });
  if (!badge) return notFound(res, 'Badge not found');

  const repBadge = await (prisma as any).repBadge.upsert({
    where: { repId_badgeId: { repId, badgeId: badge.id } },
    create: { repId, badgeId: badge.id },
    update: {},
  });

  return created(res, repBadge);
});

// ─── GET /gamification/progress/:repId ───────────────────────────────────────
router.get('/progress/:repId?', requireRole('rep', 'admin', 'super_admin'), async (req: FirebaseAuthRequest, res: Response) => {
  let repId = req.params.repId;
  if (req.user!.role === 'rep' || !repId) {
    const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
    if (!rp) return ok(res, null);
    repId = rp.id;
  }

  const rep: any = await (prisma as any).repProfile.findUnique({
    where: { id: repId },
    include: {
      repBadges: { include: { badge: true } },
      earnings: { orderBy: { periodEnd: 'desc' }, take: 30 },
      linkedInHealth: true,
    },
  });

  if (!rep) return notFound(res, 'Rep not found');

  const TIER_THRESHOLDS = {
    BRONZE: { trustScore: 0, nextTier: 'SILVER', required: 75 },
    SILVER: { trustScore: 75, nextTier: 'GOLD', required: 85 },
    GOLD: { trustScore: 85, nextTier: 'ELITE', required: 95 },
    ELITE: { trustScore: 95, nextTier: null, required: 100 },
  } as const;

  const threshold = TIER_THRESHOLDS[rep.tier as keyof typeof TIER_THRESHOLDS];
  const monthlyEarnings = rep.earnings.reduce((sum: number, e: any) => sum + Number(e.amountUsd), 0);

  return ok(res, {
    repId,
    tier: rep.tier,
    trustScore: rep.trustScore,
    nextTier: threshold.nextTier,
    trustScoreNeeded: Math.max(0, threshold.required - rep.trustScore),
    badges: rep.repBadges.map((rb: any) => rb.badge),
    monthlyEarnings,
    linkedInHealth: rep.linkedInHealth,
  });
});

export default router;
