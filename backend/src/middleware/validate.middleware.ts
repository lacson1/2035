import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Validation Middleware
 * Validates request body, query, and params using Zod schemas
 * 
 * Usage:
 *   import { z } from 'zod';
 *   import { validate } from './middleware/validate.middleware';
 * 
 *   const createPatientSchema = z.object({
 *     body: z.object({
 *       name: z.string().min(1),
 *       dateOfBirth: z.string().datetime(),
 *       gender: z.enum(['Male', 'Female', 'Other']),
 *     }),
 *   });
 * 
 *   router.post('/', validate(createPatientSchema), controller.create);
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the entire request (body, query, params)
      const dataToValidate = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const validated = schema.parse(dataToValidate);

      // Replace request data with validated data
      if (validated.body) {
        req.body = validated.body;
      }
      if (validated.query) {
        req.query = validated.query;
      }
      if (validated.params) {
        req.params = validated.params;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into a structured format
        const errors: Record<string, string[]> = {};

        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        next(
          new ValidationError('Validation failed', errors)
        );
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validate only request body
 */
export const validateBody = (schema: ZodSchema) => {
  return validate(
    require('zod').z.object({
      body: schema,
    })
  );
};

/**
 * Validate only query parameters
 */
export const validateQuery = (schema: ZodSchema) => {
  return validate(
    require('zod').z.object({
      query: schema,
    })
  );
};

/**
 * Validate only route parameters
 */
export const validateParams = (schema: ZodSchema) => {
  return validate(
    require('zod').z.object({
      params: schema,
    })
  );
};
