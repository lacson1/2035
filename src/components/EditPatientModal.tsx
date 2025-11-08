import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Patient } from "../types";
import { useDashboard } from "../context/DashboardContext";
import { useToast } from "../context/ToastContext";
import { patientService } from "../services/patients";
import SmartFormField from "./SmartFormField";
import FormGroup from "./FormGroup";

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
            <FormGroup
              title="Basic Information"
              description="Patient demographics and basic health information"
              collapsible
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SmartFormField
                  type="text"
                  name="name"
                  label="Full Name"
                  value={editFormData.name}
                  onChange={(value) => setEditFormData({ ...editFormData, name: value })}
                  required
                />
                <SmartFormField
                  type="date"
                  name="dob"
                  label="Date of Birth"
                  value={editFormData.dob}
                  onChange={(value) => setEditFormData({ ...editFormData, dob: value })}
                  required
                />
                <SmartFormField
                  type="select"
                  name="gender"
                  label="Gender"
                  value={editFormData.gender}
                  onChange={(value) => setEditFormData({ ...editFormData, gender: value })}
                  options={["Male", "Female", "Other", "Prefer not to say"]}
                  required
                />
                <SmartFormField
                  type="text"
                  name="condition"
                  label="Medical Condition"
                  value={editFormData.condition}
                  onChange={(value) => setEditFormData({ ...editFormData, condition: value })}
                />
                <SmartFormField
                  type="text"
                  name="bloodPressure"
                  label="Blood Pressure"
                  value={editFormData.bp}
                  onChange={(value) => setEditFormData({ ...editFormData, bp: value })}
                  placeholder="e.g., 120/80"
                />
              </div>
            </FormGroup>

            {/* Contact Information */}
            <FormGroup
              title="Contact Information"
              description="Patient contact details and address"
              collapsible
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SmartFormField
                  type="phone"
                  name="phone"
                  label="Phone Number"
                  value={editFormData.phone}
                  onChange={(value) => setEditFormData({ ...editFormData, phone: value })}
                />
                <SmartFormField
                  type="email"
                  name="email"
                  label="Email Address"
                  value={editFormData.email}
                  onChange={(value) => setEditFormData({ ...editFormData, email: value })}
                />
                <div className="md:col-span-2">
                  <SmartFormField
                    type="textarea"
                    name="address"
                    label="Address"
                    value={editFormData.address}
                    onChange={(value) => setEditFormData({ ...editFormData, address: value })}
                    rows={2}
                  />
                </div>
              </div>
            </FormGroup>

            {/* Allergies */}
            <FormGroup
              title="Allergies"
              description="Known allergies and sensitivities"
              collapsible
            >
              <div className="space-y-3">
                {editFormData.allergies.map((allergy, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <SmartFormField
                        type="text"
                        name={`allergy-${index}`}
                        label={index === 0 ? "Allergy" : undefined}
                        value={allergy}
                        onChange={(value) => handleAllergyChange(index, value)}
                        placeholder="e.g., Penicillin, Peanuts"
                      />
                    </div>
                    <button
                      onClick={() => removeAllergy(index)}
                      className="px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mb-1"
                      type="button"
                      aria-label="Remove allergy"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addAllergy}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                  type="button"
                >
                  + Add Allergy
                </button>
              </div>
            </FormGroup>

            {/* Emergency Contact */}
            <FormGroup
              title="Emergency Contact"
              description="Person to contact in case of emergency"
              collapsible
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SmartFormField
                  type="text"
                  name="emergencyName"
                  label="Name"
                  value={editFormData.emergencyContact.name}
                  onChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      emergencyContact: { ...editFormData.emergencyContact, name: value },
                    })
                  }
                />
                <SmartFormField
                  type="text"
                  name="emergencyRelationship"
                  label="Relationship"
                  value={editFormData.emergencyContact.relationship}
                  onChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      emergencyContact: { ...editFormData.emergencyContact, relationship: value },
                    })
                  }
                  placeholder="e.g., Spouse, Parent, Child"
                />
                <SmartFormField
                  type="phone"
                  name="emergencyPhone"
                  label="Phone"
                  value={editFormData.emergencyContact.phone}
                  onChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      emergencyContact: { ...editFormData.emergencyContact, phone: value },
                    })
                  }
                />
              </div>
            </FormGroup>

            {/* Insurance */}
            <FormGroup
              title="Insurance Information"
              description="Health insurance details"
              collapsible
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SmartFormField
                  type="text"
                  name="insuranceProvider"
                  label="Provider"
                  value={editFormData.insurance.provider}
                  onChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      insurance: { ...editFormData.insurance, provider: value },
                    })
                  }
                  placeholder="e.g., Blue Cross Blue Shield"
                />
                <SmartFormField
                  type="text"
                  name="policyNumber"
                  label="Policy Number"
                  value={editFormData.insurance.policyNumber}
                  onChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      insurance: { ...editFormData.insurance, policyNumber: value },
                    })
                  }
                />
                <SmartFormField
                  type="text"
                  name="groupNumber"
                  label="Group Number"
                  value={editFormData.insurance.groupNumber}
                  onChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      insurance: { ...editFormData.insurance, groupNumber: value },
                    })
                  }
                />
              </div>
            </FormGroup>
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

