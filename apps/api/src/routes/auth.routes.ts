import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { requireAuth, requireRefreshAuth } from '../middleware/auth.middleware';
import { registerSchema, loginSchema } from '@nextgenoutreach/validators';

const router = express.Router();
const ctrl = new AuthController();

router.post('/register',        validate(registerSchema),  ctrl.register);
router.post('/login',           validate(loginSchema),     ctrl.login);
router.post('/refresh',         requireRefreshAuth,        ctrl.refresh);
router.post('/logout',          requireAuth,               ctrl.logout);
router.get('/me',               requireAuth,               ctrl.me);

export { router as authRoutes };
