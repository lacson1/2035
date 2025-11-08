import apiClient, { ApiResponse } from './api';
import { Vaccination } from '../types';

export interface CreateVaccinationData {
  vaccineName: string;
  vaccineCode?: string;
  date: string;
  administeredById?: string;
  location?: string;
  route?: Vaccination['route'];
  site?: string;
  lotNumber?: string;
  manufacturer?: string;
  expirationDate?: string;
  doseNumber?: number;
  totalDoses?: number;
  nextDoseDate?: string;
  adverseReactions?: string[];
  notes?: string;
  verified?: boolean;
  verifiedBy?: string;
  verifiedById?: string;
  verifiedDate?: string;
}

export interface UpdateVaccinationData extends Partial<CreateVaccinationData> {}

/**
 * Vaccinations API Service
 * Handles all vaccination-related API calls
 */
export const vaccinationsService = {
  /**
   * Get all vaccinations for a patient
   */
  async getPatientVaccinations(patientId: string): Promise<ApiResponse<Vaccination[]>> {
    return apiClient.get<Vaccination[]>(`/v1/patients/${patientId}/vaccinations`);
  },

  /**
   * Get single vaccination by ID
   */
  async getVaccination(patientId: string, vaccinationId: string): Promise<ApiResponse<Vaccination>> {
    return apiClient.get<Vaccination>(`/v1/patients/${patientId}/vaccinations/${vaccinationId}`);
  },

  /**
   * Create new vaccination
   */
  async createVaccination(patientId: string, data: CreateVaccinationData): Promise<ApiResponse<Vaccination>> {
    return apiClient.post<Vaccination>(`/v1/patients/${patientId}/vaccinations`, data);
  },

  /**
   * Update vaccination
   */
  async updateVaccination(patientId: string, vaccinationId: string, data: UpdateVaccinationData): Promise<ApiResponse<Vaccination>> {
    return apiClient.put<Vaccination>(`/v1/patients/${patientId}/vaccinations/${vaccinationId}`, data);
  },

  /**
   * Delete vaccination
   */
  async deleteVaccination(patientId: string, vaccinationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/patients/${patientId}/vaccinations/${vaccinationId}`);
  },
};

