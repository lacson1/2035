// Test setup file for backend tests
import { vi } from 'vitest';

// Mock environment variables for all tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-purposes-only';

// Mock Redis client to avoid connection issues in tests
vi.mock('../src/config/redis', () => ({
  getRedisClient: () => null, // Return null to disable Redis in tests
  createRedisClient: () => null,
}));

// Mock logger to reduce noise in tests
vi.mock('../src/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));
