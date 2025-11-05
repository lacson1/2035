import { Request, Response, NextFunction } from 'express';
import { clinicalNotesService } from '../services/clinical-notes.service';
import { UnauthorizedError } from '../utils/errors';

export class ClinicalNotesController {
  async getPatientNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const notes = await clinicalNotesService.getPatientNotes(patientId);

      res.json({
        data: notes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, noteId } = req.params;
      const note = await clinicalNotesService.getNoteById(patientId, noteId);

      res.json({
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  async createNote(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { patientId } = req.params;
      const { title, content, date, type, consultationType, specialty } = req.body;

      const note = await clinicalNotesService.createNote(patientId, {
        title,
        content,
        date: new Date(date),
        type,
        authorId: req.user.userId,
        consultationType,
        specialty,
      });

      res.status(201).json({
        data: note,
        message: 'Clinical note created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, noteId } = req.params;
      const updateData: any = { ...req.body };

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const note = await clinicalNotesService.updateNote(patientId, noteId, updateData);

      res.json({
        data: note,
        message: 'Clinical note updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, noteId } = req.params;
      await clinicalNotesService.deleteNote(patientId, noteId);

      res.json({
        message: 'Clinical note deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const clinicalNotesController = new ClinicalNotesController();

