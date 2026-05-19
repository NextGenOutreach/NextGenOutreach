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

    // Map role to Prisma UserRole enum (uppercase)
    const prismaRole = (role?.toUpperCase() || 'CLIENT') as any;

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: prismaRole,
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

    // Generate tokens - convert role to UserRole type
    const registerRoleValue = user.role.toLowerCase() as any as UserRole;
    const registerPayload = { sub: user.id, email: user.email, role: registerRoleValue };
    const registerAccessToken = signAccessToken(registerPayload);
    const registerRefreshToken = signRefreshToken(registerPayload);

    return created(res, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase(),
        status: user.status
      },
      accessToken: registerAccessToken,
      refreshToken: registerRefreshToken
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

    // Generate tokens - convert role to UserRole type
    const loginRoleValue = user.role.toLowerCase() as any as UserRole;
    const loginPayload = { sub: user.id, email: user.email, role: loginRoleValue };
    const loginAccessToken = signAccessToken(loginPayload);
    const loginRefreshToken = signRefreshToken(loginPayload);

    return ok(res, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase(),
        status: user.status,
        clientProfile: user.clientProfile,
        repProfile: user.repProfile
      },
      accessToken: loginAccessToken,
      refreshToken: loginRefreshToken
    });
  }

  async syncClaims(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return unauthorized(res, 'Firebase ID token required');
    }

    const idToken = authHeader.split(' ')[1];

    try {
      const adminAuth = getAdminAuth();
      const decoded = await adminAuth.verifyIdToken(idToken);
      const email = (decoded.email || '').toLowerCase().trim();

      // Check database for user role (case-insensitive)
      const dbUser = await prisma.user.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' }
        }
      });

      if (dbUser) {
        await adminAuth.setCustomUserClaims(decoded.uid, { role: dbUser.role.toLowerCase() });
        return ok(res, { role: dbUser.role.toLowerCase(), _dbEmail: dbUser.email, _tokenEmail: email });
      }

      // New Firebase user — always assign 'client' by default.
      // Role upgrades (e.g. to 'rep') must be done by an admin via the admin API.
      const assignedRole = 'client';
      const prismaRole = 'CLIENT';

      const createdUser = await prisma.user.create({
        data: {
          email,
          passwordHash: `firebase:${decoded.uid}`,
          role: prismaRole as any,
          status: 'PENDING' as any,
          twoFaEnabled: false,
        },
      });

      await prisma.clientProfile.create({
        data: {
          userId: createdUser.id,
          plan: 'STARTER' as any,
          planStatus: 'inactive',
        },
      });

      await adminAuth.setCustomUserClaims(decoded.uid, { role: assignedRole });

      return ok(res, { role: assignedRole, _dbEmail: createdUser.email, _tokenEmail: email });
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
