import express, { Response } from 'express';
import prisma from '../lib/database';
import { ok, created, badRequest, notFound, forbidden } from '../lib/response';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';

const router = express.Router();

// ─── GET /comms/threads  (threads the current user participates in) ─────────
router.get('/threads', async (req: FirebaseAuthRequest, res: Response) => {
  const threads: any[] = await (prisma as any).messageThread.findMany({
    where: {
      participants: { some: { userId: req.user!.id } },
    },
    include: {
      participants: { select: { userId: true, joinedAt: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { body: true, createdAt: true, senderId: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return ok(res, threads);
});

// ─── POST /comms/threads  (create a DM or campaign channel thread) ────────────
router.post('/threads', async (req: FirebaseAuthRequest, res: Response) => {
  const { type, participantIds, campaignId, prospectId, subject } = req.body as {
    type?: 'DIRECT' | 'CAMPAIGN_CHANNEL' | 'ESCALATION';
    participantIds: string[];
    campaignId?: string;
    prospectId?: string;
    subject?: string;
  };

  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    return badRequest(res, 'participantIds array is required');
  }

  const allParticipants = Array.from(new Set([req.user!.id, ...participantIds]));

  const thread = await (prisma as any).messageThread.create({
    data: {
      type: type ?? 'DIRECT',
      campaignId: campaignId ?? null,
      prospectId: prospectId ?? null,
      subject: subject ?? null,
      participants: {
        create: allParticipants.map((userId: string) => ({ userId })),
      },
    },
    include: {
      participants: { select: { userId: true } },
    },
  });

  return created(res, thread);
});

// ─── GET /comms/threads/:id/messages ─────────────────────────────────────────
router.get('/threads/:id/messages', async (req: FirebaseAuthRequest, res: Response) => {
  const thread: any = await (prisma as any).messageThread.findUnique({
    where: { id: req.params.id },
    include: {
      participants: { select: { userId: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!thread) return notFound(res, 'Thread not found');

  const isMember = thread.participants.some((p: any) => p.userId === req.user!.id);
  if (!isMember) return forbidden(res, 'Not a thread participant');

  return ok(res, thread.messages);
});

// ─── POST /comms/threads/:id/messages  (send a message) ──────────────────────
router.post('/threads/:id/messages', async (req: FirebaseAuthRequest, res: Response) => {
  const { body } = req.body as { body: string };
  if (!body?.trim()) return badRequest(res, 'Message body required');

  const thread: any = await (prisma as any).messageThread.findUnique({
    where: { id: req.params.id },
    include: { participants: { select: { userId: true } } },
  });

  if (!thread) return notFound(res, 'Thread not found');

  const isMember = thread.participants.some((p: any) => p.userId === req.user!.id);
  if (!isMember) return forbidden(res, 'Not a thread participant');

  const message = await (prisma as any).internalMessage.create({
    data: { threadId: req.params.id, senderId: req.user!.id, body: body.trim() },
  });

  await (prisma as any).messageThread.update({
    where: { id: req.params.id },
    data: { updatedAt: new Date() },
  });

  return created(res, message);
});

// ─── POST /comms/escalate  (rep flags a prospect for CSM guidance) ────────────
router.post('/escalate', async (req: FirebaseAuthRequest, res: Response) => {
  const { prospectId, note } = req.body as { prospectId: string; note?: string };
  if (!prospectId) return badRequest(res, 'prospectId required');

  const prospect = await prisma.prospect.findUnique({
    where: { id: prospectId },
    include: { campaign: { include: { client: { include: { user: { select: { id: true } } } } } } },
  });
  if (!prospect) return notFound(res, 'Prospect not found');

  const adminUsers = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] as any[] } },
    select: { id: true },
    take: 1,
  });

  const participantIds = adminUsers.map((u: any) => u.id);
  if (prospect.campaign.client.user?.id) participantIds.push(prospect.campaign.client.user.id);

  const allParticipants = Array.from(new Set([req.user!.id, ...participantIds]));

  const thread = await (prisma as any).messageThread.create({
    data: {
      type: 'ESCALATION',
      prospectId,
      campaignId: prospect.campaignId,
      subject: `Escalation: ${prospect.firstName} ${prospect.lastName} — ${note ?? 'needs guidance'}`,
      participants: {
        create: allParticipants.map((userId: string) => ({ userId })),
      },
      messages: {
        create: {
          senderId: req.user!.id,
          body: note ?? 'Rep flagged this prospect for guidance.',
        },
      },
    },
  });

  return created(res, thread);
});

export default router;
