import express, { Response } from 'express';
import prisma from '../lib/database';
import { ok, created, badRequest, notFound, serverError } from '../lib/response';
import { requireRole, FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { browserProvider, SupportedProvider } from '../integrations/browser-provider';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// ─── GET /browser-profiles  (admin: all; rep: own) ────────────────────────────
router.get('/', asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const role = req.user!.role;
  let repId: string | undefined;

  if (role === 'rep') {
    const rp = await prisma.repProfile.findUnique({ where: { userId: req.user!.id } });
    if (!rp) return ok(res, []);
    repId = rp.id;
  }

  const profiles = await prisma.browserProfile.findMany({
    where: repId ? { repId } : undefined,
    include: { proxy: true, rep: { include: { user: { select: { email: true } } } } },
    orderBy: { createdAt: 'desc' },
  });

  return ok(res, profiles);
}));

// ─── GET /browser-profiles/:id ────────────────────────────────────────────────
router.get('/:id', asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const profile = await prisma.browserProfile.findUnique({
    where: { id: req.params.id },
    include: { proxy: true },
  });

  if (!profile) return notFound(res, 'Browser profile not found');

  const role = req.user!.role;
  if (role === 'rep') {
    const rp = await prisma.repProfile.findUnique({ where: { userId: req.user!.id } });
    if (!rp || profile.repId !== rp.id) return notFound(res, 'Browser profile not found');
  }

  return ok(res, profile);
}));

// ─── POST /browser-profiles  (create + provision externally) ──────────────────
router.post('/', requireRole('admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { repId, campaignId, provider, proxyId, linkedinAccountEmail, notes } = req.body as {
    repId: string;
    campaignId?: string;
    provider: SupportedProvider;
    proxyId?: string;
    linkedinAccountEmail?: string;
    notes?: string;
  };

  if (!repId || !provider) return badRequest(res, 'repId and provider are required');

  const rep = await prisma.repProfile.findUnique({
    where: { id: repId },
    include: { user: { select: { email: true } } },
  });
  if (!rep) return notFound(res, 'Rep not found');

  let proxy = proxyId
    ? await prisma.proxy.findUnique({ where: { id: proxyId } })
    : null;

  try {
    const external = await browserProvider.create(provider, {
      name: `NGO-${rep.user.email}-${Date.now()}`,
      proxyHost: proxy?.host,
      proxyPort: proxy?.port,
      proxyUsername: proxy?.username ?? undefined,
      proxyPassword: proxy?.password ?? undefined,
      notes,
    });

    const profile = await prisma.browserProfile.create({
      data: {
        repId,
        campaignId: campaignId ?? null,
        provider: provider.toUpperCase() as any,
        externalProfileId: external.externalProfileId,
        linkedinAccountEmail: linkedinAccountEmail ?? null,
        proxyId: proxyId ?? null,
        notes: notes ?? null,
        fingerprintConfig: external.raw as any,
      },
    });

    if (proxyId) {
      await prisma.proxy.update({
        where: { id: proxyId },
        data: { status: 'ACTIVE' },
      });
    }

    return created(res, profile);
  } catch (err: unknown) {
    return serverError(res, err instanceof Error ? err.message : 'Provider API error');
  }
}));

// ─── POST /browser-profiles/:id/launch ────────────────────────────────────────
router.post('/:id/launch', requireRole('rep', 'admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const profile = await prisma.browserProfile.findUnique({ where: { id: req.params.id } });
  if (!profile) return notFound(res, 'Browser profile not found');

  if (req.user!.role === 'rep') {
    const rp = await prisma.repProfile.findUnique({ where: { userId: req.user!.id } });
    if (!rp || profile.repId !== rp.id) return notFound(res, 'Browser profile not found');
  }

  if (!profile.externalProfileId) return badRequest(res, 'Profile has no external ID — provision it first');

  try {
    const provider = profile.provider.toLowerCase() as SupportedProvider;
    const result = await browserProvider.launch(provider, profile.externalProfileId);

    await prisma.browserProfile.update({
      where: { id: profile.id },
      data: { lastLaunched: new Date(), sessionStatus: 'LAUNCHING' },
    });

    return ok(res, result);
  } catch (err: unknown) {
    await prisma.browserProfile.update({ where: { id: profile.id }, data: { sessionStatus: 'ERROR' } });
    return serverError(res, err instanceof Error ? err.message : 'Launch failed');
  }
}));

// ─── GET /browser-profiles/:id/health ────────────────────────────────────────
router.get('/:id/health', requireRole('rep', 'admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const profile = await prisma.browserProfile.findUnique({ where: { id: req.params.id } });
  if (!profile) return notFound(res, 'Browser profile not found');
  if (!profile.externalProfileId) return badRequest(res, 'No external profile ID');

  try {
    const provider = profile.provider.toLowerCase() as SupportedProvider;
    const health = await browserProvider.health(provider, profile.externalProfileId);

    const newStatus = health.status === 'active' ? 'ACTIVE' : health.status === 'error' ? 'ERROR' : 'IDLE';
    await prisma.browserProfile.update({
      where: { id: profile.id },
      data: { sessionStatus: newStatus as any },
    });

    return ok(res, { ...health, profileId: profile.id });
  } catch (err: unknown) {
    return serverError(res, err instanceof Error ? err.message : 'Health check failed');
  }
}));

// ─── PATCH /browser-profiles/:id ─────────────────────────────────────────────
router.patch('/:id', requireRole('admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { warmupDay, sessionStatus, proxyId, linkedinAccountEmail, notes } = req.body;

  const profile = await prisma.browserProfile.findUnique({ where: { id: req.params.id } });
  if (!profile) return notFound(res, 'Browser profile not found');

  const updated = await prisma.browserProfile.update({
    where: { id: req.params.id },
    data: {
      ...(warmupDay !== undefined && { warmupDay }),
      ...(sessionStatus && { sessionStatus }),
      ...(proxyId !== undefined && { proxyId }),
      ...(linkedinAccountEmail !== undefined && { linkedinAccountEmail }),
      ...(notes !== undefined && { notes }),
    },
  });

  return ok(res, updated);
}));

// ─── DELETE /browser-profiles/:id ────────────────────────────────────────────
router.delete('/:id', requireRole('admin', 'super_admin'), asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const profile = await prisma.browserProfile.findUnique({ where: { id: req.params.id } });
  if (!profile) return notFound(res, 'Browser profile not found');

  if (profile.externalProfileId) {
    try {
      const provider = profile.provider.toLowerCase() as SupportedProvider;
      await browserProvider.remove(provider, profile.externalProfileId);
    } catch {
      // log but don't block deletion
    }
  }

  await prisma.browserProfile.delete({ where: { id: req.params.id } });
  return ok(res, { deleted: true });
}));

export default router;
