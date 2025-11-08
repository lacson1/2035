import apiClient, { ApiResponse } from './api';
import { Consent, ConsentType, ConsentStatus } from '../types';

export interface CreateConsentData {
  date: string;
  type: ConsentType;
  title: string;
  description: string;
  status?: ConsentStatus;
  procedureName?: string;
  risks?: string[];
  benefits?: string[];
  alternatives?: string[];
  signedBy?: string;
  signedById?: string;
  witnessName?: string;
  witnessId?: string;
  physicianName?: string;
  physicianId?: string;
  signedDate?: string;
  signedTime?: string;
  expirationDate?: string;
  notes?: string;
  digitalSignature?: string;
  printedSignature?: boolean;
}

export interface UpdateConsentData extends Partial<CreateConsentData> {}

/**
 * Consents API Service
 * Handles all consent-related API calls
 */
export const consentsService = {
  /**
   * Get all consents for a patient
   */
  async getPatientConsents(patientId: string): Promise<ApiResponse<Consent[]>> {
    return apiClient.get<Consent[]>(`/v1/patients/${patientId}/consents`);
  },

  /**
   * Get single consent by ID
   */
  async getConsent(patientId: string, consentId: string): Promise<ApiResponse<Consent>> {
    return apiClient.get<Consent>(`/v1/patients/${patientId}/consents/${consentId}`);
  },

  /**
   * Create new consent
   */
  async createConsent(patientId: string, data: CreateConsentData): Promise<ApiResponse<Consent>> {
    return apiClient.post<Consent>(`/v1/patients/${patientId}/consents`, data);
  },

  /**
   * Update consent
   */
  async updateConsent(patientId: string, consentId: string, data: UpdateConsentData): Promise<ApiResponse<Consent>> {
    return apiClient.put<Consent>(`/v1/patients/${patientId}/consents/${consentId}`, data);
  },

  /**
   * Delete consent
   */
  async deleteConsent(patientId: string, consentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/patients/${patientId}/consents/${consentId}`);
  },
};

