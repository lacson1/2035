import { Patient, SpecialtyType, Appointment, Referral } from "../types";
import { Hub, HubId, getHubById, getHubBySpecialty } from "../data/hubs";

/**
 * Get hub for a patient based on their condition or appointments
 */
export function getPatientHub(patient: Patient): Hub | null {
  // Check appointments for specialty
  if (patient.appointments && patient.appointments.length > 0) {
    const latestAppointment = patient.appointments
      .filter(apt => apt.specialty)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (latestAppointment?.specialty) {
      const hub = getHubBySpecialty(latestAppointment.specialty);
      if (hub) return hub;
    }
  }

  // Check clinical notes for specialty
  if (patient.clinicalNotes && patient.clinicalNotes.length > 0) {
    const latestNote = patient.clinicalNotes
      .filter(note => note.specialty)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (latestNote?.specialty) {
      const hub = getHubBySpecialty(latestNote.specialty);
      if (hub) return hub;
    }
  }

  // Check referrals for specialty
  if (patient.referrals && patient.referrals.length > 0) {
    const latestReferral = patient.referrals
      .filter(ref => ref.specialty)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (latestReferral?.specialty) {
      const hub = getHubBySpecialty(latestReferral.specialty as SpecialtyType);
      if (hub) return hub;
    }
  }

  // Try to match condition to hub
  // Note: Hub interface doesn't currently have commonConditions property
  // This would need to be implemented when hub data structure is expanded

  return null;
}

/**
 * Filter patients by hub
 */
export function filterPatientsByHub(_patients: Patient[], hubId: HubId): Patient[] {
  const hub = getHubById(hubId);
  if (!hub) return [];

  // Note: Hub interface doesn't currently have specialties or commonConditions properties
  // This function would need to be implemented when hub data structure is expanded
  // For now, return empty array as hub filtering is not fully implemented
  return [];
}

/**
 * Get hub statistics for a list of patients
 */
export function getHubStats(patients: Patient[], hubId: HubId) {
  const hub = getHubById(hubId);
  if (!hub) return null;

  const hubPatients = filterPatientsByHub(patients, hubId);
  
  // Note: Hub interface doesn't currently have specialties property
  // Stats calculation would need to be implemented when hub data structure is expanded
  return {
    totalPatients: hubPatients.length,
    activeAppointments: 0,
    recentNotes: 0,
    hub,
  };
}

/**
 * Create appointment pre-filled with hub specialty
 */
export function createHubAppointment(_hubId: HubId, _patient: Patient, baseAppointment: Partial<Appointment>): Appointment {
  // Note: Hub interface doesn't currently have specialties property
  const specialty = undefined as SpecialtyType | undefined;

  return {
    id: `apt-${Date.now()}`,
    date: baseAppointment.date || new Date().toISOString().split('T')[0],
    time: baseAppointment.time || "09:00",
    type: baseAppointment.type || "Consultation",
    provider: baseAppointment.provider || "",
    status: baseAppointment.status || "scheduled",
    consultationType: specialty ? "specialty" : "general",
    specialty,
    ...baseAppointment,
  } as Appointment;
}

/**
 * Create referral pre-filled with hub specialty
 */
export function createHubReferral(hubId: HubId, _patient: Patient, baseReferral: Partial<Referral>): Referral {
  const hub = getHubById(hubId);
  // Note: Hub interface doesn't currently have specialties property
  const specialty = undefined as SpecialtyType | undefined;

  return {
    id: `ref-${Date.now()}`,
    date: baseReferral.date || new Date().toISOString().split('T')[0],
    specialty: specialty || "",
    reason: baseReferral.reason || `Referral to ${hub?.name || 'specialist'}`,
    priority: baseReferral.priority || "routine",
    status: baseReferral.status || "pending",
    ...baseReferral,
  } as Referral;
}

/**
 * Get quick actions for a hub
 */
export function getHubQuickActions(hubId: HubId) {
  const hub = getHubById(hubId);
  if (!hub) return [];

  // Note: Hub interface doesn't currently have specialties property
  return [
    {
      id: "schedule-appointment",
      label: "Schedule Appointment",
      action: "schedule",
      tab: "appointments",
      specialty: undefined,
    },
    {
      id: "create-consultation",
      label: "Create Consultation",
      action: "consultation",
      tab: "consultation",
      specialty: undefined,
    },
    {
      id: "create-referral",
      label: "Create Referral",
      action: "referral",
      tab: "referrals",
      specialty: undefined,
    },
    {
      id: "view-patients",
      label: "View Hub Patients",
      action: "filter-patients",
      hubId: hub.id,
    },
  ];
}

