import apiClient, { ApiResponse } from './api';
import { ImagingStudy } from '../types';

export interface CreateImagingStudyData {
    type: string;
    modality: 'CT' | 'MRI' | 'X-Ray' | 'Ultrasound' | 'PET';
    bodyPart: string;
    date: string;
    findings: string;
    status: 'completed' | 'pending' | 'cancelled';
    reportUrl?: string;
    orderingPhysicianId?: string;
}

export interface UpdateImagingStudyData extends Partial<CreateImagingStudyData> { }

/**
 * Imaging Studies API Service
 * Handles all imaging study-related API calls
 */
export const imagingStudiesService = {
    /**
     * Get all imaging studies for a patient
     */
    async getPatientImagingStudies(patientId: string): Promise<ApiResponse<ImagingStudy[]>> {
        return await apiClient.get<ImagingStudy[]>(`/v1/patients/${patientId}/imaging`);
    },

    /**
     * Get single imaging study by ID
     */
    async getImagingStudy(patientId: string, studyId: string): Promise<ApiResponse<ImagingStudy>> {
        return await apiClient.get<ImagingStudy>(`/v1/patients/${patientId}/imaging/${studyId}`);
    },

    /**
     * Create new imaging study
     */
    async createImagingStudy(
        patientId: string,
        data: CreateImagingStudyData
    ): Promise<ApiResponse<ImagingStudy>> {
        return await apiClient.post<ImagingStudy>(`/v1/patients/${patientId}/imaging`, data);
    },

    /**
     * Update imaging study
     */
    async updateImagingStudy(
        patientId: string,
        studyId: string,
        data: UpdateImagingStudyData
    ): Promise<ApiResponse<ImagingStudy>> {
        return await apiClient.put<ImagingStudy>(`/v1/patients/${patientId}/imaging/${studyId}`, data);
    },

    /**
     * Delete imaging study
     */
    async deleteImagingStudy(patientId: string, studyId: string): Promise<ApiResponse<void>> {
        return await apiClient.delete<void>(`/v1/patients/${patientId}/imaging/${studyId}`);
    },
};

