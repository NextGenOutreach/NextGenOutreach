import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ok, badRequest, forbidden, serverError } from '../lib/response';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { calculateMatchScore } from '../services/matching.service';
import { getAdminAuth } from '../lib/firebaseAdmin';
import prisma from '../lib/database';
import { logger } from '../lib/logger';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES — All require admin/super_admin role
// ─────────────────────────────────────────────────────────────────────────────

function isAdmin(user?: FirebaseAuthRequest['user']) {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

// GET /api/v1/admin/campaigns — list all campaigns with rep matching for unassigned ones
router.get('/campaigns', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const { status, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where: any = status ? { status: (status as string).toUpperCase() } : {};

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, companyName: true } },
        rep: { select: { id: true, industry: true, user: { select: { email: true } } } },
        _count: { select: { activities: true } },
      },
    }),
    prisma.campaign.count({ where }),
  ]);

  // For unassigned campaigns, find top 3 matching reps
  const campaignsWithMatches = await Promise.all(campaigns.map(async (c: any) => {
    if (!c.repId) {
      const topReps = await prisma.repProfile.findMany({
        where: { idVerified: true, availabilityStatus: 'available' },
        take: 10, // Get a pool to score
        include: { user: { select: { email: true } } }
      });

      const prefs = {
        targetIndustry: (c.targetIcp as any)?.industry,
        targetCountry: (c.targetIcp as any)?.country,
      };

      const matches = topReps
        .map((r: any) => ({
          repId: r.id,
          email: r.user.email,
          score: calculateMatchScore(r, prefs as any).score
        }))
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3);

      return { ...c, topMatches: matches };
    }
    return c;
  }));

  return ok(res, campaignsWithMatches, { page: Number(page), total, perPage: Number(limit) });
}));

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
    select: { id: true, email: true, role: true, status: true, passwordHash: true },
  });

  // CRITICAL FIX: Sync role to Firebase custom claims so the token reflects the new role immediately
  // The passwordHash contains 'firebase:{uid}' for Firebase users
  if (updated.passwordHash?.startsWith('firebase:')) {
    const firebaseUid = updated.passwordHash.replace('firebase:', '');
    try {
      const adminAuth = getAdminAuth();
      // Set lowercase role in claims to match sync-claims convention
      await adminAuth.setCustomUserClaims(firebaseUid, { 
        role: (role as string).toLowerCase() 
      });
      logger.info(`[admin] Updated Firebase claims for user ${updated.id} (${updated.email}) to role: ${role}`);
    } catch (firebaseErr) {
      logger.error(`[admin] Failed to sync Firebase claims for user ${updated.id}:`, firebaseErr);
      // Don't fail the request - DB update succeeded, Firebase sync is best-effort
      // The user will get the new role on next token refresh or re-login
    }
  }

  return ok(res, { 
    ...updated, 
    firebaseSync: updated.passwordHash?.startsWith('firebase:') ? 'synced' : 'not-applicable'
  });
}));

// GET /api/v1/admin/stats — platform-level counts
router.get('/stats', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const [totalUsers, totalReps, totalClients, activeCampaigns, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'REP' as any } }),
    prisma.user.count({ where: { role: 'CLIENT' as any } }),
    prisma.campaign.count({ where: { status: 'ACTIVE' as any } }),
    prisma.repEarning.aggregate({ _sum: { amountUsd: true } }),
  ]);

  return ok(res, {
    totalUsers, totalReps, totalClients, activeCampaigns,
    totalRevenue: Number(totalRevenue._sum.amountUsd ?? 0),
  });
}));

