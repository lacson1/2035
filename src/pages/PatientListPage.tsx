import { useState, useMemo, useEffect } from "react";
import { Plus, RefreshCw, ArrowLeft, Search, Filter, X, Users, AlertTriangle, Calendar, Activity, TrendingUp, Heart, Clock, BarChart3, SlidersHorizontal } from "lucide-react";
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
import { getUpcomingAppointmentsCount } from "../utils/patientUtils";

interface PatientListPageProps {
  onSelectPatient: () => void; // Callback when patient is selected
}

export default function PatientListPage({ onSelectPatient }: PatientListPageProps) {
  const { patients, selectedPatient, setSelectedPatient, refreshPatients, isLoading, error } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
  const [sidebarRiskFilter, setSidebarRiskFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [showSidebarFilters, setShowSidebarFilters] = useState(false);

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

  // Calculate sidebar statistics
  const sidebarStats = useMemo(() => {
    const total = patients.length;
    const highRisk = patients.filter(p => p.risk >= 60).length;
    const mediumRisk = patients.filter(p => p.risk >= 40 && p.risk < 60).length;
    const lowRisk = patients.filter(p => p.risk < 40).length;
    const withAllergies = patients.filter(p => p.allergies && p.allergies.length > 0).length;
    const avgRisk = total > 0 ? Math.round(patients.reduce((sum, p) => sum + (p.risk || 0), 0) / total) : 0;
    const upcomingAppointments = patients.reduce((sum, p) => sum + getUpcomingAppointmentsCount(p), 0);
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentActivity = patients.filter(p => {
      if (!p.timeline || p.timeline.length === 0) return false;
      const mostRecent = p.timeline[0];
      return mostRecent && new Date(mostRecent.date).getTime() >= sevenDaysAgo;
    }).length;

    return {
      total,
      highRisk,
      mediumRisk,
      lowRisk,
      withAllergies,
      avgRisk,
      upcomingAppointments,
      recentActivity,
    };
  }, [patients]);

  // Get recent patients (last 5)
  const recentPatients = useMemo(() => {
    return [...patients]
      .sort((a, b) => {
        const aDate = a.timeline?.[0]?.date || a.createdAt || "";
        const bDate = b.timeline?.[0]?.date || b.createdAt || "";
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      })
      .slice(0, 5);
  }, [patients]);

  // Get unique conditions for filter
  const uniqueConditions = useMemo(() => {
    return Array.from(new Set(patients.map(p => p.condition).filter(Boolean))).sort();
  }, [patients]);

  // Apply sidebar filters to filtered patients
  useEffect(() => {
    if (patients.length === 0) {
      setFilteredPatients([]);
      return;
    }

    let filtered = [...patients];

    // Apply sidebar search query
    if (sidebarSearchQuery.trim()) {
      const query = sidebarSearchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.condition?.toLowerCase().includes(query) ||
        p.phone?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query)
      );
    }

    // Apply sidebar risk filter
    if (sidebarRiskFilter !== "all") {
      filtered = filtered.filter(p => {
        if (sidebarRiskFilter === "high") return p.risk >= 60;
        if (sidebarRiskFilter === "medium") return p.risk >= 40 && p.risk < 60;
        if (sidebarRiskFilter === "low") return p.risk < 40;
        return true;
      });
    }

    setFilteredPatients(filtered);
  }, [patients, sidebarSearchQuery, sidebarRiskFilter]);

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
            className="w-full flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 hover:from-teal-100 hover:to-blue-100 dark:hover:from-teal-900/40 dark:hover:to-blue-900/40 text-slate-700 dark:text-slate-300 text-sm font-medium transition-all duration-200 border border-teal-200/50 dark:border-teal-700/50 hover:shadow-md active:scale-[0.98] group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200 text-teal-600 dark:text-teal-400" />
            <span className="flex-1 text-left">Return to Workspace</span>
          </button>
        )}

        {/* Quick Stats */}
        {patients.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <BarChart3 size={14} />
                Quick Stats
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Total</span>
                </div>
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{sidebarStats.total}</div>
              </div>
              
              <div className="p-3 rounded-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 border border-red-200/50 dark:border-red-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-red-600 dark:text-red-400" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">High Risk</span>
                </div>
                <div className="text-lg font-bold text-red-700 dark:text-red-300">{sidebarStats.highRisk}</div>
              </div>
              
              <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200/50 dark:border-orange-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={14} className="text-orange-600 dark:text-orange-400" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Allergies</span>
                </div>
                <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{sidebarStats.withAllergies}</div>
              </div>
              
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 border border-green-200/50 dark:border-green-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-green-600 dark:text-green-400" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Upcoming</span>
                </div>
                <div className="text-lg font-bold text-green-700 dark:text-green-300">{sidebarStats.upcomingAppointments}</div>
              </div>
            </div>

            {/* Average Risk */}
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Avg Risk</span>
                </div>
                <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{sidebarStats.avgRisk}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6 space-y-2">
          <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
            <Activity size={14} />
            Quick Actions
          </h3>
          
          <button
            onClick={() => setShowNewPatientModal(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Add New Patient</span>
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh List"}</span>
          </button>
        </div>

        {/* Quick Search */}
        {patients.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <Search size={14} />
                Quick Search
              </h3>
              {sidebarSearchQuery && (
                <button
                  onClick={() => setSidebarSearchQuery("")}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={12} className="text-slate-500 dark:text-slate-400" />
                </button>
              )}
            </div>
            
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search patients..."
                value={sidebarSearchQuery}
                onChange={(e) => setSidebarSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Quick Filters */}
        {patients.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowSidebarFilters(!showSidebarFilters)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium transition-all duration-200 mb-3"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} />
                <span>Quick Filters</span>
              </div>
              <Filter size={14} className={showSidebarFilters ? "rotate-180" : ""} />
            </button>

            {showSidebarFilters && (
              <div className="space-y-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700">
                {/* Risk Level Filter */}
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                    Risk Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSidebarRiskFilter(sidebarRiskFilter === "high" ? "all" : "high")}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        sidebarRiskFilter === "high"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      High
                    </button>
                    <button
                      onClick={() => setSidebarRiskFilter(sidebarRiskFilter === "medium" ? "all" : "medium")}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        sidebarRiskFilter === "medium"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => setSidebarRiskFilter(sidebarRiskFilter === "low" ? "all" : "low")}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        sidebarRiskFilter === "low"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      Low
                    </button>
                    <button
                      onClick={() => setSidebarRiskFilter("all")}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        sidebarRiskFilter === "all"
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Patients */}
        {recentPatients.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
              <Clock size={14} />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {recentPatients.slice(0, 3).map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
                    selectedPatient?.id === patient.id
                      ? "bg-teal-50 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {patient.name}
                    </span>
                    {patient.risk >= 60 && (
                      <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      patient.risk >= 60
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : patient.risk >= 40
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    }`}>
                      {patient.risk || 0}% risk
                    </span>
                    {patient.condition && (
                      <span className="truncate">{patient.condition}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
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

