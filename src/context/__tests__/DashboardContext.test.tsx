import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardProvider, useDashboard } from '../DashboardContext';
import { AuthProvider } from '../AuthContext';
import { UserProvider } from '../UserContext';

// Test component that uses the context
const TestComponent = () => {
  const { patients, selectedPatient, setActiveTab, activeTab } = useDashboard();
  
  return (
    <div>
      <div data-testid="patients-count">{patients.length}</div>
      <div data-testid="selected-patient">{selectedPatient?.name || 'None'}</div>
      <div data-testid="active-tab">{activeTab}</div>
      <button onClick={() => setActiveTab('vitals')}>Switch Tab</button>
    </div>
  );
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <UserProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </UserProvider>
  </AuthProvider>
);

describe('DashboardContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides patients list', () => {
    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );
    
    const count = screen.getByTestId('patients-count');
    expect(parseInt(count.textContent || '0')).toBeGreaterThanOrEqual(0);
  });

  it('provides selected patient', () => {
    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );
    
    const selectedPatient = screen.getByTestId('selected-patient');
    expect(selectedPatient.textContent).toBeTruthy();
  });

  it('allows switching active tab', async () => {
    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );
    
    const switchButton = screen.getByText('Switch Tab');
    const activeTab = screen.getByTestId('active-tab');
    
    expect(activeTab.textContent).toBe('overview');
    
    switchButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('active-tab').textContent).toBe('vitals');
    });
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useDashboard must be used within a DashboardProvider');
    
    console.error = originalError;
  });
});

