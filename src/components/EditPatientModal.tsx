import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Patient } from "../types";
import { useDashboard } from "../context/DashboardContext";
import { useToast } from "../context/ToastContext";
import { patientService } from "../services/patients";

interface EditPatientModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditPatientModal({ patient, isOpen, onClose }: EditPatientModalProps) {
  const { updatePatient } = useDashboard();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: patient.name || "",
    dob: patient.dob || "",
    gender: patient.gender || "",
    phone: patient.phone || "",
    email: patient.email || "",
    address: patient.address || "",
    condition: patient.condition || "",
    bp: patient.bp || "",
    allergies: patient.allergies || [] as string[],
    emergencyContact: patient.emergencyContact || {
      name: "",
      relationship: "",
      phone: "",
    },
    insurance: patient.insurance || {
      provider: "",
      policyNumber: "",
      groupNumber: "",
    },
  });

  // Sync form data when patient changes
  useEffect(() => {
    if (isOpen) {
      setEditFormData({
        name: patient.name || "",
        dob: patient.dob || "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        condition: patient.condition || "",
        bp: patient.bp || "",
        allergies: patient.allergies || [],
        emergencyContact: patient.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
        },
        insurance: patient.insurance || {
          provider: "",
          policyNumber: "",
          groupNumber: "",
        },
      });
    }
  }, [patient, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Calculate age from DOB
      const dob = editFormData.dob ? new Date(editFormData.dob) : null;
      const age = dob ? Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : patient.age;

      // Update patient in context
      updatePatient(patient.id, (p) => ({
        ...p,
        name: editFormData.name,
        dob: editFormData.dob,
        age: age,
        gender: editFormData.gender,
        phone: editFormData.phone,
        email: editFormData.email,
        address: editFormData.address,
        condition: editFormData.condition,
        bp: editFormData.bp,
        allergies: editFormData.allergies,
        emergencyContact: editFormData.emergencyContact,
        insurance: editFormData.insurance,
      }));

      // Try to save to API if authenticated
      try {
        // Convert frontend format to backend format
        const updateData: any = {
          name: editFormData.name,
          gender: editFormData.gender,
          phone: editFormData.phone,
          email: editFormData.email,
          address: editFormData.address,
          condition: editFormData.condition,
          bloodPressure: editFormData.bp, // Backend uses bloodPressure, not bp
          allergies: editFormData.allergies,
          emergencyContact: editFormData.emergencyContact,
          insurance: editFormData.insurance,
        };

        // Add DOB if provided
        if (editFormData.dob) {
          updateData.dateOfBirth = editFormData.dob;
        }

        await patientService.updatePatient(patient.id, updateData);
        toast.success("Patient details updated successfully");
      } catch (apiError: any) {
        console.error("Failed to save patient to API:", apiError);
        toast.warning("Patient updated locally, but failed to save to server. Changes may be lost on refresh.");
      }

      onClose();
    } catch (error: any) {
      console.error("Error updating patient:", error);
      toast.error("Failed to update patient details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAllergyChange = (index: number, value: string) => {
    const newAllergies = [...editFormData.allergies];
    newAllergies[index] = value;
    setEditFormData({ ...editFormData, allergies: newAllergies });
  };

  const addAllergy = () => {
    setEditFormData({
      ...editFormData,
      allergies: [...editFormData.allergies, ""],
    });
  };

  const removeAllergy = (index: number) => {
    const newAllergies = editFormData.allergies.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, allergies: newAllergies });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Edit Patient Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={editFormData.dob}
                    onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender *
                  </label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Condition
                  </label>
                  <input
                    type="text"
                    value={editFormData.condition}
                    onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    value={editFormData.bp}
                    onChange={(e) => setEditFormData({ ...editFormData, bp: e.target.value })}
                    placeholder="e.g., 120/80"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <textarea
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Allergies
              </h3>
              <div className="space-y-2">
                {editFormData.allergies.map((allergy, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={allergy}
                      onChange={(e) => handleAllergyChange(index, e.target.value)}
                      placeholder="Allergy name"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeAllergy(index)}
                      className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addAllergy}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
                  type="button"
                >
                  + Add Allergy
                </button>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.emergencyContact.name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        emergencyContact: { ...editFormData.emergencyContact, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={editFormData.emergencyContact.relationship}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        emergencyContact: { ...editFormData.emergencyContact, relationship: e.target.value },
                      })
                    }
                    placeholder="e.g., Spouse, Parent"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editFormData.emergencyContact.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        emergencyContact: { ...editFormData.emergencyContact, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Insurance Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={editFormData.insurance.provider}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        insurance: { ...editFormData.insurance, provider: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.insurance.policyNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        insurance: { ...editFormData.insurance, policyNumber: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.insurance.groupNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        insurance: { ...editFormData.insurance, groupNumber: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !editFormData.name || !editFormData.dob || !editFormData.gender}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

