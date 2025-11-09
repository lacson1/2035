/**
 * API Service Layer
 * Centralized API configuration and utilities
 */

import { debugApiRequest, debugApiResponse, debugApiError } from '../utils/debug';
import { logger } from '../utils/logger';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Public endpoints that don't require authentication
    const publicEndpoints = ['/v1/hubs'];
    const isPublicEndpoint = publicEndpoints.some(publicPath => endpoint.startsWith(publicPath));

    // Add auth token if available and endpoint is not public
    // Access token is stored in memory (via AuthContext), refresh token is in httpOnly cookie
    if (!isPublicEndpoint) {
      // Try to get token from a global store or pass it as a parameter
      // For now, we'll check localStorage as fallback (will be removed after AuthContext update)
      const token = (window as any).__authToken || localStorage.getItem('authToken');
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Include cookies (for refresh token)
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    // Debug log request in development
    if (import.meta.env.DEV) {
      const debugEnabled = localStorage.getItem('showDebugInfo') === 'true';
      if (debugEnabled) {
        try {
          const requestBody = options.body ? JSON.parse(options.body as string) : undefined;
          debugApiRequest(options.method || 'GET', url, requestBody);
        } catch (e) {
          // Body might not be JSON, log as-is
          debugApiRequest(options.method || 'GET', url, options.body);
        }
      }
      // Always log basic request info in dev mode (without sensitive data)
      logger.debug(`API Request: ${options.method || 'GET'} ${url}`);
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - try to refresh token (but not for public endpoints or auth endpoints)
      // Refresh token is now in httpOnly cookie, so we don't need to send it in body
      if (response.status === 401 && retry && !isPublicEndpoint && !endpoint.includes('/auth/me') && !endpoint.includes('/auth/refresh')) {
        try {
          const refreshResponse = await fetch(`${this.baseURL}/v1/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Include cookies (refresh token)
            headers: {
              'Content-Type': 'application/json',
            },
            // No body needed - refresh token is in httpOnly cookie
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            // Handle both nested and flat response formats
            const newToken = refreshData.data?.accessToken || refreshData.accessToken;
            if (newToken) {
              // Store access token in memory (via global variable for now, will be updated in AuthContext)
              (window as any).__authToken = newToken;
              localStorage.setItem('authToken', newToken); // Temporary fallback
              // Retry original request with new token
              return this.request<T>(endpoint, options, false);
            }
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens
          // Don't log here to avoid console noise - token refresh failures are expected
          delete (window as any).__authToken;
          localStorage.removeItem('authToken');
          // Don't redirect here, let the app handle it
        }
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          // Response might not be JSON
        }
        
        // For 401 on auth endpoints (login, refresh, me), suppress console errors
        // These are expected when user is not logged in or token is expired
        const isAuthEndpoint = endpoint.includes('/auth/login') || 
                               endpoint.includes('/auth/refresh') || 
                               endpoint.includes('/auth/me');
        const shouldSuppressError = response.status === 401 && (isPublicEndpoint || isAuthEndpoint);
        
        if (shouldSuppressError) {
          const apiError = new ApiError(
            'Unauthorized - please login again',
            response.status,
            errorData.errors
          );
          throw apiError;
        }
        
        const apiError = new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData.errors
        );
        
        // Attach full response data for debugging
        (apiError as any).response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
          headers: Object.fromEntries(response.headers.entries()),
        };
        
        // Log error details in development (but suppress expected 401s on auth endpoints)
        if (import.meta.env.DEV && !shouldSuppressError) {
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            errorData,
            endpoint: url,
          });
        }
        
        // Add retry-after information for rate limiting (429)
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          if (retryAfter) {
            (apiError as any).retryAfter = parseInt(retryAfter, 10);
          } else if (errorData.retryAfter) {
            (apiError as any).retryAfter = errorData.retryAfter;
          }
        }
        
        throw apiError;
      }

      const responseData = await response.json();
      
      // Backend returns { data: T, message?: string, errors?: string[] }
      // Extract the data field
      const result = {
        data: responseData.data || responseData,
        message: responseData.message,
        errors: responseData.errors,
      };

      // Debug log response in development
      if (import.meta.env.DEV) {
        const debugEnabled = localStorage.getItem('showDebugInfo') === 'true';
        if (debugEnabled) {
        debugApiResponse(options.method || 'GET', url, result);
        }
        // Always log basic response info in dev mode
        logger.debug(`API Response: ${options.method || 'GET'} ${url} - Status: ${response.status}`);
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors (CORS, connection refused, timeout, etc.)
      let errorMessage = 'An unexpected error occurred';
      let statusCode = 500;
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error - likely CORS, connection refused, or server not running
        const baseUrlDisplay = this.baseURL || 'http://localhost:3000/api';
        const serverUrl = baseUrlDisplay.replace('/api', '');
        errorMessage = `❌ Cannot connect to backend server at ${serverUrl}

The backend server is not running. To fix this:

1. Open a terminal and navigate to the backend directory:
   cd backend

2. Start the backend server:
   npm run dev

3. Verify the server is running:
   curl http://localhost:3000/health

Once the server is running, try logging in again.`;
        statusCode = 0; // Network error, no HTTP status
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Log network errors in dev mode (only if debug info is enabled)
      if (import.meta.env.DEV) {
        const showDebugInfo = localStorage.getItem('showDebugInfo') === 'true';
        debugApiError(options.method || 'GET', url, error);
        if (statusCode === 0 && showDebugInfo) {
          logger.error('Attempted URL:', url);
          logger.error('API Base URL:', this.baseURL);
        }
      }
      
      throw new ApiError(errorMessage, statusCode);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const apiClient = new ApiClient();

// Export singleton instance
export default apiClient;

