import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from '../config/environment';
import { logSecurityEvent } from './logger';
import { Request, Response } from 'express';

// Store failed attempts in memory (in production, use Redis)
const failedAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of failedAttempts.entries()) {
    if (data.lockedUntil && data.lockedUntil < now) {
      failedAttempts.delete(key);
    } else if (data.lastAttempt < now - RATE_LIMIT_WINDOW_MS) {
      failedAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Check if user/IP is locked out
const isLockedOut = (identifier: string): boolean => {
  const attempts = failedAttempts.get(identifier);
  if (!attempts) return false;
  
  if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
    return true;
  }
  
  return false;
};

// Record failed attempt
const recordFailedAttempt = (identifier: string): { locked: boolean; remainingAttempts: number } => {
  const now = Date.now();
  const attempts = failedAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
  
  attempts.count++;
  attempts.lastAttempt = now;
  
  // Lock out after 5 failed attempts for 15 minutes
  if (attempts.count >= 5) {
    attempts.lockedUntil = now + (15 * 60 * 1000); // 15 minutes
    failedAttempts.set(identifier, attempts);
    
    logSecurityEvent('Account locked out', {
      identifier,
      failedAttempts: attempts.count,
      lockedUntil: new Date(attempts.lockedUntil).toISOString(),
    });
    
    return { locked: true, remainingAttempts: 0 };
  }
  
  failedAttempts.set(identifier, attempts);
  const remainingAttempts = Math.max(0, 5 - attempts.count);
  
  return { locked: false, remainingAttempts };
};

// Clear failed attempts on successful login
const clearFailedAttempts = (identifier: string) => {
  failedAttempts.delete(identifier);
};

// Get client identifier (IP or user ID)
const getClientIdentifier = (req: Request): string => {
  // Use user ID if available, otherwise IP
  const userId = (req as any).user?.id;
  return userId || req.ip || req.connection.remoteAddress || 'unknown';
};

// Enhanced rate limiter middleware for auth routes
export const authRateLimit = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many authentication attempts',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const identifier = getClientIdentifier(req);
    
    logSecurityEvent('Rate limit exceeded', {
      identifier,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    
    res.status(429).json({
      error: 'Too many authentication attempts',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    });
  },
});

// Account lockout middleware
export const accountLockout = (req: Request, res: Response, next: Function) => {
  const identifier = getClientIdentifier(req);
  
  if (isLockedOut(identifier)) {
    const attempts = failedAttempts.get(identifier);
    const lockTimeRemaining = attempts?.lockedUntil 
      ? Math.ceil((attempts.lockedUntil - Date.now()) / 1000)
      : 0;
    
    logSecurityEvent('Locked out user attempted access', {
      identifier,
      ip: req.ip,
      lockTimeRemaining,
    });
    
    return res.status(423).json({
      error: 'Account temporarily locked due to too many failed attempts',
      code: 'ACCOUNT_LOCKED',
      retryAfter: lockTimeRemaining,
    });
  }
  
  next();
};

// Middleware to record failed login attempts
export const recordFailedLogin = (req: Request, res: Response, next: Function) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Check if this is a failed login attempt (401 status)
    if (res.statusCode === 401) {
      const identifier = getClientIdentifier(req);
      const result = recordFailedAttempt(identifier);
      
      logSecurityEvent('Failed login attempt', {
        identifier,
        ip: req.ip,
        email: req.body?.email,
        userAgent: req.get('User-Agent'),
        remainingAttempts: result.remainingAttempts,
      });
      
      // Update response with remaining attempts info
      if (!result.locked && result.remainingAttempts > 0) {
        try {
          const responseData = typeof data === 'string' ? JSON.parse(data) : data;
          responseData.remainingAttempts = result.remainingAttempts;
          return originalSend.call(this, JSON.stringify(responseData));
        } catch {
          // Response is not JSON-parseable; send as-is
        }
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Middleware to clear failed attempts on successful login
export const clearFailedLogin = (req: Request, res: Response, next: Function) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Check if this is a successful login attempt (200 status)
    if (res.statusCode === 200) {
      const identifier = getClientIdentifier(req);
      clearFailedAttempts(identifier);
      
      logSecurityEvent('Successful login', {
        identifier,
        ip: req.ip,
        email: req.body?.email,
        userAgent: req.get('User-Agent'),
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

export {
  isLockedOut,
  recordFailedAttempt,
  clearFailedAttempts,
  getClientIdentifier,
};
