import express from 'express';
import { RepController } from '../controllers/rep.controller';
import { requireRole, FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { ok, badRequest } from '../lib/response';
import prisma from '../lib/database';

const router = express.Router();
const ctrl = new RepController();

// Public endpoints for marketplace browsing
router.get('/', ctrl.listReps);
router.get('/:id', ctrl.getRepById);

// Protected rep endpoints
router.patch('/profile', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res) => {
  const { linkedinUrl, industry, bio, locationCountry, locationCity, availabilityStatus } = req.body;
  
  if (!req.user) return badRequest(res, 'User not authenticated');

  const updated = await prisma.repProfile.update({
    where: { userId: req.user.id },
    data: {
      ...(linkedinUrl !== undefined && { linkedinUrl }),
      ...(industry !== undefined && { industry }),
      ...(bio !== undefined && { bio }),
      ...(locationCountry !== undefined && { locationCountry }),
      ...(locationCity !== undefined && { locationCity }),
      ...(availabilityStatus !== undefined && { availabilityStatus }),
    }
  });

  return ok(res, updated);
}));

router.post('/onboarding', requireRole('rep'), asyncHandler(async (req: FirebaseAuthRequest, res) => {
  // TODO: Implement onboarding steps
  return ok(res, { message: 'Rep onboarding endpoint - to be implemented' });
}));

export { router as repRoutes };
