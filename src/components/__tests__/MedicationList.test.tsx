import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import MedicationList from '../MedicationList';
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
  medications: [
    {
      name: 'Lisinopril 10mg QD',
      status: 'Active',
      started: '2024-01-01',
      prescriptionType: 'repeat',
      refillsRemaining: 3,
      refillsAuthorized: 5,
    },
    {
      name: 'Metformin 500mg BID',
      status: 'Active',
      started: '2024-01-15',
      prescriptionType: 'acute',
    },
  ],
  appointments: [],
  clinicalNotes: [],
  imagingStudies: [],
  timeline: [],
};

describe('MedicationList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders medication list', () => {
    render(<MedicationList patient={mockPatient} />);
    
    expect(screen.getByText('Current Medications')).toBeInTheDocument();
    expect(screen.getByText('Lisinopril 10mg QD')).toBeInTheDocument();
    expect(screen.getByText('Metformin 500mg BID')).toBeInTheDocument();
  });

  it('shows Add Medication button', () => {
    render(<MedicationList patient={mockPatient} />);
    
    const addButton = screen.getByText('Add Medication');
    expect(addButton).toBeInTheDocument();
  });

  it('opens modal when Add Medication is clicked', async () => {
    render(<MedicationList patient={mockPatient} />);
    
    const addButton = screen.getByText('Add Medication');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Add New Medication')).toBeInTheDocument();
    });
  });

  it('displays repeat prescriptions section', () => {
    render(<MedicationList patient={mockPatient} />);
    
    expect(screen.getByText('Repeat Prescriptions')).toBeInTheDocument();
    expect(screen.getByText('Lisinopril 10mg QD')).toBeInTheDocument();
  });

  it('displays acute prescriptions section', () => {
    render(<MedicationList patient={mockPatient} />);
    
    expect(screen.getByText('Acute Prescriptions')).toBeInTheDocument();
    expect(screen.getByText('Metformin 500mg BID')).toBeInTheDocument();
  });

  it('shows refill information for repeat prescriptions', () => {
    render(<MedicationList patient={mockPatient} />);
    
    expect(screen.getByText(/Refills: 3 \/ 5/i)).toBeInTheDocument();
  });

  it('displays empty state when no medications', () => {
    const patientWithoutMeds = {
      ...mockPatient,
      medications: [],
    };
    
    render(<MedicationList patient={patientWithoutMeds} />);
    
    expect(screen.getByText('No current medications')).toBeInTheDocument();
  });

  it('shows discontinue button for active medications', () => {
    render(<MedicationList patient={mockPatient} />);
    
    const discontinueButtons = screen.getAllByText('Discontinue');
    expect(discontinueButtons.length).toBeGreaterThan(0);
  });

  it('shows adjust button for medications', () => {
    render(<MedicationList patient={mockPatient} />);
    
    const adjustButtons = screen.getAllByText('Adjust');
    expect(adjustButtons.length).toBeGreaterThan(0);
  });

  it('displays drug name input in modal', async () => {
    render(<MedicationList patient={mockPatient} />);
    
    const addButton = screen.getByText('Add Medication');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Drug Name/i)).toBeInTheDocument();
    });
  });

  it('shows print prescription button when medications exist', () => {
    render(<MedicationList patient={mockPatient} />);
    
    const printButton = screen.getByText('Print Prescription');
    expect(printButton).toBeInTheDocument();
  });

  it('does not show print button when no medications', () => {
    const patientWithoutMeds = {
      ...mockPatient,
      medications: [],
    };
    
    render(<MedicationList patient={patientWithoutMeds} />);
    
    expect(screen.queryByText('Print Prescription')).not.toBeInTheDocument();
  });
});

