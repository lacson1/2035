import apiClient, { ApiResponse } from './api';
import { Appointment } from '../types';

export interface CreateAppointmentData {
  date: string;
  time: string;
  type: string;
  providerId: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  consultationType?: string;
  specialty?: string;
  duration?: number;
  location?: string;
  reason?: string;
  referralRequired?: boolean;
}

export interface UpdateAppointmentData {
  date?: string;
  time?: string;
  type?: string;
  providerId?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  consultationType?: string;
  specialty?: string;
  duration?: number;
  location?: string;
  reason?: string;
  referralRequired?: boolean;
}

/**
 * Appointment API Service
 * Handles all appointment-related API calls
 */
export const appointmentService = {
  /**
   * Get all appointments for a patient
   */
  async getPatientAppointments(patientId: string): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get<Appointment[]>(`/v1/patients/${patientId}/appointments`);
  },

  /**
   * Get single appointment
   */
  async getAppointment(patientId: string, appointmentId: string): Promise<ApiResponse<Appointment>> {
    return apiClient.get<Appointment>(`/v1/patients/${patientId}/appointments/${appointmentId}`);
  },

  /**
   * Create appointment for a patient
   */
  async createAppointment(patientId: string, data: CreateAppointmentData): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>(`/v1/patients/${patientId}/appointments`, data);
  },

  /**
   * Update appointment
   */
  async updateAppointment(patientId: string, appointmentId: string, data: UpdateAppointmentData): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(`/v1/patients/${patientId}/appointments/${appointmentId}`, data);
  },

  /**
   * Delete appointment
   */
  async deleteAppointment(patientId: string, appointmentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/patients/${patientId}/appointments/${appointmentId}`);
  },

  /**
   * Get appointments for a provider (doctor)
   */
  async getProviderAppointments(providerId: string, filters?: {
    from?: string;
    to?: string;
    status?: 'scheduled' | 'completed' | 'cancelled';
  }): Promise<ApiResponse<Appointment[]>> {
    const params = new URLSearchParams();
    params.append('providerId', providerId);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.status) params.append('status', filters.status);
    
    return apiClient.get<Appointment[]>(`/v1/appointments?${params.toString()}`);
  },
};

