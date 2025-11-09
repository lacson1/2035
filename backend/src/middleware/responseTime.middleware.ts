import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Response time logging middleware
 * Logs the time taken to process each request
 */
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to log response time
  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Add response time header
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    // Log request details
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      requestId: (req as any).requestId,
    };
    
    // Determine log level based on response time and status code
    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error', logData);
    } else if (responseTime > 1000) {
      // Log slow requests (> 1 second)
      logger.warn('Slow request detected', logData);
    } else if (responseTime > 500) {
      // Log moderately slow requests (> 500ms)
      logger.info('Request processed', logData);
    } else {
      // Only log in development for fast requests
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Request processed', logData);
      }
    }
    
    // Call original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
};

/**
 * Simple response time middleware (just adds header, no logging)
 * Use this if you want minimal overhead
 */
export const simpleResponseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
  });
  
  next();
};
