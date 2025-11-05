import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      status: err.statusCode,
      errors: err.errors,
      timestamp: new Date().toISOString(),
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  }

  // Unexpected error
  logger.error('Unexpected error:', err);
  
  res.status(500).json({
    message: 'Internal server error',
    status: 500,
    timestamp: new Date().toISOString(),
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

