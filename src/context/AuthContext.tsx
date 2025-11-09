import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '../services/api';
import { User } from '../types';
import { debugAuthState } from '../utils/debug';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Store access token in state (not localStorage for security)
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  
  // Ref to track if a fetch is in progress to prevent duplicate requests
  const fetchingRef = React.useRef(false);
  // Ref to track the last token we fetched for to avoid refetching with same token
  const lastFetchedTokenRef = React.useRef<string | null>(null);

  // Update global token for API client
  useEffect(() => {
    if (accessToken) {
      (window as any).__authToken = accessToken;
    } else {
      delete (window as any).__authToken;
    }
  }, [accessToken]);

  const fetchCurrentUser = useCallback(async () => {
    // Check if we have an access token (in state or localStorage as fallback)
    const token = accessToken || localStorage.getItem('authToken');
    // Don't make request if no token exists
    if (!token) {
      setIsLoading(false);
      fetchingRef.current = false;
      lastFetchedTokenRef.current = null;
      return;
    }

    // Prevent duplicate requests - if already fetching or same token, skip
    if (fetchingRef.current || lastFetchedTokenRef.current === token) {
      return;
    }

    fetchingRef.current = true;
    lastFetchedTokenRef.current = token;

    try {
      const response = await apiClient.get<User>('/v1/auth/me');
      if (response.data) {
        setUser(response.data);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error: any) {
      // Handle 401 Unauthorized - token is invalid/expired, clear it silently
      if (error?.status === 401) {
        // Token invalid or expired - clear it silently (this is expected)
        setAccessTokenState(null);
        localStorage.removeItem('authToken'); // Clear fallback
        setUser(null);
        lastFetchedTokenRef.current = null;
        // Don't log this as an error - it's expected when token expires
        return;
      }
      
      // Handle 429 Rate Limit - don't clear token, just log
      if (error?.status === 429) {
        logger.warn('Rate limited when fetching user. Will retry later.');
        // Reset fetching flag so we can retry after a delay
        fetchingRef.current = false;
        // Don't update lastFetchedTokenRef so we can retry
        lastFetchedTokenRef.current = null;
        return;
      }
      
      // Connection error - backend might be down
      if (error?.status === 0 || error?.message?.includes('Failed to fetch')) {
        logger.warn('Cannot connect to backend server. Please ensure it is running.');
        // Don't clear tokens on connection errors - might be temporary
        fetchingRef.current = false;
        lastFetchedTokenRef.current = null;
        return;
      }
      
      // Other errors - log and clear tokens
      logger.debug('Failed to fetch current user:', error?.message || error);
      setAccessTokenState(null);
      localStorage.removeItem('authToken');
      setUser(null);
      lastFetchedTokenRef.current = null;
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [accessToken]);

  useEffect(() => {
    // Check for existing session on mount
    // Try to get token from localStorage (fallback) or state
    const token = accessToken || localStorage.getItem('authToken');
    if (token) {
      // Set token in state if it was in localStorage
      if (!accessToken && token) {
        setAccessTokenState(token);
      }
      // Only fetch if we haven't already fetched for this token
      if (lastFetchedTokenRef.current !== token) {
        fetchCurrentUser();
      }
    } else {
      setIsLoading(false);
      lastFetchedTokenRef.current = null;
    }
  }, [fetchCurrentUser, accessToken]);

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username?: string
  ) => {
    setIsLoading(true);

    try {
      const response = await apiClient.post<{
        tokens: { accessToken: string; refreshToken: string };
        user: User;
      }>('/v1/auth/register', {
        email,
        password,
        firstName,
        lastName,
        username,
      });

      const data = response.data;
      const tokens = (data as any).data?.tokens || data.tokens;
      const user = (data as any).data?.user || data.user;

      if (!tokens || !user) {
        throw new Error('Invalid response from server');
      }

      // Store access token in state (refresh token is in httpOnly cookie)
      setAccessTokenState(tokens.accessToken);
      localStorage.setItem('authToken', tokens.accessToken); // Fallback for API client
      // Don't store refreshToken - it's in httpOnly cookie

      // Set user
      setUser(user);
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';

      if (err?.status === 0) {
        errorMessage =
          'Unable to connect to server. Please ensure the backend server is running.';
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.errors && typeof err.errors === 'object') {
        const firstError = Object.values(err.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{
        tokens?: {
          accessToken: string;
          refreshToken: string;
        };
        accessToken?: string;
        refreshToken?: string;
        user: User;
      }>('/v1/auth/login', { email, password });

      // Handle response format - could be nested tokens or flat
      const accessToken = response.data.tokens?.accessToken || response.data.accessToken;
      const user = response.data.user;

      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      // Store access token in state (refresh token is in httpOnly cookie)
      setAccessTokenState(accessToken);
      localStorage.setItem('authToken', accessToken); // Fallback for API client
      // Don't store refreshToken - it's in httpOnly cookie
      setUser(user);
      
      // Debug log auth state after login
      if (import.meta.env.DEV) {
        debugAuthState();
      }
    } catch (error: any) {
      // Extract error message from API error or use default
      let errorMessage = 'Login failed. Please check your credentials.';
      
      // Handle connection errors first
      if (error?.status === 0 || error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage =
          'Cannot connect to backend server. Please ensure the backend is running at http://localhost:3000';
        logger.error('Backend connection failed during login:', error);
        throw new Error(errorMessage);
      }
      
      // Handle 401 Unauthorized - wrong credentials
      if (error?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        logger.warn('Login failed: Invalid credentials');
        throw new Error(errorMessage);
      }
      
      // Handle ApiError from apiClient
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errors && typeof error.errors === 'object') {
        // Handle validation errors
        const firstError = Object.values(error.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      logger.error('Login error:', error);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      logger.warn('Logout API call failed:', error);
    } finally {
      // Clear access token from state and localStorage
      setAccessTokenState(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('viewMode'); // Clear view mode on logout
      // Refresh token cookie will be cleared by backend
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      // Refresh token is in httpOnly cookie, no need to send it in body
      const response = await apiClient.post<{ accessToken: string }>('/v1/auth/refresh', {});

      const newAccessToken = response.data.accessToken || (response.data as any).data?.accessToken;
      if (newAccessToken) {
        setAccessTokenState(newAccessToken);
        localStorage.setItem('authToken', newAccessToken); // Fallback for API client
      } else {
        throw new Error('No access token received');
      }
    } catch (error: any) {
      // Refresh failed - this is expected when user is not logged in
      // Only log if it's not a 401 (unauthorized) error
      if (error?.status !== 401) {
        logger.error('Token refresh failed:', error);
      }
      // Clear tokens and user state without calling logout to avoid recursion
      setAccessTokenState(null);
      localStorage.removeItem('authToken');
      setUser(null);
      throw error;
    }
  };

  const refreshUser = useCallback(async () => {
    // Reset the last fetched token ref to force a fresh fetch
    lastFetchedTokenRef.current = null;
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  const requestPasswordReset = async (email: string) => {
    try {
      await apiClient.post('/v1/auth/password-reset/request', { email });
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error?.status === 0) {
        errorMessage = 'Unable to connect to server. Please ensure the backend server is running.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await apiClient.post('/v1/auth/password-reset/reset', { token, password });
    } catch (error: any) {
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error?.status === 0) {
        errorMessage = 'Unable to connect to server. Please ensure the backend server is running.';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errors && typeof error.errors === 'object') {
        const firstError = Object.values(error.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshToken,
        refreshUser,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

