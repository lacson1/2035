import apiClient, { ApiResponse } from './api';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    inApp: boolean;
    appointmentReminders: boolean;
    labResults: boolean;
    medicationAlerts: boolean;
  };
  dashboard: {
    defaultView: string;
    itemsPerPage: number;
    showRecentActivity: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    dataRetention: number; // days
  };
}

export interface UserDataExport {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    specialty?: string;
    department?: string;
    phone?: string;
    avatarUrl?: string;
    preferences: UserPreferences | null;
    createdAt: string;
    updatedAt: string;
  };
  exportedAt: string;
}

/**
 * Settings API Service
 * Handles all user settings-related API calls
 */
export const settingsService = {
  /**
   * Get user preferences
   */
  async getPreferences(): Promise<ApiResponse<UserPreferences | null>> {
    return apiClient.get<UserPreferences | null>('/v1/settings/preferences');
  },

  /**
   * Save user preferences
   */
  async savePreferences(preferences: UserPreferences): Promise<ApiResponse<UserPreferences>> {
    return apiClient.put<UserPreferences>('/v1/settings/preferences', preferences);
  },

  /**
   * Export user data
   */
  async exportData(): Promise<ApiResponse<UserDataExport>> {
    return apiClient.get<UserDataExport>('/v1/settings/export');
  },

  /**
   * Clear user preferences
   */
  async clearPreferences(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/v1/settings/preferences');
  },
};

