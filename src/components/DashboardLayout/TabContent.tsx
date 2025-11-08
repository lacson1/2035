import { Suspense, lazy, useMemo, type LazyExoticComponent, type ComponentType } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useUser } from "../../context/UserContext";
import { dashboardTabs } from "../../config/dashboardTabs";
import { Appointment, ClinicalNote, Medication } from "../../types";
import LoadingSpinner from "../LoadingSpinner";
import { ErrorBoundary } from "../ErrorBoundary";
import { FallbackUI } from "../FallbackUI";

// Lazy load heavy components
const Consultation = lazy(() => import("../Consultation"));
const Settings = lazy(() => import("../Settings"));
const UserManagement = lazy(() => import("../UserManagement"));
const UserProfile = lazy(() => import("../UserProfile"));
const Telemedicine = lazy(() => import("../Telemedicine"));
const Longevity = lazy(() => import("../Longevity"));
const Microbiome = lazy(() => import("../Microbiome"));

// Static imports for components used in both static and dynamic contexts
import MedicationList from "../MedicationList";
import Overview from "../Overview";
import Vitals from "../Vitals";

// Map of lazy-loaded components
const lazyComponents: Record<string, LazyExoticComponent<ComponentType<any>>> = {
  consultation: Consultation,
  settings: Settings,
  users: UserManagement,
  profile: UserProfile,
  telemedicine: Telemedicine,
  longevity: Longevity,
  microbiome: Microbiome,
};

export default function TabContent() {
  const { activeTab, selectedPatient, addAppointment, addClinicalNote, updateMedications, addTimelineEvent } = useDashboard();
  const { currentUser } = useUser();

  const activeTabConfig = useMemo(
    () => dashboardTabs.find((tab) => tab.id === activeTab),
    [activeTab]
  );

  if (!activeTabConfig) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Tab not found
      </div>
    );
  }

  // Check if patient is required but not selected
  if (activeTabConfig.requiresPatient && !selectedPatient) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium mb-2">No Patient Selected</p>
        <p className="text-sm">Please select a patient to view this tab.</p>
      </div>
    );
  }

  // Prepare props based on component requirements
  const componentProps: any = {};
  
  if (selectedPatient) {
    componentProps.patient = selectedPatient;

    // Add handlers for components that need them
    if (activeTab === "appointments" || activeTab === "consultation") {
      componentProps.onAppointmentAdded = (appointment: Appointment) => {
        addAppointment(selectedPatient.id, appointment);
      };
    }

    if (activeTab === "consultation" || activeTab === "notes") {
      componentProps.onNoteAdded = (note: ClinicalNote) => {
        addClinicalNote(selectedPatient.id, note);
      };
      componentProps.onConsultationNoteAdded = (note: ClinicalNote) => {
        addClinicalNote(selectedPatient.id, note);
      };
    }

    if (activeTab === "medications") {
      componentProps.onMedicationUpdated = (medications: Medication[]) => {
        updateMedications(selectedPatient.id, medications);
      };
    }

    if (activeTab === "consultation") {
      componentProps.onConsultationScheduled = (appointment: Appointment) => {
        addAppointment(selectedPatient.id, appointment);
      };
    }

    if (activeTab === "telemedicine") {
      componentProps.onSessionScheduled = (session: any) => {
        addTimelineEvent(selectedPatient.id, {
          date: session.date,
          type: "appointment",
          title: `Telemedicine ${session.type} - ${session.provider}`,
          description: `Scheduled for ${session.date} at ${session.time}`,
          icon: "video",
        });
      };
      componentProps.onSessionUpdated = (session: any) => {
        addTimelineEvent(selectedPatient.id, {
          date: session.date,
          type: "appointment",
          title: `Telemedicine ${session.status} - ${session.provider}`,
          description: session.status === "completed" 
            ? `Completed - Duration: ${session.duration}`
            : `Status: ${session.status}`,
          icon: "video",
        });
      };
    }
  }

  // Check if this tab should use lazy loading
  const LazyComponent = lazyComponents[activeTab];
  const Component = activeTabConfig.component;
  const hasLazyComponent = activeTab in lazyComponents;

  // Special handling for user management (needs currentUser prop)
  if (activeTab === "users" && hasLazyComponent && LazyComponent) {
    return (
      <ErrorBoundary fallback={<FallbackUI title="Failed to load tab" />}>
        <Suspense fallback={<LoadingSpinner text="Loading..." fullScreen />}>
          <LazyComponent currentUser={currentUser} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Special handling for Settings (no props needed)
  if (activeTab === "settings" && hasLazyComponent && LazyComponent) {
    return (
      <ErrorBoundary fallback={<FallbackUI title="Failed to load settings" message="There was an error loading the settings page. Please refresh and try again." />}>
        <Suspense fallback={<LoadingSpinner text="Loading settings..." />}>
          <LazyComponent />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Render component with error boundary
  return (
    <ErrorBoundary fallback={<FallbackUI title="Failed to load tab content" />}>
      {hasLazyComponent && LazyComponent ? (
        <Suspense fallback={<LoadingSpinner text="Loading content..." />}>
          <LazyComponent {...componentProps} />
        </Suspense>
      ) : (
        <Component {...componentProps} />
      )}
    </ErrorBoundary>
  );
}

