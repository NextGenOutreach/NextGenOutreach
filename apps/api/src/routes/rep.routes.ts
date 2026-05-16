import express from 'express';
import { RepController } from '../controllers/rep.controller';
import { requireRole } from '../middleware/firebaseAuth.middleware';

const router = express.Router();
const ctrl = new RepController();

// Public endpoints for marketplace browsing
router.get('/', ctrl.listReps);
router.get('/:id', ctrl.getRepById);

// Protected rep endpoints
router.patch('/profile', requireRole('rep'), async (req: FirebaseAuthRequest, res) => {
  const { linkedinUrl, industry, bio, locationCountry, locationCity, availabilityStatus } = req.body;
  
  const updated = await prisma.repProfile.update({
    where: { userId: req.user!.id },
    data: {
      ...(linkedinUrl !== undefined && { linkedinUrl }),
      ...(industry !== undefined && { industry }),
      ...(bio !== undefined && { bio }),
      ...(locationCountry !== undefined && { locationCountry }),
      ...(locationCity !== undefined && { locationCity }),
      ...(availabilityStatus !== undefined && { availabilityStatus }),
    }
  });

  res.json({ success: true, data: updated });
});

router.post('/onboarding', requireRole('rep'), async (req, res) => {
  // TODO: Implement onboarding steps
  res.json({ success: true, data: { message: 'Rep onboarding endpoint - to be implemented' } });
});

export { router as repRoutes };
