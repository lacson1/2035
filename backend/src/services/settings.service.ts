import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Prisma } from '@prisma/client';

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

export class SettingsService {
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.preferences as UserPreferences | null;
  }

  async saveUserPreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<UserPreferences> {
    // Validate preferences structure
    this.validatePreferences(preferences);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { preferences: preferences as any },
      select: { preferences: true },
    });

    return user.preferences as unknown as UserPreferences;
  }

  async exportUserData(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialty: true,
        department: true,
        phone: true,
        avatarUrl: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get related data if needed (appointments, notes, etc.)
    // For now, just return user data and preferences
    return {
      user: {
        ...user,
        preferences: user.preferences as UserPreferences | null,
      },
      exportedAt: new Date().toISOString(),
    };
  }

  async clearUserPreferences(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { preferences: Prisma.JsonNull },
    });
  }

  private validatePreferences(preferences: any): void {
    if (!preferences || typeof preferences !== 'object') {
      throw new ValidationError('Invalid preferences format');
    }

    // Validate theme
    if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
      throw new ValidationError('Invalid theme value');
    }

    // Validate notifications
    if (preferences.notifications) {
      const notif = preferences.notifications;
      if (typeof notif.email !== 'boolean' ||
          typeof notif.inApp !== 'boolean' ||
          typeof notif.appointmentReminders !== 'boolean' ||
          typeof notif.labResults !== 'boolean' ||
          typeof notif.medicationAlerts !== 'boolean') {
        throw new ValidationError('Invalid notification preferences');
      }
    }

    // Validate dashboard
    if (preferences.dashboard) {
      const dash = preferences.dashboard;
      if (dash.itemsPerPage && (typeof dash.itemsPerPage !== 'number' || dash.itemsPerPage < 1 || dash.itemsPerPage > 1000)) {
        throw new ValidationError('Invalid items per page value');
      }
      if (dash.showRecentActivity !== undefined && typeof dash.showRecentActivity !== 'boolean') {
        throw new ValidationError('Invalid showRecentActivity value');
      }
    }

    // Validate privacy
    if (preferences.privacy) {
      const privacy = preferences.privacy;
      if (privacy.shareAnalytics !== undefined && typeof privacy.shareAnalytics !== 'boolean') {
        throw new ValidationError('Invalid shareAnalytics value');
      }
      if (privacy.dataRetention && (typeof privacy.dataRetention !== 'number' || privacy.dataRetention < 1)) {
        throw new ValidationError('Invalid data retention value');
      }
    }
  }
}

export const settingsService = new SettingsService();

