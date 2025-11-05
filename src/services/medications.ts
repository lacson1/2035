import apiClient, { ApiResponse } from './api';
import { Medication } from '../types';

export interface CreateMedicationData {
  name: string;
  status?: 'Active' | 'Discontinued' | 'Historical' | 'Archived';
  startedDate: string;
  instructions?: string;
}

export interface UpdateMedicationData {
  name?: string;
  status?: 'Active' | 'Discontinued' | 'Historical' | 'Archived';
  startedDate?: string;
  instructions?: string;
}

/**
 * Medication API Service
 * Handles all medication-related API calls
 */
export const medicationService = {
  /**
   * Get all medications for a patient
   */
  async getPatientMedications(patientId: string): Promise<ApiResponse<Medication[]>> {
    return apiClient.get<Medication[]>(`/v1/patients/${patientId}/medications`);
  },

  /**
   * Get single medication
   */
  async getMedication(patientId: string, medicationId: string): Promise<ApiResponse<Medication>> {
    return apiClient.get<Medication>(`/v1/patients/${patientId}/medications/${medicationId}`);
  },

  /**
   * Create medication for a patient
   */
  async createMedication(patientId: string, data: CreateMedicationData): Promise<ApiResponse<Medication>> {
    return apiClient.post<Medication>(`/v1/patients/${patientId}/medications`, data);
  },

  /**
   * Update medication
   */
  async updateMedication(patientId: string, medicationId: string, data: UpdateMedicationData): Promise<ApiResponse<Medication>> {
    return apiClient.put<Medication>(`/v1/patients/${patientId}/medications/${medicationId}`, data);
  },

  /**
   * Delete medication
   */
  async deleteMedication(patientId: string, medicationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/patients/${patientId}/medications/${medicationId}`);
  },
};

