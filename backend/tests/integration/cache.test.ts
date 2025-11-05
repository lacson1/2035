import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cacheService } from '../../src/services/cache.service';

describe('Cache Service', () => {
  beforeAll(async () => {
    // Clear cache before tests
    await cacheService.clear();
  });

  afterAll(async () => {
    // Cleanup
    await cacheService.clear();
  });

  describe('Basic Operations', () => {
    it('should set and get value', async () => {
      const key = 'test:key';
      const value = { test: 'data' };

      await cacheService.set(key, value);
      const cached = await cacheService.get(key);

      expect(cached).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const cached = await cacheService.get('non:existent:key');
      expect(cached).toBeNull();
    });

    it('should delete value', async () => {
      const key = 'test:delete';
      await cacheService.set(key, { data: 'test' });
      await cacheService.delete(key);

      const cached = await cacheService.get(key);
      expect(cached).toBeNull();
    });

    it('should check if key exists', async () => {
      const key = 'test:exists';
      await cacheService.set(key, { data: 'test' });

      const exists = await cacheService.exists(key);
      expect(exists).toBe(true);

      await cacheService.delete(key);
      const notExists = await cacheService.exists(key);
      expect(notExists).toBe(false);
    });
  });

  describe('TTL', () => {
    it('should expire value after TTL', async () => {
      const key = 'test:ttl';
      await cacheService.set(key, { data: 'test' }, 1); // 1 second TTL

      const cached = await cacheService.get(key);
      expect(cached).not.toBeNull();

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      const expired = await cacheService.get(key);
      expect(expired).toBeNull();
    });
  });

  describe('getOrSet', () => {
    it('should fetch and cache on miss', async () => {
      const key = 'test:getorset';
      let fetchCount = 0;

      const fetchFn = async () => {
        fetchCount++;
        return { data: `fetched ${fetchCount}` };
      };

      // First call - should fetch
      const result1 = await cacheService.getOrSet(key, fetchFn);
      expect(result1.data).toBe('fetched 1');
      expect(fetchCount).toBe(1);

      // Second call - should use cache
      const result2 = await cacheService.getOrSet(key, fetchFn);
      expect(result2.data).toBe('fetched 1');
      expect(fetchCount).toBe(1); // Should not increment
    });
  });

  describe('Pattern Deletion', () => {
    it('should delete keys matching pattern', async () => {
      // Set multiple keys
      await cacheService.set('patient:1:data', { id: 1 });
      await cacheService.set('patient:2:data', { id: 2 });
      await cacheService.set('patient:3:data', { id: 3 });
      await cacheService.set('other:data', { id: 4 });

      // Delete pattern
      const deleted = await cacheService.deletePattern('patient:*');
      expect(deleted).toBeGreaterThanOrEqual(3);

      // Verify deleted
      expect(await cacheService.get('patient:1:data')).toBeNull();
      expect(await cacheService.get('patient:2:data')).toBeNull();
      expect(await cacheService.get('patient:3:data')).toBeNull();

      // Verify other key still exists
      expect(await cacheService.get('other:data')).not.toBeNull();
    });
  });
});

