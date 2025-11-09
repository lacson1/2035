import { Request, Response, NextFunction } from 'express';
import { metricsCollector } from '../utils/metrics';
import { logger } from '../utils/logger';

/**
 * Metrics middleware to track request metrics
 * Records: method, status code, response time, errors
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Record response when finished
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const method = req.method;
    const statusCode = res.statusCode;

    // Record request metrics
    metricsCollector.recordRequest(method, statusCode, responseTime);

    // Log slow requests (>1 second)
    if (responseTime > 1000) {
      logger.warn(`Slow request detected: ${method} ${req.path} took ${responseTime}ms`);
    }
  });

  next();
}
