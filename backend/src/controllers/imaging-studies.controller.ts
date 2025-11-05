import { Request, Response, NextFunction } from 'express';
import { imagingStudiesService } from '../services/imaging-studies.service';
import { UnauthorizedError } from '../utils/errors';

export class ImagingStudiesController {
  async getPatientImagingStudies(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const studies = await imagingStudiesService.getPatientImagingStudies(patientId);

      res.json({
        data: studies,
      });
    } catch (error) {
      next(error);
    }
  }

  async getImagingStudy(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, studyId } = req.params;
      const study = await imagingStudiesService.getImagingStudyById(patientId, studyId);

      res.json({
        data: study,
      });
    } catch (error) {
      next(error);
    }
  }

  async createImagingStudy(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { patientId } = req.params;
      const { type, modality, bodyPart, date, findings, status, reportUrl, orderingPhysicianId } = req.body;

      const study = await imagingStudiesService.createImagingStudy(patientId, {
        type,
        modality,
        bodyPart,
        date: new Date(date),
        findings,
        status,
        reportUrl,
        orderingPhysicianId: orderingPhysicianId || req.user.userId,
      });

      res.status(201).json({
        data: study,
        message: 'Imaging study created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateImagingStudy(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, studyId } = req.params;
      const updateData: any = { ...req.body };

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const study = await imagingStudiesService.updateImagingStudy(patientId, studyId, updateData);

      res.json({
        data: study,
        message: 'Imaging study updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteImagingStudy(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, studyId } = req.params;
      await imagingStudiesService.deleteImagingStudy(patientId, studyId);

      res.json({
        message: 'Imaging study deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const imagingStudiesController = new ImagingStudiesController();

