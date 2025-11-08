import { memo, useState, useEffect, useMemo } from "react";
import { logger } from "../utils/logger";
import { 
  Calendar, 
  Pill, 
  FileText, 
  TrendingUp,
  AlertTriangle,
  TestTube,
  Clock,
  Activity,
  Stethoscope,
  Scan,
  FlaskConical,
  Syringe,
  Users,
  ClipboardList
} from "lucide-react";
import { Patient } from "../types";
import { useDashboard } from "../context/DashboardContext";
import { useToast } from "../context/ToastContext";
import { getActiveMedications, getUpcomingAppointments, sortByDateDesc } from "../utils/patientUtils";
import { patientService } from "../services/patients";
import { getAllPatientAlerts, getAlertCounts } from "../utils/alertSystem";
import { AlertBadgeList } from "./AlertBadge";

interface OverviewProps {
  patient: Patient;
}

function Overview({ patient }: OverviewProps) {
  const { setActiveTab, updatePatient, shouldEditPatient, setShouldEditPatient } = useDashboard();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Unused handlers - kept for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  const handleCancel = () => {
    setIsEditing(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
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
      let apiSaveFailed = false;
      let apiErrorMessage = '';
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

        // Convert dob to dateOfBirth for backend
        if (editFormData.dob) {
          // If it's already an ISO string, use it; otherwise convert
          const dobDate = typeof editFormData.dob === 'string' 
            ? new Date(editFormData.dob) 
            : editFormData.dob;
          updateData.dateOfBirth = dobDate instanceof Date 
            ? dobDate.toISOString() 
            : editFormData.dob;
        }

        await patientService.updatePatient(patient.id, updateData);
      } catch (apiError: any) {
        // API save failed, but continue with local update
        apiSaveFailed = true;
        apiErrorMessage = apiError?.message || 'Unknown error';
        logger.warn('Failed to save patient to API, using local update only:', apiError);
      }

      setIsEditing(false);
      
      if (apiSaveFailed) {
        toast.warning(
          `Changes saved locally but failed to sync to server: ${apiErrorMessage}. Your changes will be lost on refresh.`,
          { duration: 6000 }
        );
      } else {
        toast.success('Patient details saved successfully');
      }
    } catch (error) {
      logger.error('Error saving patient:', error);
      toast.error('Failed to save patient details. Please try again.');
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

  // Handle shouldEditPatient flag from context
  useEffect(() => {
    if (shouldEditPatient && !isEditing) {
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
      setShouldEditPatient(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldEditPatient, isEditing]);

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

  // Get next appointment
  const nextAppointment = useMemo(() => {
    const appointments = getUpcomingAppointments(patient);
    return appointments.length > 0 ? appointments[0] : null;
  }, [patient]);

  // Get recent abnormal lab results
  const abnormalLabResults = useMemo(() => {
    const labs = patient.labResults || [];
    return labs
      .filter(lab => {
        if (!lab.results || lab.status !== 'completed') return false;
        // Check for abnormal flags
        return Object.values(lab.results).some(result => 
          result.flag === 'high' || result.flag === 'low' || result.flag === 'critical'
        );
      })
      .sort((a, b) => {
        const dateA = a.resultDate ? new Date(a.resultDate).getTime() : new Date(a.orderedDate).getTime();
        const dateB = b.resultDate ? new Date(b.resultDate).getTime() : new Date(b.orderedDate).getTime();
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [patient.labResults]);

  // Get patient alerts
  const patientAlerts = useMemo(() => getAllPatientAlerts(patient), [patient]);
  const alertCounts = useMemo(() => getAlertCounts(patientAlerts), [patientAlerts]);

  return (
    <div className="section-spacing">
      {/* 1. Conditions - Active, Chronic, Past */}
      {(patient.condition || (patient as any).activeConditions || (patient as any).chronicConditions || (patient as any).pastConditions) && (
        <div className="mb-3">
          <div className="card p-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <FileText size={16} className="text-primary-600 dark:text-primary-400" />
              Conditions
            </h3>
            <div className="space-y-2">
              {/* Active Conditions */}
              {((patient as any).activeConditions && (patient as any).activeConditions.length > 0) || patient.condition ? (
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Active Conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.condition && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-md text-xs font-medium border border-green-200 dark:border-green-800">
                        {patient.condition}
                      </span>
                    )}
                    {(patient as any).activeConditions?.map((cond: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-md text-xs font-medium border border-green-200 dark:border-green-800"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Chronic Conditions */}
              {(patient as any).chronicConditions && (patient as any).chronicConditions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Chronic Conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(patient as any).chronicConditions.map((cond: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Conditions */}
              {(patient as any).pastConditions && (patient as any).pastConditions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Past Conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(patient as any).pastConditions.map((cond: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-700"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Alerts */}
      {patientAlerts.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Active Alerts ({alertCounts.total})
            </h3>
            {alertCounts.critical > 0 && (
              <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                {alertCounts.critical} Critical
              </span>
            )}
          </div>
          <AlertBadgeList alerts={patientAlerts} maxDisplay={5} size="sm" />
        </div>
      )}

      {/* 4. Key Metrics - Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 mb-3">
        <div className="card hover:shadow-lg transition-all duration-300 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-sans mb-0.5">Active Medications</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400 font-sans">
                {activeMedications.length}
              </p>
            </div>
            <Pill className="text-green-600 dark:text-green-400" size={20} />
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-300 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-sans mb-0.5">Upcoming Appointments</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 font-sans">
                {upcomingAppointments.length}
              </p>
            </div>
            <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-300 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-sans mb-0.5">Blood Pressure</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400 font-sans">
                  {patient.bp || "N/A"}
                </p>
                {patient.bp && patient.bp !== "N/A" && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-sans">mmHg</span>
                )}
              </div>
            </div>
            <TrendingUp className="text-orange-600 dark:text-orange-400" size={20} />
          </div>
        </div>
      </div>

      {/* 4.5. Quick Access - Common Actions */}
      <div className="card p-3 mb-3">
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Quick Access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <button
            onClick={() => setActiveTab("medications")}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 hover:shadow-md group"
            title="View Medications"
          >
            <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              <Pill size={18} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center">Medications</span>
          </button>

          <button
            onClick={() => setActiveTab("appointments")}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 hover:shadow-md group"
            title="View Appointments"
          >
            <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <Calendar size={18} className="text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center">Appointments</span>
          </button>

          <button
            onClick={() => setActiveTab("labs")}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:shadow-md group"
            title="View Lab Results"
          >
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <FlaskConical size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center">Lab Results</span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 hover:shadow-md group"
            title="View Clinical Notes"
          >
            <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
              <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center">Clinical Notes</span>
          </button>

          <button
            onClick={() => setActiveTab("consultation")}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200 hover:shadow-md group"
            title="Start Consultation"
          >
            <div className="p-1.5 rounded-md bg-teal-100 dark:bg-teal-900/30 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50 transition-colors">
              <Stethoscope size={18} className="text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center">Consultation</span>
          </button>

          <button
            onClick={() => setActiveTab("imaging")}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 hover:shadow-md group"
            title="View Imaging Studies"
          >
            <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
              <Scan size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center">Imaging</span>
          </button>

          <button
            onClick={() => setActiveTab("vitals")}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 hover:shadow-md group"
            title="View Vitals"
          >
            <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
              <Activity size={18} className="text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center">Vitals</span>
          </button>

          <button
            onClick={() => setActiveTab("vaccinations")}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200 hover:shadow-md group"
            title="View Vaccinations"
          >
            <div className="p-1.5 rounded-md bg-pink-100 dark:bg-pink-900/30 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
              <Syringe size={18} className="text-pink-600 dark:text-pink-400" />
            </div>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center">Vaccinations</span>
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-200 hover:shadow-md group"
            title="View Care Team"
          >
            <div className="p-1.5 rounded-md bg-cyan-100 dark:bg-cyan-900/30 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50 transition-colors">
              <Users size={18} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center">Care Team</span>
          </button>

          <button
            onClick={() => setActiveTab("referrals")}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 hover:shadow-md group"
            title="View Referrals"
          >
            <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
              <ClipboardList size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center">Referrals</span>
          </button>
        </div>
      </div>

      {/* 5. Active Medications List */}
      {activeMedications.length > 0 && (
        <div className="card p-3 mb-3">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Pill size={16} className="text-green-600 dark:text-green-400" />
            Active Medications ({activeMedications.length})
          </h3>
          <div className="space-y-1.5">
            {activeMedications.slice(0, 5).map((med, index) => (
              <div
                key={`${med.name}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                    {med.name}
                  </p>
                  {med.instructions && (
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {med.instructions}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {activeMedications.length > 5 && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center pt-1">
                +{activeMedications.length - 5} more medications
              </p>
            )}
          </div>
        </div>
      )}

      {/* 6. Next Appointment Details */}
      {nextAppointment && (
        <div className="card p-3 mb-3">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
            Next Appointment
          </h3>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {nextAppointment.type}
                </p>
                {nextAppointment.provider && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    with {nextAppointment.provider}
                  </p>
                )}
              </div>
              <span className="text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded flex-shrink-0">
                {nextAppointment.status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 mt-1.5">
              <Clock size={12} />
              <span>
                {new Date(nextAppointment.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })} at {nextAppointment.time}
              </span>
            </div>
            {nextAppointment.notes && (
              <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-2">
                {nextAppointment.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 7. Recent Abnormal Lab Results */}
      {abnormalLabResults.length > 0 && (
        <div className="card p-3 mb-3">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <TestTube size={16} className="text-red-600 dark:text-red-400" />
            Abnormal Lab Results ({abnormalLabResults.length})
          </h3>
          <div className="space-y-1.5">
            {abnormalLabResults.map((lab) => (
              <div
                key={lab.id}
                className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {lab.testName}
                  </p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {lab.resultDate 
                      ? new Date(lab.resultDate).toLocaleDateString()
                      : new Date(lab.orderedDate).toLocaleDateString()}
                  </span>
                </div>
                {lab.results && (
                  <div className="space-y-0.5">
                    {Object.entries(lab.results).map(([key, result]) => {
                      if (result.flag === 'normal') return null;
                      const flagColor = result.flag === 'critical' 
                        ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40'
                        : result.flag === 'high'
                        ? 'text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/40'
                        : 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/40';
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-600 dark:text-gray-400 capitalize">
                            {key}:
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${flagColor}`}>
                            {result.value} {result.unit || ''} ({result.flag?.toUpperCase()})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Recent Clinical Notes - Most Actionable */}
      {recentNotes.length > 0 && (
        <div className="card p-3 mb-3">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <FileText size={16} className="text-purple-600 dark:text-purple-400" />
            Recent Clinical Notes
          </h3>
          <div className="space-y-1.5">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-xs">{note.title}</h4>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {new Date(note.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-0.5">
                  by {note.author}
                </p>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 line-clamp-2">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. Allergies - Bottom Section */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="mb-3">
          <div className="card p-2 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-xs font-medium text-red-900 dark:text-red-100">Allergies:</span>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded text-[10px] font-medium border border-red-200 dark:border-red-800"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Overview);

