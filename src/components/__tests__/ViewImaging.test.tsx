import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ViewImaging from '../ViewImaging';
import { Patient } from '../../types';

const serviceMocks = vi.hoisted(() => ({
  getPatientImagingStudiesMock: vi.fn(),
  createImagingStudyMock: vi.fn(),
  updateImagingStudyMock: vi.fn(),
  deleteImagingStudyMock: vi.fn(),
}));

let dashboardPatient: Patient | null = null;

vi.mock('../../context/DashboardContext', () => ({
  useDashboard: () => ({
    selectedPatient: dashboardPatient,
  }),
}));

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    currentUser: {
      id: 'user-1',
      firstName: 'Alex',
      lastName: 'Smith',
      role: 'physician',
    },
    setCurrentUser: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../../hooks/useUsers', () => ({
  useUsers: () => ({
    users: [],
    isLoading: false,
  }),
}));

vi.mock('../UserAssignment', () => ({
  default: () => <div data-testid="user-assignment" />,
}));

vi.mock('../PrintPreview', () => ({
  default: () => null,
}));

vi.mock('../../services/imaging-studies', () => ({
  imagingStudiesService: {
    getPatientImagingStudies: serviceMocks.getPatientImagingStudiesMock,
    createImagingStudy: serviceMocks.createImagingStudyMock,
    updateImagingStudy: serviceMocks.updateImagingStudyMock,
    deleteImagingStudy: serviceMocks.deleteImagingStudyMock,
  },
}));

describe('ViewImaging - upload workflow', () => {
  const originalFetch = global.fetch;
  const fetchMock = vi.fn();

  const patient: Patient = {
    id: 'patient-1',
    name: 'John Doe',
    age: 52,
    gender: 'Male',
    bp: '118/79',
    condition: 'Chest pain',
    risk: 35,
    medications: [],
    imagingStudies: [
      {
        id: 'study-1',
        date: '2025-01-10',
        type: 'CT Chest',
        modality: 'CT',
        bodyPart: 'Chest',
        findings: 'No acute findings',
        status: 'completed',
      },
    ],
  };

  beforeEach(() => {
    dashboardPatient = patient;
    serviceMocks.getPatientImagingStudiesMock.mockReset();
    serviceMocks.createImagingStudyMock.mockReset();
    serviceMocks.updateImagingStudyMock.mockReset();
    serviceMocks.deleteImagingStudyMock.mockReset();
    serviceMocks.getPatientImagingStudiesMock.mockResolvedValue({ data: patient.imagingStudies });

    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        fileUrl: '/uploads/documents/report.pdf',
        data: {},
      }),
    } as Response);
    (globalThis as any).fetch = fetchMock;

    localStorage.setItem('authToken', 'test-token');
  });

  afterAll(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    }
  });

  it('uploads a report and updates the study with the returned URL', async () => {
    render(<ViewImaging patient={patient} />);

    const uploadInput = await screen.findByTitle(/upload report/i);
    const file = new File(['dummy'], 'report.pdf', { type: 'application/pdf' });

    fireEvent.change(uploadInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const fetchArgs = fetchMock.mock.calls[0];
    expect(fetchArgs[0]).toBe('/api/v1/patients/patient-1/imaging/study-1/upload-report');
    expect(fetchArgs[1]).toMatchObject({
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
      },
      body: expect.any(FormData),
    });

    await waitFor(() => {
      expect(screen.getByTitle(/download report/i)).toBeInTheDocument();
    });
  });
});
