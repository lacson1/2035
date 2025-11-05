import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Appointment, AppointmentStatus } from '@prisma/client';

export interface AppointmentFilters {
  patientId?: string;
  providerId?: string;
  status?: AppointmentStatus;
  from?: Date;
  to?: Date;
}

export class AppointmentsService {
  async getAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
    const where: any = {};

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.providerId) {
      where.providerId = filters.providerId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) {
        where.date.gte = filters.from;
      }
      if (filters.to) {
        where.date.lte = filters.to;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return appointments as any;
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return appointments as any;
  }

  async getAppointmentById(patientId: string, appointmentId: string): Promise<Appointment> {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId,
      },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment', appointmentId);
    }

    return appointment as any;
  }

  async createAppointment(
    patientId: string,
    data: {
      date: Date;
      time: string;
      type: string;
      providerId: string;
      status?: AppointmentStatus;
      notes?: string;
      consultationType?: string;
      specialty?: string;
      duration?: number;
      location?: string;
      reason?: string;
      referralRequired?: boolean;
    }
  ): Promise<Appointment> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    // Verify provider exists
    const provider = await prisma.user.findUnique({
      where: { id: data.providerId },
    });

    if (!provider) {
      throw new NotFoundError('Provider', data.providerId);
    }

    if (!data.date || !data.time || !data.type || !data.providerId) {
      throw new ValidationError('Date, time, type, and provider are required');
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        date: data.date,
        time: data.time,
        type: data.type,
        providerId: data.providerId,
        status: data.status || 'scheduled',
        notes: data.notes,
        consultationType: data.consultationType,
        specialty: data.specialty,
        duration: data.duration,
        location: data.location,
        reason: data.reason,
        referralRequired: data.referralRequired || false,
      },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return appointment as any;
  }

  async updateAppointment(
    patientId: string,
    appointmentId: string,
    data: Partial<{
      date: Date;
      time: string;
      type: string;
      providerId: string;
      status: AppointmentStatus;
      notes: string;
      consultationType: string;
      specialty: string;
      duration: number;
      location: string;
      reason: string;
      referralRequired: boolean;
    }>
  ): Promise<Appointment> {
    // Verify appointment exists
    await this.getAppointmentById(patientId, appointmentId);

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data,
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return appointment as any;
  }

  async deleteAppointment(patientId: string, appointmentId: string): Promise<void> {
    await this.getAppointmentById(patientId, appointmentId);

    await prisma.appointment.delete({
      where: { id: appointmentId },
    });
  }
}

export const appointmentsService = new AppointmentsService();

