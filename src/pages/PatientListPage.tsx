import { useState, useMemo } from "react";
import { X, Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useToast } from "../context/ToastContext";
import { Patient } from "../types";
import PatientList from "../components/PatientList";
import UserSelector from "../components/UserSelector";
import { patientService } from "../services/patients";
import PatientDirectoryAnalytics from "../components/PatientDirectoryAnalytics";
import DashboardEmptyState from "../components/DashboardEmptyState";
import { PatientCardSkeleton } from "../components/SkeletonLoader";
import AdvancedSearchPanel from "../components/AdvancedSearchPanel";
import { SearchResult } from "../hooks/useAdvancedSearch";
import { logger } from "../utils/logger";

interface PatientListPageProps {
  onSelectPatient: () => void; // Callback when patient is selected
}

export default function PatientListPage({ onSelectPatient }: PatientListPageProps) {
  const { patients, selectedPatient, setSelectedPatient, refreshPatients, isLoading, error } = useDashboard();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<SearchResult[]>([]);
  const [searchPanelCollapsed, setSearchPanelCollapsed] = useState(false);

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
      logger.warn("Invalid patient selected:", patient);
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
        toast.warning("Please fill in all required fields: Name, Date of Birth, and Gender");
        setIsCreating(false);
        return;
      }

      // Convert date to ISO string format for backend
      const dobDate = new Date(formData.dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        toast.warning("Invalid date format. Please select a valid date.");
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
        
        // Show success message
        toast.success(`Patient "${response.data.name}" created successfully!`);
        
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

      logger.error("Failed to create patient:", error);
      
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden" style={{ margin: 0, padding: 0, marginTop: 0, paddingTop: 0 }}>
      {/* Professional Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-6 left-6 z-50 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
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

      {/* Professional Sidebar */}
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
          className="md:hidden absolute top-6 right-6 p-2 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        {/* Professional Header */}
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

        {/* User Profile - Professional Design */}
        <div className="mt-auto pt-6 border-t border-slate-200/40 dark:border-slate-700/40">
          <UserSelector />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:min-w-0 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-800 dark:to-slate-900/30 min-h-screen">
        <div className="w-full max-w-6xl mx-auto px-6 py-8">
          {/* Professional Header */}
          <div className="mb-8">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-3xl font-light text-slate-800 dark:text-slate-100 tracking-tight">
                    Patient Directory
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Comprehensive patient management and care coordination
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {patients.length > 0 && (
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-lg px-4 py-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Patients</div>
                      <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">{patients.length}</div>
                    </div>
                  )}

                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh patient list"
                  >
                    <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                  </button>

                  <button
                    onClick={() => setShowNewPatientModal(true)}
                    className="bg-slate-600 hover:bg-slate-700 text-white rounded-lg p-3 font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
                    title="Add Patient"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className="space-y-6">
            {/* Advanced Search Panel - Professional Design */}
            {patients.length > 0 && !isLoading && (
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-sm overflow-hidden">
                <AdvancedSearchPanel
                  patients={patients}
                  onResultsChange={setFilteredPatients}
                  isCollapsed={searchPanelCollapsed}
                  onToggleCollapse={() => setSearchPanelCollapsed(!searchPanelCollapsed)}
                />
              </div>
            )}

            {/* Patient List Container */}
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
                    patients={filteredPatients.length > 0 ? filteredPatients.map(r => r.patient) : patients}
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
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNewPatientModal(false);
            }
          }}
        >
          <div
            className="glass-strong rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-primary-200/30 dark:border-primary-700/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gradient">Add New Patient</h4>
              <button
                onClick={() => setShowNewPatientModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                disabled={isCreating}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePatient} className="p-6 space-y-5">
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
                      className="input-base px-4 py-3"
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
                      className="input-base px-4 py-3"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2.5">Gender *</label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="input-base px-4 py-3"
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
                      className="input-base px-4 py-3"
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
                      className="input-base px-4 py-3"
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
                      className="input-base px-4 py-3"
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
                      className="input-base px-4 py-3"
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
                      className="input-base px-4 py-3"
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
                      className="input-base px-4 py-3"
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
                      className="input-base px-3 py-2 text-sm"
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
                      className="input-base p-2 text-sm"
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
                      className="input-base p-2 text-sm"
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
                      className="input-base p-2 text-sm"
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
                      className="input-base p-2 text-sm"
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
                      className="input-base p-2 text-sm"
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-95"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

