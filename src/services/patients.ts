import apiClient, { ApiResponse } from './api';
import { Patient } from '../types';
import { validatePatient, validatePartialPatient } from '../utils/validation';

const isBackendPatient = (patient: unknown): patient is Record<string, unknown> =>
  typeof patient === 'object' && patient !== null && 'dateOfBirth' in patient;

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
const mapPatientPayloadForApi = (patient: Partial<Patient>): Record<string, unknown> => {
  const payload: Record<string, unknown> = { ...patient };

  if ('dob' in payload) {
    payload.dateOfBirth = payload.dob;
    delete payload.dob;
  }

  if ('bp' in payload) {
    payload.bloodPressure = payload.bp;
    delete payload.bp;
  }

  if ('risk' in payload) {
    payload.riskScore = payload.risk;
    delete payload.risk;
  }

  // Remove derived-only fields that the backend manages itself
  delete payload.age;

  return payload;
};

export const patientService = {
  /**
   * Get list of patients with filters and pagination
   */
  async getPatients(params?: PatientListParams): Promise<ApiResponse<PatientListResponse>> {
    const queryParams = params
      ? Object.fromEntries(
          Object.entries(params).map(([key, value]) => [key, value?.toString() ?? ''])
        )
      : undefined;

    const response = await apiClient.get<PatientListResponse>('/v1/patients', queryParams);
    
    // Validate response data
    if (response.data.patients) {
      response.data.patients = response.data.patients.map((patient) => {
        if (isBackendPatient(patient)) {
          const validated = validatePatient(patient);
          return (validated ?? patient) as Patient;
        }

        return patient as Patient;
      });
    }
    
    return response;
  },

  /**
   * Get single patient by ID
   */
  async getPatient(id: string): Promise<ApiResponse<Patient>> {
    const response = await apiClient.get<Patient>(`/v1/patients/${id}`);
    
    // Validate patient data
    if (isBackendPatient(response.data)) {
      const validated = validatePatient(response.data);
      if (!validated) {
        throw new Error('Invalid patient data received from API');
      }
      response.data = validated;
    }

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

    const response = await apiClient.post<Patient>(
      '/v1/patients',
      mapPatientPayloadForApi(validated)
    );
    
    // Validate response
    if (isBackendPatient(response.data)) {
      const responseValidated = validatePatient(response.data);
      if (!responseValidated) {
        throw new Error('Invalid response data received from API');
      }
      response.data = responseValidated;
    }

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

    const response = await apiClient.put<Patient>(
      `/v1/patients/${id}`,
      mapPatientPayloadForApi(validated)
    );

    // Validate response
    if (isBackendPatient(response.data)) {
      const responseValidated = validatePatient(response.data);
      if (!responseValidated) {
        throw new Error('Invalid response data received from API');
      }
      response.data = responseValidated;
    }
    
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
      response.data = response.data.map((patient) => {
        if (isBackendPatient(patient)) {
          const validated = validatePatient(patient);
          return (validated ?? patient) as Patient;
        }
        return patient as Patient;
      });
    }

    return response;
  },
};

