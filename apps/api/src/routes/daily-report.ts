import express, { Response } from 'express';
import prisma from '../lib/database';
import { ok, created, badRequest, notFound } from '../lib/response';
import { requireRole, FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// ─── GET /daily-report/prefill  (auto-populated from activity log) ─────────────
router.get('/prefill', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
  if (!rp) return badRequest(res, 'Rep profile not found');

  const { campaignId, date } = req.query as { campaignId?: string; date?: string };
  if (!campaignId) return badRequest(res, 'campaignId required');

  const reportDate = date ? new Date(date) : new Date();
  const dayStart = new Date(reportDate.setHours(0, 0, 0, 0));
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const logs: Array<{ actionType: string }> = await (prisma as any).activityLog.findMany({
    where: {
      repId: rp.id,
      campaignId,
      loggedAt: { gte: dayStart, lt: dayEnd },
    },
    select: { actionType: true },
  });

  const counts: Record<string, number> = {};
  for (const l of logs) {
    counts[l.actionType] = (counts[l.actionType] ?? 0) + 1;
  }

  return ok(res, {
    reportDate: dayStart.toISOString(),
    campaignId,
    connectionsSent: counts['CONNECTION_SENT'] ?? 0,
    messagesSent: (counts['DM_SENT'] ?? 0),
    repliesReceived: counts['DM_REPLIED'] ?? 0,
    meetingsBooked: counts['MEETING_BOOKED'] ?? 0,
    rawCounts: counts,
    source: 'activity_log',
  });
}));

// ─── GET /daily-report  (list rep's submitted reports) ────────────────────────
router.get('/', requireRole('rep', 'admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const role = req.user!.role;
  let repId: string | undefined;

  if (role === 'rep') {
    const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
    if (!rp) return ok(res, []);
    repId = rp.id;
  } else {
    repId = req.query.repId as string | undefined;
  }

  const { campaignId } = req.query as { campaignId?: string };

  const reports = await prisma.dailyReport.findMany({
    where: {
      ...(repId && { repId }),
      ...(campaignId && { campaignId }),
    },
    orderBy: { reportDate: 'desc' },
    take: 60,
  });

  return ok(res, reports);
}));

// ─── POST /daily-report  (submit report; flags mismatch vs activity log) ──────
router.post('/', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
  if (!rp) return badRequest(res, 'Rep profile not found');

  const {
    campaignId,
    connectionsSent,
    messagesSent,
    repliesReceived,
    meetingsBooked,
    notes,
    accountHealth,
    reportDate,
  } = req.body as {
    campaignId: string;
    connectionsSent: number;
    messagesSent: number;
    repliesReceived: number;
    meetingsBooked: number;
    notes?: string;
    accountHealth?: string;
    reportDate?: string;
  };

  if (!campaignId) return badRequest(res, 'campaignId required');

  const targetDate = reportDate ? new Date(reportDate) : new Date();
  const dayStart = new Date(new Date(targetDate).setHours(0, 0, 0, 0));
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const logs: Array<{ actionType: string }> = await (prisma as any).activityLog.findMany({
    where: {
      repId: rp.id,
      campaignId,
      loggedAt: { gte: dayStart, lt: dayEnd },
    },
    select: { actionType: true },
  });

  const logCounts: Record<string, number> = {};
  for (const l of logs) {
    logCounts[l.actionType] = (logCounts[l.actionType] ?? 0) + 1;
  }

  const logConnections = logCounts['CONNECTION_SENT'] ?? 0;
  const logMessages = logCounts['DM_SENT'] ?? 0;

  const mismatch =
    Math.abs(connectionsSent - logConnections) > 2 ||
    Math.abs(messagesSent - logMessages) > 2;

  const existing = await prisma.dailyReport.findUnique({
    where: { repId_campaignId_reportDate: { repId: rp.id, campaignId, reportDate: dayStart } },
  });

  if (existing) {
    const updated = await prisma.dailyReport.update({
      where: { id: existing.id },
      data: {
        connectionsSent,
        messagesSent,
        repliesReceived,
        meetingsBooked,
        notes: [
          notes ?? '',
          mismatch ? '[FLAG: numbers differ from platform activity log — ops review needed]' : '',
          accountHealth ? `Account health: ${accountHealth}` : '',
        ].filter(Boolean).join('\n'),
        status: 'SUBMITTED',
        mismatchFlag: mismatch, // MEDIUM FIX: Use structured flag
      },
    });
    return ok(res, { ...updated, mismatch });
  }

  const report = await prisma.dailyReport.create({
    data: {
      repId: rp.id,
      campaignId,
      reportDate: dayStart,
      connectionsSent,
      messagesSent,
      repliesReceived,
      meetingsBooked,
      notes: [
        notes ?? '',
        mismatch ? '[FLAG: numbers differ from platform activity log — ops review needed]' : '',
        accountHealth ? `Account health: ${accountHealth}` : '',
      ].filter(Boolean).join('\n'),
      status: 'SUBMITTED',
      mismatchFlag: mismatch, // MEDIUM FIX: Use structured flag
    },
  });

  return created(res, { ...report, mismatch });
}));

// ─── GET /daily-report/flagged  (admin: reports with mismatch flags) ───────────
router.get('/flagged', requireRole('admin', 'super_admin'), asyncHandler(async (_req: FirebaseAuthRequest, res: Response) => {
  // MEDIUM FIX: Use structured mismatchFlag instead of text parsing
  const reports = await prisma.dailyReport.findMany({
    where: { mismatchFlag: true },
    orderBy: { reportDate: 'desc' },
    include: {
      rep: { include: { user: { select: { email: true } } } },
      campaign: { select: { name: true } },
    },
  });

  return ok(res, reports);
}));

export default router;
