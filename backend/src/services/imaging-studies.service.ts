import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { ImagingStudy, ImagingModality, ImagingStatus } from '@prisma/client';

export class ImagingStudiesService {
  async getPatientImagingStudies(patientId: string): Promise<ImagingStudy[]> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    const studies = await prisma.imagingStudy.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
    });

    return studies;
  }

  async getImagingStudyById(patientId: string, studyId: string): Promise<ImagingStudy> {
    const study = await prisma.imagingStudy.findFirst({
      where: {
        id: studyId,
        patientId,
      },
    });

    if (!study) {
      throw new NotFoundError('Imaging study', studyId);
    }

    return study;
  }

  async createImagingStudy(
    patientId: string,
    data: {
      type: string;
      modality: ImagingModality;
      bodyPart: string;
      date: Date;
      findings: string;
      status: ImagingStatus;
      reportUrl?: string;
      orderingPhysicianId?: string;
    }
  ): Promise<ImagingStudy> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    if (data.orderingPhysicianId) {
      const physician = await prisma.user.findUnique({
        where: { id: data.orderingPhysicianId },
      });

      if (!physician) {
        throw new NotFoundError('Ordering physician', data.orderingPhysicianId);
      }
    }

    if (!data.type || !data.modality || !data.bodyPart || !data.date || !data.findings || !data.status) {
      throw new ValidationError('Type, modality, body part, date, findings, and status are required');
    }

    const study = await prisma.imagingStudy.create({
      data: {
        patientId,
        type: data.type,
        modality: data.modality,
        bodyPart: data.bodyPart,
        date: data.date,
        findings: data.findings,
        status: data.status,
        reportUrl: data.reportUrl,
        orderingPhysicianId: data.orderingPhysicianId,
      },
    });

    return study;
  }

  async updateImagingStudy(
    patientId: string,
    studyId: string,
    data: Partial<{
      type: string;
      modality: ImagingModality;
      bodyPart: string;
      date: Date;
      findings: string;
      status: ImagingStatus;
      reportUrl: string;
      orderingPhysicianId: string;
    }>
  ): Promise<ImagingStudy> {
    // Verify study exists
    await this.getImagingStudyById(patientId, studyId);

    const study = await prisma.imagingStudy.update({
      where: { id: studyId },
      data,
    });

    return study;
  }

  async deleteImagingStudy(patientId: string, studyId: string): Promise<void> {
    await this.getImagingStudyById(patientId, studyId);

    await prisma.imagingStudy.delete({
      where: { id: studyId },
    });
  }
}

export const imagingStudiesService = new ImagingStudiesService();

