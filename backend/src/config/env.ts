import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Validate JWT secrets - fail fast in production
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (isProduction) {
  if (!jwtSecret || jwtSecret === 'change-me-in-production') {
    throw new Error(
      'JWT_SECRET is required in production. Please set a strong secret in your environment variables.\n' +
      'Generate one using: openssl rand -base64 32'
    );
  }
  if (!jwtRefreshSecret || jwtRefreshSecret === 'change-me-in-production') {
    throw new Error(
      'JWT_REFRESH_SECRET is required in production. Please set a strong secret in your environment variables.\n' +
      'Generate one using: openssl rand -base64 32'
    );
  }
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
  if (jwtRefreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long in production');
  }
} else {
  // In development, warn if using defaults
  if (!jwtSecret || jwtSecret === 'change-me-in-production') {
    console.warn(
      '⚠️  WARNING: JWT_SECRET not set. Using default secret. This is insecure for production!'
    );
  }
  if (!jwtRefreshSecret || jwtRefreshSecret === 'change-me-in-production') {
    console.warn(
      '⚠️  WARNING: JWT_REFRESH_SECRET not set. Using default secret. This is insecure for production!'
    );
  }
}

export const config = {
  nodeEnv,
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || '',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: jwtSecret || 'change-me-in-production',
    refreshSecret: jwtRefreshSecret || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

// Validate required environment variables
if (!config.database.url) {
  throw new Error('DATABASE_URL is required');
}

