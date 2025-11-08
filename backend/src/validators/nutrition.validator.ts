import { z } from 'zod';
import { NutritionEntryType } from '@prisma/client';

const supplementSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  reason: z.string().optional(),
});

const mealPlanSchema = z.object({
  meal: z.string().min(1),
  description: z.string().min(1),
  calories: z.number().positive().optional(),
});

export const createNutritionEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  type: z.nativeEnum(NutritionEntryType),
  dietitianId: z.string().uuid().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  currentDiet: z.string().optional(),
  recommendedDiet: z.string().optional(),
  nutritionalGoals: z.array(z.string()).optional(),
  caloricNeeds: z.number().positive().optional(),
  proteinNeeds: z.number().positive().optional(),
  fluidNeeds: z.number().positive().optional(),
  supplements: z.array(supplementSchema).optional(),
  mealPlan: z.array(mealPlanSchema).optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  bmi: z.number().positive().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const updateNutritionEntrySchema = createNutritionEntrySchema.partial();

