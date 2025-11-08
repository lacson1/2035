import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Consent, ConsentType, ConsentStatus } from '@prisma/client';
import { PaginationParams, PaginatedResponse } from '../types';
import { cacheService } from './cache.service';
import { CACHE_TTL } from '../config/constants';

export interface ConsentListParams extends PaginationParams {
  status?: ConsentStatus;
  type?: ConsentType;
  search?: string;
}

export interface CreateConsentData {
  date: string | Date;
  type: ConsentType;
  title: string;
  description: string;
  status?: ConsentStatus;
  procedureName?: string;
  risks?: string[];
  benefits?: string[];
  alternatives?: string[];
  signedBy?: string;
  signedById?: string;
  witnessName?: string;
  witnessId?: string;
  physicianName?: string;
  physicianId?: string;
  signedDate?: string | Date;
  signedTime?: string;
  expirationDate?: string | Date;
  notes?: string;
  digitalSignature?: string;
  printedSignature?: boolean;
}

export interface UpdateConsentData extends Partial<CreateConsentData> {}

export class ConsentsService {
  async getPatientConsents(
    patientId: string,
    params?: ConsentListParams
  ): Promise<PaginatedResponse<Consent>> {
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
    const cacheKey = `patient:${patientId}:consents:${JSON.stringify(params)}:page:${page}:limit:${limit}`;
    const cached = await cacheService.get<PaginatedResponse<Consent>>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = { patientId };
    
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.type) {
      where.type = params.type;
    }
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { procedureName: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (params?.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || 'desc';
    } else {
      orderBy.date = 'desc';
    }

    const [items, total] = await Promise.all([
      prisma.consent.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          physician: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          witness: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          signer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.consent.count({ where }),
    ]);

    const result: PaginatedResponse<Consent> = {
      items: items as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, CACHE_TTL.PATIENT_LIST);

    return result;
  }

  async getConsentById(patientId: string, consentId: string): Promise<Consent> {
    const consent = await prisma.consent.findFirst({
      where: {
        id: consentId,
        patientId,
      },
      include: {
        physician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        witness: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        signer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!consent) {
      throw new NotFoundError('Consent', consentId);
    }

    return consent as any;
  }

  async createConsent(
    patientId: string,
    data: CreateConsentData,
    physicianId?: string
  ): Promise<Consent> {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    if (!data.date || !data.type || !data.title || !data.description) {
      throw new ValidationError('Date, type, title, and description are required');
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

    let signedDate: Date | undefined;
    if (data.signedDate) {
      if (typeof data.signedDate === 'string') {
        signedDate = new Date(data.signedDate);
        if (isNaN(signedDate.getTime())) {
          throw new ValidationError(`Invalid signed date format: ${data.signedDate}`);
        }
      } else {
        signedDate = data.signedDate;
      }
    }

    let expirationDate: Date | undefined;
    if (data.expirationDate) {
      if (typeof data.expirationDate === 'string') {
        expirationDate = new Date(data.expirationDate);
        if (isNaN(expirationDate.getTime())) {
          throw new ValidationError(`Invalid expiration date format: ${data.expirationDate}`);
        }
      } else {
        expirationDate = data.expirationDate;
      }
    }

    const consent = await prisma.consent.create({
      data: {
        patientId,
        date,
        type: data.type,
        title: data.title,
        description: data.description,
        status: data.status || 'pending',
        procedureName: data.procedureName,
        risks: data.risks || [],
        benefits: data.benefits || [],
        alternatives: data.alternatives || [],
        signedBy: data.signedBy,
        signedById: data.signedById,
        witnessName: data.witnessName,
        witnessId: data.witnessId,
        physicianName: data.physicianName,
        physicianId: data.physicianId || physicianId,
        signedDate,
        signedTime: data.signedTime,
        expirationDate,
        notes: data.notes,
        digitalSignature: data.digitalSignature,
        printedSignature: data.printedSignature || false,
      },
      include: {
        physician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        witness: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        signer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Invalidate cache
    await cacheService.deletePattern(`patient:${patientId}:consents:*`);

    return consent as any;
  }

  async updateConsent(
    patientId: string,
    consentId: string,
    data: UpdateConsentData
  ): Promise<Consent> {
    const existingConsent = await prisma.consent.findFirst({
      where: {
        id: consentId,
        patientId,
      },
    });

    if (!existingConsent) {
      throw new NotFoundError('Consent', consentId);
    }

    const updateData: any = { ...data };
    
    if (data.date) {
      updateData.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
    }
    if (data.signedDate) {
      updateData.signedDate = typeof data.signedDate === 'string' ? new Date(data.signedDate) : data.signedDate;
    }
    if (data.expirationDate) {
      updateData.expirationDate = typeof data.expirationDate === 'string' ? new Date(data.expirationDate) : data.expirationDate;
    }

    const consent = await prisma.consent.update({
      where: { id: consentId },
      data: updateData,
      include: {
        physician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        witness: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        signer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Invalidate cache
    await cacheService.deletePattern(`patient:${patientId}:consents:*`);

    return consent as any;
  }

  async deleteConsent(patientId: string, consentId: string): Promise<void> {
    const consent = await prisma.consent.findFirst({
      where: {
        id: consentId,
        patientId,
      },
    });

    if (!consent) {
      throw new NotFoundError('Consent', consentId);
    }

    await prisma.consent.delete({
      where: { id: consentId },
    });

    // Invalidate cache
    await cacheService.deletePattern(`patient:${patientId}:consents:*`);
  }
}

export const consentsService = new ConsentsService();

