import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';

// Helper to redact sensitive fields from logs
const redactSensitiveData = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = ['password', 'passwordHash', 'passwordConfirm', 'ssn', 'creditCard', 'refreshToken'];
  const redacted = { ...obj };
  
  for (const key in redacted) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }
  
  return redacted;
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Capture exception in Sentry (only for unexpected errors)
  if (!(err instanceof AppError) && process.env.SENTRY_DSN) {
    // Don't log body for auth endpoints (contains passwords)
    const isAuthEndpoint = req.path.includes('/auth/');
    const bodyToLog = isAuthEndpoint ? undefined : redactSensitiveData(req.body);
    
    Sentry.captureException(err, {
      tags: {
        endpoint: req.path,
        method: req.method,
      },
      extra: {
        userId: (req as any).user?.id,
        body: bodyToLog, // Redacted or undefined for auth endpoints
        query: redactSensitiveData(req.query),
      },
    });
  }

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
  console.error('=== ERROR DETAILS ===');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Full error:', err);
  console.error('===================');
  
  res.status(500).json({
    message: 'Internal server error',
    status: 500,
    timestamp: new Date().toISOString(),
    ...(config.nodeEnv === 'development' && { 
      stack: err.stack,
      error: err.message,
      name: err.name,
    }),
  });
};

