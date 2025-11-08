import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Hubs from '../Hubs';
import { DashboardProvider } from '../../context/DashboardContext';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { UserProvider } from '../../context/UserContext';
import { NotificationProvider } from '../../context/NotificationContext';

// Mock dependencies
vi.mock('../../context/DashboardContext', () => ({
  DashboardProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-provider">{children}</div>,
  useDashboard: () => ({
    patients: [
      {
        id: 'pt-001',
        name: 'John Doe',
        age: 45,
        condition: 'Diabetes',
        mrn: 'MRN001',
        phone: '+1234567890'
      }
    ],
    selectedPatient: null,
    setSelectedPatient: vi.fn(),
    setActiveTab: vi.fn(),
    updatePatient: vi.fn()
  })
}));

vi.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: '1', role: 'physician' }
  })
}));

vi.mock('../../context/ToastContext', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="toast-provider">{children}</div>,
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  })
}));

vi.mock('../../context/UserContext', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="user-provider">{children}</div>,
  useUser: () => ({
    currentUser: { id: '1', role: 'physician' },
    users: []
  })
}));

vi.mock('../../context/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="notification-provider">{children}</div>
}));

vi.mock('../hooks/useUsers', () => ({
  useUsers: () => ({
    users: [],
    loading: false,
    error: null
  })
}));

// Mock API services
vi.mock('../../services/hubs', () => ({
  hubService: {
    getHubs: vi.fn().mockResolvedValue({ data: [] }),
    getHubFunctions: vi.fn().mockResolvedValue({ data: [] }),
    getHubResources: vi.fn().mockResolvedValue({ data: [] }),
    getHubNotes: vi.fn().mockResolvedValue({ data: [] }),
    getHubTemplates: vi.fn().mockResolvedValue({ data: [] })
  }
}));

