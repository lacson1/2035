import apiClient, { ApiResponse } from './api';
import { ClinicalNote } from '../types';

export interface CreateClinicalNoteData {
  title: string;
  content: string;
  date: string;
  type: 'visit' | 'consultation' | 'procedure' | 'follow_up' | 'general_consultation' | 'specialty_consultation';
  consultationType?: string;
  specialty?: string;
}

export interface UpdateClinicalNoteData {
  title?: string;
  content?: string;
  date?: string;
  type?: 'visit' | 'consultation' | 'procedure' | 'follow_up' | 'general_consultation' | 'specialty_consultation';
  consultationType?: string;
  specialty?: string;
}

/**
 * Clinical Notes API Service
 * Handles all clinical note-related API calls
 */
export const clinicalNoteService = {
  /**
   * Get all clinical notes for a patient
   */
  async getPatientNotes(patientId: string): Promise<ApiResponse<ClinicalNote[]>> {
    return apiClient.get<ClinicalNote[]>(`/v1/patients/${patientId}/notes`);
  },

  /**
   * Get single clinical note
   */
  async getNote(patientId: string, noteId: string): Promise<ApiResponse<ClinicalNote>> {
    return apiClient.get<ClinicalNote>(`/v1/patients/${patientId}/notes/${noteId}`);
  },

  /**
   * Create clinical note for a patient
   */
  async createNote(patientId: string, data: CreateClinicalNoteData): Promise<ApiResponse<ClinicalNote>> {
    return apiClient.post<ClinicalNote>(`/v1/patients/${patientId}/notes`, data);
  },

  /**
   * Update clinical note
   */
  async updateNote(patientId: string, noteId: string, data: UpdateClinicalNoteData): Promise<ApiResponse<ClinicalNote>> {
    return apiClient.put<ClinicalNote>(`/v1/patients/${patientId}/notes/${noteId}`, data);
  },

  /**
   * Delete clinical note
   */
  async deleteNote(patientId: string, noteId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/patients/${patientId}/notes/${noteId}`);
  },
};

