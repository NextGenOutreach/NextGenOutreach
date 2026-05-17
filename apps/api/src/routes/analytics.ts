import express, { Response } from 'express';
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