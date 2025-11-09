import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters in production').optional(),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters in production').optional(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((val) => parseInt(val, 10)),
});

// Validate environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    
    // Additional validation for production
    if (env.NODE_ENV === 'production') {
      if (!env.JWT_SECRET || env.JWT_SECRET === 'change-me-in-production') {
        throw new Error('JWT_SECRET must be set to a secure value in production');
      }
      if (!env.JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET === 'change-me-in-production') {
        throw new Error('JWT_REFRESH_SECRET must be set to a secure value in production');
      }
    }
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      console.error('❌ Environment validation failed:');
      console.error(missingVars.join('\n'));
      process.exit(1);
    }
    throw error;
  }
}

const env = validateEnv();

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  database: {
    url: env.DATABASE_URL,
  },
  redis: {
    url: env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: env.JWT_SECRET || 'change-me-in-production',
    refreshSecret: env.JWT_REFRESH_SECRET || 'change-me-in-production',
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
};

