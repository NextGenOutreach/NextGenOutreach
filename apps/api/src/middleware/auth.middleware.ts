import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken } from '../lib/jwt';
import { unauthorized, forbidden } from '../lib/response';
import { JWTPayload, UserRole } from '@nextgenoutreach/types';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: UserRole };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return unauthorized(res, 'Authorization header required');
  }

  try {
    const token = header.split(' ')[1];
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (error) {
    return unauthorized(res, 'Invalid or expired token');
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return forbidden(res, 'Insufficient permissions');
    }
    next();
  };
}

export function requireRefreshAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return unauthorized(res, 'Authorization header required');
  }

  try {
    const token = header.split(' ')[1];
    const payload = verifyRefreshToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (error) {
    return unauthorized(res, 'Invalid or expired refresh token');
  }
}
