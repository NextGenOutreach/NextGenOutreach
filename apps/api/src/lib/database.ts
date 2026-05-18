import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '../config/environment';
import { logger } from './logger';

// Railway (and some other providers) supply postgres:// — Prisma requires postgresql://
const normaliseDbUrl = (url: string) =>
  url.startsWith('postgres://') ? url.replace('postgres://', 'postgresql://') : url;

// Global variable to store Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with connection pooling and error handling
const createPrismaClient = () => {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: normaliseDbUrl(DATABASE_URL),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Handle connection errors — log but don't kill the process so Railway
  // health-check endpoint can still respond and surface the real error.
  client.$connect()
    .then(() => {
      logger.info('✅ Database connected successfully');
    })
    .catch((error: unknown) => {
      logger.error('❌ Database connection failed — check DATABASE_URL', { error });
      // Do NOT call process.exit(1) — let the health endpoint report the issue
    });

  // Graceful shutdown
  const disconnect = async () => {
    await client.$disconnect();
    logger.info('🔌 Database disconnected');
  };

  process.on('beforeExit', disconnect);
  process.on('SIGINT', async () => {
    await disconnect();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await disconnect();
    process.exit(0);
  });

  return client;
};

// Export singleton instance
const prisma = globalThis.__prisma || createPrismaClient();

// Prevent multiple instances in development
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await (prisma as any).$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Database connection is working' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default prisma;
