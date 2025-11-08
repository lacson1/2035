import { Request, Response, NextFunction } from 'express';
import { vaccinationsService } from '../services/vaccinations.service';
import { UnauthorizedError } from '../utils/errors';

export class VaccinationsController {
  async getPatientVaccinations(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        verified: req.query.verified === 'true' ? true : req.query.verified === 'false' ? false : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      const result = await vaccinationsService.getPatientVaccinations(patientId, params);

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

  async getVaccination(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, vaccinationId } = req.params;
      const vaccination = await vaccinationsService.getVaccinationById(patientId, vaccinationId);

      res.json({
        data: vaccination,
      });
    } catch (error) {
      next(error);
    }
  }

  async createVaccination(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const vaccination = await vaccinationsService.createVaccination(patientId, req.body, userId);

      res.status(201).json({
        data: vaccination,
        message: 'Vaccination created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateVaccination(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, vaccinationId } = req.params;
      const vaccination = await vaccinationsService.updateVaccination(patientId, vaccinationId, req.body);

      res.json({
        data: vaccination,
        message: 'Vaccination updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVaccination(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, vaccinationId } = req.params;
      await vaccinationsService.deleteVaccination(patientId, vaccinationId);

      res.json({
        message: 'Vaccination deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const vaccinationsController = new VaccinationsController();

