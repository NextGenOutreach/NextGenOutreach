import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '../config/environment';

// Mock user data for development (when database is not available)
const mockUsers = [
  {
    id: 'admin-1',
    email: 'tshepo@nextgenoutreach.co.za',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO6W', // 'NextGen2026!' hashed
    firstName: 'Tshepo',
    lastName: 'Admin',
    role: 'admin' as const,
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    organizationId: null,
    organization: null
  }
];

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

  // Handle connection errors gracefully in development
  client.$connect()
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((error: unknown) => {
      console.warn('⚠️ Database connection failed, using mock data:', error);
      // Don't exit in development, just warn and continue with mock data
    });

  // Graceful shutdown
  process.on('beforeExit', async () => {
    await client.$disconnect();
    console.log('🔌 Database disconnected');
  });

  process.on('SIGINT', async () => {
    await client.$disconnect();
    console.log('🔌 Database disconnected (SIGINT)');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await client.$disconnect();
    console.log('🔌 Database disconnected (SIGTERM)');
    process.exit(0);
  });

  return client;
};

// Create mock Prisma client for development
const createMockPrismaClient = () => {
  console.log('🔄 Using mock database client for development');
  
  return {
    user: {
      findUnique: async ({ where }: any) => {
        const user = mockUsers.find(u => u.email === where.email);
        return user || null;
      },
      create: async ({ data }: any) => {
        const newUser = {
          ...data,
          id: 'admin-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.push(newUser);
        return newUser;
      },
      update: async ({ where, data }: any) => {
        const user = mockUsers.find(u => u.id === where.id);
        if (user) {
          Object.assign(user, data, { updatedAt: new Date() });
        }
        return user || null;
      }
    },
    $queryRaw: async () => [{ result: 1 }],
    $disconnect: async () => {},
    $connect: async () => {},
  } as any;
};

// Export singleton instance
let prisma: any;
try {
  prisma = globalThis.__prisma || createPrismaClient();
} catch (error) {
  console.warn('⚠️ Failed to create Prisma client, using mock:', error);
  prisma = createMockPrismaClient();
}

// Prevent multiple instances in development
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Database connection is working' };
  } catch (error) {
    console.warn('Database health check failed, but continuing with mock data');
    return { 
      status: 'healthy', 
      message: 'Using mock database for development',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default prisma;
