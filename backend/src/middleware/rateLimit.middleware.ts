import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/env';
import { getRedisClient } from '../config/redis';
import { RATE_LIMIT } from '../config/constants';

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
 * Development: 1000 requests per minute per IP (lenient for React StrictMode)
 * Production: 100 requests per minute per IP
 */
export const apiRateLimiter = createRateLimiter(
  config.rateLimit.windowMs,
  config.nodeEnv === 'production' 
    ? config.rateLimit.maxRequests 
    : RATE_LIMIT.API_MAX_REQUESTS_DEV,
  'Too many API requests. Please slow down.'
);

/**
 * Strict rate limiter for authentication endpoints
 * Development: 500 attempts per 10 seconds per IP (very lenient for testing)
 * Production: 5 attempts per 10 seconds per IP
 */
export const authRateLimiter = createRateLimiter(
  config.nodeEnv === 'production' ? RATE_LIMIT.AUTH_WINDOW_MS_PROD : RATE_LIMIT.AUTH_WINDOW_MS_DEV,
  config.nodeEnv === 'production' ? RATE_LIMIT.AUTH_MAX_REQUESTS_PROD : RATE_LIMIT.AUTH_MAX_REQUESTS_DEV,
  'Too many login attempts. Please try again in 10 seconds.'
);

/**
 * Moderate rate limiter for write operations
 * 20 requests per minute per IP
 */
export const writeRateLimiter = createRateLimiter(
  RATE_LIMIT.WRITE_WINDOW_MS,
  RATE_LIMIT.WRITE_MAX_REQUESTS,
  'Too many write requests. Please slow down.'
);

/**
 * Lenient rate limiter for read operations
 * 200 requests per minute per IP
 */
export const readRateLimiter = createRateLimiter(
  RATE_LIMIT.READ_WINDOW_MS,
  RATE_LIMIT.READ_MAX_REQUESTS,
  'Too many read requests. Please slow down.'
);

