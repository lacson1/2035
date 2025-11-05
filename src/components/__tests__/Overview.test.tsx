import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import Overview from '../Overview';
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
  phone: '555-1234',
  email: 'john@example.com',
  address: '123 Main St',
  allergies: ['Penicillin'],
  emergencyContact: {
    name: 'Jane Doe',
    relationship: 'Spouse',
    phone: '555-5678',
  },
  insurance: {
    provider: 'Blue Cross',
    policyNumber: 'BC123456',
    groupNumber: 'GR001',
  },
  medications: [],
  appointments: [],
  clinicalNotes: [],
  imagingStudies: [],
  timeline: [],
};

const mockUpdatePatient = vi.fn();
const mockSetActiveTab = vi.fn();

vi.mock('../../context/DashboardContext', () => ({
  useDashboard: () => ({
    setActiveTab: mockSetActiveTab,
    updatePatient: mockUpdatePatient,
  }),
}));

describe('Overview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders patient information correctly', () => {
    render(<Overview patient={mockPatient} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('45 years')).toBeInTheDocument();
    expect(screen.getByText('Hypertension')).toBeInTheDocument();
  });

  it('displays risk score gauge', () => {
    render(<Overview patient={mockPatient} />);
    
    expect(screen.getByText('Risk Score')).toBeInTheDocument();
  });

  it('displays active medications count', () => {
    const patientWithMeds = {
      ...mockPatient,
      medications: [
        { name: 'Lisinopril 10mg QD', status: 'Active' as const, started: '2024-01-01' },
      ],
    };
    
    render(<Overview patient={patientWithMeds} />);
    
    expect(screen.getByText('Active Medications')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays upcoming appointments', () => {
    const patientWithAppts = {
      ...mockPatient,
      appointments: [
        {
          id: '1',
          date: '2024-12-25',
          time: '10:00',
          type: 'Follow-up',
          provider: 'Dr. Smith',
          status: 'scheduled' as const,
        },
      ],
    };
    
    render(<Overview patient={patientWithAppts} />);
    
    expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('allows editing patient information', async () => {
    render(<Overview patient={mockPatient} />);
    
    const editButton = screen.getByTitle('Edit patient details');
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    });
  });

  it('displays emergency contact information', () => {
    render(<Overview patient={mockPatient} />);
    
    expect(screen.getByText('Emergency Contact')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Spouse')).toBeInTheDocument();
  });

  it('displays insurance information when available', () => {
    render(<Overview patient={mockPatient} />);
    
    // Insurance info should be visible in edit mode or in the info section
    const editButton = screen.getByTitle('Edit patient details');
    fireEvent.click(editButton);
    
    waitFor(() => {
      expect(screen.getByText(/Insurance Information/i)).toBeInTheDocument();
    });
  });

  it('shows empty state for no medications', () => {
    render(<Overview patient={mockPatient} />);
    
    expect(screen.getByText('Active Medications')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays recent clinical notes when available', () => {
    const patientWithNotes: Patient = {
      ...mockPatient,
      clinicalNotes: [
        {
          id: '1',
          title: 'Follow-up visit',
          content: 'Patient doing well',
          author: 'Dr. Smith',
          date: '2024-01-15',
          type: 'follow-up',
        },
      ],
    };
    
    render(<Overview patient={patientWithNotes} />);
    
    expect(screen.getByText('Recent Clinical Notes')).toBeInTheDocument();
    expect(screen.getByText('Follow-up visit')).toBeInTheDocument();
  });
});

