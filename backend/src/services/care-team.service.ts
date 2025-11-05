import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { CareTeamAssignment } from '@prisma/client';

export class CareTeamService {
  async getPatientCareTeam(patientId: string): Promise<CareTeamAssignment[]> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    const assignments = await prisma.careTeamAssignment.findMany({
      where: {
        patientId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            specialty: true,
            department: true,
            role: true,
          },
        },
      },
      orderBy: { assignedDate: 'desc' },
    });

    return assignments as any;
  }

  async getCareTeamMember(patientId: string, memberId: string): Promise<CareTeamAssignment> {
    const assignment = await prisma.careTeamAssignment.findFirst({
      where: {
        id: memberId,
        patientId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            specialty: true,
            department: true,
            role: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundError('Care team member', memberId);
    }

    return assignment as any;
  }

  async addCareTeamMember(
    patientId: string,
    data: {
      userId: string;
      role: string;
      specialty?: string;
      notes?: string;
    }
  ): Promise<CareTeamAssignment> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundError('User', data.userId);
    }

    if (!data.userId || !data.role) {
      throw new ValidationError('User ID and role are required');
    }

    // Check if assignment already exists
    const existing = await prisma.careTeamAssignment.findUnique({
      where: {
        patientId_userId: {
          patientId,
          userId: data.userId,
        },
      },
    });

    if (existing) {
      // Reactivate if inactive
      if (!existing.isActive) {
        const assignment = await prisma.careTeamAssignment.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            role: data.role,
            specialty: data.specialty,
            notes: data.notes,
            assignedDate: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                specialty: true,
                department: true,
                role: true,
              },
            },
          },
        });

        return assignment as any;
      } else {
        throw new ValidationError('User is already a member of the care team');
      }
    }

    const assignment = await prisma.careTeamAssignment.create({
      data: {
        patientId,
        userId: data.userId,
        role: data.role,
        specialty: data.specialty,
        notes: data.notes,
        assignedDate: new Date(),
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            specialty: true,
            department: true,
            role: true,
          },
        },
      },
    });

    return assignment as any;
  }

  async updateCareTeamMember(
    patientId: string,
    memberId: string,
    data: Partial<{
      role: string;
      specialty: string;
      notes: string;
      isActive: boolean;
    }>
  ): Promise<CareTeamAssignment> {
    // Verify member exists
    await this.getCareTeamMember(patientId, memberId);

    const assignment = await prisma.careTeamAssignment.update({
      where: { id: memberId },
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            specialty: true,
            department: true,
            role: true,
          },
        },
      },
    });

    return assignment as any;
  }

  async removeCareTeamMember(patientId: string, memberId: string): Promise<void> {
    // Instead of deleting, mark as inactive
    await this.getCareTeamMember(patientId, memberId);

    await prisma.careTeamAssignment.update({
      where: { id: memberId },
      data: { isActive: false },
    });
  }
}

export const careTeamService = new CareTeamService();

