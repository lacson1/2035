import { Router, Request, Response } from 'express';
import { config } from '../config/env';
import prisma from '../config/database';
import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { HEALTH_CHECK } from '../config/constants';
import os from 'os';

const router = Router();

/**
 * Basic health check - just returns OK
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

/**
 * Detailed health check with dependency status
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check with dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is degraded or down
 */
router.get('/detailed', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const health = {
    status: 'ok' as 'ok' | 'degraded' | 'down',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    responseTime: 0,
    dependencies: {
      database: {
        status: 'unknown' as 'ok' | 'error' | 'unknown',
        responseTime: 0,
        message: '',
      },
      redis: {
        status: 'unknown' as 'ok' | 'error' | 'unknown' | 'not_configured',
        responseTime: 0,
        message: '',
      },
    },
    system: {
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      cpu: {
        loadAverage: [] as number[],
      },
      disk: {
        // Will be populated if available
        free: 0,
        total: 0,
        percentage: 0,
      },
    },
  };

  try {
    // Check database connection with timeout
    const dbCheckPromise = (async () => {
      try {
        const dbStart = Date.now();
        await Promise.race([
          prisma.$queryRaw`SELECT 1`,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database timeout')), HEALTH_CHECK.TIMEOUT_MS)
          ),
        ]);
        const dbEnd = Date.now();
        health.dependencies.database = {
          status: 'ok',
          responseTime: dbEnd - dbStart,
          message: 'Connected',
        };
      } catch (error: any) {
        logger.error('Database health check failed:', error);
        health.dependencies.database = {
          status: 'error',
          responseTime: 0,
          message: error.message || 'Connection failed',
        };
        health.status = 'degraded';
      }
    })();

    // Check Redis connection
    const redisCheckPromise = (async () => {
      const redis = getRedisClient();
      if (redis) {
        try {
          const redisStart = Date.now();
          await Promise.race([
            redis.ping(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Redis timeout')), HEALTH_CHECK.TIMEOUT_MS)
            ),
          ]);
          const redisEnd = Date.now();
          health.dependencies.redis = {
            status: 'ok',
            responseTime: redisEnd - redisStart,
            message: 'Connected',
          };
        } catch (error: any) {
          logger.error('Redis health check failed:', error);
          health.dependencies.redis = {
            status: 'error',
            responseTime: 0,
            message: error.message || 'Connection failed',
          };
          // Redis is optional, so don't degrade overall status unless critical
        }
      } else {
        health.dependencies.redis = {
          status: 'not_configured',
          responseTime: 0,
          message: 'Redis not configured',
        };
      }
    })();

    // Check system resources
    try {
      const memUsage = process.memoryUsage();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      health.system.memory = {
        used: Math.round(usedMem / 1024 / 1024), // MB
        total: Math.round(totalMem / 1024 / 1024), // MB
        percentage: Math.round((usedMem / totalMem) * 100),
      };

      health.system.cpu = {
        loadAverage: os.loadavg(),
      };
    } catch (error) {
      logger.warn('System resource check failed:', error);
    }

    // Wait for all checks
    await Promise.all([dbCheckPromise, redisCheckPromise]);

    // Determine overall status
    if (health.dependencies.database.status === 'error') {
      health.status = 'down';
    } else if (health.dependencies.redis.status === 'error') {
      health.status = 'degraded'; // Redis is optional
    }

    health.responseTime = Date.now() - startTime;

    const statusCode = health.status === 'down' ? 503 : health.status === 'degraded' ? 200 : 200;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    health.status = 'down';
    health.responseTime = Date.now() - startTime;
    res.status(503).json(health);
  }
});

/**
 * Readiness probe - checks if system is ready to accept traffic
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is ready
 *       503:
 *         description: System is not ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  const checks = {
    database: false,
    redis: true, // Optional, so default to true
  };

  try {
    // Check database (required)
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), HEALTH_CHECK.TIMEOUT_MS)
      ),
    ]);
    checks.database = true;
  } catch (error) {
    logger.error('Readiness check - Database failed:', error);
    checks.database = false;
  }

  // Check Redis (optional)
  const redis = getRedisClient();
  if (redis) {
    try {
      await Promise.race([
        redis.ping(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), HEALTH_CHECK.TIMEOUT_MS)
        ),
      ]);
      checks.redis = true;
    } catch (error) {
      logger.warn('Readiness check - Redis failed (optional):', error);
      checks.redis = false;
    }
  }

  const isReady = checks.database && (checks.redis || !redis); // Database required, Redis optional

  if (isReady) {
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks,
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
    });
  }
});

/**
 * Liveness probe - checks if app is alive
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is alive
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
  });
});

export default router;
