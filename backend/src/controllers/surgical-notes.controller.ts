import { Request, Response, NextFunction } from 'express';
import { surgicalNotesService } from '../services/surgical-notes.service';
import { UnauthorizedError } from '../utils/errors';

export class SurgicalNotesController {
  async getPatientSurgicalNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        status: req.query.status as any,
        procedureType: req.query.procedureType as any,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      const result = await surgicalNotesService.getPatientSurgicalNotes(patientId, params);

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

  async getSurgicalNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, noteId } = req.params;
      const surgicalNote = await surgicalNotesService.getSurgicalNoteById(patientId, noteId);

      res.json({
        data: surgicalNote,
      });
    } catch (error) {
      next(error);
    }
  }

  async createSurgicalNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const surgicalNote = await surgicalNotesService.createSurgicalNote(patientId, req.body, userId);

      res.status(201).json({
        data: surgicalNote,
        message: 'Surgical note created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSurgicalNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, noteId } = req.params;
      const surgicalNote = await surgicalNotesService.updateSurgicalNote(patientId, noteId, req.body);

      res.json({
        data: surgicalNote,
        message: 'Surgical note updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSurgicalNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, noteId } = req.params;
      await surgicalNotesService.deleteSurgicalNote(patientId, noteId);

      res.json({
        message: 'Surgical note deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const surgicalNotesController = new SurgicalNotesController();

