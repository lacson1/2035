import apiClient, { ApiResponse } from './api';
import { Patient } from '../types';
import { validatePatient, validatePatients, validatePartialPatient } from '../utils/validation';

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  risk?: 'low' | 'medium' | 'high';
  condition?: string;
  sortBy?: 'name' | 'risk' | 'recent';
}

export interface PatientListResponse {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Patient API Service
 * Handles all patient-related API calls
 */
export const patientService = {
  /**
   * Get list of patients with filters and pagination
   */
  async getPatients(params?: PatientListParams): Promise<ApiResponse<PatientListResponse>> {
    const response = await apiClient.get<PatientListResponse>('/v1/patients', params as Record<string, string>);
    
    // Validate response data
    if (response.data.patients) {
      response.data.patients = validatePatients(response.data.patients);
    }
    
    return response;
  },

  /**
   * Get single patient by ID
   */
  async getPatient(id: string): Promise<ApiResponse<Patient>> {
    const response = await apiClient.get<Patient>(`/v1/patients/${id}`);
    
    // Validate patient data
    const validated = validatePatient(response.data);
    if (!validated) {
      throw new Error('Invalid patient data received from API');
    }
    response.data = validated;
    
    return response;
  },

  /**
   * Create new patient
   */
  async createPatient(patient: Partial<Patient>): Promise<ApiResponse<Patient>> {
    // Validate input before sending
    const validated = validatePartialPatient(patient);
    if (!validated) {
      throw new Error('Invalid patient data provided');
    }

    const response = await apiClient.post<Patient>('/v1/patients', validated);
    
    // Validate response
    const responseValidated = validatePatient(response.data);
    if (!responseValidated) {
      throw new Error('Invalid response data received from API');
    }
    response.data = responseValidated;
    
    return response;
  },

  /**
   * Update patient
   */
  async updatePatient(id: string, patient: Partial<Patient>): Promise<ApiResponse<Patient>> {
    // Validate input
    const validated = validatePartialPatient(patient);
    if (!validated) {
      throw new Error('Invalid patient data provided');
    }

    const response = await apiClient.put<Patient>(`/v1/patients/${id}`, validated);
    
    // Validate response
    const responseValidated = validatePatient(response.data);
    if (!responseValidated) {
      throw new Error('Invalid response data received from API');
    }
    response.data = responseValidated;
    
    return response;
  },

  /**
   * Delete patient
   */
  async deletePatient(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/patients/${id}`);
  },

  /**
   * Search patients
   */
  async searchPatients(query: string): Promise<ApiResponse<Patient[]>> {
    const response = await apiClient.get<Patient[]>('/v1/patients/search', { q: query });
    
    // Validate response data
    if (response.data) {
      response.data = validatePatients(response.data);
    }
    
    return response;
  },
};

