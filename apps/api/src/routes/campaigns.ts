import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ok, created, badRequest, forbidden } from '../lib/response';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import prisma from '../lib/database';

const router = express.Router();

// GET /api/v1/campaigns — list campaigns scoped to the authenticated user
router.get('/', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { user } = req;
  if (!user) return forbidden(res);

  const { status, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const statusFilter = status ? { status: (status as string).toUpperCase() as any } : {};

  let where: any;

  if (user.role === 'client') {
    const profile = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return ok(res, [], { page: 1, total: 0, perPage: Number(limit) });
    where = { clientId: profile.id, ...statusFilter };
  } else if (user.role === 'rep') {
    const profile = await prisma.repProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return ok(res, [], { page: 1, total: 0, perPage: Number(limit) });
    where = { repId: profile.id, ...statusFilter };
  } else {
    // admin / super_admin sees all
    where = { ...statusFilter };
  }

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        rep: {
          select: { id: true, linkedinFollowers: true, industry: true, rating: true },
        },
        _count: { select: { activities: true } },
      },
    }),
    prisma.campaign.count({ where }),
  ]);

  return ok(res, campaigns, { page: Number(page), total, perPage: Number(limit) });
}));

// POST /api/v1/campaigns — create a new campaign (client only)
router.post('/', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { user } = req;
  if (!user) return forbidden(res);
  if (user.role !== 'client') return forbidden(res, 'Only clients can create campaigns');

  const { name, type, targetIcp, dailyLimit, notes } = req.body;
  if (!name || !type) return badRequest(res, 'name and type are required');

  const profile = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return badRequest(res, 'Client profile not found');

  const VALID_TYPES = ['CONNECTIONS', 'DMS', 'POSTS', 'MIXED'];
  const campaignType = (type as string).toUpperCase();
  if (!VALID_TYPES.includes(campaignType)) return badRequest(res, `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`);

  const campaign = await prisma.campaign.create({
    data: {
      clientId: profile.id,
      name: String(name).slice(0, 200),
      type: campaignType as any,
      status: 'DRAFT' as any,
      targetIcp: targetIcp ?? null,
      dailyLimit: Number(dailyLimit) || 20,
      notes: notes ? String(notes) : null,
    },
  });

  return created(res, campaign);
}));

// PATCH /api/v1/campaigns/:id/status — update campaign status (admin or owning client/rep)
router.patch('/:id/status', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { user } = req;
  if (!user) return forbidden(res);

  const { status } = req.body;
  if (!status) return badRequest(res, 'status is required');

  const VALID_STATUSES = ['DRAFT', 'PENDING_MATCH', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];
  const newStatus = (status as string).toUpperCase();
  if (!VALID_STATUSES.includes(newStatus)) return badRequest(res, `Invalid status`);

  const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!campaign) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found', statusCode: 404 } });

  if (user.role === 'client') {
    const profile = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
    if (!profile || campaign.clientId !== profile.id) return forbidden(res, 'You do not own this campaign');
  } else if (user.role === 'rep') {
    const profile = await prisma.repProfile.findUnique({ where: { userId: user.id } });
    if (!profile || campaign.repId !== profile.id) return forbidden(res, 'You are not assigned to this campaign');
  }

  const updated = await prisma.campaign.update({
    where: { id: req.params.id },
    data: { status: newStatus as any },
  });

  return ok(res, updated);
}));

export default router;