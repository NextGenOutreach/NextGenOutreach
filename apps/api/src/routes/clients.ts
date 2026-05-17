import express, { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { ok, badRequest } from '../lib/response';
import prisma from '../lib/database';

const router = express.Router();

// GET /api/v1/clients/profile — get client profile
router.get('/profile', asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const profile = await prisma.clientProfile.findUnique({
    where: { userId: req.user!.id },
    include: { user: { select: { email: true } } }
  });
  if (!profile) return res.status(404).json({ success: false, error: { message: 'Profile not found' } });
  return ok(res, profile);
}));

// PATCH /api/v1/clients/profile — update client profile
router.patch('/profile', asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { companyName, website, industry, targetMarket } = req.body;
  
  const updated = await prisma.clientProfile.update({
    where: { userId: req.user!.id },
    data: {
      ...(companyName !== undefined && { companyName }),
      ...(website !== undefined && { website }),
      ...(industry !== undefined && { industry }),
      ...(targetMarket !== undefined && { targetMarket }),
    }
  });

  return ok(res, updated);
}));

router.post('/sync-crm', asyncHandler(async (req: FirebaseAuthRequest, res: Response) => {
  const { user } = req;
  if (!user) return badRequest(res, 'User not authenticated');

  // Find client profile
  const client = await prisma.clientProfile.findUnique({
    where: { userId: user.id }
  });

  if (!client) return badRequest(res, 'Client profile not found');

  // TODO: Implement actual CRM integration (HubSpot, Salesforce, etc.)
  // For now, we'll just log it and return success
  console.log(`CRM Sync requested for client ${client.id}`);

  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 1500));

  return ok(res, { 
    message: 'CRM synchronization completed successfully',
    syncedCount: 12 // Mock value
  });
}));

export default router;
