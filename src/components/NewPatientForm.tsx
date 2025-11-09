import { useState, FormEvent } from "react";
import { X } from "lucide-react";
import { patientService } from "../services/patients";
import { useToast } from "../context/ToastContext";
import { logger } from "../utils/logger";
import { Patient } from "../types";

interface NewPatientFormProps {
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
}

export default function NewPatientForm({ onClose, onSuccess }: NewPatientFormProps) {
  const toast = useToast();
  const [isCreating, setIsCreating] = useState(false);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.dateOfBirth || !formData.gender) {
        toast.warning("Please fill in all required fields: Name, Date of Birth, and Gender");
        setIsCreating(false);
        return;
      }

      // Convert date to ISO string format
      const dobDate = new Date(formData.dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        toast.warning("Invalid date format. Please select a valid date.");
        setIsCreating(false);
        return;
      }

      // Prepare patient data
      const patientData: any = {
        name: formData.name.trim(),
        dateOfBirth: dobDate.toISOString(),
        gender: formData.gender,
      };

      // Add optional fields
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
      
      // Allergies (comma-separated to array)
      if (formData.allergies?.trim()) {
        const allergyMap = new Map<string, string>();
        formData.allergies.split(',').forEach(a => {
          const trimmed = a.trim();
          if (trimmed.length > 0) {
            const lowerKey = trimmed.toLowerCase();
            if (!allergyMap.has(lowerKey)) {
              allergyMap.set(lowerKey, trimmed);
            }
          }
        });
        patientData.allergies = Array.from(allergyMap.values());
      }

      const response = await patientService.createPatient(patientData);
      
      if (response.data) {
        toast.success(`Patient "${response.data.name}" created successfully!`);
        onSuccess(response.data);
        onClose();
      }
    } catch (error: any) {
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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
          <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Add New Patient</h4>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
            disabled={isCreating}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h5 className="text-base font-semibold mb-4 text-slate-700 dark:text-slate-300">Basic Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Patient name"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Preferred Language
                </label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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

          {/* Contact Information */}
          <div>
            <h5 className="text-base font-semibold mb-4 text-slate-700 dark:text-slate-300">Contact Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patient@example.com"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State ZIP"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h5 className="text-base font-semibold mb-4 text-slate-700 dark:text-slate-300">Medical Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Blood Pressure</label>
                <input
                  type="text"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                  placeholder="e.g., 120/80"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Condition</label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="e.g., Type 2 Diabetes"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Allergies</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g., Penicillin, Latex (comma-separated)"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Separate multiple allergies with commas</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h5 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Emergency Contact (Optional)</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="Contact name"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Relationship</label>
                <input
                  type="text"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                  placeholder="e.g., Spouse"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div>
            <h5 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Insurance (Optional)</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Provider</label>
                <input
                  type="text"
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                  placeholder="Insurance provider"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Policy Number</label>
                <input
                  type="text"
                  value={formData.insurancePolicyNumber}
                  onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                  placeholder="Policy number"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  disabled={isCreating}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

