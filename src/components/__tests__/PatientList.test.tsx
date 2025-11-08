import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientList from '../PatientList';
import { Patient } from '../../types';

// Mock the usePatientSearch hook
const mockUsePatientSearch = vi.fn();

vi.mock('../../hooks/usePatientSearch', () => ({
  usePatientSearch: mockUsePatientSearch,
}));

// Mock child components
vi.mock('../PatientList/PatientListItem', () => ({
  default: ({ patient, isSelected, onClick }: any) => (
    <div data-testid={`patient-list-item-${patient.id}`} onClick={onClick}>
      <span>{patient.firstName} {patient.lastName}</span>
      {isSelected && <span data-testid="selected-indicator">Selected</span>}
    </div>
  ),
}));

vi.mock('../PatientList/PatientGridItem', () => ({
  default: ({ patient, isSelected, onClick }: any) => (
    <div data-testid={`patient-grid-item-${patient.id}`} onClick={onClick}>
      <span>{patient.firstName} {patient.lastName}</span>
      {isSelected && <span data-testid="selected-indicator">Selected</span>}
    </div>
  ),
}));

vi.mock('../PatientList/PatientDetailItem', () => ({
  default: ({ patient, isSelected, onClick }: any) => (
    <div data-testid={`patient-detail-item-${patient.id}`} onClick={onClick}>
      <span>{patient.firstName} {patient.lastName}</span>
      {isSelected && <span data-testid="selected-indicator">Selected</span>}
    </div>
  ),
}));

vi.mock('../PatientList/PatientListPagination', () => ({
  default: ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }: any) => (
    <div data-testid="pagination">
      <span>Page {currentPage} of {totalPages}</span>
      <span>Items per page: {itemsPerPage}</span>
      <span>Total: {totalItems}</span>
      <button onClick={() => onPageChange(currentPage + 1)} data-testid="next-page">Next</button>
      <select
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        data-testid="items-per-page-select"
      >
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
      </select>
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">SearchIcon</div>,
  Filter: () => <div data-testid="filter-icon">FilterIcon</div>,
  X: () => <div data-testid="x-icon">XIcon</div>,
  List: () => <div data-testid="list-icon">ListIcon</div>,
  LayoutGrid: () => <div data-testid="grid-icon">GridIcon</div>,
  FileText: () => <div data-testid="file-text-icon">FileTextIcon</div>,
}));

// Mock data
const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1980-01-01',
    gender: 'male',
    email: 'john@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'wife',
      phone: '123-456-7891'
    },
    medicalHistory: [],
    medications: [],
    allergies: [],
    riskScore: 75,
    conditions: ['Hypertension'],
    lastVisit: '2023-01-01',
    nextAppointment: '2023-02-01',
    insurance: {
      provider: 'Blue Cross',
      policyNumber: '123456',
      groupNumber: '789'
    },
    notes: 'Regular checkup needed',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1985-05-15',
    gender: 'female',
    email: 'jane@example.com',
    phone: '987-654-3210',
    address: '456 Oak Ave',
    emergencyContact: {
      name: 'Bob Smith',
      relationship: 'husband',
      phone: '987-654-3211'
    },
    medicalHistory: [],
    medications: [],
    allergies: [],
    riskScore: 45,
    conditions: ['Diabetes'],
    lastVisit: '2023-01-15',
    nextAppointment: '2023-02-15',
    insurance: {
      provider: 'Aetna',
      policyNumber: '654321',
      groupNumber: '123'
    },
    notes: 'Blood sugar monitoring',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  }
];

const mockFilterState = {
  searchQuery: '',
  filterRisk: 'all',
  filterCondition: 'all',
  sortBy: 'name'
};

const mockUniqueConditions = ['Hypertension', 'Diabetes'];

