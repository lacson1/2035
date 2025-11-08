import apiClient, { ApiResponse } from './api';
import { LabResult } from '../types';

export interface CreateLabResultData {
  testName: string;
  testCode?: string;
  category?: string;
  orderedDate: string;
  collectedDate?: string;
  resultDate?: string;
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled' | 'pending_review';
  results?: {
    [key: string]: {
      value: string | number;
      unit?: string;
      flag?: 'normal' | 'high' | 'low' | 'critical';
      referenceRange?: string;
    };
  };
  referenceRanges?: {
    [key: string]: string;
  };
  interpretation?: string;
  notes?: string;
  orderingPhysicianId?: string;
  labName?: string;
  labLocation?: string;
}

export interface UpdateLabResultData extends Partial<CreateLabResultData> {}

/**
 * Lab Results API Service
 * Handles all lab result-related API calls
 */
export const labResultsService = {
  /**
   * Get all lab results for a patient
   */
  async getPatientLabResults(patientId: string): Promise<ApiResponse<LabResult[]>> {
    return await apiClient.get<LabResult[]>(`/v1/patients/${patientId}/lab-results`);
  },

  /**
   * Get single lab result by ID
   */
  async getLabResult(patientId: string, labResultId: string): Promise<ApiResponse<LabResult>> {
    return await apiClient.get<LabResult>(`/v1/patients/${patientId}/lab-results/${labResultId}`);
  },

  /**
   * Create new lab result
   */
  async createLabResult(
    patientId: string,
    data: CreateLabResultData
  ): Promise<ApiResponse<LabResult>> {
    return await apiClient.post<LabResult>(`/v1/patients/${patientId}/lab-results`, data);
  },

  /**
   * Update lab result
   */
  async updateLabResult(
    patientId: string,
    labResultId: string,
    data: UpdateLabResultData
  ): Promise<ApiResponse<LabResult>> {
    return await apiClient.put<LabResult>(`/v1/patients/${patientId}/lab-results/${labResultId}`, data);
  },

  /**
   * Delete lab result
   */
  async deleteLabResult(patientId: string, labResultId: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/v1/patients/${patientId}/lab-results/${labResultId}`);
  },
};

