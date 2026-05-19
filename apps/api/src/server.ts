import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { firebaseAuthMiddleware as authMiddleware } from './middleware/firebaseAuth.middleware';
import { asyncHandler } from './middleware/asyncHandler';
import { requestLogger } from './middleware/requestLogger';
import { morganStream, logger } from './lib/logger';
import { authRateLimit, accountLockout, recordFailedLogin, clearFailedLogin } from './lib/rateLimiter';
import { NODE_ENV } from './config/environment';
import prisma from './lib/database';

// Import routes
import { authRoutes } from './routes/auth.routes';
import userRoutes from './routes/users';
import { repRoutes } from './routes/rep.routes';
import clientRoutes from './routes/clients';
import campaignRoutes from './routes/campaigns';
import billingRoutes from './routes/billing';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin';
import repDashboardRoutes from './routes/rep-dashboard';
import crmRoutes from './routes/crm';
import prospectRoutes from './routes/prospects';
import taskRoutes from './routes/tasks';
import webhookRoutes from './routes/webhooks';
import healthRoutes from './routes/health';
import browserProfileRoutes from './routes/browser-profiles';
import proxyRoutes from './routes/proxies';
import activityLogRoutes from './routes/activity-log';
import outreachQueueRoutes from './routes/outreach-queue';
import linkedinHealthRoutes from './routes/linkedin-health';
import commsRoutes from './routes/comms';
import gamificationRoutes from './routes/gamification';
import dailyReportRoutes from './routes/daily-report';
import { startCronJobs } from './lib/cron';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Health routes MUST be registered before any redirect middleware
app.use('/', healthRoutes);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// HTTPS enforcement in production
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.sendgrid.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      childSrc: ["'none'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));

// MEDIUM FIX: Reduced from 10mb to 100kb default, with larger limit on upload routes
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(limiter);
app.use(requestLogger);

// API routes
const apiRouter = express.Router();

// Public routes (no auth required)
apiRouter.use('/auth', authRateLimit, accountLockout, recordFailedLogin, clearFailedLogin, authRoutes);
apiRouter.use('/webhooks', webhookRoutes);
apiRouter.use('/reps', repRoutes); // Marketplace reps are public

// Intercept campaign activity creation for real-time notifications
apiRouter.post('/campaigns/:id/activity', authMiddleware, asyncHandler(async (req, res, next) => {
  const { activityType, prospectName } = req.body;
  if (activityType === 'MEETING_BOOKED') {
    io.to(`campaign_${req.params.id}`).emit('new_lead', {
      type: 'MEETING_BOOKED',
      prospectName,
      campaignId: req.params.id,
      timestamp: new Date()
    });
  }
  next();
}));

// Protected routes (auth required)
apiRouter.use('/users', authMiddleware, userRoutes);
apiRouter.use('/clients', authMiddleware, clientRoutes);
apiRouter.use('/campaigns', authMiddleware, campaignRoutes);
apiRouter.use('/billing', authMiddleware, billingRoutes);
apiRouter.use('/analytics', authMiddleware, analyticsRoutes);
apiRouter.use('/admin', authMiddleware, adminRoutes);
apiRouter.use('/rep', authMiddleware, repDashboardRoutes);
apiRouter.use('/crm', authMiddleware, crmRoutes);
apiRouter.use('/prospects', authMiddleware, prospectRoutes);
apiRouter.use('/tasks', authMiddleware, taskRoutes);
apiRouter.use('/browser-profiles', authMiddleware, browserProfileRoutes);
apiRouter.use('/proxies', authMiddleware, proxyRoutes);
apiRouter.use('/activity-log', authMiddleware, activityLogRoutes);
apiRouter.use('/outreach-queue', authMiddleware, outreachQueueRoutes);
apiRouter.use('/linkedin-health', authMiddleware, linkedinHealthRoutes);
apiRouter.use('/comms', authMiddleware, commsRoutes);
apiRouter.use('/gamification', authMiddleware, gamificationRoutes);
apiRouter.use('/daily-report', authMiddleware, dailyReportRoutes);

app.use('/api/v1', apiRouter);

// Socket.IO authentication — reject connections without a valid Firebase token
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    const { getAdminAuth } = await import('./lib/firebaseAdmin');
    await getAdminAuth().verifyIdToken(token);
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join_campaign', (campaignId: string) => {
    socket.join(`campaign_${campaignId}`);
    logger.debug(`Socket ${socket.id} joined campaign ${campaignId}`);
  });

  socket.on('leave_campaign', (campaignId: string) => {
    socket.leave(`campaign_${campaignId}`);
    logger.debug(`Socket ${socket.id} left campaign ${campaignId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Export io instance for use in services
export { io };

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      statusCode: 404
    },
    meta: {
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`🚀 NextGenOutreach API server running on port ${PORT}`);
  logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
  logger.info(`🔌 Socket.IO server ready`);
  startCronJobs();
});

// MEDIUM FIX: Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    // Close database connections
    prisma.$disconnect().then(() => {
      logger.info('Database connections closed');
      process.exit(0);
    });
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
});

export default app;
