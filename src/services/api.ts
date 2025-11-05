/**
 * API Service Layer
 * Centralized API configuration and utilities
 */

import { debugApiRequest, debugApiResponse, debugApiError } from '../utils/debug';

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

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    // Debug log request in development (only if debug info is enabled)
    if (import.meta.env.DEV && localStorage.getItem('showDebugInfo') === 'true') {
      debugApiRequest(options.method || 'GET', url, options.body ? JSON.parse(options.body as string) : undefined);
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retry) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${this.baseURL}/v1/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              // Handle both nested and flat response formats
              const newToken = refreshData.data?.accessToken || refreshData.accessToken;
              if (newToken) {
                localStorage.setItem('authToken', newToken);
                // Retry original request with new token
                return this.request<T>(endpoint, options, false);
              }
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens
            // Don't log here to avoid console noise - token refresh failures are expected
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            // Don't redirect here, let the app handle it
          }
        }
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          // Response might not be JSON
        }
        
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData.errors
        );
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
        debugApiResponse(options.method || 'GET', url, result);
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
          console.error('Attempted URL:', url);
          console.error('API Base URL:', this.baseURL);
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

