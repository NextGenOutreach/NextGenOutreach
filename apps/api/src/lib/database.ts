import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '../config/environment';

// Global variable to store Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with connection pooling and error handling
const createPrismaClient = () => {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Handle connection errors
  client.$connect()
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((error: unknown) => {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    });

  // Graceful shutdown
  const disconnect = async () => {
    await client.$disconnect();
    console.log('🔌 Database disconnected');
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
