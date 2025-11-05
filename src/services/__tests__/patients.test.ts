import { describe, it, expect, vi, beforeEach } from 'vitest';
import { patientService } from '../patients';
import apiClient from '../api';
import { ApiError } from '../api';

vi.mock('../api');

describe('Patient Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches patients list', async () => {
    const mockResponse = {
      data: {
        patients: [{ id: '1', name: 'John Doe' }],
        total: 1,
        page: 1,
        limit: 10,
      },
    };

    (apiClient.get as any).mockResolvedValueOnce(mockResponse);

    const result = await patientService.getPatients({ page: 1, limit: 10 });

    expect(result.data).toEqual(mockResponse.data);
    expect(apiClient.get).toHaveBeenCalledWith('/v1/patients', {
      page: '1',
      limit: '10',
    });
  });

  it('fetches single patient by id', async () => {
    const mockPatient = { id: '1', name: 'John Doe', age: 45 };
    const mockResponse = { data: mockPatient };

    (apiClient.get as any).mockResolvedValueOnce(mockResponse);

    const result = await patientService.getPatient('1');

    expect(result.data).toEqual(mockPatient);
    expect(apiClient.get).toHaveBeenCalledWith('/v1/patients/1');
  });

  it('creates new patient', async () => {
    const newPatient = { name: 'Jane Doe', dateOfBirth: '1990-01-01', gender: 'F' };
    const mockResponse = { data: { id: '2', ...newPatient } };

    (apiClient.post as any).mockResolvedValueOnce(mockResponse);

    const result = await patientService.createPatient(newPatient);

    expect(result.data).toEqual(mockResponse.data);
    expect(apiClient.post).toHaveBeenCalledWith('/v1/patients', newPatient);
  });

  it('updates patient', async () => {
    const updates = { name: 'Jane Smith' };
    const mockResponse = { data: { id: '1', name: 'Jane Smith' } };

    (apiClient.put as any).mockResolvedValueOnce(mockResponse);

    const result = await patientService.updatePatient('1', updates);

    expect(result.data).toEqual(mockResponse.data);
    expect(apiClient.put).toHaveBeenCalledWith('/v1/patients/1', updates);
  });

  it('deletes patient', async () => {
    const mockResponse = { data: { success: true } };

    (apiClient.delete as any).mockResolvedValueOnce(mockResponse);

    const result = await patientService.deletePatient('1');

    expect(result.data).toEqual(mockResponse.data);
    expect(apiClient.delete).toHaveBeenCalledWith('/v1/patients/1');
  });

  it('handles API errors', async () => {
    const error = new ApiError('Not found', 404);
    (apiClient.get as any).mockRejectedValueOnce(error);

    await expect(patientService.getPatient('999')).rejects.toThrow(ApiError);
  });
});

