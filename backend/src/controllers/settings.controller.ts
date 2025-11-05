import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';
import { JwtPayload } from '../types';

export class SettingsController {
  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as JwtPayload;
      const preferences = await settingsService.getUserPreferences(user.userId);

      res.json({
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  async savePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as JwtPayload;
      const preferences = req.body;

      const savedPreferences = await settingsService.saveUserPreferences(
        user.userId,
        preferences
      );

      res.json({
        data: savedPreferences,
        message: 'Preferences saved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as JwtPayload;
      const data = await settingsService.exportUserData(user.userId);

      res.json({
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async clearPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as JwtPayload;
      await settingsService.clearUserPreferences(user.userId);

      res.json({
        message: 'Preferences cleared successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();

