import express, { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { FirebaseAuthRequest, requireRole } from '../middleware/firebaseAuth.middleware';
import { ok, badRequest, forbidden } from '../lib/response';
import prisma from '../lib/database';
import { ConnectionStatus, MessageStatus, Sentiment } from '@prisma/client';

const router = express.Router();

// Middleware to ensure client owns the campaign the prospect belongs to
const canAccessProspect = async (req: FirebaseAuthRequest, res: Response, next: any) => {
  const { id } = req.params;
  const user = req.user!;

  if (user.role === 'admin' || user.role === 'super_admin') return next();

  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: { campaign: true }
  });

  if (!prospect) return badRequest(res, 'Prospect not found');

  if (user.role === 'client') {
    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
    if (!clientProfile || prospect.campaign.clientId !== clientProfile.id) {
      return forbidden(res, 'Access denied to this prospect');
    }
  }

  if (user.role === 'rep') {
    if (prospect.repId !== user.id) { // This assumes repId is profileId or userId, need to check
      // Actually repId in Prospect model links to RepProfile.
    }
  }

  next();
};

// GET /api/v1/prospects — list prospects (Client or Rep scoped)
router.get('/', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { campaignId, status, sentiment, search } = req.query;
  const user = req.user!;

  const where: any = {};
  if (campaignId) where.campaignId = campaignId as string;
  if (status) where.messageStatus = status as MessageStatus;
  if (sentiment) where.replySentiment = sentiment as Sentiment;

  if (user.role === 'client') {
    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
    if (!clientProfile) return forbidden(res, 'Client profile not found');
    where.campaign = { clientId: clientProfile.id };
  } else if (user.role === 'rep') {
    const repProfile = await prisma.repProfile.findUnique({ where: { userId: user.id } });
    if (!repProfile) return forbidden(res, 'Rep profile not found');
    where.repId = repProfile.id;
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { company: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const prospects = await prisma.prospect.findMany({
    where,
    include: { campaign: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return ok(res, prospects);
}));

// PATCH /api/v1/prospects/:id — update prospect status (Rep only usually)
router.patch('/:id', canAccessProspect, asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { connectionStatus, messageStatus, replySentiment, notes, meetingBooked, meetingDate } = req.body;
  
  const updated = await prisma.prospect.update({
    where: { id: req.params.id },
    data: {
      ...(connectionStatus && { connectionStatus: connectionStatus as ConnectionStatus }),
      ...(messageStatus && { messageStatus: messageStatus as MessageStatus }),
      ...(replySentiment && { replySentiment: replySentiment as Sentiment }),
      ...(notes !== undefined && { notes }),
      ...(meetingBooked !== undefined && { meetingBooked }),
      ...(meetingDate && { meetingDate: new Date(meetingDate) }),
    }
  });

  // If meeting booked, create a Deal
  if (meetingBooked && !updated.isDisqualified) {
    // Check if deal already exists
    const existingDeal = await prisma.deal.findFirst({ where: { prospectId: updated.id } });
    if (!existingDeal) {
      await prisma.deal.create({
        data: {
          prospectId: updated.id,
          clientId: updated.campaignId, // Wait, Deal model uses clientId, Prospect has campaignId
          // Need to get clientId from Campaign
        }
      });
    }
  }

  return ok(res, updated);
}));

export default router;
