import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Referral, ReferralStatus, ReferralPriority } from '@prisma/client';

export interface ReferralFilters {
  patientId?: string;
  status?: ReferralStatus;
  priority?: ReferralPriority;
  specialty?: string;
  from?: Date;
  to?: Date;
}

export class ReferralsService {
  async getReferrals(filters: ReferralFilters = {}): Promise<Referral[]> {
    const where: any = {};

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.specialty) {
      where.specialty = filters.specialty;
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

    const referrals = await prisma.referral.findMany({
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
        referringPhysician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        referredToProvider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return referrals as any;
  }

  async getPatientReferrals(patientId: string): Promise<Referral[]> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    const referrals = await prisma.referral.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
      include: {
        referringPhysician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        referredToProvider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return referrals as any;
  }

  async getReferralById(patientId: string, referralId: string): Promise<Referral> {
    const referral = await prisma.referral.findFirst({
      where: {
        id: referralId,
        patientId,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        referringPhysician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        referredToProvider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    if (!referral) {
      throw new NotFoundError('Referral', referralId);
    }

    return referral as any;
  }

  async createReferral(
    patientId: string,
    data: {
      date: Date;
      specialty: string;
      reason: string;
      diagnosis?: string;
      priority: ReferralPriority;
      status?: ReferralStatus;
      referringPhysicianId?: string;
      referredToProviderId?: string;
      referredToProvider?: string;
      referredToFacility?: string;
      referredToAddress?: string;
      referredToPhone?: string;
      appointmentDate?: Date;
      appointmentTime?: string;
      notes?: string;
      attachments?: string[];
      insurancePreAuth?: boolean;
      preAuthNumber?: string;
      followUpRequired?: boolean;
      followUpDate?: Date;
    }
  ): Promise<Referral> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    // Verify referring physician exists if provided
    if (data.referringPhysicianId) {
      const physician = await prisma.user.findUnique({
        where: { id: data.referringPhysicianId },
      });

      if (!physician) {
        throw new NotFoundError('Referring Physician', data.referringPhysicianId);
      }
    }

    // Verify referred to provider exists if provided
    if (data.referredToProviderId) {
      const provider = await prisma.user.findUnique({
        where: { id: data.referredToProviderId },
      });

      if (!provider) {
        throw new NotFoundError('Referred To Provider', data.referredToProviderId);
      }
    }

    if (!data.date || !data.specialty || !data.reason || !data.priority) {
      throw new ValidationError('Date, specialty, reason, and priority are required');
    }

    const referral = await prisma.referral.create({
      data: {
        patientId,
        date: data.date,
        specialty: data.specialty,
        reason: data.reason,
        diagnosis: data.diagnosis,
        priority: data.priority,
        status: data.status || 'pending',
        referringPhysicianId: data.referringPhysicianId,
        referredToProviderId: data.referredToProviderId,
        referredToProviderName: data.referredToProvider,
        referredToFacility: data.referredToFacility,
        referredToAddress: data.referredToAddress,
        referredToPhone: data.referredToPhone,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        notes: data.notes,
        attachments: data.attachments || [],
        insurancePreAuth: data.insurancePreAuth || false,
        preAuthNumber: data.preAuthNumber,
        followUpRequired: data.followUpRequired || false,
        followUpDate: data.followUpDate,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        referringPhysician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        referredToProvider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return referral as any;
  }

  async updateReferral(
    patientId: string,
    referralId: string,
    data: Partial<{
      date: Date;
      specialty: string;
      reason: string;
      diagnosis: string;
      priority: ReferralPriority;
      status: ReferralStatus;
      referringPhysicianId: string;
      referredToProviderId: string;
      referredToProvider: string; // This is the name field, kept for backward compatibility
      referredToFacility: string;
      referredToAddress: string;
      referredToPhone: string;
      appointmentDate: Date;
      appointmentTime: string;
      notes: string;
      attachments: string[];
      insurancePreAuth: boolean;
      preAuthNumber: string;
      followUpRequired: boolean;
      followUpDate: Date;
    }>
  ): Promise<Referral> {
    // Verify referral exists
    const existingReferral = await prisma.referral.findFirst({
      where: {
        id: referralId,
        patientId,
      },
    });

    if (!existingReferral) {
      throw new NotFoundError('Referral', referralId);
    }

    // Verify referring physician exists if provided
    if (data.referringPhysicianId) {
      const physician = await prisma.user.findUnique({
        where: { id: data.referringPhysicianId },
      });

      if (!physician) {
        throw new NotFoundError('Referring Physician', data.referringPhysicianId);
      }
    }

    // Verify referred to provider exists if provided
    if (data.referredToProviderId) {
      const provider = await prisma.user.findUnique({
        where: { id: data.referredToProviderId },
      });

      if (!provider) {
        throw new NotFoundError('Referred To Provider', data.referredToProviderId);
      }
    }

    // Build update data, mapping referredToProvider to referredToProviderName
    const updateData: any = { ...data };
    if (updateData.referredToProvider !== undefined) {
      updateData.referredToProviderName = updateData.referredToProvider;
      delete updateData.referredToProvider;
    }
    if (updateData.attachments !== undefined) {
      updateData.attachments = updateData.attachments;
    }

    const referral = await prisma.referral.update({
      where: { id: referralId },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        referringPhysician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        referredToProvider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return referral as any;
  }

  async deleteReferral(patientId: string, referralId: string): Promise<void> {
    const referral = await prisma.referral.findFirst({
      where: {
        id: referralId,
        patientId,
      },
    });

    if (!referral) {
      throw new NotFoundError('Referral', referralId);
    }

    await prisma.referral.delete({
      where: { id: referralId },
    });
  }
}

