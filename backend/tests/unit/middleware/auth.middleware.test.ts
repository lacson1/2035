import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, requireRole } from '../../../src/middleware/auth.middleware';
import { config } from '../../../src/config/env';
import { UnauthorizedError, ForbiddenError } from '../../../src/utils/errors';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    nextFunction = vi.fn();
  });

  describe('authenticate', () => {
    it('should call next() with valid token', () => {
      const token = jwt.sign(
        { userId: 'user-id', email: 'test@example.com', role: 'physician' },
        config.jwt.secret
      );

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe('user-id');
    });

    it('should throw UnauthorizedError if no token provided', () => {
      mockRequest.headers = {};

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw UnauthorizedError if token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw UnauthorizedError if token format is wrong', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('requireRole', () => {
    beforeEach(() => {
      const token = jwt.sign(
        { userId: 'user-id', email: 'test@example.com', role: 'physician' },
        config.jwt.secret
      );
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };
      authenticate(mockRequest as Request, mockResponse as Response, vi.fn());
    });

    it('should call next() if user has required role', () => {
      const middleware = requireRole('physician', 'admin');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should throw ForbiddenError if user does not have required role', () => {
      const middleware = requireRole('admin');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should throw UnauthorizedError if user is not authenticated', () => {
      mockRequest.user = undefined;
      const middleware = requireRole('admin');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });
});
