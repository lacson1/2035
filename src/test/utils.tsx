import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { UserProvider } from '../context/UserContext';
import { ToastProvider } from '../context/ToastContext';

// Mock DashboardProvider for tests
const MockDashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const mockValue = {
    patients: [],
    selectedPatient: null,
    setSelectedPatient: vi.fn(),
    activeTab: 'overview',
    setActiveTab: vi.fn(),
    addAppointment: vi.fn(),
    addClinicalNote: vi.fn(),
    updateMedications: vi.fn(),
    addTimelineEvent: vi.fn(),
    isLoading: false,
    error: null,
  };

  return (
    <div data-testid="dashboard-provider" data-value={JSON.stringify(mockValue)}>
      {children}
    </div>
  );
};

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <ToastProvider>
          <MockDashboardProvider>
            {children}
          </MockDashboardProvider>
        </ToastProvider>
      </UserProvider>
    </AuthProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

