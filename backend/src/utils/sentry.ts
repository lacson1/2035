/**
 * Sentry Error Tracking for Backend
 * 
 * To enable Sentry:
 * 1. Install: npm install @sentry/node @sentry/profiling-node
 * 2. Set environment variable: SENTRY_DSN=your_sentry_dsn
 * 3. Import and call initSentry() in app.ts before routes
 */

let sentryInitialized = false;

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Sentry DSN not configured - error tracking disabled');
    }
    return;
  }

  try {
    // Dynamic import to avoid errors if Sentry is not installed
    const Sentry = require('@sentry/node');
    const { ProfilingIntegration } = require('@sentry/profiling-node');

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        new ProfilingIntegration(),
        // HTTP tracing
        Sentry.httpIntegration(),
        // Express integration
        Sentry.expressIntegration({ app: undefined }), // Will be set in app.ts
      ],
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Profiling
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Filter sensitive data
      beforeSend(event: any) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });

    sentryInitialized = true;
    console.log('Sentry initialized successfully');
  } catch (error) {
    // Sentry not installed or initialization failed
    if (process.env.NODE_ENV === 'development') {
      console.warn('Sentry initialization skipped:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (sentryInitialized) {
    try {
      const Sentry = require('@sentry/node');
      Sentry.captureException(error, {
        contexts: {
          custom: context,
        },
      });
    } catch {
      // Silently fail if Sentry not available
    }
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (sentryInitialized) {
    try {
      const Sentry = require('@sentry/node');
      Sentry.captureMessage(message, level);
    } catch {
      // Silently fail if Sentry not available
    }
  }
}

export function setUserContext(user: { id: string; email?: string; role?: string }) {
  if (sentryInitialized) {
    try {
      const Sentry = require('@sentry/node');
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.role,
      });
    } catch {
      // Silently fail if Sentry not available
    }
  }
}

export function clearUserContext() {
  if (sentryInitialized) {
    try {
      const Sentry = require('@sentry/node');
      Sentry.setUser(null);
    } catch {
      // Silently fail if Sentry not available
    }
  }
}

export { sentryInitialized };
