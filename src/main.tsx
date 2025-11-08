import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { UserProvider } from './context/UserContext.tsx'
import { DashboardProvider } from './context/DashboardContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import { NotificationProvider } from './context/NotificationContext.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { initSentry } from './utils/sentry'
import { logger } from './utils/logger'
import './utils/debug' // Initialize debug utilities
import './index.css'

// Initialize Sentry error tracking (silently fails if not configured)
try {
  initSentry()
} catch (error) {
  // Silently handle initialization errors
  logger.debug('Sentry initialization skipped');
}

// Global error handlers to prevent unhandled errors from appearing in console
window.addEventListener('error', (event) => {
  // Filter out known browser extension errors
  if (
    (event.filename && event.filename.includes('chrome-extension://')) ||
    (event.message && (
      event.message.includes('chrome-extension://') ||
      event.message.includes('ERR_FILE_NOT_FOUND') ||
      event.message.includes('pejdijmoenmkgeppbflobdenhhabjlaj')
    ))
  ) {
    event.preventDefault();
    return;
  }
  
  // Log through our logger instead of console
  logger.error('Global error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
  });
  
  // Send to Sentry if available
  import('./utils/sentry').then(({ captureException }) => {
    if (event.error) {
      captureException(event.error, {
        tags: { type: 'global_error' },
      });
    }
  }).catch(() => {
    // Sentry not available
  });
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Filter out known browser extension errors
  const reasonStr = String(event.reason || '');
  if (
    reasonStr.includes('chrome-extension://') ||
    reasonStr.includes('Extension context invalidated') ||
    reasonStr.includes('ERR_FILE_NOT_FOUND') ||
    reasonStr.includes('pejdijmoenmkgeppbflobdenhhabjlaj')
  ) {
    event.preventDefault();
    return;
  }
  
  if (event.reason && typeof event.reason === 'object' && 'message' in event.reason) {
    const message = String(event.reason.message || '');
    if (
      message.includes('chrome-extension://') ||
      message.includes('Extension context invalidated') ||
      message.includes('ERR_FILE_NOT_FOUND') ||
      message.includes('pejdijmoenmkgeppbflobdenhhabjlaj')
    ) {
      event.preventDefault();
      return;
    }
  }
  
  // Log through our logger instead of console
  logger.error('Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise,
  });
  
  // Send to Sentry if available
  import('./utils/sentry').then(({ captureException }) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason || 'Unhandled promise rejection'));
    captureException(error, {
      tags: { type: 'unhandled_rejection' },
    });
  }).catch(() => {
    // Sentry not available
  });
  
  // Prevent default console error (we've handled it)
  event.preventDefault();
});

// Suppress React StrictMode double-invocation warnings and browser extension errors
// These are intentional and don't indicate real problems
const originalError = console.error;
const originalWarn = console.warn;

// Helper function to check if error is from Chrome extension
const isChromeExtensionError = (arg: any): boolean => {
  if (typeof arg === 'string') {
    return !!(
      arg.includes('chrome-extension://') ||
      arg.includes('Extension context invalidated') ||
      arg.includes('ERR_FILE_NOT_FOUND') ||
      arg.includes('pejdijmoenmkgeppbflobdenhhabjlaj') ||
      arg.includes('Failed to load resource') ||
      arg.match(/chrome-extension:\/\/[^/]+\//)
    );
  }
  if (arg && typeof arg === 'object') {
    const str = JSON.stringify(arg);
    return (
      str.includes('chrome-extension://') ||
      str.includes('ERR_FILE_NOT_FOUND') ||
      str.includes('pejdijmoenmkgeppbflobdenhhabjlaj')
    );
  }
  return false;
};

console.error = (...args: any[]) => {
  // Filter out React StrictMode warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('findDOMNode') ||
     args[0].includes('componentWillReceiveProps') ||
     args[0].includes('componentWillMount') ||
     args[0].includes('componentWillUpdate'))
  ) {
    return;
  }

  // Filter out Chrome extension errors
  if (args.some(isChromeExtensionError)) {
    return;
  }

  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  // Filter out Chrome extension warnings
  if (args.some(isChromeExtensionError)) {
    return;
  }

  originalWarn.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <UserProvider>
            <DashboardProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </DashboardProvider>
          </UserProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

