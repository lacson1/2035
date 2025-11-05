import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '../services/api';
import { User } from '../types';
import { debugAuthState } from '../utils/debug';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await apiClient.get<User>('/v1/auth/me');
      if (response.data) {
        setUser(response.data);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error: any) {
      // Token invalid, clear it
      if (import.meta.env.DEV) {
        console.warn('Failed to fetch current user:', error?.message || error);
      }
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [fetchCurrentUser]);

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
      const refreshToken = response.data.tokens?.refreshToken || response.data.refreshToken;
      const user = response.data.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      
      // Debug log auth state after login
      if (import.meta.env.DEV) {
        debugAuthState();
      }
    } catch (error: any) {
      // Extract error message from API error or use default
      let errorMessage = 'Login failed. Please check your credentials.';
      
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
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      if (import.meta.env.DEV) {
        console.error('Logout API call failed:', error);
      }
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<{ accessToken: string }>('/v1/auth/refresh', {
        refreshToken: refreshTokenValue,
      });

      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
      } else {
        // Handle nested response format
        const nestedResponse = response.data as any;
        if (nestedResponse.data?.accessToken) {
          localStorage.setItem('authToken', nestedResponse.data.accessToken);
        }
      }
    } catch (error) {
      // Refresh failed, logout user
      if (import.meta.env.DEV) {
        console.error('Token refresh failed:', error);
      }
      // Clear tokens and user state without calling logout to avoid recursion
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshToken,
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

