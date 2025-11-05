import { useState, useMemo } from "react";
import { X, Plus, RefreshCw, ArrowLeft, Users, AlertTriangle, TrendingUp, Activity, LayoutDashboard } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { Patient } from "../types";
import PatientList from "../components/PatientList";
import UserSelector from "../components/UserSelector";
import { patientService } from "../services/patients";
import PatientDirectoryAnalytics from "../components/PatientDirectoryAnalytics";
import DashboardEmptyState from "../components/DashboardEmptyState";

interface PatientListPageProps {
  onSelectPatient: () => void; // Callback when patient is selected
}

export default function PatientListPage({ onSelectPatient }: PatientListPageProps) {
  const { patients, selectedPatient, setSelectedPatient, refreshPatients, isLoading, error } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPatients();
    } catch (error) {
      console.error("Failed to refresh patients:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    bloodPressure: "",
    condition: "",
    email: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    preferredLanguage: "English",
    allergies: "",
  });

  const handleSelectPatient = (patient: Patient) => {
    if (!patient || !patient.id) {
      if (import.meta.env.DEV) {
        console.error("Invalid patient selected:", patient);
      }
      return;
    }
    setSelectedPatient(patient);
    onSelectPatient(); // Navigate to workspace
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.dateOfBirth || !formData.gender) {
        alert("Please fill in all required fields: Name, Date of Birth, and Gender");
        setIsCreating(false);
        return;
      }

      // Convert date to ISO string format for backend
      const dobDate = new Date(formData.dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        alert("Invalid date format. Please select a valid date.");
        setIsCreating(false);
        return;
      }

      // Prepare patient data for backend (backend expects dateOfBirth as ISO string, bloodPressure, not age/bp)
      const patientData: any = {
        name: formData.name.trim(),
        dateOfBirth: dobDate.toISOString(), // Convert to ISO string for backend
        gender: formData.gender,
      };

      // Add optional fields only if they have values
      if (formData.bloodPressure?.trim()) {
        patientData.bloodPressure = formData.bloodPressure.trim();
      }
      if (formData.condition?.trim()) {
        patientData.condition = formData.condition.trim();
      }
      if (formData.email?.trim()) {
        patientData.email = formData.email.trim();
      }
      if (formData.phone?.trim()) {
        patientData.phone = formData.phone.trim();
      }
      if (formData.address?.trim()) {
        patientData.address = formData.address.trim();
      }
      if (formData.preferredLanguage?.trim()) {
        patientData.preferredLanguage = formData.preferredLanguage.trim();
      }
      
      // Emergency contact
      if (formData.emergencyContactName?.trim() || formData.emergencyContactPhone?.trim()) {
        patientData.emergencyContact = {
          name: formData.emergencyContactName.trim() || "",
          relationship: formData.emergencyContactRelationship.trim() || "",
          phone: formData.emergencyContactPhone.trim() || "",
        };
      }
      
      // Insurance
      if (formData.insuranceProvider?.trim() || formData.insurancePolicyNumber?.trim()) {
        patientData.insurance = {
          provider: formData.insuranceProvider.trim() || "",
          policyNumber: formData.insurancePolicyNumber.trim() || "",
        };
      }
      
      // Allergies (comma-separated string to array, remove duplicates)
      if (formData.allergies?.trim()) {
        const allergyMap = new Map<string, string>();
        formData.allergies.split(',').forEach(a => {
          const trimmed = a.trim();
          if (trimmed.length > 0) {
            const lowerKey = trimmed.toLowerCase();
            // Keep first occurrence, preserving original case
            if (!allergyMap.has(lowerKey)) {
              allergyMap.set(lowerKey, trimmed);
            }
          }
        });
        patientData.allergies = Array.from(allergyMap.values());
      }

      const response = await patientService.createPatient(patientData);
      
      if (response.data) {
        // Refresh patient list
        await refreshPatients();
        
        // Select the new patient and navigate to workspace
        setSelectedPatient(response.data);
        onSelectPatient();
        
        // Reset form and close modal
        setFormData({
          name: "",
          dateOfBirth: "",
          gender: "",
          bloodPressure: "",
          condition: "",
          email: "",
          phone: "",
          address: "",
          emergencyContactName: "",
          emergencyContactRelationship: "",
          emergencyContactPhone: "",
          insuranceProvider: "",
          insurancePolicyNumber: "",
          preferredLanguage: "English",
          allergies: "",
        });
        setShowNewPatientModal(false);
      }
    } catch (error: any) {
      // Better error handling
      let errorMessage = "Failed to create patient. Please try again.";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errors && typeof error.errors === 'object') {
        const firstError = Object.values(error.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0] as string;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      if (import.meta.env.DEV) {
        console.error("Failed to create patient:", error);
      }
      
      alert(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden" style={{ margin: 0, padding: 0, marginTop: 0, paddingTop: 0 }}>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-2.5 left-2.5 z-50 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          w-64 md:w-64 md:h-full
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
          border-r border-gray-200/50 dark:border-gray-700/50
          shadow-xl md:shadow-none
          pt-3 md:pt-3 px-3 pb-3
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          flex flex-col
          flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-2.5 mb-5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight m-0">
              Bluequee2.0
            </h1>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg shadow-sm w-fit">
            Bluequee 2.0
          </span>
        </div>

        {/* Navigation to Workspace (if patient selected) */}
        {selectedPatient && (
          <button
            onClick={onSelectPatient}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium transition-all duration-200 border border-blue-200 dark:border-blue-800 hover:shadow-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="flex-1 text-left">Back to Workspace</span>
          </button>
        )}

        {/* Patient Statistics */}
        {(() => {
          const stats = useMemo(() => {
            const total = patients.length;
            const highRisk = patients.filter(p => p.risk >= 60).length;
            const mediumRisk = patients.filter(p => p.risk >= 40 && p.risk < 60).length;
            const lowRisk = patients.filter(p => p.risk < 40).length;
            const uniqueConditions = new Set(patients.map(p => p.condition).filter(Boolean)).size;
            
            return { total, highRisk, mediumRisk, lowRisk, uniqueConditions };
          }, [patients]);

          return (
            <div className="mb-5 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-gray-600 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Statistics</h3>
              </div>
              
              {/* Total Patients */}
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Total Patients</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{stats.total}</span>
                </div>
              </div>

              {/* Risk Distribution */}
              {stats.total > 0 && (
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-red-600 dark:text-red-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">High Risk</span>
                      </div>
                      <span className="text-xs font-semibold text-red-700 dark:text-red-300">{stats.highRisk}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">Medium Risk</span>
                      </div>
                      <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">{stats.mediumRisk}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Activity size={14} className="text-green-600 dark:text-green-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">Low Risk</span>
                      </div>
                      <span className="text-xs font-semibold text-green-700 dark:text-green-300">{stats.lowRisk}</span>
                    </div>
                  </div>
                  {stats.uniqueConditions > 0 && (
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-700 dark:text-gray-300">Conditions</span>
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{stats.uniqueConditions}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Quick Actions */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard size={16} className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Actions</h3>
          </div>
          
          <button
            onClick={() => {
              setShowNewPatientModal(true);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus size={16} />
            <span>New Patient</span>
          </button>
          
          <button
            onClick={() => {
              handleRefresh();
              setSidebarOpen(false);
            }}
            disabled={isRefreshing}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* User Profile - Moved to bottom */}
        <div className="mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <UserSelector />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:min-w-0 px-3 md:px-4 pb-3 md:pb-4 pt-3 md:pt-3 overflow-y-auto">
        <div className="w-full">
          {/* Header */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap items-baseline">
                <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent leading-tight m-0">
                  Patient Directory
                </h2>
                {patients.length > 0 && (
                  <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                    {patients.length} {patients.length === 1 ? 'patient' : 'patients'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
                Select a patient to view their medical information and care plan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh patient list"
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setShowNewPatientModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
              >
                <Plus size={18} />
                <span>New Patient</span>
              </button>
            </div>
          </div>

          {/* Dashboard Analytics */}
          {patients.length > 0 && <PatientDirectoryAnalytics patients={patients} />}

          {/* Patient List or Empty State */}
          {isLoading || error || patients.length === 0 ? (
            <DashboardEmptyState />
          ) : (
            <PatientList
              patients={patients}
              selectedPatient={selectedPatient}
              onSelectPatient={handleSelectPatient}
            />
          )}
        </div>
      </main>

      {/* New Patient Modal */}
      {showNewPatientModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNewPatientModal(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Add New Patient</h4>
              <button
                onClick={() => setShowNewPatientModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                disabled={isCreating}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePatient} className="space-y-6">
              {/* Basic Information Section */}
              <div>
                <h5 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-300">Basic Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-base font-medium mb-2.5">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Patient name"
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2.5">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2.5">Gender *</label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCreating}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2.5">Preferred Language</label>
                    <select
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCreating}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h5 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-300">Contact Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-base font-medium mb-2.5">Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="patient@example.com"
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium mb-2.5">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St, City, State ZIP"
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div>
                <h5 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-300">Medical Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-base font-medium mb-2.5">Blood Pressure</label>
                    <input
                      type="text"
                      value={formData.bloodPressure}
                      onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                      placeholder="e.g., 120/80"
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2.5">Condition</label>
                    <input
                      type="text"
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      placeholder="e.g., Type 2 Diabetes"
                      className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">Allergies</label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      placeholder="e.g., Penicillin, Latex (comma-separated)"
                      className="w-full px-3 py-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCreating}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple allergies with commas</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div>
                <h5 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Emergency Contact</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      placeholder="Emergency contact name"
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                      placeholder="e.g., Spouse, Parent"
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Information Section */}
              <div>
                <h5 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Insurance Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Provider</label>
                    <input
                      type="text"
                      value={formData.insuranceProvider}
                      onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                      placeholder="Insurance provider name"
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Policy Number</label>
                    <input
                      type="text"
                      value={formData.insurancePolicyNumber}
                      onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                      placeholder="Policy number"
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

