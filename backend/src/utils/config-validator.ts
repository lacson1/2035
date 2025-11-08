import { config } from '../config/env';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ConfigValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * Validate all configuration settings
   */
  public validateAll(): ValidationResult {
    this.errors = [];
    this.warnings = [];

    this.validateEnvironment();
    this.validateDatabase();
    this.validateRedis();
    this.validateJWT();
    this.validateCORS();
    this.validateRateLimiting();
    this.validateSecurity();

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Validate environment-specific settings
   */
  private validateEnvironment(): void {
    const nodeEnv = config.nodeEnv;
    const validEnvs = ['development', 'staging', 'production', 'test'];

    if (!validEnvs.includes(nodeEnv)) {
      this.errors.push(`NODE_ENV must be one of: ${validEnvs.join(', ')}, got: ${nodeEnv}`);
    }

    // Production-specific validations
    if (nodeEnv === 'production') {
      if (!process.env.SENTRY_DSN) {
        this.warnings.push('SENTRY_DSN is not set in production - error tracking will be limited');
      }

      if (config.cors.origin.some(origin => origin.includes('localhost'))) {
        this.errors.push('CORS_ORIGIN should not include localhost in production');
      }
    }
  }

  /**
   * Validate database configuration
   */
  private validateDatabase(): void {
    const dbUrl = config.database.url;

    if (!dbUrl) {
      this.errors.push('DATABASE_URL is required');
      return;
    }

    // Check if it's a valid PostgreSQL URL (postgres:// or postgresql://)
    const postgresRegex = /^postgres(ql)?:\/\/.+:.+@.+:\d+\/.+/;
    if (!postgresRegex.test(dbUrl)) {
      this.errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
    }

    // Check for SSL in production
    if (config.nodeEnv === 'production' && !dbUrl.includes('sslmode=require')) {
      this.warnings.push('Consider using sslmode=require in production database URL');
    }

    // Check connection pool settings
    if (config.nodeEnv === 'production') {
      if (!dbUrl.includes('connection_limit=')) {
        this.warnings.push('Consider setting connection_limit in production database URL');
      }
      if (!dbUrl.includes('pool_timeout=')) {
        this.warnings.push('Consider setting pool_timeout in production database URL');
      }
    }
  }

  /**
   * Validate Redis configuration
   */
  private validateRedis(): void {
    const redisUrl = config.redis.url;

    // Redis is optional, but if configured, validate it
    if (redisUrl && redisUrl !== '') {
      const redisRegex = /^redis:\/\/(?::([^@]+)@)?([^:]+):(\d+)(?:\/(\d+))?$/;
      if (!redisRegex.test(redisUrl)) {
        this.errors.push('REDIS_URL must be a valid Redis connection string');
      }

      // Check password strength in production
      const passwordMatch = redisUrl.match(/redis:\/\/:([^@]+)@/);
      if (passwordMatch && config.nodeEnv === 'production') {
        const password = passwordMatch[1];
        if (password.length < 8) {
          this.warnings.push('Redis password should be at least 8 characters in production');
        }
      }
    }
  }

  /**
   * Validate JWT configuration
   */
  private validateJWT(): void {
    const { secret, refreshSecret } = config.jwt;

    if (!secret) {
      this.errors.push('JWT_SECRET is required');
    } else if (secret.length < 32) {
      this.errors.push('JWT_SECRET must be at least 32 characters long');
    } else if (secret === 'change-me-in-production') {
      this.errors.push('JWT_SECRET must be changed from default value');
    }

    if (!refreshSecret) {
      this.errors.push('JWT_REFRESH_SECRET is required');
    } else if (refreshSecret.length < 32) {
      this.errors.push('JWT_REFRESH_SECRET must be at least 32 characters long');
    } else if (refreshSecret === 'change-me-in-production') {
      this.errors.push('JWT_REFRESH_SECRET must be changed from default value');
    }

    // Check if secrets are the same
    if (secret && refreshSecret && secret === refreshSecret) {
      this.errors.push('JWT_SECRET and JWT_REFRESH_SECRET should be different');
    }

    // Validate token expiration times
    const expiresIn = config.jwt.expiresIn;
    const refreshExpiresIn = config.jwt.refreshExpiresIn;

    if (!expiresIn || !refreshExpiresIn) {
      this.errors.push('JWT expiration times must be configured');
    }

    // Access token should expire faster than refresh token
    const expiresMs = this.parseDuration(expiresIn);
    const refreshExpiresMs = this.parseDuration(refreshExpiresIn);

    if (expiresMs && refreshExpiresMs && expiresMs >= refreshExpiresMs) {
      this.errors.push('Access token should expire before refresh token');
    }
  }

  /**
   * Validate CORS configuration
   */
  private validateCORS(): void {
    const origins = config.cors.origin;

    if (!origins || origins.length === 0) {
      this.errors.push('CORS_ORIGIN must be configured');
      return;
    }

    // Validate origin format
    const originRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
    for (const origin of origins) {
      if (!originRegex.test(origin) && !origin.includes('*.')) {
        this.warnings.push(`CORS origin '${origin}' should be a valid URL or wildcard pattern`);
      }
    }

    // Production should not allow overly permissive origins
    if (config.nodeEnv === 'production') {
      const permissiveOrigins = origins.filter(origin =>
        origin === '*' || origin === 'http://*' || origin === 'https://*'
      );
      if (permissiveOrigins.length > 0) {
        this.errors.push('Wildcard CORS origins are not allowed in production');
      }
    }
  }

  /**
   * Validate rate limiting configuration
   */
  private validateRateLimiting(): void {
    const { windowMs, maxRequests } = config.rateLimit;

    if (!windowMs || windowMs < 1000) {
      this.errors.push('RATE_LIMIT_WINDOW_MS must be at least 1000ms');
    }

    if (!maxRequests || maxRequests < 1) {
      this.errors.push('RATE_LIMIT_MAX_REQUESTS must be at least 1');
    }

    // Production should have reasonable rate limits
    if (config.nodeEnv === 'production' && maxRequests > 1000) {
      this.warnings.push('High rate limit in production may allow abuse');
    }
  }

  /**
   * Validate security-related configuration
   */
  private validateSecurity(): void {
    // Check for debug mode in production
    if (config.nodeEnv === 'production') {
      const logLevel = process.env.LOG_LEVEL?.toLowerCase();
      if (logLevel === 'debug') {
        this.warnings.push('LOG_LEVEL=debug in production may expose sensitive information');
      }
    }

    // Validate port
    const port = config.port;
    if (port < 1000 || port > 65535) {
      this.errors.push('PORT must be between 1000 and 65535');
    }
  }

  /**
   * Parse duration string to milliseconds
   */
  private parseDuration(duration: string): number | null {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return null;
    }
  }

  /**
   * Get validation summary
   */
  public getSummary(result: ValidationResult): string {
    let summary = `Configuration validation: ${result.isValid ? 'PASSED' : 'FAILED'}\n`;

    if (result.errors.length > 0) {
      summary += `\n❌ Errors (${result.errors.length}):\n`;
      result.errors.forEach(error => {
        summary += `  - ${error}\n`;
      });
    }

    if (result.warnings.length > 0) {
      summary += `\n⚠️  Warnings (${result.warnings.length}):\n`;
      result.warnings.forEach(warning => {
        summary += `  - ${warning}\n`;
      });
    }

    return summary;
  }
}

// Export singleton instance
export const configValidator = new ConfigValidator();
