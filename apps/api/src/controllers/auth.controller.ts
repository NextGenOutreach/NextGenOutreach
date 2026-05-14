import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthRequest, requireAuth } from '../middleware/auth.middleware';
import { ok, created, unauthorized, badRequest } from '../lib/response';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { registerSchema, loginSchema, RegisterInput, LoginInput } from '@nextgenoutreach/validators';
import { UserRole } from '@nextgenoutreach/types';
import prisma from '../lib/database';

export class AuthController {
  async register(req: Request, res: Response) {
    const { email, password, role }: RegisterInput = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return badRequest(res, 'User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as UserRole,
        status: 'pending',
        twoFaEnabled: false
      }
    });

    // Create profile based on role
    if (role === 'client') {
      await prisma.clientProfile.create({
        data: {
          userId: user.id,
          plan: 'starter',
          planStatus: 'pending'
        }
      });
    } else if (role === 'rep') {
      await prisma.repProfile.create({
        data: {
          userId: user.id,
          linkedinUrl: '',
          linkedinFollowers: 0,
          idVerified: false,
          twoFaConfirmed: false,
          availabilityStatus: 'unavailable',
          maxClients: 3,
          rating: 0,
          totalReviews: 0
        }
      });
    }

    // Generate tokens
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return created(res, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      accessToken,
      refreshToken
    });
  }

  async login(req: Request, res: Response) {
    const { email, password }: LoginInput = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clientProfile: true,
        repProfile: true
      }
    });

    if (!user) {
      return unauthorized(res, 'Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active') {
      return unauthorized(res, 'Account is not active');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return unauthorized(res, 'Invalid credentials');
    }

    // Check 2FA if enabled
    if (user.twoFaEnabled) {
      // TODO: Implement TOTP verification
      // For now, we'll skip this implementation
    }

    // Generate tokens
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return ok(res, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        clientProfile: user.clientProfile,
        repProfile: user.repProfile
      },
      accessToken,
      refreshToken
    });
  }

  async refresh(req: AuthRequest, res: Response) {
    if (!req.user) {
      return unauthorized(res);
    }

    // Generate new tokens
    const payload = { sub: req.user.id, email: req.user.email, role: req.user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return ok(res, {
      accessToken,
      refreshToken
    });
  }

  async logout(req: AuthRequest, res: Response) {
    // TODO: Implement token invalidation/blacklisting
    return ok(res, { message: 'Logged out successfully' });
  }

  async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      return unauthorized(res);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        clientProfile: true,
        repProfile: true
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        twoFaEnabled: true,
        createdAt: true,
        clientProfile: true,
        repProfile: true
      }
    });

    return ok(res, { user });
  }
}
