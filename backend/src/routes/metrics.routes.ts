import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import prisma from '../config/database';
import { getRedisClient } from '../config/redis';
import { metricsCollector } from '../utils/metrics';

const router = Router();

// Simple in-memory metrics store (in production, use Redis or Prometheus)
interface Metrics {
  requests: {
    total: number;
    byMethod: Record<string, number>;
    byStatus: Record<number, number>;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
  };
  responseTimes: number[];
  database: {
    queries: number;
    slowQueries: number;
  };
  cache: {
    hits: number;
    misses: number;
  };
  lastUpdated: Date;
}

let metrics: Metrics = {
  requests: {
    total: 0,
    byMethod: {},
    byStatus: {},
  },
  errors: {
    total: 0,
    byType: {},
  },
  responseTimes: [],
  database: {
    queries: 0,
    slowQueries: 0,
  },
  cache: {
    hits: 0,
    misses: 0,
  },
  lastUpdated: new Date(),
};

// Keep only last 1000 response times for memory efficiency
const MAX_RESPONSE_TIMES = 1000;

/**
 * Get application metrics
 * @swagger
 * /api/v1/metrics:
 *   get:
 *     summary: Get application metrics (Admin only)
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    // Check if user has admin role
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
      });
    }

    // Get base metrics from collector
    const baseMetrics = metricsCollector.getMetrics();

    // Get additional stats
    const dbStats = await getDatabaseStats();
    const cacheStats = await getCacheStats();
    const systemStats = getSystemStats();

    const response = {
      timestamp: new Date().toISOString(),
      ...baseMetrics,
      database: dbStats,
      cache: cacheStats,
      system: systemStats,
    };

    res.json({ data: response });
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch metrics',
    });
  }
});

/**
 * Reset metrics (admin only)
 */
router.post('/reset', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
      });
    }

    metricsCollector.reset();

    res.json({
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error resetting metrics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to reset metrics',
    });
  }
});

// Note: Metrics recording is handled by metricsCollector in utils/metrics.ts
// The middleware calls metricsCollector.recordRequest() automatically

async function getDatabaseStats() {
  try {
    // Get connection pool stats if available
    const poolStats = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    return {
      tables: Number(poolStats[0]?.count || 0),
    };
  } catch (error) {
    logger.warn('Failed to get database stats:', error);
    return {};
  }
}

async function getCacheStats() {
  const redis = getRedisClient();
  if (!redis) {
    return {
      enabled: false,
    };
  }

  try {
    const info = await redis.info('stats');
    // Parse Redis INFO stats (simplified)
    return {
      enabled: true,
      connected: true,
    };
  } catch (error) {
    logger.warn('Failed to get cache stats:', error);
    return {
      enabled: true,
      connected: false,
    };
  }
}

function getSystemStats() {
  const memUsage = process.memoryUsage();
  return {
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    },
    uptime: process.uptime(),
    nodeVersion: process.version,
  };
}

export default router;
