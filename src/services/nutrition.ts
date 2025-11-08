import apiClient, { ApiResponse } from './api';
import { NutritionEntry } from '../types';

export interface CreateNutritionEntryData {
  date: string;
  type: NutritionEntry['type'];
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
  followUpDate?: string;
}

export interface UpdateNutritionEntryData extends Partial<CreateNutritionEntryData> {}

/**
 * Nutrition API Service
 * Handles all nutrition entry-related API calls
 */
export const nutritionService = {
  /**
   * Get all nutrition entries for a patient
   */
  async getPatientNutritionEntries(patientId: string): Promise<ApiResponse<NutritionEntry[]>> {
    return apiClient.get<NutritionEntry[]>(`/v1/patients/${patientId}/nutrition`);
  },

  /**
   * Get single nutrition entry by ID
   */
  async getNutritionEntry(patientId: string, entryId: string): Promise<ApiResponse<NutritionEntry>> {
    return apiClient.get<NutritionEntry>(`/v1/patients/${patientId}/nutrition/${entryId}`);
  },

  /**
   * Create new nutrition entry
   */
  async createNutritionEntry(patientId: string, data: CreateNutritionEntryData): Promise<ApiResponse<NutritionEntry>> {
    return apiClient.post<NutritionEntry>(`/v1/patients/${patientId}/nutrition`, data);
  },

  /**
   * Update nutrition entry
   */
  async updateNutritionEntry(patientId: string, entryId: string, data: UpdateNutritionEntryData): Promise<ApiResponse<NutritionEntry>> {
    return apiClient.put<NutritionEntry>(`/v1/patients/${patientId}/nutrition/${entryId}`, data);
  },

  /**
   * Delete nutrition entry
   */
  async deleteNutritionEntry(patientId: string, entryId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/patients/${patientId}/nutrition/${entryId}`);
  },
};

