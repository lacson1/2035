import { Request, Response, NextFunction } from 'express';
import { nutritionService } from '../services/nutrition.service';
import { UnauthorizedError } from '../utils/errors';

export class NutritionController {
  async getPatientNutritionEntries(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        type: req.query.type as any,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      const result = await nutritionService.getPatientNutritionEntries(patientId, params);

      res.json({
        data: result.items,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getNutritionEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, entryId } = req.params;
      const entry = await nutritionService.getNutritionEntryById(patientId, entryId);

      res.json({
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  async createNutritionEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const entry = await nutritionService.createNutritionEntry(patientId, req.body, userId);

      res.status(201).json({
        data: entry,
        message: 'Nutrition entry created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateNutritionEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, entryId } = req.params;
      const entry = await nutritionService.updateNutritionEntry(patientId, entryId, req.body);

      res.json({
        data: entry,
        message: 'Nutrition entry updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNutritionEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, entryId } = req.params;
      await nutritionService.deleteNutritionEntry(patientId, entryId);

      res.json({
        message: 'Nutrition entry deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const nutritionController = new NutritionController();

