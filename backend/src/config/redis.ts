import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

export const createRedisClient = (): Redis => {
  if (redis) {
    return redis;
  }

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
  });

  redis.on('connect', () => {
    logger.info('✅ Redis connected successfully');
  });

  redis.on('error', (err) => {
    logger.error('❌ Redis connection error:', err);
    // Don't throw - allow app to continue without Redis
  });

  redis.on('close', () => {
    logger.warn('⚠️ Redis connection closed');
  });

  return redis;
};

export const getRedisClient = (): Redis | null => {
  if (!redis) {
    try {
      return createRedisClient();
    } catch (error) {
      logger.error('Failed to create Redis client:', error);
      return null;
    }
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

