import { Request, Response, NextFunction } from 'express';
import { getAdminAuth } from '../lib/firebaseAdmin';
import { unauthorized, forbidden } from '../lib/response';
import prisma from '../lib/database';

export interface FirebaseAuthRequest extends Request {
  user?: {
    id: string;
    uid: string;
    email: string;
    role: string;
    status?: string;
  };
}

/**
 * Verifies a Firebase ID token, then finds or lazily creates the corresponding
 * Prisma User + profile so protected API routes can use req.user.id.
 */
export async function firebaseAuthMiddleware(
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return unauthorized(res, 'Authorization header required');
  }

  const idToken = header.split(' ')[1];

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);

    const email = decoded.email!;
    const roleRaw: string = (decoded.role as string) || 'client';
    // Normalise to lowercase (custom claims set by sync-claims use lowercase)
    const role = roleRaw.toLowerCase();

    // Map to Prisma enum string values (schema uses uppercase)
    const prismaRole = role === 'rep'
      ? 'REP'
      : role === 'admin'
      ? 'ADMIN'
      : role === 'super_admin'
      ? 'SUPER_ADMIN'
      : 'CLIENT';

    // Find or create the Prisma user record
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: `firebase:${decoded.uid}`,
          role: prismaRole as any,
          status: 'ACTIVE' as any,
          twoFaEnabled: false,
        },
      });

      // Create the matching profile
      if (prismaRole === 'CLIENT') {
        await prisma.clientProfile.create({
          data: {
            userId: user.id,
            plan: 'STARTER' as any,
            planStatus: 'inactive',
          },
        });
      } else if (prismaRole === 'REP') {
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
            totalReviews: 0,
          },
        });
      }
    }

    req.user = {
      id: user.id,
      uid: decoded.uid,
      email: user.email,
      role: (user.role as string).toLowerCase(),
      status: (user.status as string).toLowerCase(),
    };

    next();
  } catch {
    return unauthorized(res, 'Invalid or expired Firebase token');
  }
}

/**
 * Middleware to require one of the specified roles.
 * Must be used AFTER firebaseAuthMiddleware.
 */
export function requireRole(...roles: string[]) {
  return (req: FirebaseAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return unauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return forbidden(res, 'Insufficient permissions');
    }

    next();
  };
}

/** Optional auth — sets req.user if a valid token is present, but never rejects. */
export async function optionalFirebaseAuth(
  req: FirebaseAuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  const idToken = header.split(' ')[1];
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const user = await prisma.user.findUnique({ where: { email: decoded.email! } });
    if (user) {
      req.user = {
        id: user.id,
        uid: decoded.uid,
        email: user.email,
        role: (user.role as string).toLowerCase(),
      } as FirebaseAuthRequest['user'];
    }
  } catch {
    // ignore — optional auth
  }
  next();
}
