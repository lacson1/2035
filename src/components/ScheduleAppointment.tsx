import { useState } from "react";
import { Calendar, Clock, User, X, Stethoscope, Filter, CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import { Patient, Appointment, ConsultationType, SpecialtyType } from "../types";
import { getAllSpecialties, getSpecialtyTemplate } from "../data/specialtyTemplates";
import UserAssignment from "./UserAssignment";
import { useUsers } from "../hooks/useUsers";
import { appointmentService } from "../services/appointments";
import { logger } from "../utils/logger";
import { useToast } from "../context/ToastContext";
import { useDashboard } from "../context/DashboardContext";

interface ScheduleAppointmentProps {
  patient: Patient;
  onAppointmentAdded?: (appointment: Appointment) => void;
}

export default function ScheduleAppointment({ patient, onAppointmentAdded }: ScheduleAppointmentProps) {
  const { users } = useUsers({ 
    allowForAssignment: true,
    roles: ['physician', 'nurse_practitioner', 'physician_assistant', 'nurse']
  });
  const toast = useToast();
  const { updatePatient } = useDashboard();
  const [open, setOpen] = useState(false);
  const [openConsultation, setOpenConsultation] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("all");
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    type: "",
    provider: "",
    providerId: null as string | null,
    notes: "",
    consultationType: "" as ConsultationType | "",
    specialty: "" as SpecialtyType | "",
    duration: "30",
    location: "in-person",
    reason: "",
  });

  const [consultationFormData, setConsultationFormData] = useState({
    date: "",
    time: "",
    provider: "",
    providerId: null as string | null,
    consultationType: "general" as ConsultationType,
    specialty: "" as SpecialtyType | "",
    duration: "30",
    location: "in-person" as "in-person" | "telemedicine" | "hybrid",
    reason: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get provider name from selected user if providerId is set
    const selectedUser = formData.providerId ? users.find(u => u.id === formData.providerId) : null;
    const providerName = selectedUser 
      ? `${selectedUser.firstName} ${selectedUser.lastName}` 
      : formData.provider || "Unknown Provider";
    
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      provider: providerName,
      status: "scheduled",
      notes: formData.notes || undefined,
      consultationType: formData.consultationType ? (formData.consultationType as ConsultationType) : undefined,
      specialty: formData.specialty ? (formData.specialty as SpecialtyType) : undefined,
      duration: formData.consultationType ? parseInt(formData.duration) : undefined,
      location: formData.consultationType ? formData.location : undefined,
      reason: formData.reason || undefined,
    };

    // Try to save to API if providerId is available
    if (formData.providerId) {
      try {
        await appointmentService.createAppointment(patient.id, {
          date: formData.date,
          time: formData.time,
          type: formData.type,
          providerId: formData.providerId,
          status: "scheduled",
          notes: formData.notes || undefined,
          consultationType: formData.consultationType || undefined,
          specialty: formData.specialty || undefined,
          duration: formData.consultationType ? parseInt(formData.duration) : undefined,
          location: formData.consultationType ? formData.location : undefined,
          reason: formData.reason || undefined,
        });
        toast.success('Appointment created and linked to user successfully');
      } catch (apiError: any) {
        logger.warn('Failed to save appointment to API:', apiError);
        toast.warning('Appointment saved locally but failed to link to user. Please try again.');
      }
    } else if (!formData.provider) {
      toast.warning('Please select a provider or enter a provider name');
      return;
    }

    if (onAppointmentAdded) {
      onAppointmentAdded(newAppointment);
    }

    // Reset form
    setFormData({ 
      date: "", 
      time: "", 
      type: "", 
      provider: "", 
      providerId: null,
      notes: "",
      consultationType: "" as ConsultationType | "",
      specialty: "" as SpecialtyType | "",
      duration: "30",
      location: "in-person",
      reason: "",
    });
    setOpen(false);
  };

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get provider name from selected user if providerId is set
    const selectedUser = consultationFormData.providerId ? users.find(u => u.id === consultationFormData.providerId) : null;
    const providerName = selectedUser 
      ? `${selectedUser.firstName} ${selectedUser.lastName}` 
      : consultationFormData.provider || "Unknown Provider";
    
    const appointmentType = consultationFormData.consultationType === "general" 
      ? "General Consultation" 
      : "Specialty Consultation";
    
    const newAppointment: Appointment = {
      id: `cons-${Date.now()}`,
      date: consultationFormData.date,
      time: consultationFormData.time,
      type: appointmentType,
      provider: providerName,
      status: "scheduled",
      consultationType: consultationFormData.consultationType,
      specialty: consultationFormData.specialty || undefined,
      duration: parseInt(consultationFormData.duration),
      location: consultationFormData.location,
      reason: consultationFormData.reason || undefined,
      notes: consultationFormData.notes || undefined,
    };

    // Try to save to API if providerId is available
    if (consultationFormData.providerId) {
      try {
        await appointmentService.createAppointment(patient.id, {
          date: consultationFormData.date,
          time: consultationFormData.time,
          type: appointmentType,
          providerId: consultationFormData.providerId,
          status: "scheduled",
          consultationType: consultationFormData.consultationType,
          specialty: consultationFormData.specialty || undefined,
          duration: parseInt(consultationFormData.duration),
          location: consultationFormData.location,
          reason: consultationFormData.reason || undefined,
          notes: consultationFormData.notes || undefined,
        });
        toast.success('Consultation scheduled and linked to user successfully');
      } catch (apiError: any) {
        logger.warn('Failed to save consultation to API:', apiError);
        toast.warning('Consultation saved locally but failed to link to user. Please try again.');
      }
    } else if (!consultationFormData.provider) {
      toast.warning('Please select a provider or enter a provider name');
      return;
    }

    if (onAppointmentAdded) {
      onAppointmentAdded(newAppointment);
    }

    // Reset form
    setConsultationFormData({
      date: "",
      time: "",
      provider: "",
      providerId: null,
      consultationType: "general" as ConsultationType,
      specialty: "" as SpecialtyType | "",
      duration: "30",
      location: "in-person" as "in-person" | "telemedicine" | "hybrid",
      reason: "",
      notes: "",
    });
    setOpenConsultation(false);
  };

  return (
    <div className="p-4 border rounded-lg dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Appointments</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenConsultation(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            <Stethoscope size={18} /> Schedule Consultation
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            <Calendar size={18} /> Schedule Appointment
          </button>
        </div>
      </div>

      {/* Status Filter */}
      {patient.appointments && patient.appointments.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <Filter size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
          <div className="flex gap-2">
            {(["all", "scheduled", "completed", "cancelled"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  statusFilter === status
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtered and Sorted Appointments */}
      {(() => {
        const filteredAppointments = patient.appointments?.filter((apt) => 
          statusFilter === "all" || apt.status === statusFilter
        ) || [];
        
        const sortedAppointments = [...filteredAppointments].sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateB.getTime() - dateA.getTime();
        });

        const upcomingAppointments = sortedAppointments.filter(apt => {
          const aptDate = new Date(`${apt.date}T${apt.time}`);
          return aptDate >= new Date() && apt.status === "scheduled";
        });

        const pastAppointments = sortedAppointments.filter(apt => {
          const aptDate = new Date(`${apt.date}T${apt.time}`);
          return aptDate < new Date() || apt.status !== "scheduled";
        });

        const getStatusColor = (status: string) => {
          switch (status) {
            case "scheduled":
              return "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800";
            case "completed":
              return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800";
            case "cancelled":
              return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800";
            default:
              return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600";
          }
        };

        const handleStatusChange = (aptId: string, newStatus: "scheduled" | "completed" | "cancelled") => {
          updatePatient(patient.id, (p) => {
            const updatedAppointments = p.appointments?.map(apt =>
              apt.id === aptId ? { ...apt, status: newStatus } : apt
            ) || [];
            return { ...p, appointments: updatedAppointments };
          });
          toast.success(`Appointment status updated to ${newStatus}`);
          setEditingStatus(null);
        };

        if (filteredAppointments.length === 0) {
          return (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {statusFilter === "all" 
                ? "No appointments scheduled" 
                : `No ${statusFilter} appointments`}
            </p>
          );
        }

        return (
          <div className="space-y-4">
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar size={14} className="text-teal-600 dark:text-teal-400" />
                  Upcoming ({upcomingAppointments.length})
                </h4>
                <div className="space-y-2">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex justify-between items-start bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar size={16} className="text-teal-600 dark:text-teal-400" />
                          <span className="font-medium">{apt.date}</span>
                          <Clock size={16} className="text-gray-600 dark:text-gray-400" />
                          <span className="text-sm">{apt.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User size={14} className="text-gray-600 dark:text-gray-400" />
                          <span className="font-medium">{apt.provider}</span>
                          <span className="text-gray-600 dark:text-gray-400">•</span>
                          <span className="text-gray-600 dark:text-gray-400">{apt.type}</span>
                        </div>
                        {apt.notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{apt.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {editingStatus === apt.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStatusChange(apt.id, "completed")}
                              className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                              title="Mark as completed"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(apt.id, "cancelled")}
                              className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                              title="Cancel appointment"
                            >
                              <XCircle size={14} />
                            </button>
                            <button
                              onClick={() => setEditingStatus(null)}
                              className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(apt.status)}`}
                            >
                              {apt.status}
                            </span>
                            <button
                              onClick={() => setEditingStatus(apt.id)}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Change status"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past/Other Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock size={14} className="text-gray-600 dark:text-gray-400" />
                  Past & Other ({pastAppointments.length})
                </h4>
                <div className="space-y-2">
                  {pastAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex justify-between items-start bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-4 rounded-lg opacity-75"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar size={16} className="text-gray-500 dark:text-gray-500" />
                          <span className="font-medium">{apt.date}</span>
                          <Clock size={16} className="text-gray-500 dark:text-gray-500" />
                          <span className="text-sm">{apt.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User size={14} className="text-gray-500 dark:text-gray-500" />
                          <span className="font-medium">{apt.provider}</span>
                          <span className="text-gray-500 dark:text-gray-500">•</span>
                          <span className="text-gray-500 dark:text-gray-500">{apt.type}</span>
                        </div>
                        {apt.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{apt.notes}</p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(apt.status)}`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-96 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Schedule Appointment</h4>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Type</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setFormData({ 
                      ...formData, 
                      type: newType,
                      consultationType: newType === "Consultation" ? "" : formData.consultationType,
                    });
                  }}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                >
                  <option value="">Select type</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Procedure">Procedure</option>
                  <option value="Annual Exam">Annual Exam</option>
                  <option value="Urgent Care">Urgent Care</option>
                </select>
              </div>
              
              {formData.type === "Consultation" && (
                <>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Consultation Type</label>
                    <select
                      value={formData.consultationType}
                      onChange={(e) => setFormData({ ...formData, consultationType: e.target.value as ConsultationType })}
                      className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                    >
                      <option value="">Select consultation type</option>
                      <option value="general">General Consultation</option>
                      <option value="specialty">Specialty Consultation</option>
                    </select>
                  </div>
                  
                  {formData.consultationType === "specialty" && (
                    <div>
                      <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Specialty</label>
                      <select
                        value={formData.specialty}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value as SpecialtyType })}
                        className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                      >
                        <option value="">Select specialty</option>
                        {getAllSpecialties().map((specialty) => {
                          const template = getSpecialtyTemplate(specialty);
                          return (
                            <option key={specialty} value={specialty}>
                              {template?.name || specialty}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                  
                  {formData.consultationType && (
                    <>
                      <div>
                        <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Duration (minutes)</label>
                        <select
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">60 minutes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Location</label>
                        <select
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                        >
                          <option value="in-person">In-Person</option>
                          <option value="telemedicine">Telemedicine</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Reason for Consultation</label>
                        <textarea
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          placeholder="Brief reason for consultation..."
                          rows={3}
                          className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
              {/* User Assignment - Link to User */}
              <UserAssignment
                assignedTo={formData.providerId}
                allowedRoles={['physician', 'nurse_practitioner', 'physician_assistant', 'nurse']}
                label="Assign to Provider"
                placeholder="Select provider..."
                onAssign={(userId) => {
                  if (userId) {
                    const selectedUser = users.find(u => u.id === userId);
                    if (selectedUser) {
                      setFormData(prev => ({ 
                        ...prev, 
                        providerId: userId,
                        provider: `${selectedUser.firstName} ${selectedUser.lastName}`
                      }));
                    }
                  } else {
                    setFormData(prev => ({ ...prev, providerId: null }));
                  }
                }}
              />
              
              {/* Fallback: Manual Provider Name (if no user selected) */}
              {!formData.providerId && (
              <div>
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Provider Name (if not selecting from users)
                  </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Dr. Smith"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                />
              </div>
              )}
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-teal-500 text-white hover:bg-teal-600"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openConsultation && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenConsultation(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-96 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Schedule Consultation</h4>
              <button
                onClick={() => setOpenConsultation(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleConsultationSubmit} className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={consultationFormData.date}
                  onChange={(e) => setConsultationFormData({ ...consultationFormData, date: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={consultationFormData.time}
                  onChange={(e) => setConsultationFormData({ ...consultationFormData, time: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Consultation Type</label>
                <select
                  required
                  value={consultationFormData.consultationType}
                  onChange={(e) => setConsultationFormData({ ...consultationFormData, consultationType: e.target.value as ConsultationType })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors"
                >
                  <option value="general">General Consultation</option>
                  <option value="specialty">Specialty Consultation</option>
                </select>
              </div>
              
              {consultationFormData.consultationType === "specialty" && (
                <div>
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Specialty</label>
                  <select
                    required
                    value={consultationFormData.specialty}
                    onChange={(e) => setConsultationFormData({ ...consultationFormData, specialty: e.target.value as SpecialtyType })}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors"
                  >
                    <option value="">Select specialty</option>
                    {getAllSpecialties().map((specialty) => {
                      const template = getSpecialtyTemplate(specialty);
                      return (
                        <option key={specialty} value={specialty}>
                          {template?.name || specialty}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Duration (minutes)</label>
                <select
                  value={consultationFormData.duration}
                  onChange={(e) => setConsultationFormData({ ...consultationFormData, duration: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Location</label>
                <select
                  value={consultationFormData.location}
                  onChange={(e) => setConsultationFormData({ ...consultationFormData, location: e.target.value as "in-person" | "telemedicine" | "hybrid" })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors"
                >
                  <option value="in-person">In-Person</option>
                  <option value="telemedicine">Telemedicine</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Reason for Consultation</label>
                <textarea
                  value={consultationFormData.reason}
                  onChange={(e) => setConsultationFormData({ ...consultationFormData, reason: e.target.value })}
                  placeholder="Brief reason for consultation..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors"
                />
              </div>
              {/* User Assignment - Link to User */}
              <UserAssignment
                assignedTo={consultationFormData.providerId}
                allowedRoles={['physician', 'nurse_practitioner', 'physician_assistant', 'nurse']}
                label="Assign to Provider"
                placeholder="Select provider..."
                onAssign={(userId) => {
                  if (userId) {
                    const selectedUser = users.find(u => u.id === userId);
                    if (selectedUser) {
                      setConsultationFormData(prev => ({ 
                        ...prev, 
                        providerId: userId,
                        provider: `${selectedUser.firstName} ${selectedUser.lastName}`
                      }));
                    }
                  } else {
                    setConsultationFormData(prev => ({ ...prev, providerId: null }));
                  }
                }}
              />
              
              {/* Fallback: Manual Provider Name (if no user selected) */}
              {!consultationFormData.providerId && (
              <div>
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Provider Name (if not selecting from users)
                  </label>
                <input
                  type="text"
                  value={consultationFormData.provider}
                  onChange={(e) => setConsultationFormData({ ...consultationFormData, provider: e.target.value })}
                  placeholder="Dr. Smith"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors"
                />
              </div>
              )}
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Notes (Optional)</label>
                <textarea
                  value={consultationFormData.notes}
                  onChange={(e) => setConsultationFormData({ ...consultationFormData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setOpenConsultation(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Schedule Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

