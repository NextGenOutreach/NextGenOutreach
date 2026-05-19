import express, { Response } from 'express';
import prisma from '../lib/database';
import { ok, created, badRequest, notFound } from '../lib/response';
import { requireRole, FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

const DAY_4_OFFSET_MS = 4 * 24 * 60 * 60 * 1000;
const DAY_8_OFFSET_MS = 8 * 24 * 60 * 60 * 1000;

// ─── GET /outreach-queue  (rep's queued prospects by step) ────────────────────
router.get('/', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
  if (!rp) return ok(res, { day1: [], day4: [], day8: [], noResponse: [] });

  const { campaignId } = req.query as { campaignId?: string };
  const now = new Date();

  const sequences: any[] = await (prisma as any).outreachSequence.findMany({
    where: {
      repId: rp.id,
      ...(campaignId && { campaignId }),
      status: { notIn: ['SKIPPED', 'MEETING_BOOKED'] },
    },
    include: {
      prospect: { select: { id: true, firstName: true, lastName: true, company: true, jobTitle: true, linkedinUrl: true } },
      campaign: { select: { id: true, name: true, dailyLimit: true, messageTemplates: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const day1 = sequences.filter((s: any) => s.status === 'QUEUED' && s.currentStep === 'DAY_1');
  const day4 = sequences.filter((s: any) =>
    s.status === 'IN_PROGRESS' && s.currentStep === 'DAY_4' && s.day4DueAt && new Date(s.day4DueAt) <= now
  );
  const day8 = sequences.filter((s: any) =>
    s.status === 'IN_PROGRESS' && s.currentStep === 'DAY_8' && s.day8DueAt && new Date(s.day8DueAt) <= now
  );
  const noResponse = sequences.filter((s: any) => s.status === 'NO_RESPONSE');

  return ok(res, { day1, day4, day8, noResponse });
}));

// ─── POST /outreach-queue  (enqueue a prospect) ───────────────────────────────
router.post('/', requireRole('rep', 'admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { prospectId, campaignId } = req.body as { prospectId: string; campaignId: string };
  if (!prospectId || !campaignId) return badRequest(res, 'prospectId and campaignId are required');

  let repId: string;
  if (req.user!.role === 'rep') {
    const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
    if (!rp) return badRequest(res, 'Rep profile not found');
    repId = rp.id;
  } else {
    const prospect = await prisma.prospect.findUnique({ where: { id: prospectId } });
    if (!prospect) return notFound(res, 'Prospect not found');
    repId = prospect.repId;
  }

  const existing = await (prisma as any).outreachSequence.findUnique({ where: { prospectId } });
  if (existing) return badRequest(res, 'Prospect is already in a sequence');

  const sequence = await (prisma as any).outreachSequence.create({
    data: { prospectId, repId, campaignId, currentStep: 'DAY_1', status: 'QUEUED' },
  });

  return created(res, sequence);
}));

// ─── PATCH /outreach-queue/:id/advance ───────────────────────────────────────
// Rep marks a step as sent — advances the sequence
router.patch('/:id/advance', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const sequence: any = await (prisma as any).outreachSequence.findUnique({ where: { id: req.params.id } });
  if (!sequence) return notFound(res, 'Sequence not found');

  const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
  if (!rp || sequence.repId !== rp.id) return notFound(res, 'Sequence not found');

  const now = new Date();
  let updateData: Record<string, unknown> = {};

  if (sequence.currentStep === 'DAY_1') {
    updateData = {
      currentStep: 'DAY_4',
      status: 'IN_PROGRESS',
      day1SentAt: now,
      day4DueAt: new Date(now.getTime() + DAY_4_OFFSET_MS),
    };
  } else if (sequence.currentStep === 'DAY_4') {
    updateData = {
      currentStep: 'DAY_8',
      day4SentAt: now,
      day8DueAt: new Date(now.getTime() + (DAY_8_OFFSET_MS - DAY_4_OFFSET_MS)),
    };
  } else if (sequence.currentStep === 'DAY_8') {
    updateData = {
      day8SentAt: now,
      status: 'NO_RESPONSE',
    };
  }

  const updated = await (prisma as any).outreachSequence.update({
    where: { id: req.params.id },
    data: updateData,
  });

  return ok(res, updated);
}));

// ─── PATCH /outreach-queue/:id/reply ─────────────────────────────────────────
router.patch('/:id/reply', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { sentiment } = req.body as { sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' };
  const sequence: any = await (prisma as any).outreachSequence.findUnique({
    where: { id: req.params.id },
    include: { prospect: true },
  });
  if (!sequence) return notFound(res, 'Sequence not found');

  await (prisma as any).outreachSequence.update({
    where: { id: req.params.id },
    data: { status: 'REPLIED' },
  });

  if (sentiment) {
    await prisma.prospect.update({
      where: { id: sequence.prospectId },
      data: { replySentiment: sentiment as any },
    });
  }

  return ok(res, { updated: true });
}));

// ─── PATCH /outreach-queue/:id/skip ──────────────────────────────────────────
router.patch('/:id/skip', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const sequence: any = await (prisma as any).outreachSequence.findUnique({ where: { id: req.params.id } });
  if (!sequence) return notFound(res, 'Sequence not found');

  // HIGH FIX: Verify rep owns this sequence
  const rp = await (prisma as any).repProfile.findUnique({ where: { userId: req.user!.id } });
  if (!rp || sequence.repId !== rp.id) {
    return notFound(res, 'Sequence not found'); // Return 404 to not leak existence
  }

  await (prisma as any).outreachSequence.update({
    where: { id: req.params.id },
    data: { status: 'SKIPPED' },
  });

  return ok(res, { skipped: true });
}));

export default router;
