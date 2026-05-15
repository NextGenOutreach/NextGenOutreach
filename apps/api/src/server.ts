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
import { requestLogger } from './middleware/requestLogger';
import { morganStream } from './lib/logger';
import { authRateLimit, accountLockout, recordFailedLogin, clearFailedLogin } from './lib/rateLimiter';
import { NODE_ENV } from './config/environment';

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
import webhookRoutes from './routes/webhooks';
import healthRoutes from './routes/health';

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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);
app.use(requestLogger);

// Health check
app.use('/', healthRoutes);

// API routes
const apiRouter = express.Router();

// Public routes (no auth required)
apiRouter.use('/auth', authRateLimit, accountLockout, recordFailedLogin, clearFailedLogin, authRoutes);
apiRouter.use('/webhooks', webhookRoutes);

// Protected routes (auth required)
apiRouter.use('/users', authMiddleware, userRoutes);
apiRouter.use('/reps', authMiddleware, repRoutes);
apiRouter.use('/clients', authMiddleware, clientRoutes);
apiRouter.use('/campaigns', authMiddleware, campaignRoutes);
apiRouter.use('/billing', authMiddleware, billingRoutes);
apiRouter.use('/analytics', authMiddleware, analyticsRoutes);
apiRouter.use('/admin', authMiddleware, adminRoutes);
apiRouter.use('/rep', authMiddleware, repDashboardRoutes);

app.use('/api/v1', apiRouter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join_campaign', (campaignId: string) => {
    socket.join(`campaign_${campaignId}`);
    console.log(`Client ${socket.id} joined campaign ${campaignId}`);
  });

  socket.on('leave_campaign', (campaignId: string) => {
    socket.leave(`campaign_${campaignId}`);
    console.log(`Client ${socket.id} left campaign ${campaignId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
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
  console.log(`🚀 NextGenOutreach API server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.IO server ready`);
});

export default app;
