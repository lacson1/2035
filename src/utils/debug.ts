/**
 * Debug Utilities
 * Helper functions for debugging the application
 */

/**
 * Log debug information (only in development)
 */
export function debugLog(message: string, data?: any) {
  if (import.meta.env.DEV) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
}

/**
 * Log API requests for debugging
 */
export function debugApiRequest(method: string, url: string, data?: any) {
  if (import.meta.env.DEV && localStorage.getItem('showDebugInfo') === 'true') {
    console.group(`🔵 API ${method} ${url}`);
    if (data) {
      console.log('Request data:', data);
    }
    console.groupEnd();
  }
}

/**
 * Log API responses for debugging
 */
export function debugApiResponse(method: string, url: string, response: any) {
  if (import.meta.env.DEV && localStorage.getItem('showDebugInfo') === 'true') {
    console.group(`✅ API ${method} ${url}`);
    console.log('Response:', response);
    console.groupEnd();
  }
}

/**
 * Log API errors for debugging
 */
export function debugApiError(method: string, url: string, error: any) {
  if (import.meta.env.DEV) {
    // Only show connection errors if explicitly enabled or if it's not a connection refused error
    const isConnectionError = error?.message?.includes('Failed to fetch') || 
                             error?.message?.includes('ERR_CONNECTION_REFUSED') ||
                             error?.message?.includes('NetworkError');
    
    if (localStorage.getItem('showDebugInfo') === 'true' || !isConnectionError) {
      console.group(`❌ API ${method} ${url}`);
      console.error('Error:', error);
      console.groupEnd();
    } else if (isConnectionError) {
      // Silently handle connection errors - backend is likely not running
      // This is expected behavior when using the app without backend
    }
  }
}

/**
 * Check authentication state
 */
export function debugAuthState() {
  if (import.meta.env.DEV) {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    console.group('🔐 Auth State');
    console.log('Token exists:', !!token);
    console.log('Refresh token exists:', !!refreshToken);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000));
      } catch (e) {
        console.log('Could not parse token');
      }
    }
    console.groupEnd();
  }
}

/**
 * Check environment configuration
 */
export function debugEnv() {
  if (import.meta.env.DEV) {
    console.group('⚙️ Environment');
    console.log('Mode:', import.meta.env.MODE);
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api');
    console.log('Dev mode:', import.meta.env.DEV);
    console.log('Prod mode:', import.meta.env.PROD);
    console.groupEnd();
  }
}

/**
 * Debug component render (for React DevTools)
 */
export function debugComponent(name: string, props: any) {
  if (import.meta.env.DEV) {
    console.log(`[Component] ${name}`, props);
  }
}

/**
 * Export debug utilities to window in development
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__DEBUG__ = {
    debugLog,
    debugApiRequest,
    debugApiResponse,
    debugApiError,
    debugAuthState,
    debugEnv,
    debugComponent,
  };
  
  // Only show debug utilities message if explicitly enabled via localStorage
  if (localStorage.getItem('showDebugInfo') === 'true') {
    console.log('%c🔧 Debug utilities available!', 'color: #3b82f6; font-weight: bold;');
    console.log('%cUse window.__DEBUG__ to access debug functions', 'color: #6b7280;');
    console.log('%cExample: window.__DEBUG__.debugAuthState()', 'color: #6b7280;');
  }
}