describe('PatientList Component', () => {
  const mockOnSelectPatient = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    mockUsePatientSearch.mockReturnValue({
      filterState: mockFilterState,
      filteredAndSortedPatients: mockPatients,
      uniqueConditions: mockUniqueConditions,
      updateFilter: vi.fn(),
      clearFilters: vi.fn(),
      resultCount: mockPatients.length,
      totalCount: mockPatients.length,
    });
  });

  it('renders patient list with search input', () => {
    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    expect(screen.getByPlaceholderText('Search patients...')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('displays patient count correctly', () => {
    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    expect(screen.getByText('Showing 1-2 of 2 patients')).toBeInTheDocument();
  });

  it('renders patients in list view by default', () => {
    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    expect(screen.getByTestId('patient-list-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('patient-list-item-2')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('switches to grid view', async () => {
    const user = userEvent.setup();
    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    const gridButton = screen.getByLabelText('Grid view');
    await user.click(gridButton);

    expect(screen.getByTestId('patient-grid-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('patient-grid-item-2')).toBeInTheDocument();
  });

  it('switches to detail view', async () => {
    const user = userEvent.setup();
    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    const detailButton = screen.getByLabelText('Detail view');
    await user.click(detailButton);

    expect(screen.getByTestId('patient-detail-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('patient-detail-item-2')).toBeInTheDocument();
  });

  it('shows selected patient indicator', () => {
    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={mockPatients[0]}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    const selectedIndicators = screen.getAllByTestId('selected-indicator');
    expect(selectedIndicators.length).toBeGreaterThan(0);
  });

  it('calls onSelectPatient when patient is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    const patientItem = screen.getByTestId('patient-list-item-1');
    await user.click(patientItem);

    expect(mockOnSelectPatient).toHaveBeenCalledWith(mockPatients[0]);
  });

  it('toggles filters visibility', async () => {
    const user = userEvent.setup();
    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);

    expect(screen.getByText('Risk Level')).toBeInTheDocument();
    expect(screen.getByText('Condition')).toBeInTheDocument();
  });

  it('shows active filters indicator when filters are applied', () => {
    mockUsePatientSearch.mockReturnValue({
      filterState: {
        ...mockFilterState,
        filterRisk: 'high',
      },
      filteredAndSortedPatients: mockPatients,
      uniqueConditions: mockUniqueConditions,
      updateFilter: vi.fn(),
      clearFilters: vi.fn(),
      resultCount: mockPatients.length,
      totalCount: mockPatients.length,
    });

    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays filter options when filters are shown', async () => {
    const user = userEvent.setup();
    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);

    expect(screen.getByDisplayValue('All Risk Levels')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Conditions')).toBeInTheDocument();
    expect(screen.getByText('Hypertension')).toBeInTheDocument();
    expect(screen.getByText('Diabetes')).toBeInTheDocument();
  });

  it('updates search query', async () => {
    const user = userEvent.setup();
    const mockUpdateFilter = vi.fn();

    mockUsePatientSearch.mockReturnValue({
      filterState: mockFilterState,
      filteredAndSortedPatients: mockPatients,
      uniqueConditions: mockUniqueConditions,
      updateFilter: mockUpdateFilter,
      clearFilters: vi.fn(),
      resultCount: mockPatients.length,
      totalCount: mockPatients.length,
    });

    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search patients...');
    await user.type(searchInput, 'John');

    expect(mockUpdateFilter).toHaveBeenCalledWith({ searchQuery: 'John' });
  });

  it('clears search query', async () => {
    const user = userEvent.setup();
    const mockUpdateFilter = vi.fn();

    mockUsePatientSearch.mockReturnValue({
      filterState: { ...mockFilterState, searchQuery: 'test search' },
      filteredAndSortedPatients: mockPatients,
      uniqueConditions: mockUniqueConditions,
      updateFilter: mockUpdateFilter,
      clearFilters: vi.fn(),
      resultCount: mockPatients.length,
      totalCount: mockPatients.length,
    });

    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    expect(mockUpdateFilter).toHaveBeenCalledWith({ searchQuery: '' });
  });

  it('shows pagination when there are more patients than items per page', () => {
    const manyPatients = Array.from({ length: 30 }, (_, i) => ({
      ...mockPatients[0],
      id: String(i + 1),
      firstName: `Patient${i + 1}`,
      lastName: 'Test'
    }));

    mockUsePatientSearch.mockReturnValue({
      filterState: mockFilterState,
      filteredAndSortedPatients: manyPatients,
      uniqueConditions: mockUniqueConditions,
      updateFilter: vi.fn(),
      clearFilters: vi.fn(),
      resultCount: manyPatients.length,
      totalCount: manyPatients.length,
    });

    render(
      <PatientList
        patients={manyPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('displays "No patients found" when search returns no results', () => {
    mockUsePatientSearch.mockReturnValue({
      filterState: { ...mockFilterState, searchQuery: 'nonexistent' },
      filteredAndSortedPatients: [],
      uniqueConditions: mockUniqueConditions,
      updateFilter: vi.fn(),
      clearFilters: vi.fn(),
      resultCount: 0,
      totalCount: mockPatients.length,
    });

    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    expect(screen.getByText('No patients match your filters')).toBeInTheDocument();
    expect(screen.getByText('Clear filters to see all patients')).toBeInTheDocument();
  });

  it('displays "No patients available" when no patients exist', () => {
    mockUsePatientSearch.mockReturnValue({
      filterState: mockFilterState,
      filteredAndSortedPatients: [],
      uniqueConditions: [],
      updateFilter: vi.fn(),
      clearFilters: vi.fn(),
      resultCount: 0,
      totalCount: 0,
    });

    render(
      <PatientList
        patients={[]}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    expect(screen.getByText('No patients available')).toBeInTheDocument();
  });

  it('shows filtered count when filters are applied', () => {
    mockUsePatientSearch.mockReturnValue({
      filterState: { ...mockFilterState, filterRisk: 'high' },
      filteredAndSortedPatients: [mockPatients[0]], // Only high risk patient
      uniqueConditions: mockUniqueConditions,
      updateFilter: vi.fn(),
      clearFilters: vi.fn(),
      resultCount: 1,
      totalCount: mockPatients.length,
    });

    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    expect(screen.getByText('Showing 1-1 of 1 patients (filtered from 2 total)')).toBeInTheDocument();
  });

  it('changes sort order', async () => {
    const user = userEvent.setup();
    const mockUpdateFilter = vi.fn();

    mockUsePatientSearch.mockReturnValue({
      filterState: mockFilterState,
      filteredAndSortedPatients: mockPatients,
      uniqueConditions: mockUniqueConditions,
      updateFilter: mockUpdateFilter,
      clearFilters: vi.fn(),
      resultCount: mockPatients.length,
      totalCount: mockPatients.length,
    });

    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    const sortSelect = screen.getByDisplayValue('Sort: Name');
    await user.selectOptions(sortSelect, 'Sort: Risk');

    expect(mockUpdateFilter).toHaveBeenCalledWith({ sortBy: 'risk' });
  });

  it('clears all filters', async () => {
    const user = userEvent.setup();
    const mockClearFilters = vi.fn();

    mockUsePatientSearch.mockReturnValue({
      filterState: { ...mockFilterState, filterRisk: 'high' },
      filteredAndSortedPatients: mockPatients,
      uniqueConditions: mockUniqueConditions,
      updateFilter: vi.fn(),
      clearFilters: mockClearFilters,
      resultCount: mockPatients.length,
      totalCount: mockPatients.length,
    });

    render(
      <PatientList
        patients={mockPatients}
        selectedPatient={null}
        onSelectPatient={mockOnSelectPatient}
      />
    );

    // Show filters
    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);

    const clearButton = screen.getByText('Clear All Filters');
    await user.click(clearButton);

    expect(mockClearFilters).toHaveBeenCalled();
  });
});
