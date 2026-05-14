import express from 'express';
import { RepController } from '../controllers/rep.controller';
import { requireRole } from '../middleware/firebaseAuth.middleware';

const router = express.Router();
const ctrl = new RepController();

// Public endpoints for marketplace browsing
router.get('/', ctrl.listReps);
router.get('/:id', ctrl.getRepById);

// Protected rep endpoints
router.post('/profile', requireRole('rep'), async (req, res) => {
  // TODO: Implement profile update
  res.json({ success: true, data: { message: 'Rep profile endpoint - to be implemented' } });
});

router.post('/onboarding', requireRole('rep'), async (req, res) => {
  // TODO: Implement onboarding steps
  res.json({ success: true, data: { message: 'Rep onboarding endpoint - to be implemented' } });
});

export { router as repRoutes };
