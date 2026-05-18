import express, { Response } from 'express';
import { Prisma } from '@prisma/client';
import { asyncHandler } from '../middleware/asyncHandler';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { ok, forbidden, badRequest } from '../lib/response';
import prisma from '../lib/database';

const router = express.Router();

// GET /api/v1/analytics/overview
router.get('/overview', asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { user } = req;
  if (!user) return forbidden(res);

  if (user.role !== 'client') {
    return forbidden(res, 'Analytics overview is only available for clients');
  }

  // Find client profile
  const profile = await prisma.clientProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    return badRequest(res, 'Client profile not found');
  }

  // Fetch real aggregate data
  const [activeCampaigns, connectionsCount, meetingsCount] = await Promise.all([
    prisma.campaign.count({
      where: { 
        clientId: profile.id,
        status: 'ACTIVE'
      }
    }),
    prisma.campaignActivity.count({
      where: {
        campaign: { clientId: profile.id },
        activityType: 'CONNECTION_SENT'
      }
    }),
    prisma.campaignActivity.count({
      where: {
        campaign: { clientId: profile.id },
        activityType: 'MEETING_BOOKED'
      }
    })
  ]);

  // For pipeline value, we might need a more complex calculation or a stored field.
  // For now, let's sum up earnings tied to this client as a proxy or keep it 0 if not implemented.
  const pipelineValue = 0; 

  return ok(res, {
    activeCampaigns,
    connectionsSent: connectionsCount,
    meetingsBooked: meetingsCount,
    pipelineValue
  });
}));

// GET /api/v1/analytics/prospects — live prospect feed for the client
router.get('/prospects', asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { user } = req;
  if (!user) return forbidden(res);
  if (user.role !== 'client') return forbidden(res, 'Clients only');

  const profile = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return badRequest(res, 'Client profile not found');

  const { campaignId, status, sentiment, page = 1, limit = 30 } = req.query as Record<string, string>;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    campaign: { clientId: profile.id },
    ...(campaignId && { campaignId }),
    ...(status && { connectionStatus: status.toUpperCase() }),
    ...(sentiment && { replySentiment: sentiment.toUpperCase() }),
  };

  const [prospects, total] = await Promise.all([
    prisma.prospect.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        company: true,
        jobTitle: true,
        linkedinUrl: true,
        connectionStatus: true,
        messageStatus: true,
        replySentiment: true,
        meetingBooked: true,
        meetingDate: true,
        updatedAt: true,
        campaign: { select: { id: true, name: true } },
        rep: { select: { id: true, user: { select: { email: true } } } },
      },
    }),
    prisma.prospect.count({ where }),
  ]);

  return ok(res, prospects, { page: Number(page), total, perPage: Number(limit) });
}));

// GET /api/v1/analytics/roi — ROI calculator data for the client
router.get('/roi', asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { user } = req;
  if (!user) return forbidden(res);
  if (user.role !== 'client') return forbidden(res, 'Clients only');

  const profile = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return badRequest(res, 'Client profile not found');

  const { campaignId } = req.query as { campaignId?: string };

  const where: any = {
    campaign: { clientId: profile.id },
    ...(campaignId && { campaignId }),
  };

  const [
    totalProspects,
    connectionsSent,
    connectionsAccepted,
    repliesReceived,
    meetingsBooked,
    earnings,
    activities30d,
  ] = await Promise.all([
    prisma.prospect.count({ where }),
    prisma.prospect.count({ where: { ...where, connectionStatus: { not: 'NOT_SENT' } } }),
    prisma.prospect.count({ where: { ...where, connectionStatus: 'ACCEPTED' } }),
    prisma.prospect.count({ where: { ...where, messageStatus: { not: 'NOT_STARTED' } } }),
    prisma.prospect.count({ where: { ...where, meetingBooked: true } }),
    prisma.repEarning.findMany({
      where: { campaign: { clientId: profile.id }, ...(campaignId && { campaignId }) },
      select: { amountUsd: true },
    }),
    prisma.campaignActivity.findMany({
      where: {
        campaign: { clientId: profile.id },
        ...(campaignId && { campaignId }),
        occurredAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { activityType: true, occurredAt: true },
    }),
  ]);

  const totalSpend = earnings.reduce((s, e) => s + Number(e.amountUsd), 0);

  const acceptanceRate = connectionsSent > 0 ? connectionsAccepted / connectionsSent : 0;
  const replyRate = connectionsAccepted > 0 ? repliesReceived / connectionsAccepted : 0;
  const meetingRate = repliesReceived > 0 ? meetingsBooked / repliesReceived : 0;
  const costPerMeeting = meetingsBooked > 0 ? totalSpend / meetingsBooked : null;

  // Activity trend — last 30d by day
  const trendMap: Record<string, Record<string, number>> = {};
  for (const a of activities30d) {
    const day = a.occurredAt.toISOString().slice(0, 10);
    if (!trendMap[day]) trendMap[day] = {};
    trendMap[day][a.activityType] = (trendMap[day][a.activityType] ?? 0) + 1;
  }
  const trend = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));

  return ok(res, {
    totalProspects,
    connectionsSent,
    connectionsAccepted,
    repliesReceived,
    meetingsBooked,
    totalSpend,
    acceptanceRate: Number(acceptanceRate.toFixed(4)),
    replyRate: Number(replyRate.toFixed(4)),
    meetingRate: Number(meetingRate.toFixed(4)),
    costPerMeeting: costPerMeeting !== null ? Number(costPerMeeting.toFixed(2)) : null,
    trend,
  });
}));