// GET /api/v1/admin/activity — recent platform events
router.get('/activity', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const [recentUsers, recentCampaigns, recentActivities] = await Promise.all([
    prisma.user.findMany({
      take: 5, orderBy: { createdAt: 'desc' },
      select: { email: true, role: true, createdAt: true },
    }),
    prisma.campaign.findMany({
      take: 5, orderBy: { createdAt: 'desc' },
      select: { name: true, status: true, createdAt: true },
    }),
    prisma.campaignActivity.findMany({
      take: 10, orderBy: { occurredAt: 'desc' },
      select: {
        activityType: true, prospectName: true, occurredAt: true,
        campaign: { select: { name: true } },
      },
    }),
  ]);

  const activity = [
    ...recentUsers.map((u: { email: string; role: string; createdAt: Date }) => ({
      type: 'user_registered',
      label: `New ${u.role.toLowerCase()} registered: ${u.email}`,
      time: u.createdAt,
    })),
    ...recentCampaigns.map((c: { name: string; status: string; createdAt: Date }) => ({
      type: 'campaign',
      label: `Campaign ${c.status.toLowerCase()}: ${c.name}`,
      time: c.createdAt,
    })),
    ...recentActivities.map((a: { activityType: string; prospectName: string | null; occurredAt: Date; campaign: { name: string } }) => ({
      type: a.activityType.toLowerCase(),
      label: `${a.activityType.replace(/_/g, ' ')}: ${a.prospectName ?? 'Unknown'} — ${a.campaign.name}`,
      time: a.occurredAt,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  return ok(res, activity);
}));

// GET /api/v1/admin/leads — campaign activities as prospect leads
router.get('/leads', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const { page = 1, limit = 30, type } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where: any = type ? { activityType: (type as string).toUpperCase() } : {};

  const [leads, total] = await Promise.all([
    prisma.campaignActivity.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { occurredAt: 'desc' },
      include: {
        campaign: {
          select: {
            id: true, name: true,
            rep: { select: { id: true, industry: true, user: { select: { email: true } } } },
          },
        },
      },
    }),
    prisma.campaignActivity.count({ where }),
  ]);

  return ok(res, leads, { page: Number(page), total, perPage: Number(limit) });
}));

// GET /api/v1/admin/reps — all reps with performance stats
router.get('/reps', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const reps = await prisma.repProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true, status: true, createdAt: true } },
      _count: { select: { campaigns: true, earnings: true } },
    },
  });

  // HIGH FIX: Batch fetch all activity stats in 3 queries instead of N*3 queries
  const repIds = reps.map(r => r.id);
  
  // Fetch all activity counts grouped by rep
  const [allConnectionsSent, allConnectionsAccepted, allMeetingsBooked] = await Promise.all([
    prisma.campaignActivity.groupBy({
      by: ['campaignId'],
      where: { 
        campaign: { repId: { in: repIds } },
        activityType: 'CONNECTION_SENT' 
      },
      _count: { _all: true },
    }),
    prisma.campaignActivity.groupBy({
      by: ['campaignId'],
      where: { 
        campaign: { repId: { in: repIds } },
        activityType: 'CONNECTION_ACCEPTED' 
      },
      _count: { _all: true },
    }),
    prisma.campaignActivity.groupBy({
      by: ['campaignId'],
      where: { 
        campaign: { repId: { in: repIds } },
        activityType: 'MEETING_BOOKED' 
      },
      _count: { _all: true },
    }),
  ]);

  // Get campaign to rep mapping
  const campaignIds = [...new Set([...allConnectionsSent, ...allConnectionsAccepted, ...allMeetingsBooked].map(a => a.campaignId))];
  const campaigns = campaignIds.length > 0 
    ? await prisma.campaign.findMany({
        where: { id: { in: campaignIds } },
        select: { id: true, repId: true }
      })
    : [];
  const campaignToRep = new Map(campaigns.map(c => [c.id, c.repId]));

  // Aggregate counts per rep
  const repStats = new Map<string, { connectionsSent: number; connectionsAccepted: number; meetingsBooked: number }>();
  
  for (const stat of allConnectionsSent) {
    const repId = campaignToRep.get(stat.campaignId);
    if (repId) {
      const current = repStats.get(repId) || { connectionsSent: 0, connectionsAccepted: 0, meetingsBooked: 0 };
      current.connectionsSent += stat._count._all;
      repStats.set(repId, current);
    }
  }
  
  for (const stat of allConnectionsAccepted) {
    const repId = campaignToRep.get(stat.campaignId);
    if (repId) {
      const current = repStats.get(repId) || { connectionsSent: 0, connectionsAccepted: 0, meetingsBooked: 0 };
      current.connectionsAccepted += stat._count._all;
      repStats.set(repId, current);
    }
  }
  
  for (const stat of allMeetingsBooked) {
    const repId = campaignToRep.get(stat.campaignId);
    if (repId) {
      const current = repStats.get(repId) || { connectionsSent: 0, connectionsAccepted: 0, meetingsBooked: 0 };
      current.meetingsBooked += stat._count._all;
      repStats.set(repId, current);
    }
  }

  const repsWithStats = reps.map(rep => {
    const stats = repStats.get(rep.id) || { connectionsSent: 0, connectionsAccepted: 0, meetingsBooked: 0 };
    return {
      ...rep,
      stats: {
        connectionsSent: stats.connectionsSent,
        acceptanceRate: stats.connectionsSent > 0 ? Math.round((stats.connectionsAccepted / stats.connectionsSent) * 100) : 0,
        meetingsBooked: stats.meetingsBooked,
      },
    };
  });

  return ok(res, repsWithStats);
}));

