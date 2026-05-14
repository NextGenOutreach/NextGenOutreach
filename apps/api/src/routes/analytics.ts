import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

router.get('/overview', asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'Analytics endpoint - to be implemented' } });
}));

export default router;