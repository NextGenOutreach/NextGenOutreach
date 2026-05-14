import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ok, badRequest, forbidden } from '../lib/response';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import prisma from '../lib/database';

const router = express.Router();

function isAdmin(user?: FirebaseAuthRequest['user']) {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

// GET /api/v1/admin/users — list all users with profiles
router.get('/users', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const { role, status, search, page = 1, limit = 30 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    ...(role && { role: (role as string).toUpperCase() }),
    ...(status && { status: (status as string).toUpperCase() }),
    ...(search && {
      email: { contains: search as string, mode: 'insensitive' },
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        twoFaEnabled: true,
        createdAt: true,
        clientProfile: {
          select: { id: true, companyName: true, plan: true, planStatus: true },
        },
        repProfile: {
          select: { id: true, linkedinFollowers: true, industry: true, idVerified: true, rating: true, availabilityStatus: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return ok(res, users, { page: Number(page), total, perPage: Number(limit) });
}));

// PATCH /api/v1/admin/users/:id/status — approve / suspend a user
router.patch('/users/:id/status', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const { status } = req.body;
  const VALID = ['PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED'];
  if (!status || !VALID.includes((status as string).toUpperCase())) {
    return badRequest(res, `status must be one of: ${VALID.join(', ')}`);
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { status: (status as string).toUpperCase() as any },
    select: { id: true, email: true, role: true, status: true },
  });

  return ok(res, updated);
}));

// PATCH /api/v1/admin/users/:id/role — change a user's role
router.patch('/users/:id/role', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const { role } = req.body;
  const VALID = ['CLIENT', 'REP', 'ADMIN', 'SUPER_ADMIN'];
  if (!role || !VALID.includes((role as string).toUpperCase())) {
    return badRequest(res, `role must be one of: ${VALID.join(', ')}`);
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: (role as string).toUpperCase() as any },
    select: { id: true, email: true, role: true, status: true },
  });

  return ok(res, updated);
}));

// GET /api/v1/admin/stats — platform-level counts
router.get('/stats', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const [totalUsers, totalReps, totalClients, activeCampaigns] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'REP' as any } }),
    prisma.user.count({ where: { role: 'CLIENT' as any } }),
    prisma.campaign.count({ where: { status: 'ACTIVE' as any } }),
  ]);

  return ok(res, { totalUsers, totalReps, totalClients, activeCampaigns });
}));

export default router;