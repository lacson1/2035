import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { PaginationParams, PaginatedResponse } from '../types';
import { Patient, Medication, Appointment, ClinicalNote, ImagingStudy } from '@prisma/client';
import { cacheService } from './cache.service';
import { CACHE_TTL } from '../config/constants';

export interface PatientListParams extends PaginationParams {
  search?: string;
  risk?: 'low' | 'medium' | 'high';
  condition?: string;
}

export interface PatientWithRelations extends Patient {
  medications: Medication[];
  appointments: Appointment[];
  clinicalNotes: ClinicalNote[];
  imagingStudies: ImagingStudy[];
}

/**
 * Remove duplicate allergies (case-insensitive)
 * Preserves the original case of the first occurrence
 */
function deduplicateAllergies(allergies: string[] | undefined | null): string[] | undefined {
  if (!allergies || !Array.isArray(allergies) || allergies.length === 0) {
    return undefined;
  }

  const allergyMap = new Map<string, string>();
  allergies.forEach((allergy) => {
    const trimmed = allergy.trim();
    if (trimmed.length > 0) {
      const lowerKey = trimmed.toLowerCase();
      // Keep first occurrence, preserving original case
      if (!allergyMap.has(lowerKey)) {
        allergyMap.set(lowerKey, trimmed);
      }
    }
  });

  const deduplicated = Array.from(allergyMap.values());
  return deduplicated.length > 0 ? deduplicated : undefined;
}

export class PatientsService {
  async getPatients(params: PatientListParams = {}): Promise<PaginatedResponse<Patient>> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Create cache key from params
    const cacheKey = `patients:${JSON.stringify(params)}:page:${page}:limit:${limit}`;

    // Try to get from cache
    const cached = await cacheService.get<PaginatedResponse<Patient>>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = {};

    // Search filter
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    // Risk filter
    if (params.risk) {
      if (params.risk === 'low') {
        where.riskScore = { lte: 33 };
      } else if (params.risk === 'medium') {
        where.riskScore = { gt: 33, lte: 66 };
      } else if (params.risk === 'high') {
        where.riskScore = { gt: 66 };
      }
    }

    // Condition filter
    if (params.condition) {
      where.condition = { contains: params.condition, mode: 'insensitive' };
    }

    // Sort
    const orderBy: any = {};
    if (params.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.patient.count({ where }),
    ]);

    const result = {
      items: patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache for 5 minutes (patient lists change frequently)
    await cacheService.set(cacheKey, result, CACHE_TTL.PATIENT_LIST);

    return result;
  }

  async getPatientById(id: string): Promise<PatientWithRelations> {
    // Try cache first
    const cacheKey = `patient:${id}`;
    const cached = await cacheService.get<PatientWithRelations>(cacheKey);
    if (cached) {
      return cached;
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        medications: true,
        appointments: {
          orderBy: { date: 'desc' },
        },
        clinicalNotes: {
          orderBy: { date: 'desc' },
        },
        imagingStudies: {
          orderBy: { date: 'desc' },
        },
        // Temporarily commented out until Prisma Client is regenerated
        // referrals: {
        //   orderBy: { date: 'desc' },
        //   include: {
        //     referringPhysician: {
        //       select: {
        //         id: true,
        //         firstName: true,
        //         lastName: true,
        //         specialty: true,
        //       },
        //     },
        //     referredToProvider: {
        //       select: {
        //         id: true,
        //         firstName: true,
        //         lastName: true,
        //         specialty: true,
        //       },
        //     },
        //   },
        // },
        timelineEvents: {
          orderBy: { date: 'desc' },
          take: 50,
        },
        careTeamMembers: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                specialty: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundError('Patient', id);
    }

    const result = patient as any;

    // Cache for 10 minutes (individual patient data changes less frequently)
    await cacheService.set(cacheKey, result, CACHE_TTL.PATIENT_DETAIL);

    return result;
  }

  async createPatient(data: any, userId: string): Promise<Patient> {
    // Validate required fields
    if (!data.name || !data.dateOfBirth || !data.gender) {
      throw new ValidationError('Name, date of birth, and gender are required');
    }

    // Remove duplicate allergies
    if (data.allergies) {
      data.allergies = deduplicateAllergies(data.allergies);
    }

    const patient = await prisma.patient.create({
      data: {
        ...data,
        createdById: userId,
        updatedById: userId,
      },
    });

    // Invalidate patient list cache
    await cacheService.deletePattern('patients:*');

    return patient;
  }

  async updatePatient(id: string, data: any, userId: string): Promise<Patient> {
    // Check if patient exists
    await this.getPatientById(id);

    // Remove duplicate allergies if they're being updated
    if (data.allergies !== undefined) {
      data.allergies = deduplicateAllergies(data.allergies);
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...data,
        updatedById: userId,
      },
    });

    // Invalidate caches
    await cacheService.invalidatePatientCache(id);
    await cacheService.deletePattern('patients:*');

    return patient;
  }

  async deletePatient(id: string): Promise<void> {
    await this.getPatientById(id);

    await prisma.patient.delete({
      where: { id },
    });

    // Invalidate caches
    await cacheService.invalidatePatientCache(id);
    await cacheService.deletePattern('patients:*');
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return patients;
  }
}

export const patientsService = new PatientsService();

