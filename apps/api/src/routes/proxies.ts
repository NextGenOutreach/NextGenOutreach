import express, { Response } from 'express';
import prisma from '../lib/database';
import { ok, created, badRequest, notFound } from '../lib/response';
import { requireRole, FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// ─── GET /proxies ─────────────────────────────────────────────────────────────
router.get('/', requireRole('admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const proxies = await prisma.proxy.findMany({
    orderBy: { createdAt: 'desc' },
    include: { browserProfiles: { select: { id: true, repId: true, linkedinAccountEmail: true } } },
  });
  return ok(res, proxies);
}));

// ─── GET /proxies/available ───────────────────────────────────────────────────
router.get('/available', requireRole('admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { country } = req.query as { country?: string };

  const proxies = await prisma.proxy.findMany({
    where: {
      status: 'UNASSIGNED',
      ...(country && { country: { equals: country, mode: 'insensitive' } }),
    },
    orderBy: { createdAt: 'asc' },
  });

  return ok(res, proxies);
}));

// ─── POST /proxies ────────────────────────────────────────────────────────────
router.post('/', requireRole('admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { provider, ipAddress, host, port, username, password, country, rotationSchedule, notes } = req.body as {
    provider: string;
    ipAddress: string;
    host: string;
    port: number;
    username?: string;
    password?: string;
    country: string;
    rotationSchedule?: string;
    notes?: string;
  };

  if (!provider || !ipAddress || !host || !port || !country) {
    return badRequest(res, 'provider, ipAddress, host, port, country are required');
  }

  const proxy = await prisma.proxy.create({
    data: { provider, ipAddress, host, port, username, password, country, rotationSchedule, notes },
  });

  return created(res, proxy);
}));

// ─── POST /proxies/bulk ───────────────────────────────────────────────────────
router.post('/bulk', requireRole('admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { proxies } = req.body as {
    proxies: Array<{
      provider: string; ipAddress: string; host: string;
      port: number; username?: string; password?: string;
      country: string;
    }>;
  };

  if (!Array.isArray(proxies) || proxies.length === 0) {
    return badRequest(res, 'proxies array is required');
  }

  const result = await prisma.proxy.createMany({ data: proxies, skipDuplicates: true });
  return created(res, { created: result.count });
}));

// ─── PATCH /proxies/:id ───────────────────────────────────────────────────────
router.patch('/:id', requireRole('admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const proxy = await prisma.proxy.findUnique({ where: { id: req.params.id } });
  if (!proxy) return notFound(res, 'Proxy not found');

  const { status, notes, rotationSchedule } = req.body;
  const updated = await prisma.proxy.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(rotationSchedule !== undefined && { rotationSchedule }),
      lastChecked: new Date(),
    },
  });

  return ok(res, updated);
}));

// ─── DELETE /proxies/:id ──────────────────────────────────────────────────────
router.delete('/:id', requireRole('admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const proxy = await prisma.proxy.findUnique({ where: { id: req.params.id } });
  if (!proxy) return notFound(res, 'Proxy not found');

  const inUse = await prisma.browserProfile.count({ where: { proxyId: req.params.id } });
  if (inUse > 0) return badRequest(res, `Proxy is assigned to ${inUse} browser profile(s). Unassign first.`);

  await prisma.proxy.delete({ where: { id: req.params.id } });
  return ok(res, { deleted: true });
}));

export default router;
