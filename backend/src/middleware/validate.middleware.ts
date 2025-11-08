import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Middleware to validate request body using Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMap: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errorMap[path]) {
            errorMap[path] = [];
          }
          errorMap[path].push(err.message);
        });
        next(new ValidationError('Validation failed', errorMap));
      } else {
        next(error);
      }
    }
  };
};

