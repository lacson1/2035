import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { NutritionEntry, NutritionEntryType } from '@prisma/client';
import { PaginationParams, PaginatedResponse } from '../types';
import { cacheService } from './cache.service';
import { CACHE_TTL } from '../config/constants';

export interface NutritionEntryListParams extends PaginationParams {
  type?: NutritionEntryType;
  search?: string;
}

export interface CreateNutritionEntryData {
  date: string | Date;
  type: NutritionEntryType;
  dietitianId?: string;
  dietaryRestrictions?: string[];
  allergies?: string[];
  currentDiet?: string;
  recommendedDiet?: string;
  nutritionalGoals?: string[];
  caloricNeeds?: number;
  proteinNeeds?: number;
  fluidNeeds?: number;
  supplements?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    reason?: string;
  }>;
  mealPlan?: Array<{
    meal: string;
    description: string;
    calories?: number;
  }>;
  weight?: number;
  height?: number;
  bmi?: number;
  notes?: string;
  followUpDate?: string | Date;
}

export interface UpdateNutritionEntryData extends Partial<CreateNutritionEntryData> {}

export class NutritionService {
  async getPatientNutritionEntries(
    patientId: string,
    params?: NutritionEntryListParams
  ): Promise<PaginatedResponse<NutritionEntry>> {
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
    const cacheKey = `patient:${patientId}:nutrition-entries:${JSON.stringify(params)}:page:${page}:limit:${limit}`;
    const cached = await cacheService.get<PaginatedResponse<NutritionEntry>>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = { patientId };
    
    if (params?.type) {
      where.type = params.type;
    }
    if (params?.search) {
      where.OR = [
        { currentDiet: { contains: params.search, mode: 'insensitive' } },
        { recommendedDiet: { contains: params.search, mode: 'insensitive' } },
        { notes: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (params?.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || 'desc';
    } else {
      orderBy.date = 'desc';
    }

    const [items, total] = await Promise.all([
      prisma.nutritionEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          dietitian: {
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
      prisma.nutritionEntry.count({ where }),
    ]);

    const result: PaginatedResponse<NutritionEntry> = {
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

  async getNutritionEntryById(patientId: string, entryId: string): Promise<NutritionEntry> {
    const entry = await prisma.nutritionEntry.findFirst({
      where: {
        id: entryId,
        patientId,
      },
      include: {
        dietitian: {
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

    if (!entry) {
      throw new NotFoundError('Nutrition Entry', entryId);
    }

    return entry as any;
  }

  async createNutritionEntry(
    patientId: string,
    data: CreateNutritionEntryData,
    dietitianId?: string
  ): Promise<NutritionEntry> {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', patientId);
    }

    if (!data.date || !data.type) {
      throw new ValidationError('Date and type are required');
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

    // Calculate BMI if weight and height are provided
    let bmi: number | undefined;
    if (data.weight && data.height && data.height > 0) {
      bmi = parseFloat((data.weight / ((data.height / 100) ** 2)).toFixed(1));
    } else if (data.bmi) {
      bmi = data.bmi;
    }

    const entry = await prisma.nutritionEntry.create({
      data: {
        patientId,
        date,
        type: data.type,
        dietitianId: data.dietitianId || dietitianId,
        dietaryRestrictions: data.dietaryRestrictions || [],
        allergies: data.allergies || [],
        currentDiet: data.currentDiet,
        recommendedDiet: data.recommendedDiet,
        nutritionalGoals: data.nutritionalGoals || [],
        caloricNeeds: data.caloricNeeds,
        proteinNeeds: data.proteinNeeds,
        fluidNeeds: data.fluidNeeds,
        supplements: data.supplements ? JSON.parse(JSON.stringify(data.supplements)) : null,
        mealPlan: data.mealPlan ? JSON.parse(JSON.stringify(data.mealPlan)) : null,
        weight: data.weight,
        height: data.height,
        bmi,
        notes: data.notes,
        followUpDate,
      },
      include: {
        dietitian: {
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
    await cacheService.deletePattern(`patient:${patientId}:nutrition-entries:*`);

    return entry as any;
  }

  async updateNutritionEntry(
    patientId: string,
    entryId: string,
    data: UpdateNutritionEntryData
  ): Promise<NutritionEntry> {
    const existingEntry = await prisma.nutritionEntry.findFirst({
      where: {
        id: entryId,
        patientId,
      },
    });

    if (!existingEntry) {
      throw new NotFoundError('Nutrition Entry', entryId);
    }

    const updateData: any = { ...data };
    
    if (data.date) {
      updateData.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
    }
    if (data.followUpDate) {
      updateData.followUpDate = typeof data.followUpDate === 'string' ? new Date(data.followUpDate) : data.followUpDate;
    }

    // Recalculate BMI if weight or height changed
    if (data.weight !== undefined || data.height !== undefined) {
      const weight = data.weight !== undefined ? data.weight : existingEntry.weight;
      const height = data.height !== undefined ? data.height : existingEntry.height;
      if (weight && height && height > 0) {
        updateData.bmi = parseFloat((weight / ((height / 100) ** 2)).toFixed(1));
      }
    }

    if (data.supplements) {
      updateData.supplements = JSON.parse(JSON.stringify(data.supplements));
    }
    if (data.mealPlan) {
      updateData.mealPlan = JSON.parse(JSON.stringify(data.mealPlan));
    }

    const entry = await prisma.nutritionEntry.update({
      where: { id: entryId },
      data: updateData,
      include: {
        dietitian: {
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
    await cacheService.deletePattern(`patient:${patientId}:nutrition-entries:*`);

    return entry as any;
  }

  async deleteNutritionEntry(patientId: string, entryId: string): Promise<void> {
    const entry = await prisma.nutritionEntry.findFirst({
      where: {
        id: entryId,
        patientId,
      },
    });

    if (!entry) {
      throw new NotFoundError('Nutrition Entry', entryId);
    }

    await prisma.nutritionEntry.delete({
      where: { id: entryId },
    });

    // Invalidate cache
    await cacheService.deletePattern(`patient:${patientId}:nutrition-entries:*`);
  }
}

export const nutritionService = new NutritionService();

