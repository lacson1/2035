import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Vital } from '@prisma/client';

export interface CreateVitalData {
  date: string | Date;
  time?: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygen?: number;
  notes?: string;
}

export interface UpdateVitalData extends Partial<CreateVitalData> {}

export class VitalsService {
  async getPatientVitals(patientId: string): Promise<Vital[]> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    const vitals = await prisma.vital.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
    });

    return vitals;
  }

  async getVitalById(patientId: string, vitalId: string): Promise<Vital> {
    const vital = await prisma.vital.findFirst({
      where: {
        id: vitalId,
        patientId,
      },
    });

    if (!vital) {
      throw new NotFoundError('Vital', vitalId);
    }

    return vital;
  }

  async createVital(
    patientId: string,
    data: CreateVitalData,
    recordedById?: string
  ): Promise<Vital> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    if (!data.date) {
      throw new ValidationError('Date is required');
    }

    // Convert date string to Date object if needed
    // Handle both ISO date strings (YYYY-MM-DD) and full ISO datetime strings
    let date: Date;
    if (typeof data.date === 'string') {
      // If it's just a date (YYYY-MM-DD), parse it as local midnight to avoid timezone issues
      if (data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Parse as local date to avoid timezone conversion issues
        const [year, month, day] = data.date.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(data.date);
      }
      
      // Validate the date
      if (isNaN(date.getTime())) {
        throw new ValidationError(`Invalid date format: ${data.date}`);
      }
    } else {
      date = data.date;
    }

    console.log('Creating vital with data:', {
      patientId,
      date: date.toISOString(),
      time: data.time,
      systolic: data.systolic,
      diastolic: data.diastolic,
      heartRate: data.heartRate,
      temperature: data.temperature,
      oxygen: data.oxygen,
      recordedById,
    });

    const vital = await prisma.vital.create({
      data: {
        patientId,
        date,
        time: data.time,
        systolic: data.systolic,
        diastolic: data.diastolic,
        heartRate: data.heartRate,
        temperature: data.temperature,
        oxygen: data.oxygen,
        notes: data.notes,
        recordedById,
      },
    });

    return vital;
  }

  async updateVital(
    patientId: string,
    vitalId: string,
    data: UpdateVitalData
  ): Promise<Vital> {
    // Verify vital exists and belongs to patient
    const existingVital = await prisma.vital.findFirst({
      where: {
        id: vitalId,
        patientId,
      },
    });

    if (!existingVital) {
      throw new NotFoundError('Vital', vitalId);
    }

    // Convert date string to Date object if provided
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
    }

    const vital = await prisma.vital.update({
      where: { id: vitalId },
      data: updateData,
    });

    return vital;
  }

  async deleteVital(patientId: string, vitalId: string): Promise<void> {
    // Verify vital exists and belongs to patient
    const vital = await prisma.vital.findFirst({
      where: {
        id: vitalId,
        patientId,
      },
    });

    if (!vital) {
      throw new NotFoundError('Vital', vitalId);
    }

    await prisma.vital.delete({
      where: { id: vitalId },
    });
  }
}

export const vitalsService = new VitalsService();

