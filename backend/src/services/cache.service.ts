import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
}

export class CacheService {
  private defaultTTL = 3600; // 1 hour default

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client) {
      return null; // Cache unavailable, return null
    }

    try {
      const value = await client.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    const client = getRedisClient();
    if (!client) {
      return false; // Cache unavailable
    }

    try {
      const serialized = JSON.stringify(value);
      const cacheTTL = ttl || this.defaultTTL;
      
      if (cacheTTL > 0) {
        await client.setex(key, cacheTTL, serialized);
      } else {
        await client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) {
      return false;
    }

    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    const client = getRedisClient();
    if (!client) {
      return 0;
    }

    try {
      const keys = await client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      await client.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) {
      return false;
    }

    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set with automatic caching
   * Useful for caching expensive operations
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch data
    const data = await fetchFn();

    // Store in cache
    const cacheKey = options?.prefix ? `${options.prefix}:${key}` : key;
    await this.set(cacheKey, data, options?.ttl);

    return data;
  }

  /**
   * Invalidate cache for a patient (all related data)
   */
  async invalidatePatientCache(patientId: string): Promise<void> {
    const patterns = [
      `patient:${patientId}:*`,
      `patients:*`,
      `patient:${patientId}`,
    ];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }
  }

  /**
   * Invalidate cache for a user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `user:${userId}:*`,
      `users:*`,
    ];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async clear(): Promise<boolean> {
    const client = getRedisClient();
    if (!client) {
      return false;
    }

    try {
      await client.flushdb();
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }
}

export const cacheService = new CacheService();