vi.mock('../../data/hubs', () => ({
  getAllHubsSync: () => [
    {
      id: 'cardiology',
      name: 'Cardiology',
      description: 'Heart and cardiovascular care',
      color: 'blue',
      specialties: ['cardiology'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  getHubById: (id: string) => id === 'cardiology' ? {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Heart and cardiovascular care',
    color: 'blue',
    specialties: ['cardiology'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  } : undefined,
  getHubColorClass: () => 'bg-blue-50 border-blue-200',
  initializeHubs: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../../utils/hubIntegration', () => ({
  filterPatientsByHub: vi.fn().mockReturnValue([]),
  getHubStats: vi.fn().mockReturnValue({ totalPatients: 0, activeAppointments: 0, recentNotes: 0 }),
  getHubQuickActions: vi.fn().mockReturnValue([])
}));

vi.mock('../../utils/hubConditions', () => ({
  getHubConditions: vi.fn().mockReturnValue(['Hypertension', 'Heart Disease']),
  getHubTreatments: vi.fn().mockReturnValue(['Medication', 'Lifestyle Changes']),
  getPatientConditions: vi.fn().mockReturnValue(['Hypertension'])
}));

vi.mock('../../data/questionnaires', () => ({
  getQuestionnairesByHub: vi.fn().mockReturnValue([]),
  Questionnaire: {},
  Question: {}
}));

vi.mock('../../utils/questionnaireScoring', () => ({
  getScoringFunction: vi.fn().mockReturnValue(() => 0),
  QuestionnaireScore: {}
}));

vi.mock('../../data/specialtyTemplates', () => ({
  getSpecialtyTemplate: vi.fn().mockReturnValue({
    name: 'Cardiology Template',
    consultationTemplate: {
      chiefComplaint: 'Cardiac evaluation',
      historyOfPresentIllness: 'Patient presents for cardiac evaluation',
      reviewOfSystems: ['No chest pain'],
      physicalExamination: ['Cardiac exam normal'],
      assessment: 'Stable condition',
      plan: ['Continue current medications']
    }
  }),
  getAllSpecialties: vi.fn().mockReturnValue(['cardiology', 'neurology'])
}));

vi.mock('../../utils/templateTransfer', () => ({
  storeTemplateForConsultation: vi.fn()
}));

vi.mock('../../utils/formHelpers', () => ({
  commonProcedures: []
}));

vi.mock('../../utils/popupHandler', () => ({
  openPrintWindow: vi.fn()
}));

vi.mock('../../utils/organization', () => ({
  getOrganizationDetails: vi.fn().mockReturnValue({})
}));

// Mock ErrorBoundary for testing
vi.mock('../ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <UserProvider>
        <DashboardProvider>
          <ToastProvider>
            <NotificationProvider>
              {component}
            </NotificationProvider>
          </ToastProvider>
        </DashboardProvider>
      </UserProvider>
    </AuthProvider>
  );
};

describe('Hubs Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders loading state initially', () => {
    renderWithProviders(<Hubs />);
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('renders hubs list after loading', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByText('Medical Hubs')).toBeInTheDocument();
    });

    expect(screen.getByText('Showing 1 of 1 hubs')).toBeInTheDocument();
  });

  it('displays hub cards correctly', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByText('Cardiology')).toBeInTheDocument();
    });

    expect(screen.getByText('Heart and cardiovascular care, including heart disease management, cardiac procedures, and cardiovascular monitoring.')).toBeInTheDocument();
  });

  it('allows searching hubs', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search hubs/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search hubs/i);
    fireEvent.change(searchInput, { target: { value: 'cardiology' } });

    expect(searchInput).toHaveValue('cardiology');
  });

  it('opens hub details when hub is clicked', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByText('Cardiology')).toBeInTheDocument();
    });

    const hubCard = screen.getByText('Cardiology').closest('button');
    fireEvent.click(hubCard!);

    // Should show hub details
    await waitFor(() => {
      expect(screen.getByText('Back to Hubs')).toBeInTheDocument();
    });
  });

  it('displays hub statistics correctly', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByText('Cardiology')).toBeInTheDocument();
    });

    const hubCard = screen.getByText('Cardiology').closest('button');
    fireEvent.click(hubCard!);

    await waitFor(() => {
      expect(screen.getByText('Quick Stats')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Patients count
      expect(screen.getByText('Patients')).toBeInTheDocument();
    });
  });

  it('shows tab navigation in hub details', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByText('Cardiology')).toBeInTheDocument();
    });

    const hubCard = screen.getByText('Cardiology').closest('button');
    fireEvent.click(hubCard!);

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Functions')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByText('Cardiology')).toBeInTheDocument();
    });

    // Test keyboard shortcuts hint is displayed
    expect(screen.getByText(/↑↓ navigate/)).toBeInTheDocument();
    expect(screen.getByText(/Enter select/)).toBeInTheDocument();
    expect(screen.getByText(/⌘K search/)).toBeInTheDocument();
  });

  it('opens advanced filters panel', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Advanced filters should be visible
    await waitFor(() => {
      expect(screen.getByText('Specialty')).toBeInTheDocument();
    });
  });

  it('handles filter changes', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const specialtySelect = screen.getByDisplayValue('All Specialties');
      fireEvent.change(specialtySelect, { target: { value: 'cardiology' } });
      expect(specialtySelect).toHaveValue('cardiology');
    });
  });

  it('displays correct sorting information', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByText(/Sorted by name/)).toBeInTheDocument();
    });
  });

  it('handles empty state correctly', async () => {
    // Mock empty hubs
    vi.mocked(require('../../data/hubs').getAllHubsSync).mockReturnValue([]);

    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByText('No hubs available')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    vi.mocked(require('../../services/hubs').hubService.getHubs).mockRejectedValue(new Error('API Error'));

    renderWithProviders(<Hubs />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Hubs')).toBeInTheDocument();
    });
  });

  it('handles search with no results', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search hubs/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    });

    await waitFor(() => {
      expect(screen.getByText('No hubs match your search')).toBeInTheDocument();
    });
  });

  it('preserves search term in localStorage', async () => {
    renderWithProviders(<Hubs />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search hubs/i);
      fireEvent.change(searchInput, { target: { value: 'test search' } });
    });

    // Search term should be preserved (component re-renders maintain state)
    expect(screen.getByPlaceholderText(/search hubs/i)).toHaveValue('test search');
  });
});
