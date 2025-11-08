import apiClient, { ApiResponse } from './api';
import { Referral, ReferralStatus, ReferralPriority } from '../types';

export interface CreateReferralData {
  date: string;
  specialty: string;
  reason: string;
  diagnosis?: string;
  priority: ReferralPriority;
  status?: ReferralStatus;
  referringPhysicianId?: string;
  referredToProviderId?: string;
  referredToProvider?: string;
  referredToFacility?: string;
  referredToAddress?: string;
  referredToPhone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string;
  attachments?: string[];
  insurancePreAuth?: boolean;
  preAuthNumber?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface UpdateReferralData {
  date?: string;
  specialty?: string;
  reason?: string;
  diagnosis?: string;
  priority?: ReferralPriority;
  status?: ReferralStatus;
  referringPhysicianId?: string;
  referredToProviderId?: string;
  referredToProvider?: string;
  referredToFacility?: string;
  referredToAddress?: string;
  referredToPhone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string;
  attachments?: string[];
  insurancePreAuth?: boolean;
  preAuthNumber?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

/**
 * Referral API Service
 * Handles all referral-related API calls
 */
export const referralService = {
  /**
   * Get all referrals for a patient
   */
  async getPatientReferrals(patientId: string): Promise<ApiResponse<Referral[]>> {
    return apiClient.get<Referral[]>(`/v1/patients/${patientId}/referrals`);
  },

  /**
   * Get single referral
   */
  async getReferral(patientId: string, referralId: string): Promise<ApiResponse<Referral>> {
    return apiClient.get<Referral>(`/v1/patients/${patientId}/referrals/${referralId}`);
  },

  /**
   * Create referral for a patient
   */
  async createReferral(patientId: string, data: CreateReferralData): Promise<ApiResponse<Referral>> {
    return apiClient.post<Referral>(`/v1/patients/${patientId}/referrals`, data);
  },

  /**
   * Update referral
   */
  async updateReferral(patientId: string, referralId: string, data: UpdateReferralData): Promise<ApiResponse<Referral>> {
    return apiClient.put<Referral>(`/v1/patients/${patientId}/referrals/${referralId}`, data);
  },

  /**
   * Delete referral
   */
  async deleteReferral(patientId: string, referralId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/patients/${patientId}/referrals/${referralId}`);
  },
};

