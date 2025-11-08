import { useEffect } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Track page load performance
    const trackPageLoad = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');

        const metrics: Partial<PerformanceMetrics> = {
          pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          timeToInteractive: performance.now(),
        };

        // First Contentful Paint
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          metrics.firstContentfulPaint = fcp.startTime;
        }

        // Largest Contentful Paint
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          metrics.largestContentfulPaint = lcpEntries[lcpEntries.length - 1].startTime;
        }

        // Cumulative Layout Shift
        const clsEntries = performance.getEntriesByType('layout-shift');
        const clsValue = clsEntries.reduce((total, entry: any) => {
          if (!(entry as any).hadRecentInput) {
            return total + (entry as any).value;
          }
          return total;
        }, 0);
        metrics.cumulativeLayoutShift = clsValue;

        // Log metrics (in production, send to analytics service)
        console.log('Performance Metrics:', metrics);

        // Send to analytics (replace with your analytics service)
        if (process.env.NODE_ENV === 'production') {
          // Example: sendToAnalytics('performance', metrics);
        }
      }
    };

    // Track user interactions
    const trackInteractions = () => {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const trackableElement = target.closest('[data-track]');

        if (trackableElement) {
          const trackData = trackableElement.getAttribute('data-track');
          console.log('User interaction:', trackData);

          // Send to analytics
          if (process.env.NODE_ENV === 'production') {
            // Example: sendToAnalytics('interaction', { element: trackData, page: window.location.pathname });
          }
        }
      };

      document.addEventListener('click', handleClick);

      return () => {
        document.removeEventListener('click', handleClick);
      };
    };

    // Track errors
    const trackErrors = () => {
      const handleError = (event: ErrorEvent) => {
        console.error('JavaScript Error:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        });

        // Send to error tracking service
        if (process.env.NODE_ENV === 'production') {
          // Example: sendToErrorTracker(event.error);
        }
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error('Unhandled Promise Rejection:', event.reason);

        if (process.env.NODE_ENV === 'production') {
          // Example: sendToErrorTracker(event.reason);
        }
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    };

    // Initialize tracking
    trackPageLoad();
    const cleanupInteractions = trackInteractions();
    const cleanupErrors = trackErrors();

    return () => {
      cleanupInteractions();
      cleanupErrors();
    };
  }, []);
};

// Hook for tracking component performance
export const useComponentPerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      console.log(`${componentName} render time:`, renderTime, 'ms');

      // Track slow renders
      if (renderTime > 16.67) { // Slower than 60fps
        console.warn(`${componentName} slow render detected:`, renderTime, 'ms');
      }
    };
  }, [componentName]);
};

// Hook for tracking API call performance
export const useApiPerformance = () => {
  const trackApiCall = (endpoint: string, startTime: number, success: boolean) => {
    const duration = performance.now() - startTime;

    console.log(`API Call ${endpoint}:`, duration, 'ms', success ? '✅' : '❌');

    // Track slow API calls
    if (duration > 1000) {
      console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
    }

    // Send to analytics
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToAnalytics('api_call', { endpoint, duration, success });
    }
  };

  return { trackApiCall };
};
