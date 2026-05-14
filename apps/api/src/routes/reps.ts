import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'Reps endpoint - to be implemented' } });
}));

export default router;