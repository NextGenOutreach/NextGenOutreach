import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { firebaseAuthMiddleware } from '../middleware/firebaseAuth.middleware';

const router = express.Router();
const ctrl = new AuthController();

/**
 * Public routes (or routes with custom token handling)
 */
router.post('/sync-claims', ctrl.syncClaims);

/**
 * Protected routes
 */
router.get('/me', firebaseAuthMiddleware, ctrl.me);
router.post('/logout', firebaseAuthMiddleware, ctrl.logout);

export { router as authRoutes };
