import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

router.post('/payfast', asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'Webhooks endpoint - to be implemented' } });
}));

export default router;