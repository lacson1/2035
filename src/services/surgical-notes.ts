import apiClient, { ApiResponse } from './api';
import { SurgicalNote, SurgicalProcedureType, SurgicalStatus } from '../types';

export interface CreateSurgicalNoteData {
  date: string;
  procedureName: string;
  procedureType: SurgicalProcedureType;
  status?: SurgicalStatus;
  surgeonId?: string;
  assistantSurgeons?: string[];
  anesthesiologistId?: string;
  anesthesiaType?: string;
  indication: string;
  preoperativeDiagnosis: string;
  postoperativeDiagnosis?: string;
  procedureDescription: string;
  findings?: string;
  complications?: string;
  estimatedBloodLoss?: string;
  specimens?: string[];
  drains?: string;
  postOpInstructions?: string;
  recoveryNotes?: string;
  followUpDate?: string;
  operatingRoom?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
}

export interface UpdateSurgicalNoteData extends Partial<CreateSurgicalNoteData> {}

/**
 * Surgical Notes API Service
 * Handles all surgical note-related API calls
 */
export const surgicalNotesService = {
  /**
   * Get all surgical notes for a patient
   */
  async getPatientSurgicalNotes(patientId: string): Promise<ApiResponse<SurgicalNote[]>> {
    return apiClient.get<SurgicalNote[]>(`/v1/patients/${patientId}/surgical-notes`);
  },

  /**
   * Get single surgical note by ID
   */
  async getSurgicalNote(patientId: string, noteId: string): Promise<ApiResponse<SurgicalNote>> {
    return apiClient.get<SurgicalNote>(`/v1/patients/${patientId}/surgical-notes/${noteId}`);
  },

  /**
   * Create new surgical note
   */
  async createSurgicalNote(patientId: string, data: CreateSurgicalNoteData): Promise<ApiResponse<SurgicalNote>> {
    return apiClient.post<SurgicalNote>(`/v1/patients/${patientId}/surgical-notes`, data);
  },

  /**
   * Update surgical note
   */
  async updateSurgicalNote(patientId: string, noteId: string, data: UpdateSurgicalNoteData): Promise<ApiResponse<SurgicalNote>> {
    return apiClient.put<SurgicalNote>(`/v1/patients/${patientId}/surgical-notes/${noteId}`, data);
  },

  /**
   * Delete surgical note
   */
  async deleteSurgicalNote(patientId: string, noteId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/patients/${patientId}/surgical-notes/${noteId}`);
  },
};

