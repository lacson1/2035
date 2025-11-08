import { Request, Response, NextFunction } from 'express';
import { imagingStudiesService } from '../services/imaging-studies.service';
import { UnauthorizedError } from '../utils/errors';
import prisma from '../config/database';

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

  async uploadReport(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { patientId, studyId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
        });
      }

      // Generate the file URL
      const fileUrl = `/uploads/documents/${req.file.filename}`;

      // Get the imaging study to get additional info for the document
      const study = await imagingStudiesService.getImagingStudyById(patientId, studyId);

      // Create a document record
      const document = await prisma.document.create({
        data: {
          patientId,
          documentType: 'imaging_report',
          title: `${study.type} Report`,
          fileName: req.file.filename,
          fileUrl,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          description: `Radiology report for ${study.type} (${study.bodyPart})`,
          uploadedById: req.user.userId,
          tags: ['imaging', 'report', study.modality.toLowerCase()],
          metadata: {
            imagingStudyId: studyId,
            modality: study.modality,
            bodyPart: study.bodyPart,
          },
        },
      });

      // Update the imaging study with the report URL
      const updatedStudy = await imagingStudiesService.updateImagingStudy(patientId, studyId, {
        reportUrl: fileUrl,
      });

      res.json({
        data: updatedStudy,
        document,
        message: 'Report uploaded successfully',
        fileUrl,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const imagingStudiesController = new ImagingStudiesController();

