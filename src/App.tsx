import { useState, useEffect } from "react";
import { useDashboard } from "./context/DashboardContext";
import { useAuth } from "./context/AuthContext";
import PatientListPage from "./pages/PatientListPage";
import WorkspacePage from "./pages/WorkspacePage";
import Login from "./components/Login";
import { initializeHubs } from "./data/hubs";
import { usePerformanceMonitor } from "./hooks/usePerformanceMonitor";

type ViewMode = "patients" | "workspace";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("patients");
  const { selectedPatient: _selectedPatient } = useDashboard();
  const { isAuthenticated, isLoading } = useAuth();

  // Performance monitoring
  usePerformanceMonitor();

  // Initialize hubs when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeHubs().catch(err => {
        console.warn('Failed to initialize hubs:', err);
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    setDarkMode(stored === "dark");
    
    // Only restore view mode if authenticated, otherwise default to patients
    if (isAuthenticated) {
      const storedView = localStorage.getItem("viewMode") as ViewMode | null;
      if (storedView && (storedView === "patients" || storedView === "workspace")) {
        setViewMode(storedView);
      }
    } else {
      // Reset to patients view when not authenticated
      setViewMode("patients");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  // Auto-switch to workspace when patient is selected (only when coming from patient list selection)
  // Removed auto-switch to allow manual navigation to patient list even when patient is selected

  const handleNavigateToWorkspace = () => {
    setViewMode("workspace");
  };

  const handleNavigateToPatients = () => {
    setViewMode("patients");
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50 dark:bg-primary-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <div className="text-gray-700 dark:text-gray-300">Loading application...</div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Main app content
  return (
    <>
      {viewMode === "patients" ? (
        <PatientListPage onSelectPatient={handleNavigateToWorkspace} />
      ) : (
        <WorkspacePage 
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onNavigateToPatients={handleNavigateToPatients}
        />
      )}
    </>
  );
}

export default App;
