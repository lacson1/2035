import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import EditPatientModal from '../EditPatientModal';
import { Patient } from '../../types';

const mocks = vi.hoisted(() => ({
  updatePatientMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastWarningMock: vi.fn(),
  toastErrorMock: vi.fn(),
  updatePatientApiMock: vi.fn(),
}));

vi.mock('../../context/DashboardContext', () => ({
  useDashboard: () => ({
    updatePatient: mocks.updatePatientMock,
  }),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    toast: vi.fn(),
    success: mocks.toastSuccessMock,
    error: mocks.toastErrorMock,
    warning: mocks.toastWarningMock,
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    dismissAll: vi.fn(),
  }),
}));

vi.mock('../../services/patients', () => ({
  patientService: {
    updatePatient: mocks.updatePatientApiMock,
  },
}));

describe('EditPatientModal', () => {
  const basePatient: Patient = {
    id: 'patient-1',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    bp: '120/80',
    condition: 'Hypertension',
    risk: 12,
    email: 'john@example.com',
    phone: '1234567890',
    dob: '1980-01-01',
    address: '123 Main St',
    allergies: ['Peanuts'],
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '0987654321',
    },
    insurance: {
      provider: 'HealthCare Inc.',
      policyNumber: 'POL123',
      groupNumber: 'GRP456',
    },
    medications: [],
    imagingStudies: [],
  };

  beforeEach(() => {
    mocks.updatePatientMock.mockReset();
    mocks.toastSuccessMock.mockReset();
    mocks.toastWarningMock.mockReset();
    mocks.toastErrorMock.mockReset();
    mocks.updatePatientApiMock.mockReset();
  });

  it('saves patient updates and closes the modal', async () => {
    mocks.updatePatientApiMock.mockResolvedValue({ data: {} });
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <EditPatientModal
        patient={basePatient}
        isOpen
        onClose={onClose}
      />
    );

    const nameInput = screen.getByRole('textbox', { name: /full name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mocks.updatePatientMock).toHaveBeenCalledWith('patient-1', expect.any(Function));
      expect(mocks.updatePatientApiMock).toHaveBeenCalledWith('patient-1', expect.objectContaining({
        name: 'Jane Doe',
      }));
      expect(mocks.toastSuccessMock).toHaveBeenCalledWith('Patient details updated successfully');
      expect(onClose).toHaveBeenCalled();
    });

    const updater = mocks.updatePatientMock.mock.calls[0][1];
    const updatedPatient = updater(basePatient);
    expect(updatedPatient.name).toBe('Jane Doe');
  });

  it('shows a warning toast when API update fails', async () => {
    mocks.updatePatientApiMock.mockRejectedValue(new Error('API failure'));
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <EditPatientModal
        patient={basePatient}
        isOpen
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mocks.updatePatientMock).toHaveBeenCalled();
      expect(mocks.updatePatientApiMock).toHaveBeenCalled();
      expect(mocks.toastWarningMock).toHaveBeenCalledWith('Patient updated locally, but failed to save to server. Changes may be lost on refresh.');
      expect(onClose).toHaveBeenCalled();
    });

    expect(mocks.toastErrorMock).not.toHaveBeenCalled();
  });
});
