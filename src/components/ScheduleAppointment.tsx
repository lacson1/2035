import { useState } from "react";
import { Calendar, Clock, User, X, Stethoscope } from "lucide-react";
import { Patient, Appointment, ConsultationType, SpecialtyType } from "../types";
import { getAllSpecialties, getSpecialtyTemplate } from "../data/specialtyTemplates";

interface ScheduleAppointmentProps {
  patient: Patient;
  onAppointmentAdded?: (appointment: Appointment) => void;
}

export default function ScheduleAppointment({ patient, onAppointmentAdded }: ScheduleAppointmentProps) {
  const [open, setOpen] = useState(false);
  const [openConsultation, setOpenConsultation] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    type: "",
    provider: "",
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
    consultationType: "general" as ConsultationType,
    specialty: "" as SpecialtyType | "",
    duration: "30",
    location: "in-person" as "in-person" | "telemedicine" | "hybrid",
    reason: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      provider: formData.provider,
      status: "scheduled",
      notes: formData.notes || undefined,
      consultationType: formData.consultationType ? (formData.consultationType as ConsultationType) : undefined,
      specialty: formData.specialty ? (formData.specialty as SpecialtyType) : undefined,
      duration: formData.consultationType ? parseInt(formData.duration) : undefined,
      location: formData.consultationType ? formData.location : undefined,
      reason: formData.reason || undefined,
    };

    if (onAppointmentAdded) {
      onAppointmentAdded(newAppointment);
    }

    // Reset form
    setFormData({ 
      date: "", 
      time: "", 
      type: "", 
      provider: "", 
      notes: "",
      consultationType: "" as ConsultationType | "",
      specialty: "" as SpecialtyType | "",
      duration: "30",
      location: "in-person",
      reason: "",
    });
    setOpen(false);
  };

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const appointmentType = consultationFormData.consultationType === "general" 
      ? "General Consultation" 
      : "Specialty Consultation";
    
    const newAppointment: Appointment = {
      id: `cons-${Date.now()}`,
      date: consultationFormData.date,
      time: consultationFormData.time,
      type: appointmentType,
      provider: consultationFormData.provider,
      status: "scheduled",
      consultationType: consultationFormData.consultationType,
      specialty: consultationFormData.specialty || undefined,
      duration: parseInt(consultationFormData.duration),
      location: consultationFormData.location,
      reason: consultationFormData.reason || undefined,
      notes: consultationFormData.notes || undefined,
    };

    if (onAppointmentAdded) {
      onAppointmentAdded(newAppointment);
    }

    // Reset form
    setConsultationFormData({
      date: "",
      time: "",
      provider: "",
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
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            <Calendar size={18} /> Schedule Appointment
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {patient.appointments && patient.appointments.length > 0 ? (
          patient.appointments.map((apt) => (
            <div
              key={apt.id}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
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
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  apt.status === "scheduled"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    : apt.status === "completed"
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                {apt.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No appointments scheduled
          </p>
        )}
      </div>

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
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
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
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
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
                      className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
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
                        className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
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
                          className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
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
                          className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
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
                          className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Provider</label>
                <input
                  type="text"
                  required
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Dr. Smith"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
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
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
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
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Provider</label>
                <input
                  type="text"
                  required
                  value={consultationFormData.provider}
                  onChange={(e) => setConsultationFormData({ ...consultationFormData, provider: e.target.value })}
                  placeholder="Dr. Smith"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors"
                />
              </div>
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

