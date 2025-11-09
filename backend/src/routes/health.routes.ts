import { Router, Request, Response } from 'express';
import { config } from '../config/env';
import prisma from '../config/database';
import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Basic health check - just returns OK
 */
router.get('/', async (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

/**
 * Detailed health check with dependency status
 */
router.get('/detailed', async (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  
  const health = {
    status: 'ok' as 'ok' | 'degraded' | 'down',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    system: {
      memory: {
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      },
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
    },
    dependencies: {
      database: {
        status: 'unknown' as 'ok' | 'error' | 'unknown',
        responseTime: 0,
      },
      redis: {
        status: 'unknown' as 'ok' | 'error' | 'unknown' | 'not_configured',
        responseTime: 0,
      },
    },
  };

  // Check database connection
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbEnd = Date.now();
    health.dependencies.database = {
      status: 'ok',
      responseTime: dbEnd - dbStart,
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    health.dependencies.database = {
      status: 'error',
      responseTime: 0,
    };
    health.status = 'degraded';
  }

  // Check Redis connection
  const redis = getRedisClient();
  if (redis) {
    try {
      const redisStart = Date.now();
      await redis.ping();
      const redisEnd = Date.now();
      health.dependencies.redis = {
        status: 'ok',
        responseTime: redisEnd - redisStart,
      };
    } catch (error) {
      logger.error('Redis health check failed:', error);
      health.dependencies.redis = {
        status: 'error',
        responseTime: 0,
      };
      // Redis is optional, so don't degrade overall status
    }
  } else {
    health.dependencies.redis = {
      status: 'not_configured',
      responseTime: 0,
    };
  }

  // Determine overall status
  if (health.dependencies.database.status === 'error') {
    health.status = 'down';
  } else if (health.dependencies.redis.status === 'error') {
    health.status = 'degraded'; // Redis is optional
  }

  const statusCode = health.status === 'down' ? 503 : health.status === 'degraded' ? 200 : 200;
  res.status(statusCode).json(health);
});

/**
 * Readiness probe - checks if app is ready to serve traffic
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // If we get here, database is ready
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

/**
 * Liveness probe - checks if app is alive
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;

