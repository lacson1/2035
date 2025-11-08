/**
 * Centralized logging utility
 * Provides consistent logging interface with environment-aware behavior
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
    debug: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
}

class LoggerImpl implements Logger {
    private isDevelopment = import.meta.env.DEV;
    private isDebugEnabled = this.isDevelopment &&
        (typeof window !== 'undefined' && localStorage.getItem('showDebugInfo') === 'true');

    debug(message: string, ...args: any[]): void {
        if (this.isDebugEnabled) {
            console.debug(`[DEBUG] ${message}`, ...args);
        } else if (this.isDevelopment) {
            // In development, show debug logs even if not explicitly enabled (but less verbose)
            console.debug(`[DEBUG] ${message}`);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.isDevelopment) {
            console.info(`[INFO] ${message}`, ...args);
        }
        // In production, could send to logging service (e.g., Sentry, DataDog)
    }

    warn(message: string, ...args: any[]): void {
        console.warn(`[WARN] ${message}`, ...args);
        // In production, could send to logging service
    }

    error(message: string, ...args: any[]): void {
        console.error(`[ERROR] ${message}`, ...args);
        // In production, should send to error tracking service (e.g., Sentry)
    }
}

// Export singleton instance
export const logger: Logger = new LoggerImpl();

// Export type for use in other modules
export type { Logger, LogLevel };

