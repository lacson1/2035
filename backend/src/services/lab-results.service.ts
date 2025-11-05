import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { LabResult, LabStatus } from '@prisma/client';

export class LabResultsService {
  async getPatientLabResults(patientId: string): Promise<LabResult[]> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    const labResults = await prisma.labResult.findMany({
      where: { patientId },
      orderBy: { orderedDate: 'desc' },
      include: {
        orderingPhysician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return labResults;
  }

  async getLabResultById(patientId: string, labResultId: string): Promise<LabResult> {
    const labResult = await prisma.labResult.findFirst({
      where: {
        id: labResultId,
        patientId,
      },
      include: {
        orderingPhysician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!labResult) {
      throw new NotFoundError('Lab result', labResultId);
    }

    return labResult;
  }

  async createLabResult(
    patientId: string,
    data: {
      testName: string;
      testCode?: string;
      category?: string;
      orderedDate: Date;
      collectedDate?: Date;
      resultDate?: Date;
      status: LabStatus;
      results?: any;
      referenceRanges?: any;
      interpretation?: string;
      notes?: string;
      labName?: string;
      labLocation?: string;
      orderingPhysicianId?: string;
    }
  ): Promise<LabResult> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    if (!data.testName || !data.orderedDate || !data.status) {
      throw new ValidationError('Test name, ordered date, and status are required');
    }

    if (data.orderingPhysicianId) {
      const physician = await prisma.user.findUnique({
        where: { id: data.orderingPhysicianId },
      });

      if (!physician) {
        throw new NotFoundError('Ordering physician', data.orderingPhysicianId);
      }
    }

    const labResult = await prisma.labResult.create({
      data: {
        patientId,
        testName: data.testName,
        testCode: data.testCode,
        category: data.category,
        orderedDate: data.orderedDate,
        collectedDate: data.collectedDate,
        resultDate: data.resultDate,
        status: data.status,
        results: data.results,
        referenceRanges: data.referenceRanges,
        interpretation: data.interpretation,
        notes: data.notes,
        labName: data.labName,
        labLocation: data.labLocation,
        orderingPhysicianId: data.orderingPhysicianId,
      },
      include: {
        orderingPhysician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return labResult;
  }

  async updateLabResult(
    patientId: string,
    labResultId: string,
    data: Partial<{
      testName: string;
      testCode: string;
      category: string;
      orderedDate: Date;
      collectedDate: Date;
      resultDate: Date;
      status: LabStatus;
      results: any;
      referenceRanges: any;
      interpretation: string;
      notes: string;
      labName: string;
      labLocation: string;
      orderingPhysicianId: string;
      reviewedById: string;
      reviewedAt: Date;
    }>
  ): Promise<LabResult> {
    // Verify lab result exists
    await this.getLabResultById(patientId, labResultId);

    const updateData: any = { ...data };

    // Convert date strings to Date objects if provided
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

    // If reviewedById is set, set reviewedAt to now if not provided
    if (updateData.reviewedById && !updateData.reviewedAt) {
      updateData.reviewedAt = new Date();
    }

    const labResult = await prisma.labResult.update({
      where: { id: labResultId },
      data: updateData,
      include: {
        orderingPhysician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return labResult;
  }

  async deleteLabResult(patientId: string, labResultId: string): Promise<void> {
    await this.getLabResultById(patientId, labResultId);

    await prisma.labResult.delete({
      where: { id: labResultId },
    });
  }

  // Note: assignedForReview functionality would require a database migration
  // For now, assignment can be handled by setting reviewedById to null
  // and updating status to pending_review
}

export const labResultsService = new LabResultsService();

