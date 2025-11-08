import { useState } from "react";
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
          bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg
          border-r border-gray-200/60 dark:border-gray-700/60
          shadow-xl md:shadow-sm
          pt-5 md:pt-5 px-5 pb-5
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
          className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-lg md:text-xl font-bold text-gradient leading-tight">
            Bluequee2.0
          </h1>
        </div>

        {/* Navigation to Workspace (if patient selected) */}
        {selectedPatient && (
          <button
            onClick={onSelectPatient}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 mb-5 rounded-xl bg-gradient-to-r from-primary-50 to-success-50 dark:from-primary-900/20 dark:to-success-900/20 hover:from-primary-100 hover:to-success-100 dark:hover:from-primary-900/30 dark:hover:to-success-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium transition-all duration-200 border border-primary-200/60 dark:border-primary-800/60 hover:shadow-sm active:scale-[0.98] group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="flex-1 text-left">Back to Workspace</span>
          </button>
        )}

        {/* User Profile - At bottom */}
        <div className="mt-auto pt-5 border-t border-gray-200/40 dark:border-gray-700/40">
          <UserSelector />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:min-w-0 px-4 md:px-6 pb-4 md:pb-6 pt-4 md:pt-6 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header - Streamlined */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl md:text-2xl font-bold text-gradient">
                  Patient Directory
                </h2>
                {patients.length > 0 && (
                  <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                    {patients.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                <span>New Patient</span>
              </button>
            </div>
          </div>

          {/* Dashboard Analytics - Compact */}
          {patients.length > 0 && (
            <div className="mb-6">
              <PatientDirectoryAnalytics patients={patients} />
            </div>
          )}

          {/* Patient List or Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <PatientCardSkeleton count={6} />
            </div>
          ) : error || patients.length === 0 ? (
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

