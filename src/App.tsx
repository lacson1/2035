import { useState, useEffect } from "react";
import { useDashboard } from "./context/DashboardContext";
import { useAuth } from "./context/AuthContext";
import PatientListPage from "./pages/PatientListPage";
import WorkspacePage from "./pages/WorkspacePage";
import Login from "./components/Login";

type ViewMode = "patients" | "workspace";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("patients");
  const { selectedPatient: _selectedPatient } = useDashboard();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    setDarkMode(stored === "dark");
    
    // If a patient is selected, default to workspace view
    const storedView = localStorage.getItem("viewMode") as ViewMode | null;
    if (storedView && (storedView === "patients" || storedView === "workspace")) {
      setViewMode(storedView);
    }
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-700">Loading...</div>
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
