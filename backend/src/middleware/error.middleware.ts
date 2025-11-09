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
  const requestId = req.id || 'unknown';

  if (err instanceof AppError) {
    // Attach request ID to error
    err.requestId = requestId;

    logger.warn('Application error', {
      requestId,
      error: err.message,
      code: err.code,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      errors: err.errors,
    });

    return res.status(err.statusCode).json({
      message: err.message,
      status: err.statusCode,
      code: err.code,
      errors: err.errors,
      requestId,
      timestamp: new Date().toISOString(),
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  }

  // Unexpected error
  logger.error('Unexpected error', {
    requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    message: 'Internal server error',
    status: 500,
    code: 'INTERNAL_ERROR',
    requestId,
    timestamp: new Date().toISOString(),
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

