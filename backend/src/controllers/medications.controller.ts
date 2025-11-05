import { Request, Response, NextFunction } from 'express';
import { medicationsService } from '../services/medications.service';
import { UnauthorizedError } from '../utils/errors';

export class MedicationsController {
  async getPatientMedications(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const medications = await medicationsService.getPatientMedications(patientId);

      res.json({
        data: medications,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMedication(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, medId } = req.params;
      const medication = await medicationsService.getMedicationById(patientId, medId);

      res.json({
        data: medication,
      });
    } catch (error) {
      next(error);
    }
  }

  async createMedication(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { patientId } = req.params;
      const { name, status, started, instructions } = req.body;

      const medication = await medicationsService.createMedication(
        patientId,
        {
          name,
          status,
          startedDate: new Date(started),
          instructions,
        },
        req.user.userId
      );

      res.status(201).json({
        data: medication,
        message: 'Medication created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMedication(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, medId } = req.params;
      const { name, status, started, instructions } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (status) updateData.status = status;
      if (started) updateData.startedDate = new Date(started);
      if (instructions !== undefined) updateData.instructions = instructions;

      const medication = await medicationsService.updateMedication(
        patientId,
        medId,
        updateData
      );

      res.json({
        data: medication,
        message: 'Medication updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMedication(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, medId } = req.params;
      await medicationsService.deleteMedication(patientId, medId);

      res.json({
        message: 'Medication deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const medicationsController = new MedicationsController();

