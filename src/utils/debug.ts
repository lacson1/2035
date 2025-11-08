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
 * Enable debug mode (stores in localStorage)
 */
export function enableDebugMode() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('showDebugInfo', 'true');
    console.log('%c✅ Debug mode enabled!', 'color: #10b981; font-weight: bold; font-size: 14px;');
    console.log('%cDebug utilities are now available via window.__DEBUG__', 'color: #6b7280;');
  }
}

/**
 * Disable debug mode
 */
export function disableDebugMode() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('showDebugInfo');
    console.log('%c❌ Debug mode disabled', 'color: #ef4444; font-weight: bold;');
  }
}

/**
 * Check if debug mode is enabled
 */
export function isDebugModeEnabled(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('showDebugInfo') === 'true';
  }
  return false;
}

/**
 * Debug localStorage contents
 */
export function debugLocalStorage() {
  if (import.meta.env.DEV) {
    console.group('💾 LocalStorage Contents');
    const keys = Object.keys(localStorage);
    if (keys.length === 0) {
      console.log('No items in localStorage');
    } else {
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        // Don't show full token values for security
        if (key.includes('token') || key.includes('Token')) {
          console.log(`${key}:`, value ? `${value.substring(0, 20)}...` : 'null');
        } else {
          console.log(`${key}:`, value);
        }
      });
    }
    console.groupEnd();
  }
}

/**
 * Debug current user state
 */
export function debugUserState() {
  if (import.meta.env.DEV) {
    console.group('👤 User State');
    const authToken = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (authToken) {
      try {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        console.log('User ID:', payload.sub || payload.userId || 'N/A');
        console.log('Email:', payload.email || 'N/A');
        console.log('Role:', payload.role || 'N/A');
        console.log('Expires:', new Date(payload.exp * 1000).toLocaleString());
      } catch (e) {
        console.log('Could not parse token');
      }
    }
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('User object:', user);
      } catch (e) {
        console.log('Could not parse user object');
      }
    }
    
    console.groupEnd();
  }
}

/**
 * Clear all application data (for testing)
 */
export function clearAppData() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    if (confirm('Clear all app data? This will log you out.')) {
      localStorage.clear();
      sessionStorage.clear();
      console.log('%c🗑️ All app data cleared', 'color: #ef4444; font-weight: bold;');
      location.reload();
    }
  }
}

/**
 * Export debug utilities to window in development
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__DEBUG__ = {
    // Core debug functions
    debugLog,
    debugApiRequest,
    debugApiResponse,
    debugApiError,
    debugAuthState,
    debugEnv,
    debugComponent,
    debugLocalStorage,
    debugUserState,
    
    // Debug mode control
    enable: enableDebugMode,
    disable: disableDebugMode,
    isEnabled: isDebugModeEnabled,
    
    // Utility functions
    clearData: clearAppData,
    
    // Quick access to common checks
    checkAuth: debugAuthState,
    checkEnv: debugEnv,
    checkStorage: debugLocalStorage,
    checkUser: debugUserState,
  };
  
  // Show debug utilities message if enabled or on first load
  const showDebugInfo = localStorage.getItem('showDebugInfo') === 'true';
  const hasSeenDebugMessage = sessionStorage.getItem('hasSeenDebugMessage') === 'true';
  
  if (showDebugInfo || !hasSeenDebugMessage) {
    console.log('%c🔧 Debug utilities available!', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
    console.log('%cUse window.__DEBUG__ to access debug functions', 'color: #6b7280;');
    console.log('%cQuick commands:', 'color: #6b7280;');
    console.log('%c  window.__DEBUG__.enable() - Enable debug mode (shows API logs)', 'color: #9ca3af;');
    console.log('%c  window.__DEBUG__.checkAuth() - Check auth state', 'color: #9ca3af;');
    console.log('%c  window.__DEBUG__.checkUser() - Check user state', 'color: #9ca3af;');
    console.log('%c  window.__DEBUG__.checkEnv() - Check environment', 'color: #9ca3af;');
    console.log('%c  window.__DEBUG__.checkStorage() - Check localStorage', 'color: #9ca3af;');
    console.log('%c  window.__DEBUG__.clearData() - Clear all data', 'color: #9ca3af;');
    console.log('%c', 'color: #6b7280;');
    console.log('%c💡 Tip: Run window.__DEBUG__.enable() to see detailed API request/response logs', 'color: #10b981; font-style: italic;');
    
    if (!hasSeenDebugMessage) {
      sessionStorage.setItem('hasSeenDebugMessage', 'true');
    }
  }
}

