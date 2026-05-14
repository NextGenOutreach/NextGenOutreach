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

export default router;