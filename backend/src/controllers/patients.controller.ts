import { Request, Response, NextFunction } from 'express';
import { patientsService, PatientListParams } from '../services/patients.service';
import { UnauthorizedError } from '../utils/errors';

export class PatientsController {
  async getPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const params: PatientListParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        search: req.query.search as string,
        risk: req.query.risk as 'low' | 'medium' | 'high',
        condition: req.query.condition as string,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
      };

      const result = await patientsService.getPatients(params);

      res.json({
        data: {
          patients: result.items,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
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

  async getPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const patient = await patientsService.getPatientById(id);

      res.json({
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPatient(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const patient = await patientsService.createPatient(req.body, req.user.userId);

      res.status(201).json({
        data: patient,
        message: 'Patient created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;
      const patient = await patientsService.updatePatient(id, req.body, req.user.userId);

      res.json({
        data: patient,
        message: 'Patient updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await patientsService.deletePatient(id);

      res.json({
        message: 'Patient deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async searchPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;

      if (!query) {
        return res.status(400).json({
          message: 'Search query is required',
          status: 400,
        });
      }

      const patients = await patientsService.searchPatients(query);

      res.json({
        data: patients,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const patientsController = new PatientsController();

