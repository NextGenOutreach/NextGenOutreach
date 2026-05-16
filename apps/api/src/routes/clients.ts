import express, { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { ok } from '../lib/response';
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

export default router;