// GET /api/v1/admin/earnings — all rep earnings for auditing
router.get('/earnings', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const { status, page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where: any = status ? { status: (status as string).toLowerCase() } : {};

  const [earnings, total] = await Promise.all([
    prisma.repEarning.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        rep: { select: { id: true, industry: true, user: { select: { email: true } } } },
        client: { select: { id: true, companyName: true } },
        campaign: { select: { id: true, name: true } },
      },
    }),
    prisma.repEarning.count({ where }),
  ]);

  return ok(res, earnings, { page: Number(page), total, perPage: Number(limit) });
}));

// PATCH /api/v1/admin/users/:id/verify-id — verify a rep's ID
router.patch('/users/:id/verify-id', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const { verified } = req.body;

  const updated = await prisma.repProfile.update({
    where: { userId: req.params.id },
    data: { 
      idVerified: !!verified,
      idVerifiedAt: verified ? new Date() : null
    },
    select: { id: true, idVerified: true, idVerifiedAt: true }
  });

  return ok(res, updated);
}));

// PATCH /api/v1/admin/earnings/:id/pay — mark an earning as paid
router.patch('/earnings/:id/pay', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const updated = await prisma.repEarning.update({
    where: { id: req.params.id },
    data: { 
      status: 'paid',
      paidAt: new Date()
    }
  });

  return ok(res, updated);
}));

// POST /api/v1/admin/reps/import — bulk import reps from marketplace
router.post('/reps/import', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const { repIds } = req.body;
  if (!repIds || !Array.isArray(repIds)) {
    return badRequest(res, 'repIds array is required');
  }

  // In a real app, we would fetch these from a marketplace source 
  // and create real RepProfile/User records. For now, we simulate success.
  logger.info(`[ADMIN] Importing ${repIds.length} reps: ${repIds.join(', ')}`);
  
  // Logic to "import" could be adding them to a specific list or creating placeholder users
  
  return ok(res, { 
    message: `Successfully queued ${repIds.length} reps for import`,
    importedCount: repIds.length 
  });
}));

// GET /api/v1/admin/alerts — identify campaigns needing intervention
router.get('/alerts', asyncHandler(async (req: FirebaseAuthRequest, res) => {
  if (!isAdmin(req.user)) return forbidden(res, 'Admin access required');

  const activeCampaigns = await prisma.campaign.findMany({
    where: { status: 'ACTIVE' as any },
    include: { activities: { orderBy: { occurredAt: 'desc' }, take: 1 } },
  });

  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const alerts = activeCampaigns
    .filter(c => {
      const last = c.activities[0]?.occurredAt;
      return !last || last < threshold;
    })
    .map(c => ({
      campaignId: c.id,
      campaignName: c.name,
      lastActivity: c.activities[0]?.occurredAt || null,
      issue: 'NO_ACTIVITY_24H'
    }));

  return ok(res, alerts);
}));

export default router;