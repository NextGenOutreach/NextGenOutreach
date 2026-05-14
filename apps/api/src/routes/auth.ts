import express, { Request, Response } from 'express';
import { z } from 'zod';
import { JWTUtils } from '../utils/jwt';
import prisma from '../lib/database';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/environment';
import { logError, logInfo, logAuthEvent, logSecurityEvent } from '../lib/logger';

const router = express.Router();

// Login validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  try {
    // Validate input
    const { email, password } = loginSchema.parse(req.body);

    logAuthEvent('Login attempt', undefined, {
      email,
      ip: clientIP,
      userAgent,
    });

    let user = null;

    // Check for admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      logAuthEvent('Admin login attempt', undefined, {
        email,
        ip: clientIP,
        userAgent,
      });

      // Create or find admin user in database
      user = await prisma.user.findUnique({
        where: { email: ADMIN_EMAIL },
        include: {
          organization: true,
        },
      });

      if (!user) {
        // Create admin user if it doesn't exist
        const hashedPassword = await JWTUtils.hashPassword(ADMIN_PASSWORD);
        user = await prisma.user.create({
          data: {
            email: ADMIN_EMAIL,
            passwordHash: hashedPassword,
            firstName: 'Tshepo',
            lastName: 'Admin',
            role: 'admin',
            isActive: true,
            emailVerified: true,
          },
          include: {
            organization: true,
          },
        });

        logAuthEvent('Admin user created', user.id, {
          email: user.email,
          ip: clientIP,
        });
      }
    } else {
      // Regular user login - find user in database
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          organization: true,
        },
      });

      if (!user) {
        logSecurityEvent('Login failed - user not found', {
          email,
          ip: clientIP,
          userAgent,
        });
        
        return res.status(401).json({
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Verify password
      const isPasswordValid = await JWTUtils.comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        logSecurityEvent('Login failed - invalid password', {
          email,
          userId: user.id,
          ip: clientIP,
          userAgent,
        });
        
        return res.status(401).json({
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
    }

    // Check if user is active
    if (!user.isActive) {
      logSecurityEvent('Login failed - account deactivated', {
        email,
        userId: user.id,
        ip: clientIP,
        userAgent,
      });
      
      return res.status(401).json({
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if email is verified (skip for admin)
    if (!user.emailVerified && email !== ADMIN_EMAIL) {
      logSecurityEvent('Login failed - email not verified', {
        email,
        userId: user.id,
        ip: clientIP,
        userAgent,
      });
      
      return res.status(401).json({
        error: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || undefined,
    };

    const { accessToken, refreshToken } = JWTUtils.generateTokenPair(tokenPayload);

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const responseTime = Date.now() - startTime;

    logAuthEvent('Login successful', user.id, {
      email: user.email,
      role: user.role,
      ip: clientIP,
      userAgent,
      responseTime,
    });

    // Return success response
    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
        } : null,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logError('Login error', error, {
      email: req.body?.email,
      ip: clientIP,
      userAgent,
      responseTime,
    });
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    // Verify refresh token
    const decoded = JWTUtils.verifyRefreshToken(refreshToken);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || undefined,
    };

    const { accessToken, refreshToken: newRefreshToken } = JWTUtils.generateTokenPair(tokenPayload);

    // Update refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken,
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error instanceof Error) {
      return res.status(401).json({
        error: error.message,
        code: 'REFRESH_TOKEN_ERROR'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // Clear refresh token cookie
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 0,
    });

    res.json({
      message: 'Logout successful',
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    // TODO: Implement registration logic
    res.json({
      success: true,
      data: { message: 'Registration endpoint - to be implemented' }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;
