import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/env';
import { getRedisClient } from '../config/redis';

/**
 * Create a rate limiter with Redis store if available, otherwise memory store
 */
const createRateLimiter = (windowMs: number, maxRequests: number, message?: string) => {
  const redis = getRedisClient();
  
  // Basic rate limiter configuration
  const limiterConfig: any = {
    windowMs,
    max: maxRequests,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        message: message || 'Too many requests from this IP, please try again later.',
        status: 429,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  };

  // If Redis is available, we could use RedisStore here
  // For now, using memory store (default) which works fine for single-instance deployments
  // For distributed deployments, consider installing 'rate-limit-redis' package
  
  const limiter = rateLimit(limiterConfig);

  return limiter;
};

/**
 * General API rate limiter
 * 100 requests per minute per IP
 */
export const apiRateLimiter = createRateLimiter(
  config.rateLimit.windowMs,
  config.rateLimit.maxRequests,
  'Too many API requests. Please slow down.'
);

/**
 * Strict rate limiter for authentication endpoints
 * Development: 50 attempts per 15 minutes per IP
 * Production: 5 attempts per 15 minutes per IP
 */
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  config.nodeEnv === 'production' ? 5 : 50, // 5 requests in production, 50 in development
  'Too many login attempts. Please try again in 15 minutes.'
);

/**
 * Moderate rate limiter for write operations
 * 20 requests per minute per IP
 */
export const writeRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  20, // 20 requests
  'Too many write requests. Please slow down.'
);

/**
 * Lenient rate limiter for read operations
 * 200 requests per minute per IP
 */
export const readRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  200, // 200 requests
  'Too many read requests. Please slow down.'
);

