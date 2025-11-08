import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Vaccination, VaccinationRoute } from '@prisma/client';
import { PaginationParams, PaginatedResponse } from '../types';
import { cacheService } from './cache.service';
import { CACHE_TTL } from '../config/constants';

export interface VaccinationListParams extends PaginationParams {
  verified?: boolean;
  search?: string;
}

export interface CreateVaccinationData {
  vaccineName: string;
  vaccineCode?: string;
  date: string | Date;
  administeredById?: string;
  location?: string;
  route?: VaccinationRoute;
  site?: string;
  lotNumber?: string;
  manufacturer?: string;
  expirationDate?: string | Date;
  doseNumber?: number;
  totalDoses?: number;
  nextDoseDate?: string | Date;
  adverseReactions?: string[];
  notes?: string;
  verified?: boolean;
  verifiedBy?: string;
  verifiedById?: string;
  verifiedDate?: string | Date;
}

export interface UpdateVaccinationData extends Partial<CreateVaccinationData> {}

export class VaccinationsService {
  async getPatientVaccinations(
    patientId: string,
    params?: VaccinationListParams
  ): Promise<PaginatedResponse<Vaccination>> {
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
    const cacheKey = `patient:${patientId}:vaccinations:${JSON.stringify(params)}:page:${page}:limit:${limit}`;
    const cached = await cacheService.get<PaginatedResponse<Vaccination>>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = { patientId };
    
    if (params?.verified !== undefined) {
      where.verified = params.verified;
    }
    if (params?.search) {
      where.OR = [
        { vaccineName: { contains: params.search, mode: 'insensitive' } },
        { vaccineCode: { contains: params.search, mode: 'insensitive' } },
        { manufacturer: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (params?.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || 'desc';
    } else {
      orderBy.date = 'desc';
    }

    const [items, total] = await Promise.all([
      prisma.vaccination.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          administeredBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          verifiedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.vaccination.count({ where }),
    ]);

    const result: PaginatedResponse<Vaccination> = {
      items: items as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache for 15 minutes (vaccinations change less frequently)
    await cacheService.set(cacheKey, result, CACHE_TTL.PATIENT_DETAIL);

    return result;
  }

  async getVaccinationById(patientId: string, vaccinationId: string): Promise<Vaccination> {
    const vaccination = await prisma.vaccination.findFirst({
      where: {
        id: vaccinationId,
        patientId,
      },
      include: {
        administeredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        verifiedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!vaccination) {
      throw new NotFoundError('Vaccination', vaccinationId);
    }

    return vaccination as any;
  }

  async createVaccination(
    patientId: string,
    data: CreateVaccinationData,
    administeredById?: string
  ): Promise<Vaccination> {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    if (!data.vaccineName || !data.date) {
      throw new ValidationError('Vaccine name and date are required');
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

    let nextDoseDate: Date | undefined;
    if (data.nextDoseDate) {
      if (typeof data.nextDoseDate === 'string') {
        nextDoseDate = new Date(data.nextDoseDate);
        if (isNaN(nextDoseDate.getTime())) {
          throw new ValidationError(`Invalid next dose date format: ${data.nextDoseDate}`);
        }
      } else {
        nextDoseDate = data.nextDoseDate;
      }
    }

    let verifiedDate: Date | undefined;
    if (data.verifiedDate) {
      if (typeof data.verifiedDate === 'string') {
        verifiedDate = new Date(data.verifiedDate);
        if (isNaN(verifiedDate.getTime())) {
          throw new ValidationError(`Invalid verified date format: ${data.verifiedDate}`);
        }
      } else {
        verifiedDate = data.verifiedDate;
      }
    }

    const vaccination = await prisma.vaccination.create({
      data: {
        patientId,
        vaccineName: data.vaccineName,
        vaccineCode: data.vaccineCode,
        date,
        administeredById: data.administeredById || administeredById,
        location: data.location,
        route: data.route,
        site: data.site,
        lotNumber: data.lotNumber,
        manufacturer: data.manufacturer,
        expirationDate,
        doseNumber: data.doseNumber,
        totalDoses: data.totalDoses,
        nextDoseDate,
        adverseReactions: data.adverseReactions || [],
        notes: data.notes,
        verified: data.verified || false,
        verifiedBy: data.verifiedBy,
        verifiedById: data.verifiedById,
        verifiedDate,
      },
      include: {
        administeredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        verifiedByUser: {
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
    await cacheService.deletePattern(`patient:${patientId}:vaccinations:*`);

    return vaccination as any;
  }

  async updateVaccination(
    patientId: string,
    vaccinationId: string,
    data: UpdateVaccinationData
  ): Promise<Vaccination> {
    const existingVaccination = await prisma.vaccination.findFirst({
      where: {
        id: vaccinationId,
        patientId,
      },
    });

    if (!existingVaccination) {
      throw new NotFoundError('Vaccination', vaccinationId);
    }

    const updateData: any = { ...data };
    
    if (data.date) {
      updateData.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
    }
    if (data.expirationDate) {
      updateData.expirationDate = typeof data.expirationDate === 'string' ? new Date(data.expirationDate) : data.expirationDate;
    }
    if (data.nextDoseDate) {
      updateData.nextDoseDate = typeof data.nextDoseDate === 'string' ? new Date(data.nextDoseDate) : data.nextDoseDate;
    }
    if (data.verifiedDate) {
      updateData.verifiedDate = typeof data.verifiedDate === 'string' ? new Date(data.verifiedDate) : data.verifiedDate;
    }

    const vaccination = await prisma.vaccination.update({
      where: { id: vaccinationId },
      data: updateData,
      include: {
        administeredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        verifiedByUser: {
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
    await cacheService.deletePattern(`patient:${patientId}:vaccinations:*`);

    return vaccination as any;
  }

  async deleteVaccination(patientId: string, vaccinationId: string): Promise<void> {
    const vaccination = await prisma.vaccination.findFirst({
      where: {
        id: vaccinationId,
        patientId,
      },
    });

    if (!vaccination) {
      throw new NotFoundError('Vaccination', vaccinationId);
    }

    await prisma.vaccination.delete({
      where: { id: vaccinationId },
    });
  }
}

export const vaccinationsService = new VaccinationsService();

