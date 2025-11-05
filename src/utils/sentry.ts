/**
 * Sentry Error Tracking Configuration
 * 
 * Initialize Sentry for production error tracking and performance monitoring.
 * Set VITE_SENTRY_DSN in .env file to enable.
 */

let sentryInitialized = false;

export const initSentry = () => {
  // Only initialize in production or if explicitly enabled
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    
    if (!dsn) {
      // Silently skip in development if not configured
      return;
    }

    try {
      // Construct import path at runtime to avoid Vite static analysis
      const sentryPath = '@' + 'sentry/react';
      
      // Use dynamic import with runtime-constructed path
      import(/* @vite-ignore */ sentryPath)
        .then((Sentry: any) => {
          if (!Sentry || !Sentry.init) {
            // Package exists but API not available
            return;
          }
          
          Sentry.init({
            dsn,
            environment: import.meta.env.MODE || 'production',
            integrations: [
              Sentry.browserTracingIntegration(),
              Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
              }),
            ],
            // Performance Monitoring
            tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
            // Session Replay
            replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
            replaysOnErrorSampleRate: 1.0,
            // Filter sensitive data
            beforeSend(event: any, _hint: any) {
              // Remove sensitive data from errors
              if (event.request?.headers) {
                delete event.request.headers['Authorization'];
              }
              return event;
            },
          });
          
          sentryInitialized = true;
          // Only log in production or if explicitly enabled
          if (import.meta.env.PROD) {
            console.log('Sentry initialized successfully');
          }
        })
        .catch(() => {
          // Silently fail - package may not be installed
          // This is expected behavior when Sentry is optional
        });
    } catch (error) {
      // Only log errors in development
      if (import.meta.env.DEV) {
        console.warn('Sentry initialization skipped:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (sentryInitialized) {
    try {
      const sentryPath = '@' + 'sentry/react';
      import(/* @vite-ignore */ sentryPath).then((Sentry: any) => {
        if (Sentry?.captureException) {
          Sentry.captureException(error, {
            contexts: {
              custom: context,
            },
          });
        }
      }).catch(() => {
        // Silently fail if package not available
      });
    } catch {
      // Silently fail if import fails
    }
  }
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (sentryInitialized) {
    try {
      const sentryPath = '@' + 'sentry/react';
      import(/* @vite-ignore */ sentryPath).then((Sentry: any) => {
        if (Sentry?.captureMessage) {
          Sentry.captureMessage(message, level);
        }
      }).catch(() => {
        // Silently fail if package not available
      });
    } catch {
      // Silently fail if import fails
    }
  }
};

export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
  if (sentryInitialized) {
    try {
      const sentryPath = '@' + 'sentry/react';
      import(/* @vite-ignore */ sentryPath).then((Sentry: any) => {
        if (Sentry?.setUser) {
          Sentry.setUser({
            id: user.id,
            email: user.email,
            username: user.role,
          });
        }
      }).catch(() => {
        // Silently fail if package not available
      });
    } catch {
      // Silently fail if import fails
    }
  }
};

export const clearUserContext = () => {
  if (sentryInitialized) {
    try {
      const sentryPath = '@' + 'sentry/react';
      import(/* @vite-ignore */ sentryPath).then((Sentry: any) => {
        if (Sentry?.setUser) {
          Sentry.setUser(null);
        }
      }).catch(() => {
        // Silently fail if package not available
      });
    } catch {
      // Silently fail if import fails
    }
  }
};

