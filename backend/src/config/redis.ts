import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

export const createRedisClient = (): Redis | null => {
  // Skip Redis if URL is not set or empty
  if (!config.redis.url || config.redis.url.trim() === '') {
    logger.info('ℹ️  Redis not configured, skipping connection');
    return null;
  }

  if (redis) {
    return redis;
  }

  try {
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true; // Reconnect on READONLY error
        }
        return false;
      },
      lazyConnect: true, // Don't connect immediately
    });

    redis.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    redis.on('error', (err: any) => {
      // Only log if it's not a connection refused error (expected when Redis is not available)
      if (err.code !== 'ECONNREFUSED') {
        logger.warn('⚠️  Redis connection error (non-critical):', err.message);
      } else {
        // Connection refused is expected when Redis is not available - log as info
        logger.info('ℹ️  Redis not available, continuing without cache');
      }
      // Don't throw - allow app to continue without Redis
    });

    redis.on('close', () => {
      logger.warn('⚠️  Redis connection closed');
    });

    // Attempt to connect, but don't fail if it doesn't work
    redis.connect().catch(() => {
      logger.warn('⚠️  Redis connection failed, continuing without cache');
    });

    return redis;
  } catch (error) {
    logger.warn('⚠️  Failed to create Redis client, continuing without cache:', error);
    return null;
  }
};

export const getRedisClient = (): Redis | null => {
  if (!redis) {
    return createRedisClient();
  }
  return redis;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('Redis connection closed');
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await closeRedisConnection();
});

export default redis;

