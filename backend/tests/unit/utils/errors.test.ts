import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '../../../src/utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('HTTP_400');
    });

    it('should create error with custom code', () => {
      const error = new AppError('Test error', 400, 'CUSTOM_ERROR');
      expect(error.code).toBe('CUSTOM_ERROR');
    });

    it('should include request ID', () => {
      const error = new AppError('Test error', 400);
      error.requestId = 'test-request-id';
      expect(error.requestId).toBe('test-request-id');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with errors object', () => {
      const errors = {
        email: ['Invalid email format'],
        password: ['Password is required'],
      };
      const error = new ValidationError('Validation failed', errors);
      
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.errors).toEqual(errors);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError('Patient');
      expect(error.message).toBe('Patient not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create not found error with ID', () => {
      const error = new NotFoundError('Patient', '123');
      expect(error.message).toBe('Patient with id 123 not found');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create unauthorized error with custom message', () => {
      const error = new UnauthorizedError('Invalid token');
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should create forbidden error with custom message', () => {
      const error = new ForbiddenError('Insufficient permissions');
      expect(error.message).toBe('Insufficient permissions');
    });
  });
});
