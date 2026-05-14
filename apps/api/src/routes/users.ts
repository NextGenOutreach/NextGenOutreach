import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// All user routes will be implemented here
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'Users endpoint - to be implemented' } });
}));

export default router;