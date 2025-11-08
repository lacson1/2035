/**
 * Application Constants
 * Centralized configuration values to avoid magic numbers/strings
 */

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  PATIENT_LIST: 300, // 5 minutes - patient lists change frequently
  PATIENT_DETAIL: 600, // 10 minutes - individual patient data changes less frequently
  USER_LIST: 300, // 5 minutes
  HUB_LIST: 600, // 10 minutes
} as const;

// Rate Limiting Configuration
export const RATE_LIMIT = {
  API_WINDOW_MS: 60000, // 1 minute
  API_MAX_REQUESTS: 100,
  API_MAX_REQUESTS_DEV: 1000, // Very lenient for development (React StrictMode causes double requests)
  AUTH_WINDOW_MS_DEV: 5 * 60 * 1000, // 5 minutes in development
  AUTH_WINDOW_MS_PROD: 15 * 60 * 1000, // 15 minutes in production
  AUTH_MAX_REQUESTS_DEV: 500, // Very lenient for testing
  AUTH_MAX_REQUESTS_PROD: 5, // Strict in production
  WRITE_WINDOW_MS: 60000, // 1 minute
  WRITE_MAX_REQUESTS: 20,
  READ_WINDOW_MS: 60000, // 1 minute
  READ_MAX_REQUESTS: 200,
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// JWT Configuration
export const JWT_DEFAULTS = {
  EXPIRES_IN: '15m',
  REFRESH_EXPIRES_IN: '7d',
  MIN_SECRET_LENGTH: 32,
} as const;

// Database Query Limits
export const QUERY_LIMITS = {
  TIMELINE_EVENTS: 50, // Max timeline events per patient
  SEARCH_RESULTS: 100, // Max search results
} as const;

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 255,
  MAX_NAME_LENGTH: 100,
} as const;

// Risk Score Thresholds
export const RISK_THRESHOLDS = {
  LOW: 33,
  MEDIUM: 66,
  HIGH: 100,
} as const;

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE_MB: 10, // 10MB
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
  ],
} as const;

// Session Configuration
export const SESSION = {
  CLEANUP_INTERVAL_MS: 60 * 60 * 1000, // 1 hour
  MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
} as const;

// Health Check Configuration
export const HEALTH_CHECK = {
  TIMEOUT_MS: 5000, // 5 seconds
} as const;

