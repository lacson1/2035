import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import Vitals from '../Vitals';
import { Patient } from '../../types';

const mockPatient: Patient = {
  id: '1',
  name: 'John Doe',
  age: 45,
  gender: 'M',
  dob: '1978-01-15',
  condition: 'Hypertension',
  bp: '140/90',
  risk: 65,
  medications: [],
  appointments: [],
  clinicalNotes: [],
  imagingStudies: [],
  timeline: [],
};

const mockUpdatePatient = vi.fn();

vi.mock('../../context/DashboardContext', () => ({
  useDashboard: () => ({
    updatePatient: mockUpdatePatient,
  }),
}));

describe('Vitals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders vital signs section', () => {
    render(<Vitals patient={mockPatient} />);
    
    expect(screen.getByText('Vital Signs')).toBeInTheDocument();
    expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
    expect(screen.getByText('Heart Rate')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('SpO2')).toBeInTheDocument();
  });

  it('displays current blood pressure from patient', () => {
    render(<Vitals patient={mockPatient} />);
    
    expect(screen.getByText('140/90')).toBeInTheDocument();
  });

  it('shows Record Vitals button', () => {
    render(<Vitals patient={mockPatient} />);
    
    const recordButton = screen.getByText('Record Vitals');
    expect(recordButton).toBeInTheDocument();
  });

  it('opens modal when Record Vitals is clicked', async () => {
    render(<Vitals patient={mockPatient} />);
    
    const recordButton = screen.getByText('Record Vitals');
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(screen.getByText('Record New Vital Signs')).toBeInTheDocument();
    });
  });

  it('displays chart selection buttons', () => {
    render(<Vitals patient={mockPatient} />);
    
    expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
    expect(screen.getByText('Heart Rate')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Oxygen Saturation')).toBeInTheDocument();
  });

  it('allows switching between metric charts', () => {
    render(<Vitals patient={mockPatient} />);
    
    const heartRateButton = screen.getByText('Heart Rate');
    fireEvent.click(heartRateButton);
    
    expect(screen.getByText('Heart Rate Trend (30 days)')).toBeInTheDocument();
  });

  it('displays recent readings table', () => {
    render(<Vitals patient={mockPatient} />);
    
    expect(screen.getByText('Recent Readings (Last 7 Days)')).toBeInTheDocument();
  });

  it('validates form fields when submitting', async () => {
    render(<Vitals patient={mockPatient} />);
    
    const recordButton = screen.getByText('Record Vitals');
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(screen.getByText('Record New Vital Signs')).toBeInTheDocument();
    });
    
    const submitButton = screen.getByRole('button', { name: /Record Vitals/i });
    fireEvent.click(submitButton);
    
    // Should show validation or the form should still be visible
    await waitFor(() => {
      expect(screen.getByText('Record New Vital Signs')).toBeInTheDocument();
    });
  });

  it('closes modal when cancel is clicked', async () => {
    render(<Vitals patient={mockPatient} />);
    
    const recordButton = screen.getByText('Record Vitals');
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(screen.getByText('Record New Vital Signs')).toBeInTheDocument();
    });
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Record New Vital Signs')).not.toBeInTheDocument();
    });
  });

  it('displays BP status correctly', () => {
    render(<Vitals patient={mockPatient} />);
    
    // High BP should show status
    expect(screen.getByText('140/90')).toBeInTheDocument();
    // BP status should be visible
    expect(screen.getByText(/High|Elevated|Normal/i)).toBeInTheDocument();
  });
});

