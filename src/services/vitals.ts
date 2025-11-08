import apiClient, { ApiResponse } from './api';

export interface Vital {
  id: string;
  patientId: string;
  date: string;
  time?: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygen?: number;
  notes?: string;
  recordedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVitalData {
  date: string;
  time?: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygen?: number;
  notes?: string;
}

export interface UpdateVitalData extends Partial<CreateVitalData> {}

/**
 * Vitals API Service
 * Handles all vital signs-related API calls
 */
export const vitalsService = {
  /**
   * Get all vitals for a patient
   */
  async getPatientVitals(patientId: string): Promise<ApiResponse<Vital[]>> {
    return apiClient.get<Vital[]>(`/v1/patients/${patientId}/vitals`);
  },

  /**
   * Get single vital by ID
   */
  async getVital(patientId: string, vitalId: string): Promise<ApiResponse<Vital>> {
    return apiClient.get<Vital>(`/v1/patients/${patientId}/vitals/${vitalId}`);
  },

  /**
   * Create new vital reading
   */
  async createVital(patientId: string, data: CreateVitalData): Promise<ApiResponse<Vital>> {
    return apiClient.post<Vital>(`/v1/patients/${patientId}/vitals`, data);
  },

  /**
   * Update vital reading
   */
  async updateVital(patientId: string, vitalId: string, data: UpdateVitalData): Promise<ApiResponse<Vital>> {
    return apiClient.put<Vital>(`/v1/patients/${patientId}/vitals/${vitalId}`, data);
  },

  /**
   * Delete vital reading
   */
  async deleteVital(patientId: string, vitalId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/patients/${patientId}/vitals/${vitalId}`);
  },
};

