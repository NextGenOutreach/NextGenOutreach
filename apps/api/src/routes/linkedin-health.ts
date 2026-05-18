import express, { Response } from 'express';
import prisma from '../lib/database';
import { ok, notFound } from '../lib/response';
import { requireRole, FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';

const router = express.Router();

function computeScore(data: {
  acceptanceRate7d?: number | null;
  daysSinceLastRestriction?: number | null;
  warmupDay: number;
  recentWarning: boolean;
  connectionVelocityAlert: boolean;
  profileCompletenessScore?: number | null;
}): number {
  let score = 70;

  if (data.daysSinceLastRestriction !== null && data.daysSinceLastRestriction !== undefined) {
    if (data.daysSinceLastRestriction >= 90) score += 20;
    else if (data.daysSinceLastRestriction >= 30) score += 10;
    else if (data.daysSinceLastRestriction < 7) score -= 20;
  }

  if (data.acceptanceRate7d !== null && data.acceptanceRate7d !== undefined) {
    if (data.acceptanceRate7d >= 0.35) score += 10;
    else if (data.acceptanceRate7d < 0.25) score -= 15;
  }

  if (data.recentWarning) score -= 20;
  if (data.connectionVelocityAlert) score -= 10;

  if (data.profileCompletenessScore !== null && data.profileCompletenessScore !== undefined) {
    score += Math.round((data.profileCompletenessScore / 100) * 5);
  }

  return Math.max(0, Math.min(100, score));
}

function statusLabel(score: number): 'healthy' | 'stable' | 'caution' | 'at_risk' {
  if (score >= 90) return 'healthy';
  if (score >= 70) return 'stable';
  if (score >= 50) return 'caution';
  return 'at_risk';
}

// ─── GET /linkedin-health  ────────────────────────────────────────────────────
router.get('/', async (req: FirebaseAuthRequest, res: Response) => {
  const role = req.user!.role;

  if (role === 'rep') {
    const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
    if (!rp) return ok(res, null);

    let record = await (prisma as any).linkedInHealthScore.findUnique({ where: { repId: rp.id } });
    if (!record) {
      record = await (prisma as any).linkedInHealthScore.create({
        data: { repId: rp.id, score: 70, warmupDay: rp.warmupDay ?? 0 },
      });
    }

    return ok(res, { ...record, status: statusLabel(record.score) });
  }

  const records: any[] = await (prisma as any).linkedInHealthScore.findMany({
    include: { rep: { include: { user: { select: { email: true } } } } },
    orderBy: { score: 'asc' },
  });

  return ok(res, records.map((r: any) => ({ ...r, status: statusLabel(r.score) })));
});

// ─── PATCH /linkedin-health  (rep self-reports or admin updates) ──────────────
router.patch('/', requireRole('rep', 'admin', 'super_admin'), async (req: FirebaseAuthRequest, res: Response) => {
  const {
    repId: bodyRepId,
    acceptanceRate7d,
    daysSinceLastRestriction,
    warmupDay,
    profileCompletenessScore,
    recentWarning,
    connectionVelocityAlert,
  } = req.body as {
    repId?: string;
    acceptanceRate7d?: number;
    daysSinceLastRestriction?: number;
    warmupDay?: number;
    profileCompletenessScore?: number;
    recentWarning?: boolean;
    connectionVelocityAlert?: boolean;
  };

  let repId = bodyRepId;
  if (req.user!.role === 'rep') {
    const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
    if (!rp) return notFound(res, 'Rep profile not found');
    repId = rp.id;
  }

  if (!repId) {
    const { badRequest } = await import('../lib/response');
    return badRequest(res, 'repId required');
  }

  const existing = await (prisma as any).linkedInHealthScore.findUnique({ where: { repId } });
  const currentData = existing ?? {
    acceptanceRate7d: null,
    daysSinceLastRestriction: null,
    warmupDay: 0,
    recentWarning: false,
    connectionVelocityAlert: false,
    profileCompletenessScore: null,
  };

  const mergedData = {
    acceptanceRate7d: acceptanceRate7d ?? currentData.acceptanceRate7d,
    daysSinceLastRestriction: daysSinceLastRestriction ?? currentData.daysSinceLastRestriction,
    warmupDay: warmupDay ?? currentData.warmupDay,
    profileCompletenessScore: profileCompletenessScore ?? currentData.profileCompletenessScore,
    recentWarning: recentWarning ?? currentData.recentWarning,
    connectionVelocityAlert: connectionVelocityAlert ?? currentData.connectionVelocityAlert,
  };

  const newScore = computeScore(mergedData);

  const record = await (prisma as any).linkedInHealthScore.upsert({
    where: { repId },
    create: { repId, ...mergedData, score: newScore, lastCalculatedAt: new Date() },
    update: { ...mergedData, score: newScore, lastCalculatedAt: new Date() },
  });

  return ok(res, { ...record, status: statusLabel(record.score) });
});

export default router;
