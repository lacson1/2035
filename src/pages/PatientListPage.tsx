import { useState } from "react";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { Patient } from "../types";
import PatientList from "../components/PatientList";
import UserSelector from "../components/UserSelector";
import PatientDirectoryAnalytics from "../components/PatientDirectoryAnalytics";
import DashboardEmptyState from "../components/DashboardEmptyState";
import { PatientCardSkeleton } from "../components/SkeletonLoader";
import SimpleSearchPanel from "../components/SimpleSearchPanel";
import NewPatientForm from "../components/NewPatientForm";
import { logger } from "../utils/logger";

interface PatientListPageProps {
  onSelectPatient: () => void; // Callback when patient is selected
}

export default function PatientListPage({ onSelectPatient }: PatientListPageProps) {
  const { patients, selectedPatient, setSelectedPatient, refreshPatients, isLoading, error } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPatients();
    } catch (error) {
      logger.error("Failed to refresh patients:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    if (!patient || !patient.id) {
      logger.warn("Invalid patient selected:", patient);
      return;
    }
    setSelectedPatient(patient);
    onSelectPatient();
  };

  const handlePatientCreated = async (patient: Patient) => {
    await refreshPatients();
    setSelectedPatient(patient);
    onSelectPatient();
  };

  return (
    <div className="h-screen dark:bg-gray-900 flex overflow-hidden" style={{ margin: 0, padding: 0, marginTop: 0, paddingTop: 0, backgroundColor: '#f8fcff' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-6 left-6 z-50 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl hover:shadow-2xl transition-all duration-200"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-72 md:w-72 md:h-full
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
          border-r border-slate-200/60 dark:border-slate-700/60
          shadow-2xl md:shadow-lg
          pt-8 md:pt-8 px-6 pb-6
          transform transition-transform duration-300 ease-out
          overflow-y-auto overflow-x-hidden
          flex flex-col
          flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-6 right-6 p-2 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                Bluequee 2.0
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Healthcare Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation to Workspace (if patient selected) */}
        {selectedPatient && (
          <button
            onClick={onSelectPatient}
            className="w-full flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-sm font-medium transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md active:scale-[0.98] group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="flex-1 text-left">Return to Workspace</span>
          </button>
        )}

        {/* User Profile */}
        <div className="mt-auto pt-6 border-t border-slate-200/40 dark:border-slate-700/40">
          <UserSelector />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:min-w-0 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-800 dark:to-slate-900/30 min-h-screen">
        <div className="w-full max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                  Patient Directory
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Manage and search your patients
                </p>
              </div>

              <div className="flex items-center gap-2">
                {patients.length > 0 && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-lg px-3 py-1.5">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
                    <div className="text-base font-semibold text-slate-800 dark:text-slate-200">{patients.length}</div>
                  </div>
                )}

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh"
                >
                  <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                </button>

                <button
                  onClick={() => setShowNewPatientModal(true)}
                  className="p-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all"
                  title="Add Patient"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Search Panel */}
            {patients.length > 0 && !isLoading && (
              <SimpleSearchPanel
                patients={patients}
                onResultsChange={setFilteredPatients}
              />
            )}

            {/* Patient List */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PatientCardSkeleton count={6} />
                  </div>
                </div>
              ) : error || patients.length === 0 ? (
                <div className="p-12">
                  <DashboardEmptyState />
                </div>
              ) : (
                <div className="p-6">
                  <PatientList
                    patients={filteredPatients.length > 0 ? filteredPatients : patients}
                    selectedPatient={selectedPatient}
                    onSelectPatient={handleSelectPatient}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* New Patient Modal */}
      {showNewPatientModal && (
        <NewPatientForm
          onClose={() => setShowNewPatientModal(false)}
          onSuccess={handlePatientCreated}
        />
      )}
    </div>
  );
}