// GET /api/v1/analytics/message-ab — A/B template performance across sequences
router.get('/message-ab', asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { user } = req;
  if (!user) return forbidden(res);
  if (user.role !== 'client') return forbidden(res, 'Clients only');

  const profile = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return badRequest(res, 'Client profile not found');

  const { campaignId } = req.query as { campaignId?: string };

  const campaigns = await prisma.campaign.findMany({
    where: {
      clientId: profile.id,
      ...(campaignId && { id: campaignId }),
      NOT: { messageTemplates: { equals: Prisma.JsonNull } },
    },
    select: { id: true, name: true, messageTemplates: true },
  });

  const results = await Promise.all(
    campaigns.map(async (c) => {
      const [sent, replied, booked] = await Promise.all([
        prisma.prospect.count({ where: { campaignId: c.id, messageStatus: { not: 'NOT_STARTED' } } }),
        prisma.prospect.count({ where: { campaignId: c.id, replySentiment: { not: null } } }),
        prisma.prospect.count({ where: { campaignId: c.id, meetingBooked: true } }),
      ]);
      return {
        campaignId: c.id,
        campaignName: c.name,
        messageTemplates: c.messageTemplates,
        sent,
        replied,
        booked,
        replyRate: sent > 0 ? Number((replied / sent).toFixed(4)) : 0,
        bookingRate: sent > 0 ? Number((booked / sent).toFixed(4)) : 0,
      };
    })
  );

  return ok(res, results);
}));

// GET /api/v1/analytics/admin — platform-level reporting
router.get('/admin', asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { user } = req;
  if (!user || !['admin', 'super_admin'].includes(user.role)) {
    return forbidden(res, 'Admin access required');
  }

  // 1. Revenue over time (last 6 months)
  const earnings = await prisma.repEarning.findMany({
    where: {
      periodStart: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
    },
    select: { amountUsd: true, periodStart: true }
  });

  const revenueByMonth: Record<string, number> = {};
  earnings.forEach(e => {
    const month = e.periodStart.toISOString().slice(0, 7);
    revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(e.amountUsd);
  });

  // 2. User growth (last 6 months)
  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
    },
    select: { createdAt: true, role: true }
  });

  const userGrowthByMonth: Record<string, { total: number, client: number, rep: number }> = {};
  users.forEach(u => {
    const month = u.createdAt.toISOString().slice(0, 7);
    if (!userGrowthByMonth[month]) userGrowthByMonth[month] = { total: 0, client: 0, rep: 0 };
    userGrowthByMonth[month].total++;
    if (u.role === 'CLIENT') userGrowthByMonth[month].client++;
    if (u.role === 'REP') userGrowthByMonth[month].rep++;
  });

  // 3. Campaign activity (last 30 days)
  const activities = await prisma.campaignActivity.findMany({
    where: {
      occurredAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
    },
    select: { activityType: true, occurredAt: true }
  });

  const activityByDay: Record<string, Record<string, number>> = {};
  activities.forEach(a => {
    const day = a.occurredAt.toISOString().slice(0, 10);
    if (!activityByDay[day]) activityByDay[day] = {};
    activityByDay[day][a.activityType] = (activityByDay[day][a.activityType] || 0) + 1;
  });

  return ok(res, {
    revenueByMonth,
    userGrowthByMonth,
    activityByDay
  });
  }));

  export default router;