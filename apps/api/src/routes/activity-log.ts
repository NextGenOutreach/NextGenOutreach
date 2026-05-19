import express, { Response } from 'express';
import prisma from '../lib/database';
import { ok, created, badRequest } from '../lib/response';
import { requireRole, FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { ActivityType } from '@prisma/client';

const router = express.Router();

// MEDIUM FIX: Valid action types
const VALID_ACTION_TYPES: string[] = Object.values(ActivityType);

// ─── POST /activity-log  (rep logs an action) ─────────────────────────────────
router.post('/', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
  if (!rp) return badRequest(res, 'Rep profile not found');

  const { campaignId, prospectId, actionType, metadata } = req.body as {
    campaignId: string;
    prospectId?: string;
    actionType: string;
    metadata?: Record<string, unknown>;
  };

  if (!campaignId || !actionType) return badRequest(res, 'campaignId and actionType are required');
  
  // MEDIUM FIX: Validate actionType against enum
  if (!VALID_ACTION_TYPES.includes(actionType)) {
    return badRequest(res, `Invalid actionType. Must be one of: ${VALID_ACTION_TYPES.join(', ')}`);
  }

  const log = await (prisma as any).activityLog.create({
    data: {
      repId: rp.id,
      campaignId,
      prospectId: prospectId ?? null,
      actionType,
      metadata: metadata ?? null,
    },
  });

  return created(res, log);
}));

// ─── GET /activity-log  (rep: own today; admin: all) ─────────────────────────
router.get('/', asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const role = req.user!.role;
  const { campaignId, date } = req.query as { campaignId?: string; date?: string };

  let repId: string | undefined;
  if (role === 'rep') {
    const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
    if (!rp) return ok(res, []);
    repId = rp.id;
  }

  const dayStart = date ? new Date(date) : new Date(new Date().setHours(0, 0, 0, 0));
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const logs = await (prisma as any).activityLog.findMany({
    where: {
      ...(repId && { repId }),
      ...(campaignId && { campaignId }),
      loggedAt: { gte: dayStart, lt: dayEnd },
    },
    orderBy: { loggedAt: 'asc' },
  });

  return ok(res, logs);
}));

// ─── GET /activity-log/summary  (rep's today count by action type) ─────────────
router.get('/summary', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
  if (!rp) return ok(res, {});

  const { campaignId } = req.query as { campaignId?: string };
  const dayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const logs: Array<{ actionType: string }> = await (prisma as any).activityLog.findMany({
    where: {
      repId: rp.id,
      ...(campaignId && { campaignId }),
      loggedAt: { gte: dayStart, lt: dayEnd },
    },
    select: { actionType: true },
  });

  const summary: Record<string, number> = {};
  for (const l of logs) {
    summary[l.actionType] = (summary[l.actionType] ?? 0) + 1;
  }

  return ok(res, summary);
}));

export default router;
