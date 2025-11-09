import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../../src/middleware/validate.middleware';
import { ValidationError } from '../../../src/utils/errors';

describe('Validate Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {};
    nextFunction = vi.fn();
  });

  describe('validate', () => {
    it('should call next() if validation passes', () => {
      const schema = z.object({
        body: z.object({
          name: z.string(),
          age: z.number(),
        }),
      });

      mockRequest.body = {
        name: 'Test',
        age: 25,
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(); // No error
    });

    it('should throw ValidationError if validation fails', () => {
      const schema = z.object({
        body: z.object({
          name: z.string().min(1),
          email: z.string().email(),
        }),
      });

      mockRequest.body = {
        name: '',
        email: 'invalid-email',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should validate query parameters', () => {
      const schema = z.object({
        query: z.object({
          page: z.string().regex(/^\d+$/).transform(Number),
          limit: z.string().regex(/^\d+$/).transform(Number),
        }),
      });

      mockRequest.query = {
        page: '1',
        limit: '10',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.query.page).toBe(1);
      expect(mockRequest.query.limit).toBe(10);
    });

    it('should validate route parameters', () => {
      const schema = z.object({
        params: z.object({
          id: z.string().uuid(),
        }),
      });

      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should format validation errors correctly', () => {
      const schema = z.object({
        body: z.object({
          name: z.string().min(1, 'Name is required'),
          email: z.string().email('Invalid email'),
        }),
      });

      mockRequest.body = {
        name: '',
        email: 'invalid',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = (nextFunction as any).mock.calls[0][0] as ValidationError;
      expect(error.errors).toBeDefined();
      expect(Object.keys(error.errors || {})).toContain('body.name');
    });
  });
});
