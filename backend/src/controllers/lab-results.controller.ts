import { Request, Response, NextFunction } from 'express';
import { labResultsService } from '../services/lab-results.service';
import { UnauthorizedError } from '../utils/errors';

export class LabResultsController {
  async getPatientLabResults(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const labResults = await labResultsService.getPatientLabResults(patientId);

      res.json({
        data: labResults,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLabResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, labResultId } = req.params;
      const labResult = await labResultsService.getLabResultById(patientId, labResultId);

      res.json({
        data: labResult,
      });
    } catch (error) {
      next(error);
    }
  }

  async createLabResult(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { patientId } = req.params;
      const {
        testName,
        testCode,
        category,
        orderedDate,
        collectedDate,
        resultDate,
        status,
        results,
        referenceRanges,
        interpretation,
        notes,
        labName,
        labLocation,
        orderingPhysicianId,
      } = req.body;

      const labResult = await labResultsService.createLabResult(patientId, {
        testName,
        testCode,
        category,
        orderedDate: new Date(orderedDate),
        collectedDate: collectedDate ? new Date(collectedDate) : undefined,
        resultDate: resultDate ? new Date(resultDate) : undefined,
        status,
        results,
        referenceRanges,
        interpretation,
        notes,
        labName,
        labLocation,
        orderingPhysicianId: orderingPhysicianId || req.user.userId,
      });

      res.status(201).json({
        data: labResult,
        message: 'Lab result created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLabResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, labResultId } = req.params;
      const updateData: any = { ...req.body };

      // Convert date strings to Date objects
      if (updateData.orderedDate && typeof updateData.orderedDate === 'string') {
        updateData.orderedDate = new Date(updateData.orderedDate);
      }
      if (updateData.collectedDate && typeof updateData.collectedDate === 'string') {
        updateData.collectedDate = new Date(updateData.collectedDate);
      }
      if (updateData.resultDate && typeof updateData.resultDate === 'string') {
        updateData.resultDate = new Date(updateData.resultDate);
      }
      if (updateData.reviewedAt && typeof updateData.reviewedAt === 'string') {
        updateData.reviewedAt = new Date(updateData.reviewedAt);
      }

      const labResult = await labResultsService.updateLabResult(patientId, labResultId, updateData);

      res.json({
        data: labResult,
        message: 'Lab result updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteLabResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, labResultId } = req.params;
      await labResultsService.deleteLabResult(patientId, labResultId);

      res.json({
        message: 'Lab result deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

}

export const labResultsController = new LabResultsController();

