import { Request, Response, NextFunction } from 'express';
import { metricsCollector } from '../utils/metrics';
import { logger } from '../utils/logger';

/**
 * Middleware to collect request metrics and log slow requests
 */
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const requestId = req.id || 'unknown';

  // Capture response finish
  res.once('finish', () => {
    const responseTime = Date.now() - startTime;
    const method = req.method;
    const statusCode = res.statusCode;
    const path = req.path;

    // Record metrics
    metricsCollector.recordRequest(method, statusCode, responseTime);

    // Log slow requests (>1 second)
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        requestId,
        method,
        path,
        statusCode,
        duration: responseTime,
      });
    }

    // Log request completion in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Request completed', {
        requestId,
        method,
        path,
        statusCode,
        duration: responseTime,
      });
    }
  });

  next();
};

