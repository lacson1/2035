import apiClient, { ApiResponse } from './api';

export interface CareTeamMember {
  id: string;
  patientId: string;
  userId: string;
  role: string;
  specialty?: string;
  notes?: string;
  assignedDate: string;
  isActive: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialty?: string;
    department?: string;
    role: string;
  };
}

export interface CreateCareTeamMemberData {
  userId: string;
  role: string;
  specialty?: string;
  notes?: string;
}

export interface UpdateCareTeamMemberData extends Partial<CreateCareTeamMemberData> {}

/**
 * Care Team API Service
 * Handles all care team-related API calls
 */
export const careTeamService = {
  /**
   * Get all care team members for a patient
   */
  async getPatientCareTeam(patientId: string): Promise<ApiResponse<CareTeamMember[]>> {
    return apiClient.get<CareTeamMember[]>(`/v1/patients/${patientId}/care-team`);
  },

  /**
   * Get single care team member by ID
   */
  async getCareTeamMember(patientId: string, memberId: string): Promise<ApiResponse<CareTeamMember>> {
    return apiClient.get<CareTeamMember>(`/v1/patients/${patientId}/care-team/${memberId}`);
  },

  /**
   * Add care team member
   */
  async addCareTeamMember(patientId: string, data: CreateCareTeamMemberData): Promise<ApiResponse<CareTeamMember>> {
    return apiClient.post<CareTeamMember>(`/v1/patients/${patientId}/care-team`, data);
  },

  /**
   * Update care team member
   */
  async updateCareTeamMember(patientId: string, memberId: string, data: UpdateCareTeamMemberData): Promise<ApiResponse<CareTeamMember>> {
    return apiClient.put<CareTeamMember>(`/v1/patients/${patientId}/care-team/${memberId}`, data);
  },

  /**
   * Remove care team member
   */
  async removeCareTeamMember(patientId: string, memberId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/patients/${patientId}/care-team/${memberId}`);
  },
};

