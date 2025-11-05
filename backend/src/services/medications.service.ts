import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Medication, MedicationStatus } from '@prisma/client';

export class MedicationsService {
  async getPatientMedications(patientId: string): Promise<Medication[]> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    const medications = await prisma.medication.findMany({
      where: { patientId },
      orderBy: { startedDate: 'desc' },
    });

    return medications;
  }

  async getMedicationById(patientId: string, medicationId: string): Promise<Medication> {
    const medication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        patientId,
      },
    });

    if (!medication) {
      throw new NotFoundError('Medication', medicationId);
    }

    return medication;
  }

  async createMedication(
    patientId: string,
    data: {
      name: string;
      status: MedicationStatus;
      startedDate: Date;
      instructions?: string;
    },
    prescribedById?: string
  ): Promise<Medication> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    if (!data.name || !data.status || !data.startedDate) {
      throw new ValidationError('Name, status, and started date are required');
    }

    const medication = await prisma.medication.create({
      data: {
        patientId,
        name: data.name,
        status: data.status,
        startedDate: data.startedDate,
        instructions: data.instructions,
        prescribedById,
      },
    });

    return medication;
  }

  async updateMedication(
    patientId: string,
    medicationId: string,
    data: Partial<{
      name: string;
      status: MedicationStatus;
      startedDate: Date;
      instructions: string;
    }>
  ): Promise<Medication> {
    // Verify medication exists
    await this.getMedicationById(patientId, medicationId);

    const medication = await prisma.medication.update({
      where: { id: medicationId },
      data,
    });

    return medication;
  }

  async deleteMedication(patientId: string, medicationId: string): Promise<void> {
    await this.getMedicationById(patientId, medicationId);

    await prisma.medication.delete({
      where: { id: medicationId },
    });
  }
}

export const medicationsService = new MedicationsService();

