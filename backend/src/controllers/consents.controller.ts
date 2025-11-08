import { Request, Response, NextFunction } from 'express';
import { consentsService } from '../services/consents.service';
import { UnauthorizedError } from '../utils/errors';

export class ConsentsController {
  async getPatientConsents(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        status: req.query.status as any,
        type: req.query.type as any,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      const result = await consentsService.getPatientConsents(patientId, params);

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

  async getConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, consentId } = req.params;
      const consent = await consentsService.getConsentById(patientId, consentId);

      res.json({
        data: consent,
      });
    } catch (error) {
      next(error);
    }
  }

  async createConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const consent = await consentsService.createConsent(patientId, req.body, userId);

      res.status(201).json({
        data: consent,
        message: 'Consent created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, consentId } = req.params;
      const consent = await consentsService.updateConsent(patientId, consentId, req.body);

      res.json({
        data: consent,
        message: 'Consent updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, consentId } = req.params;
      await consentsService.deleteConsent(patientId, consentId);

      res.json({
        message: 'Consent deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const consentsController = new ConsentsController();

