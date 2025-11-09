import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../src/services/auth.service';
import prisma from '../../../src/config/database';
import { config } from '../../../src/config/env';

// Mock Prisma
vi.mock('../../../src/config/database', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('validateCredentials', () => {
    it('should return user if credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'physician',
        isActive: true,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await authService.validateCredentials('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await authService.validateCredentials('notfound@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'physician',
        isActive: true,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await authService.validateCredentials('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null if user is inactive', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'physician',
        isActive: false,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await authService.validateCredentials('test@example.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'physician',
      };

      const tokens = authService.generateTokens(user);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate valid JWT tokens', () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'physician',
      };

      const tokens = authService.generateTokens(user);

      // Verify access token
      const decodedAccess = jwt.verify(tokens.accessToken, config.jwt.secret) as any;
      expect(decodedAccess.userId).toBe(user.id);
      expect(decodedAccess.email).toBe(user.email);
      expect(decodedAccess.role).toBe(user.role);

      // Verify refresh token
      const decodedRefresh = jwt.verify(tokens.refreshToken, config.jwt.refreshSecret) as any;
      expect(decodedRefresh.userId).toBe(user.id);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid access token', () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'physician',
      };

      const tokens = authService.generateTokens(user);
      const decoded = authService.verifyToken(tokens.accessToken);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(user.id);
    });

    it('should return null for invalid token', () => {
      const decoded = authService.verifyToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: 'user-id', email: 'test@example.com', role: 'physician' },
        config.jwt.secret,
        { expiresIn: '-1h' }
      );

      const decoded = authService.verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });
});
