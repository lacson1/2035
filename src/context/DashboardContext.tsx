import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Patient, Appointment, ClinicalNote, Medication } from "../types";
import { patientService } from "../services/patients";
import { useAuth } from "./AuthContext";
import { logger } from "../utils/logger";

interface DashboardContextType {
  patients: Patient[];
  selectedPatient: Patient;
  activeTab: string;
  isLoading: boolean;
  error: string | null;
  shouldEditPatient: boolean;
  setSelectedPatient: (patient: Patient) => void;
  setActiveTab: (tab: string) => void;
  setShouldEditPatient: (shouldEdit: boolean) => void;
  updatePatient: (patientId: string, updater: (patient: Patient) => Patient) => void;
  addAppointment: (patientId: string, appointment: Appointment) => void;
  addClinicalNote: (patientId: string, note: ClinicalNote) => void;
  updateMedications: (patientId: string, medications: Medication[]) => void;
  addTimelineEvent: (patientId: string, event: {
    date: string;
    type: "appointment" | "note" | "medication" | "imaging" | "lab" | "referral" | "consent" | "surgery" | "nutrition" | "vaccination";
    title: string;
    description: string;
    icon: string;
  }) => void;
  refreshPatients: () => Promise<void>;
  nextPatient: () => void;
  previousPatient: () => void;
  getCurrentPatientIndex: () => number;
  getTotalPatients: () => number;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatientState] = useState<Patient>({} as Patient);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldEditPatient, setShouldEditPatient] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load patients from API when authenticated
  const loadPatients = useCallback(async () => {
    if (!isAuthenticated) {
      // Not authenticated, clear data
      setPatients([]);
      setSelectedPatientState({} as Patient);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Load from API
      const response = await patientService.getPatients({ page: 1, limit: 100 });
      
      // Debug logging in development
      logger.debug('Patients API response:', response);
      
      if (response.data?.patients && response.data.patients.length > 0) {
        setPatients(response.data.patients);
        if (!selectedPatient?.id || !response.data.patients.find((p: Patient) => p.id === selectedPatient.id)) {
          setSelectedPatientState(response.data.patients[0]);
        }
        setError(null);
      } else {
        // API returned empty - no patients available
        setPatients([]);
        setSelectedPatientState({} as Patient);
        setError('No patients found in database. Please ensure the backend is running and seeded with data.');
      }
    } catch (error: any) {
      // API failed - show error message
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      logger.error('Failed to load patients from API:', error);
      
      // More specific error messages
      if (error?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error?.status === 403) {
        setError('Access denied. You do not have permission to view patients.');
      } else if (error?.status === 404) {
        setError('API endpoint not found. Please check if the backend server is running.');
      } else if (error?.status === 500) {
        setError('Server error. Please check the backend logs.');
      } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        setError('Cannot connect to API server. Please ensure the backend is running at http://localhost:3000');
      } else {
        setError(`Failed to load patients: ${errorMessage}`);
      }
      
      setPatients([]);
      setSelectedPatientState({} as Patient);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedPatient?.id]);

  // Load patients when authenticated state changes
  useEffect(() => {
    loadPatients();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync selectedPatient when patients list changes
  useEffect(() => {
    if (selectedPatient?.id) {
      const updatedPatient = patients.find((p) => p.id === selectedPatient.id);
      if (updatedPatient && updatedPatient !== selectedPatient) {
        setSelectedPatientState(updatedPatient);
      }
    }
    // Removed auto-selection of first patient - let user choose explicitly
    // This prevents unexpected navigation when patient list loads
  }, [patients, selectedPatient]);

  // Update patient in the list
  const updatePatient = useCallback((patientId: string, updater: (patient: Patient) => Patient) => {
    setPatients((prevPatients) => {
      return prevPatients.map((p) => 
        p.id === patientId ? updater(p) : p
      );
    });
  }, []);

  const setSelectedPatient = useCallback((patient: Patient) => {
    // Find the latest version from patients list
    const latestPatient = patients.find((p) => p.id === patient.id) || patient;
    setSelectedPatientState(latestPatient);
    
    // If currently on a non-patient tab (settings, users, profile), switch back to overview
    if (activeTab === "settings" || activeTab === "users" || activeTab === "profile") {
      setActiveTab("overview");
    }
  }, [patients, activeTab]);

  const addTimelineEventRef = useCallback((patientId: string, event: {
    date: string;
    type: "appointment" | "note" | "medication" | "imaging" | "lab" | "referral" | "consent" | "surgery" | "nutrition" | "vaccination";
    title: string;
    description: string;
    icon: string;
  }) => {
    const eventId = `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setPatients((prevPatients) => {
      return prevPatients.map((p) => 
        p.id === patientId
          ? {
              ...p,
              timeline: [
                {
                  id: eventId,
                  ...event,
                },
                ...(p.timeline || []),
              ],
            }
          : p
      );
    });
  }, []);

  const addAppointment = useCallback((patientId: string, appointment: Appointment) => {
    updatePatient(patientId, (patient) => {
      const updated = {
        ...patient,
        appointments: [...(patient.appointments || []), appointment],
      };
      // Add timeline event as part of the update
      const eventId = `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      updated.timeline = [
        {
          id: eventId,
          date: appointment.date,
          type: "appointment" as const,
          title: `${appointment.type} - ${appointment.provider}`,
          description: `Scheduled for ${appointment.date} at ${appointment.time}`,
          icon: "calendar",
        },
        ...(patient.timeline || []),
      ];
      return updated;
    });
  }, [updatePatient]);

  const addClinicalNote = useCallback((patientId: string, note: ClinicalNote) => {
    updatePatient(patientId, (patient) => {
      const updated = {
        ...patient,
        clinicalNotes: [...(patient.clinicalNotes || []), note],
      };
      // Add timeline event as part of the update
      const eventId = `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      updated.timeline = [
        {
          id: eventId,
          date: note.date,
          type: "note" as const,
          title: note.title,
          description: `Clinical note by ${note.author}`,
          icon: "file-text",
        },
        ...(patient.timeline || []),
      ];
      return updated;
    });
  }, [updatePatient]);

  const updateMedications = useCallback((patientId: string, medications: Medication[]) => {
    updatePatient(patientId, (patient) => {
      const updated = {
        ...patient,
        medications,
      };
      // Add timeline event as part of the update
      const eventId = `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      updated.timeline = [
        {
          id: eventId,
          date: new Date().toISOString().split("T")[0],
          type: "medication" as const,
          title: "Medication updated",
          description: "Medication list has been modified",
          icon: "pill",
        },
        ...(patient.timeline || []),
      ];
      return updated;
    });
  }, [updatePatient]);

  const refreshPatients = useCallback(async () => {
    await loadPatients();
  }, [loadPatients]);

  // Get current patient index in the patients array
  const getCurrentPatientIndex = useCallback(() => {
    if (!selectedPatient?.id || patients.length === 0) return -1;
    return patients.findIndex((p) => p.id === selectedPatient.id);
  }, [selectedPatient, patients]);

  // Get total number of patients
  const getTotalPatients = useCallback(() => {
    return patients.length;
  }, [patients]);

  // Navigate to next patient
  const nextPatient = useCallback(() => {
    const currentIndex = getCurrentPatientIndex();
    if (currentIndex === -1 || patients.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % patients.length;
    setSelectedPatientState(patients[nextIndex]);
  }, [getCurrentPatientIndex, patients]);

  // Navigate to previous patient
  const previousPatient = useCallback(() => {
    const currentIndex = getCurrentPatientIndex();
    if (currentIndex === -1 || patients.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? patients.length - 1 : currentIndex - 1;
    setSelectedPatientState(patients[prevIndex]);
  }, [getCurrentPatientIndex, patients]);

  return (
        <DashboardContext.Provider
          value={{
            patients,
            selectedPatient,
            activeTab,
            isLoading,
            error,
            shouldEditPatient,
            setSelectedPatient,
            setActiveTab,
            setShouldEditPatient,
            updatePatient,
            addAppointment,
            addClinicalNote,
            updateMedications,
            addTimelineEvent: addTimelineEventRef,
            refreshPatients,
            nextPatient,
            previousPatient,
            getCurrentPatientIndex,
            getTotalPatients,
          }}
        >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
