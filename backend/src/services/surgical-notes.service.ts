import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { SurgicalNote, SurgicalProcedureType, SurgicalStatus } from '@prisma/client';
import { PaginationParams, PaginatedResponse } from '../types';
import { cacheService } from './cache.service';
import { CACHE_TTL } from '../config/constants';

export interface SurgicalNoteListParams extends PaginationParams {
  status?: SurgicalStatus;
  procedureType?: SurgicalProcedureType;
  search?: string;
}

export interface CreateSurgicalNoteData {
  date: string | Date;
  procedureName: string;
  procedureType: SurgicalProcedureType;
  status?: SurgicalStatus;
  surgeonId?: string;
  assistantSurgeons?: string[];
  anesthesiologistId?: string;
  anesthesiaType?: string;
  indication: string;
  preoperativeDiagnosis: string;
  postoperativeDiagnosis?: string;
  procedureDescription: string;
  findings?: string;
  complications?: string;
  estimatedBloodLoss?: string;
  specimens?: string[];
  drains?: string;
  postOpInstructions?: string;
  recoveryNotes?: string;
  followUpDate?: string | Date;
  operatingRoom?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
}

export interface UpdateSurgicalNoteData extends Partial<CreateSurgicalNoteData> { }

export class SurgicalNotesService {
  async getPatientSurgicalNotes(
    patientId: string,
    params?: SurgicalNoteListParams
  ): Promise<PaginatedResponse<SurgicalNote>> {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    const page = params?.page || 1;
    const limit = Math.min(params?.limit || 50, 100);
    const skip = (page - 1) * limit;

    // Create cache key
    const cacheKey = `patient:${patientId}:surgical-notes:${JSON.stringify(params)}:page:${page}:limit:${limit}`;
    const cached = await cacheService.get<PaginatedResponse<SurgicalNote>>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = { patientId };

    if (params?.status) {
      where.status = params.status;
    }
    if (params?.procedureType) {
      where.procedureType = params.procedureType;
    }
    if (params?.search) {
      where.OR = [
        { procedureName: { contains: params.search, mode: 'insensitive' } },
        { indication: { contains: params.search, mode: 'insensitive' } },
        { preoperativeDiagnosis: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (params?.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || 'desc';
    } else {
      orderBy.date = 'desc';
    }

    const [items, total] = await Promise.all([
      prisma.surgicalNote.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          surgeon: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              specialty: true,
            },
          },
          anesthesiologist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              specialty: true,
            },
          },
        },
      }),
      prisma.surgicalNote.count({ where }),
    ]);

    const result: PaginatedResponse<SurgicalNote> = {
      items: items as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache for 10 minutes
    await cacheService.set(cacheKey, result, CACHE_TTL.PATIENT_DETAIL);

    return result;
  }

  async getSurgicalNoteById(patientId: string, noteId: string): Promise<SurgicalNote> {
    const note = await prisma.surgicalNote.findFirst({
      where: {
        id: noteId,
        patientId,
      },
      include: {
        surgeon: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            specialty: true,
          },
        },
        anesthesiologist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            specialty: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundError('Surgical Note', noteId);
    }

    return note as any;
  }

  async createSurgicalNote(
    patientId: string,
    data: CreateSurgicalNoteData,
    surgeonId?: string
  ): Promise<SurgicalNote> {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    if (!data.date || !data.procedureName || !data.procedureType || !data.indication || !data.preoperativeDiagnosis || !data.procedureDescription) {
      throw new ValidationError('Date, procedure name, type, indication, preoperative diagnosis, and procedure description are required');
    }

    let date: Date;
    if (typeof data.date === 'string') {
      if (data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = data.date.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(data.date);
      }
      if (isNaN(date.getTime())) {
        throw new ValidationError(`Invalid date format: ${data.date}`);
      }
    } else {
      date = data.date;
    }

    let followUpDate: Date | undefined;
    if (data.followUpDate) {
      if (typeof data.followUpDate === 'string') {
        followUpDate = new Date(data.followUpDate);
        if (isNaN(followUpDate.getTime())) {
          throw new ValidationError(`Invalid follow-up date format: ${data.followUpDate}`);
        }
      } else {
        followUpDate = data.followUpDate;
      }
    }

    const surgicalNote = await prisma.surgicalNote.create({
      data: {
        patientId,
        date,
        procedureName: data.procedureName,
        procedureType: data.procedureType,
        status: data.status || 'scheduled',
        surgeonId: data.surgeonId || surgeonId,
        assistantSurgeons: data.assistantSurgeons || [],
        anesthesiologistId: data.anesthesiologistId,
        anesthesiaType: data.anesthesiaType,
        indication: data.indication,
        preoperativeDiagnosis: data.preoperativeDiagnosis,
        postoperativeDiagnosis: data.postoperativeDiagnosis,
        procedureDescription: data.procedureDescription,
        findings: data.findings,
        complications: data.complications,
        estimatedBloodLoss: data.estimatedBloodLoss,
        specimens: data.specimens || [],
        drains: data.drains,
        postOpInstructions: data.postOpInstructions,
        recoveryNotes: data.recoveryNotes,
        followUpDate,
        operatingRoom: data.operatingRoom,
        duration: data.duration,
        startTime: data.startTime,
        endTime: data.endTime,
      },
      include: {
        surgeon: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            specialty: true,
          },
        },
        anesthesiologist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            specialty: true,
          },
        },
      },
    });

    // Invalidate cache
    await cacheService.deletePattern(`patient:${patientId}:surgical-notes:*`);

    return surgicalNote as any;
  }

  async updateSurgicalNote(
    patientId: string,
    noteId: string,
    data: UpdateSurgicalNoteData
  ): Promise<SurgicalNote> {
    const existingNote = await prisma.surgicalNote.findFirst({
      where: {
        id: noteId,
        patientId,
      },
    });

    if (!existingNote) {
      throw new NotFoundError('Surgical Note', noteId);
    }

    const updateData: any = { ...data };

    if (data.date) {
      updateData.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
    }
    if (data.followUpDate) {
      updateData.followUpDate = typeof data.followUpDate === 'string' ? new Date(data.followUpDate) : data.followUpDate;
    }

    const surgicalNote = await prisma.surgicalNote.update({
      where: { id: noteId },
      data: updateData,
      include: {
        surgeon: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            specialty: true,
          },
        },
        anesthesiologist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            specialty: true,
          },
        },
      },
    });

    // Invalidate cache
    await cacheService.deletePattern(`patient:${patientId}:surgical-notes:*`);

    return surgicalNote as any;
  }

  async deleteSurgicalNote(patientId: string, noteId: string): Promise<void> {
    const note = await prisma.surgicalNote.findFirst({
      where: {
        id: noteId,
        patientId,
      },
    });

    if (!note) {
      throw new NotFoundError('Surgical Note', noteId);
    }

    await prisma.surgicalNote.delete({
      where: { id: noteId },
    });

    // Invalidate cache
    await cacheService.deletePattern(`patient:${patientId}:surgical-notes:*`);
  }
}

export const surgicalNotesService = new SurgicalNotesService();

