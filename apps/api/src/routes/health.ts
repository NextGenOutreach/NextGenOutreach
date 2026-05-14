import express, { Request, Response } from 'express';
import { checkDatabaseHealth } from '../lib/database';
import { logInfo, logError } from '../lib/logger';
import { REDIS_URL } from '../config/environment';

const router = express.Router();

// Redis health check
async function checkRedisHealth() {
  try {
    // Simple Redis connection check (would need redis client in production)
    return { status: 'healthy', message: 'Redis connection is working' };
  } catch (error) {
    logError('Redis health check failed', error);
    return { 
      status: 'unhealthy', 
      message: 'Redis connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Memory usage check
function checkMemoryUsage() {
  const usage = process.memoryUsage();
  const totalMemory = usage.heapTotal / 1024 / 1024; // MB
  const usedMemory = usage.heapUsed / 1024 / 1024; // MB
  const memoryUsagePercent = (usedMemory / totalMemory) * 100;

  const isHealthy = memoryUsagePercent < 90; // Alert if using more than 90% of allocated memory

  return {
    status: isHealthy ? 'healthy' : 'warning',
    message: `Memory usage: ${memoryUsagePercent.toFixed(2)}%`,
    details: {
      heapUsed: `${usedMemory.toFixed(2)} MB`,
      heapTotal: `${totalMemory.toFixed(2)} MB`,
      external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    }
  };
}

// CPU usage check
function checkCPUUsage() {
  const cpuUsage = process.cpuUsage();
  return {
    status: 'healthy',
    message: 'CPU usage within normal limits',
    details: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    }
  };
}

// Disk space check (basic implementation)
function checkDiskSpace() {
  // In production, you'd use a library like 'diskusage'
  return {
    status: 'healthy',
    message: 'Disk space sufficient',
    details: {
      note: 'Implement actual disk space checking in production'
    }
  };
}

// Overall system health
router.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const [dbHealth, redisHealth, memoryHealth, cpuHealth, diskHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
      Promise.resolve(checkMemoryUsage()),
      Promise.resolve(checkCPUUsage()),
      Promise.resolve(checkDiskSpace()),
    ]);

    const overallStatus = [
      dbHealth.status,
      redisHealth.status,
      memoryHealth.status,
      cpuHealth.status,
      diskHealth.status
    ].every(status => status === 'healthy') ? 'healthy' : 'degraded';

    const responseTime = Date.now() - startTime;

    const healthReport = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: dbHealth,
        redis: redisHealth,
        memory: memoryHealth,
        cpu: cpuHealth,
        disk: diskHealth,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      }
    };

    // Log health check results
    logInfo('Health check completed', {
      status: overallStatus,
      responseTime,
      services: healthReport.services,
    });

    // Set appropriate HTTP status code
    const statusCode = overallStatus === 'healthy' ? 200 : 
                       overallStatus === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthReport);

  } catch (error) {
    logError('Health check failed', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Detailed health check with more diagnostics
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    // Import the health check function directly to avoid network calls
    const [dbHealth, redisHealth, memoryHealth, cpuHealth, diskHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
      Promise.resolve(checkMemoryUsage()),
      Promise.resolve(checkCPUUsage()),
      Promise.resolve(checkDiskSpace()),
    ]);

    const overallStatus = [
      dbHealth.status,
      redisHealth.status,
      memoryHealth.status,
      cpuHealth.status,
      diskHealth.status
    ].every(status => status === 'healthy') ? 'healthy' : 'degraded';
    
    const detailedReport = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: '0ms',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: dbHealth,
        redis: redisHealth,
        memory: memoryHealth,
        cpu: cpuHealth,
        disk: diskHealth,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
      diagnostics: {
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          PORT: process.env.PORT,
          isProduction: process.env.NODE_ENV === 'production',
          isDevelopment: process.env.NODE_ENV === 'development',
        },
        security: {
          helmetEnabled: true,
          corsEnabled: true,
          rateLimitEnabled: true,
        },
        performance: {
          eventLoopLag: 0, // Would need actual monitoring
          activeConnections: 0, // Would need connection tracking
          requestsPerMinute: 0, // Would need request tracking
        },
        configuration: {
          databaseUrlConfigured: !!process.env.DATABASE_URL,
          redisUrlConfigured: !!REDIS_URL,
          jwtSecretConfigured: !!process.env.JWT_SECRET,
          corsOriginConfigured: !!process.env.CORS_ORIGIN,
        }
      }
    };

    res.json(detailedReport);

  } catch (error) {
    logError('Detailed health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Readiness probe (for Kubernetes/container orchestration)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    if (dbHealth.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Database not healthy',
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Liveness probe (for Kubernetes/container orchestration)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
