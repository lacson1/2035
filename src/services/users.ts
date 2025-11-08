import apiClient, { ApiResponse } from './api';
import { User } from '../types';

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * User API Service
 * Handles all user-related API calls
 */
export const userService = {
  /**
   * Get list of providers (available to all authenticated users for assignment)
   */
  async getProviders(params?: { role?: string; search?: string }): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>('/v1/users/providers', params as Record<string, string>);
  },

  /**
   * Get list of users (admin only)
   */
  async getUsers(params?: UserListParams): Promise<ApiResponse<UserListResponse>> {
    return apiClient.get<UserListResponse>('/v1/users', params as Record<string, string>);
  },

  /**
   * Get single user by ID
   */
  async getUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/v1/users/${id}`);
  },

  /**
   * Create new user (admin only)
   */
  async createUser(user: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/v1/users', user);
  },

  /**
   * Update user (admin only)
   */
  async updateUser(id: string, user: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/v1/users/${id}`, user);
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/users/${id}`);
  },
};

