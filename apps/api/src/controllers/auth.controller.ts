import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth.middleware';
import { ok, created, unauthorized, badRequest } from '../lib/response';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import { RegisterInput, LoginInput } from '@nextgenoutreach/validators';
import { UserRole } from '@nextgenoutreach/types';
import prisma from '../lib/database';
import { getAdminAuth } from '../lib/firebaseAdmin';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const speakeasy = require('speakeasy') as {
  totp: { verify(opts: { secret: string; encoding: string; token: string; window?: number }): boolean };
};

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
        role: (role?.toUpperCase() || 'CLIENT') as UserRole,
        status: 'PENDING',
        twoFaEnabled: false
      }
    });

    // Create profile based on role
    if (role?.toLowerCase() === 'client') {
      await prisma.clientProfile.create({
        data: {
          userId: user.id,
          plan: 'STARTER',
          planStatus: 'pending'
        }
      });
    } else if (role?.toLowerCase() === 'rep') {
      await prisma.repProfile.create({
        data: {
          userId: user.id,
          linkedinUrl: '',
          linkedinFollowers: 0,
          onboardingStep: 1,
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
    if (user.status !== 'ACTIVE') {
      return unauthorized(res, 'Account is not active');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return unauthorized(res, 'Invalid credentials');
    }

    // Check 2FA if enabled
    if (user.twoFaEnabled) {
      const { totpCode } = req.body as LoginInput & { totpCode?: string };
      if (!totpCode) {
        return res.status(200).json({ success: true, data: { twoFaRequired: true } });
      }
      if (!user.twoFaSecret) {
        return unauthorized(res, 'Two-factor authentication is misconfigured');
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFaSecret,
        encoding: 'base32',
        token: totpCode,
        window: 1,
      });
      if (!verified) {
        return unauthorized(res, 'Invalid two-factor authentication code');
      }
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

  async syncClaims(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return unauthorized(res, 'Firebase ID token required');
    }

    const idToken = authHeader.split(' ')[1];
    const { role } = req.body as { role?: string };

    try {
      const adminAuth = getAdminAuth();
      const decoded = await adminAuth.verifyIdToken(idToken);
      const email = decoded.email || '';
      console.log('[sync-claims] email from token:', email);

      // Check database for user role first
      const dbUser = await prisma.user.findUnique({
        where: { email }
      });
      console.log('[sync-claims] dbUser:', dbUser ? { email: dbUser.email, role: dbUser.role } : null);

      if (dbUser?.role) {
        // Sync database role to Firebase claims
        await adminAuth.setCustomUserClaims(decoded.uid, { role: dbUser.role.toLowerCase() });
        console.log('[sync-claims] returning DB role:', dbUser.role.toLowerCase());
        return ok(res, { role: dbUser.role.toLowerCase() });
      }

      // Fallback to existing Firebase claims
      const userRecord = await adminAuth.getUser(decoded.uid);
      const existingRole = (userRecord.customClaims as { role?: string } | null)?.role;

      if (existingRole) {
        return ok(res, { role: existingRole });
      }

      // Default role assignment for new users
      const assignedRole = role === 'rep' ? 'rep' : 'client';
      await adminAuth.setCustomUserClaims(decoded.uid, { role: assignedRole });

      // Create user in database
      await prisma.user.create({
        data: {
          email,
          passwordHash: '', // Firebase handles auth
          role: assignedRole.toUpperCase() as UserRole,
          status: 'PENDING',
          twoFaEnabled: false
        }
      });

      return ok(res, { role: assignedRole });
    } catch {
      return unauthorized(res, 'Invalid or expired Firebase token');
    }
  }

  async refresh(req: FirebaseAuthRequest, res: Response) {
    if (!req.user) {
      return unauthorized(res);
    }

    // Generate new tokens (if still needed, though Firebase handles this)
    const payload = { sub: req.user.id, email: req.user.email, role: req.user.role as UserRole };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return ok(res, {
      accessToken,
      refreshToken
    });
  }

  async logout(req: FirebaseAuthRequest, res: Response) {
    // TODO: Implement token invalidation/blacklisting if needed
    return ok(res, { message: 'Logged out successfully' });
  }

  async me(req: FirebaseAuthRequest, res: Response) {
    if (!req.user) {
      return unauthorized(res);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
