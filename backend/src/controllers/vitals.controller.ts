import { Request, Response, NextFunction } from 'express';
import { vitalsService } from '../services/vitals.service';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export class VitalsController {
  async getPatientVitals(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      logger.debug('Getting vitals for patient:', { patientId });
      const vitals = await vitalsService.getPatientVitals(patientId);

      res.json({
        data: vitals,
      });
    } catch (error: any) {
      logger.error('Error getting vitals:', {
        patientId: req.params.patientId,
        error: error?.message,
        stack: error?.stack,
      });
      next(error);
    }
  }

  async getVital(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, vitalId } = req.params;
      const vital = await vitalsService.getVitalById(patientId, vitalId);

      res.json({
        data: vital,
      });
    } catch (error) {
      next(error);
    }
  }

  async createVital(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      logger.debug('Creating vital:', { patientId, userId });
      const vital = await vitalsService.createVital(patientId, req.body, userId);

      res.status(201).json({
        data: vital,
        message: 'Vital created successfully',
      });
    } catch (error: any) {
      logger.error('Error creating vital:', {
        patientId: req.params.patientId,
        userId: req.user?.userId,
        error: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      next(error);
    }
  }

  async updateVital(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, vitalId } = req.params;
      const vital = await vitalsService.updateVital(patientId, vitalId, req.body);

      res.json({
        data: vital,
        message: 'Vital updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVital(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, vitalId } = req.params;
      await vitalsService.deleteVital(patientId, vitalId);

      res.json({
        message: 'Vital deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const vitalsController = new VitalsController();

