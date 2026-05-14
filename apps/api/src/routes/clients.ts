import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'Clients endpoint - to be implemented' } });
}));

export default router;