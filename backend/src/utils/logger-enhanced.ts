/**
 * Enhanced Logger with Winston
 * 
 * This is an enhanced version that can be used when Winston is installed.
 * To use: Install winston and winston-daily-rotate-file, then replace logger.ts imports.
 * 
 * Installation:
 *   npm install winston winston-daily-rotate-file
 *   npm install --save-dev @types/winston
 */

import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Try to use Winston if available, fallback to console
let winston: any = null;
try {
  winston = require('winston');
  require('winston-daily-rotate-file');
} catch (error) {
  // Winston not installed, will use console fallback
}

interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: any;
}

class Logger {
  private logger: any;

  constructor() {
    if (winston) {
      // Winston is available - use structured logging
      const logFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      );

      const consoleFormat = winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      );

      this.logger = winston.createLogger({
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        defaultMeta: { service: 'physician-dashboard-api' },
        format: logFormat,
        transports: [
          // Error logs
          new winston.transports.DailyRotateFile({
            filename: path.join(logsDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d',
          }),
          // Combined logs
          new winston.transports.DailyRotateFile({
            filename: path.join(logsDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
          }),
        ],
      });

      // Add console transport in development
      if (process.env.NODE_ENV !== 'production') {
        this.logger.add(
          new winston.transports.Console({
            format: consoleFormat,
          })
        );
      }
    } else {
      // Fallback to console logging
      this.logger = null;
    }
  }

  private formatMessage(message: string, context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return message;
    }
    return `${message} ${JSON.stringify(context)}`;
  }

  info(message: string, context?: LogContext): void {
    if (this.logger) {
      this.logger.info(message, context);
    } else {
      console.log(`[INFO] ${this.formatMessage(message, context)}`);
    }
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    if (this.logger) {
      this.logger.error(message, { ...context, error: error?.message, stack: error?.stack });
    } else {
      console.error(`[ERROR] ${this.formatMessage(message, context)}`, error);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.logger) {
      this.logger.warn(message, context);
    } else {
      console.warn(`[WARN] ${this.formatMessage(message, context)}`);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.logger) {
      this.logger.debug(message, context);
    } else if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${this.formatMessage(message, context)}`);
    }
  }

  /**
   * Create a child logger with default context (e.g., request ID)
   */
  child(defaultContext: LogContext) {
    if (this.logger) {
      return this.logger.child(defaultContext);
    }
    // Fallback: return logger with context appended
    return {
      info: (msg: string, ctx?: LogContext) => this.info(msg, { ...defaultContext, ...ctx }),
      error: (msg: string, err?: Error, ctx?: LogContext) => this.error(msg, err, { ...defaultContext, ...ctx }),
      warn: (msg: string, ctx?: LogContext) => this.warn(msg, { ...defaultContext, ...ctx }),
      debug: (msg: string, ctx?: LogContext) => this.debug(msg, { ...defaultContext, ...ctx }),
    };
  }
}

export const logger = new Logger();

/**
 * Helper to create logger with request ID
 */
export const logWithRequestId = (requestId: string) => {
  return logger.child({ requestId });
};
