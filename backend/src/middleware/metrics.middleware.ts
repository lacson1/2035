import { Request, Response, NextFunction } from 'express';
import { metricsCollector } from '../utils/metrics';

/**
 * Middleware to collect request metrics
 */
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Capture response finish
  res.once('finish', () => {
    const responseTime = Date.now() - startTime;
    const method = req.method;
    const statusCode = res.statusCode;

    metricsCollector.recordRequest(method, statusCode, responseTime);
  });

  next();
};

