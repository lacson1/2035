import { useMemo, memo, useState, useEffect } from "react";
import { 
  Activity, 
  Calendar, 
  Pill, 
  FileText, 
  Scan, 
  TrendingUp, 
  Clock,
  Phone,
  Mail,
  MapPin,
  Heart,
  Users,
  Dna,
  GitBranch,
  Edit2,
  Save,
  Copy,
  Check,
  MessageSquare
} from "lucide-react";
import { Patient } from "../types";
import QuickActions from "./QuickActions";
import OverviewSummaryCards from "./OverviewSummaryCards";
import { useDashboard } from "../context/DashboardContext";
import { getActiveMedications, getUpcomingAppointments, sortByDateDesc } from "../utils/patientUtils";
import { patientService } from "../services/patients";

interface OverviewProps {
  patient: Patient;
}

function Overview({ patient }: OverviewProps) {
  const { setActiveTab, updatePatient } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
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

  const handleQuickAction = (action: string) => {
    setActiveTab(action);
  };

  const handleEdit = () => {
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
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

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
        await patientService.updatePatient(patient.id, {
          name: editFormData.name,
          dob: editFormData.dob,
          gender: editFormData.gender,
          phone: editFormData.phone,
          email: editFormData.email,
          address: editFormData.address,
          condition: editFormData.condition,
          bp: editFormData.bp,
          allergies: editFormData.allergies,
          emergencyContact: editFormData.emergencyContact,
          insurance: editFormData.insurance,
        });
      } catch (apiError) {
        // API save failed, but continue with local update
        if (import.meta.env.DEV) {
          console.warn('Failed to save patient to API, using local update only:', apiError);
        }
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Failed to save patient details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Sync form data when patient changes
  useEffect(() => {
    if (!isEditing) {
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
  }, [patient.id, patient.name, patient.dob, patient.gender, patient.phone, patient.email, patient.address, patient.condition, patient.bp, patient.allergies, patient.emergencyContact, patient.insurance, isEditing]);

  const upcomingAppointments = useMemo(() => {
    const appointments = getUpcomingAppointments(patient);
    return appointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [patient]);

  const recentNotes = useMemo(() =>
    sortByDateDesc(patient.clinicalNotes || []).slice(0, 3),
    [patient.clinicalNotes]
  );

  const activeMedications = useMemo(() =>
    getActiveMedications(patient),
    [patient]
  );

  const recentImaging = useMemo(() =>
    sortByDateDesc(patient.imagingStudies || []).slice(0, 2),
    [patient.imagingStudies]
  );

  const recentTimeline = useMemo(() => {
    const timeline = patient.timeline || [];
    return [...timeline]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [patient.timeline]);


  return (
    <div className="section-spacing">
      {/* Key Metrics - Improved Spacing and Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="card hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-sans mb-1">Active Medications</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400 font-sans">
                {activeMedications.length}
              </p>
            </div>
            <Pill className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 font-sans">
            {activeMedications.length > 0 ? activeMedications[0].name.split(' ')[0] : "None"} and {activeMedications.length > 1 ? `${activeMedications.length - 1} more` : "others"}
          </p>
        </div>

        <div className="card hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-sans mb-1">Upcoming Appointments</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-400 font-sans">
                {upcomingAppointments.length}
              </p>
            </div>
            <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          {upcomingAppointments.length > 0 && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 font-sans">
              Next: {new Date(upcomingAppointments[0].date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="card hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-sans mb-1">Blood Pressure</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-400 font-sans">
                {patient.bp}
              </p>
            </div>
            <TrendingUp className="text-orange-600 dark:text-orange-400" size={24} />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 font-sans">
            {parseInt(patient.bp.split('/')[0]) >= 140 ? "Elevated" : "Normal"}
          </p>
        </div>
      </div>

      {/* Patient Info & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Patient Information */}
        <div className="card border-2 border-gray-300/40 dark:border-gray-600/40 shadow-md ring-1 ring-gray-200/30 dark:ring-gray-700/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 font-sans">
              <Activity size={20} className="text-blue-600 dark:text-blue-400" />
              Patient Information
            </h3>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="btn-secondary flex items-center gap-1.5 text-sm"
                title="Edit patient details"
              >
                <Edit2 size={16} />
                Edit
              </button>
            )}
          </div>
          
          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium mb-2.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editFormData.dob}
                    onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                    className="input-base text-sm"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="input-base text-sm"
                  >
                    <option value="">Select gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 120/80"
                    value={editFormData.bp}
                    onChange={(e) => setEditFormData({ ...editFormData, bp: e.target.value })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">
                    Primary Condition
                  </label>
                  <input
                    type="text"
                    value={editFormData.condition}
                    onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })}
                    placeholder="e.g., T2D, Hypertension"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="(123) 456-7890"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="patient@email.com"
                    className="input-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Address
                </label>
                <textarea
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="Street address, City, State ZIP"
                  rows={3}
                  className="input-base resize-none"
                />
              </div>

              {/* Emergency Contact */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.emergencyContact.name}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        emergencyContact: { ...editFormData.emergencyContact, name: e.target.value }
                      })}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={editFormData.emergencyContact.relationship}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        emergencyContact: { ...editFormData.emergencyContact, relationship: e.target.value }
                      })}
                      placeholder="e.g., Spouse, Parent"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.emergencyContact.phone}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        emergencyContact: { ...editFormData.emergencyContact, phone: e.target.value }
                      })}
                      placeholder="(123) 456-7890"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Insurance Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Provider
                    </label>
                    <input
                      type="text"
                      value={editFormData.insurance.provider}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        insurance: { ...editFormData.insurance, provider: e.target.value }
                      })}
                      placeholder="Insurance company name"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Policy Number
                    </label>
                    <input
                      type="text"
                      value={editFormData.insurance.policyNumber}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        insurance: { ...editFormData.insurance, policyNumber: e.target.value }
                      })}
                      placeholder="Policy number"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Group Number
                    </label>
                    <input
                      type="text"
                      value={editFormData.insurance.groupNumber}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        insurance: { ...editFormData.insurance, groupNumber: e.target.value }
                      })}
                      placeholder="Group number (optional)"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save size={16} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 font-sans">Age</span>
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100 font-sans">{patient.age} years</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 font-sans">Gender</span>
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100 font-sans">{patient.gender}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 font-sans">Primary Condition</span>
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100 font-sans">{patient.condition}</span>
              </div>
              {patient.dob && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 font-sans">Date of Birth</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-gray-100 font-sans">{new Date(patient.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                </div>
              )}
              {patient.phone && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 group">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 font-sans">
                    <Phone size={16} className="text-gray-400 dark:text-gray-500" /> Phone
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100 font-sans">
                      {patient.phone}
                    </span>
                    <a
                      href={`tel:${patient.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                      title={`Call ${patient.phone}`}
                    >
                      <Phone size={14} />
                      Call
                    </a>
                    <a
                      href={`sms:${patient.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                      title={`Message ${patient.phone}`}
                    >
                      <MessageSquare size={14} />
                      Message
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigator.clipboard.writeText(patient.phone || '').then(() => {
                          setCopiedField('phone');
                          setTimeout(() => setCopiedField(null), 2000);
                        });
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title="Copy phone number"
                      aria-label="Copy phone number"
                    >
                      {copiedField === 'phone' ? (
                        <Check size={14} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy size={14} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              {patient.email && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 group">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 font-sans">
                    <Mail size={16} className="text-gray-400 dark:text-gray-500" /> Email
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100 font-sans truncate max-w-[180px] text-right">
                      {patient.email}
                    </span>
                    <a
                      href={`mailto:${patient.email}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium flex-shrink-0"
                      title={`Email ${patient.email}`}
                    >
                      <Mail size={14} />
                      Email
                    </a>
                    <a
                      href={`mailto:${patient.email}?subject=Message from Bluequee2.0`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium flex-shrink-0"
                      title={`Send message to ${patient.email}`}
                    >
                      <MessageSquare size={14} />
                      Message
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigator.clipboard.writeText(patient.email || '').then(() => {
                          setCopiedField('email');
                          setTimeout(() => setCopiedField(null), 2000);
                        });
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
                      title="Copy email address"
                      aria-label="Copy email address"
                    >
                      {copiedField === 'email' ? (
                        <Check size={14} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy size={14} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              {patient.address && (
                <div className="flex justify-between items-start py-3 group">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 font-sans">
                    <MapPin size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" /> Address
                  </span>
                  <div className="flex items-start gap-2 min-w-0 flex-1 justify-end">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(patient.address || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-gray-900 dark:text-gray-100 font-sans text-right max-w-[60%] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title={`Open ${patient.address} in maps`}
                      onClick={() => {
                        navigator.clipboard.writeText(patient.address || '').then(() => {
                          setCopiedField('address');
                          setTimeout(() => setCopiedField(null), 2000);
                        });
                      }}
                    >
                      {patient.address}
                    </a>
                    {copiedField === 'address' ? (
                      <Check size={14} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <Copy size={14} className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 transition-opacity flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions - Workflow-aware */}
        <QuickActions onAction={handleQuickAction} />
      </div>

      {/* Summary Cards for New Sections */}
      <OverviewSummaryCards patient={patient} />

      {/* Emergency Contact & Key Health Info */}
      {(patient.emergencyContact || patient.pharmacogenomics || patient.familyHistory) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {patient.emergencyContact && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={20} className="text-blue-600 dark:text-blue-400" />
                Emergency Contact
              </h3>
              <div className="space-y-2">
                <p className="font-medium font-sans">{patient.emergencyContact.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">{patient.emergencyContact.relationship}</p>
                <div className="flex items-center gap-2 group">
                  <a
                    href={`tel:${patient.emergencyContact.phone.replace(/\s/g, '')}`}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-sans"
                    title={`Call ${patient.emergencyContact.phone}`}
                  >
                    <Phone size={16} /> {patient.emergencyContact.phone}
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigator.clipboard.writeText(patient.emergencyContact?.phone || '').then(() => {
                        setCopiedField('emergency-phone');
                        setTimeout(() => setCopiedField(null), 2000);
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Copy emergency contact phone"
                    aria-label="Copy emergency contact phone"
                  >
                    {copiedField === 'emergency-phone' ? (
                      <Check size={12} className="text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy size={12} className="text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {patient.pharmacogenomics && patient.pharmacogenomics.tested && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Dna size={20} className="text-purple-600 dark:text-purple-400" />
                Pharmacogenomics
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Genetic Testing: <span className="font-medium text-green-600 dark:text-green-400">Completed</span></p>
                {patient.pharmacogenomics.variants && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {patient.pharmacogenomics.variants.map((variant) => (
                      <span key={variant} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded text-xs">
                        {variant}
                      </span>
                    ))}
                  </div>
                )}
                {patient.pharmacogenomics.notes && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {patient.pharmacogenomics.notes}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {patient.familyHistory && patient.familyHistory.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart size={20} className="text-red-600 dark:text-red-400" />
                Family History
              </h3>
              <ul className="space-y-1">
                {patient.familyHistory.slice(0, 3).map((history) => (
                  <li key={history} className="text-sm text-gray-700 dark:text-gray-300">• {history}</li>
                ))}
                {patient.familyHistory.length > 3 && (
                  <li className="text-xs text-gray-500 dark:text-gray-400">+{patient.familyHistory.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Clinical Notes */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText size={20} className="text-purple-600 dark:text-purple-400" />
            Recent Clinical Notes
          </h3>
          {recentNotes.length > 0 ? (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{note.title}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(note.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    by {note.author}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No recent notes
            </p>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
            Upcoming Appointments
          </h3>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{apt.type}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {apt.provider}
                      </p>
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Clock size={16} />
                    <span>{new Date(apt.date).toLocaleDateString()} at {apt.time}</span>
                  </div>
                  {apt.notes && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {apt.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No upcoming appointments
            </p>
          )}
        </div>
      </div>

      {/* Recent Imaging Studies */}
      {recentImaging.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scan size={20} className="text-green-600 dark:text-green-400" />
            Recent Imaging Studies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentImaging.map((study) => (
              <div
                key={study.id}
                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{study.type}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{study.bodyPart}</p>
                  </div>
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    {study.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {new Date(study.date).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                  {study.findings}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Timeline */}
      {recentTimeline.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GitBranch size={20} className="text-indigo-600 dark:text-indigo-400" />
            Recent Timeline
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            <div className="space-y-3">
              {recentTimeline.map((event) => {
                const getEventIcon = () => {
                  switch (event.type) {
                    case "appointment":
                      return <Calendar size={14} className="text-blue-600 dark:text-blue-400" />;
                    case "note":
                      return <FileText size={14} className="text-purple-600 dark:text-purple-400" />;
                    case "imaging":
                      return <Scan size={14} className="text-green-600 dark:text-green-400" />;
                    case "medication":
                      return <Pill size={14} className="text-orange-600 dark:text-orange-400" />;
                    case "lab":
                      return <Activity size={14} className="text-red-600 dark:text-red-400" />;
                    default:
                      return <Activity size={14} className="text-gray-600 dark:text-gray-400" />;
                  }
                };

                const getEventColor = () => {
                  switch (event.type) {
                    case "appointment":
                      return "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
                    case "note":
                      return "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800";
                    case "imaging":
                      return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
                    case "medication":
                      return "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
                    case "lab":
                      return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
                    default:
                      return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
                  }
                };

                return (
                  <div key={event.id} className="relative flex gap-3 items-start">
                    {/* Icon */}
                    <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${getEventColor()}`}>
                      {getEventIcon()}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {event.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {event.description}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                        {event.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Overview);

