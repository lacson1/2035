import { Patient, SpecialtyType, Appointment, Referral, Hub, HubId } from "../types";

/**
 * Get hub for a patient based on their condition or appointments
 */
export function getPatientHub(_patient: Patient, _availableHubs: Hub[] = []): Hub | null {
  // TODO: Implement hub resolution once patient data includes hub metadata
  return null;
}

/**
 * Filter patients by hub
 */
export function filterPatientsByHub(_patients: Patient[], _hubId: HubId): Patient[] {
  // TODO: Implement real hub filtering when patient records include hub assignments
  return [];
}

/**
 * Get hub statistics for a list of patients
 */
export function getHubStats(patients: Patient[], hubId: HubId) {
  const hubPatients = filterPatientsByHub(patients, hubId);

  return {
    totalPatients: hubPatients.length,
    activeAppointments: 0,
    recentNotes: 0,
  };
}

/**
 * Create appointment pre-filled with hub specialty
 */
export function createHubAppointment(
  _hubId: HubId,
  _patient: Patient,
  baseAppointment: Partial<Appointment>
): Appointment {
  return {
    id: `apt-${Date.now()}`,
    date: baseAppointment.date || new Date().toISOString().split('T')[0],
    time: baseAppointment.time || "09:00",
    type: baseAppointment.type || "Consultation",
    provider: baseAppointment.provider || "",
    status: baseAppointment.status || "scheduled",
    consultationType: baseAppointment.specialty ? "specialty" : "general",
    specialty: baseAppointment.specialty as SpecialtyType | undefined,
    ...baseAppointment,
  } as Appointment;
}

/**
 * Create referral pre-filled with hub specialty
 */
export function createHubReferral(
  hubId: HubId,
  _patient: Patient,
  baseReferral: Partial<Referral>
): Referral {
  return {
    id: `ref-${Date.now()}`,
    date: baseReferral.date || new Date().toISOString().split('T')[0],
    specialty: (baseReferral.specialty as SpecialtyType | string) || "",
    reason: baseReferral.reason || `Referral to hub ${hubId}`,
    priority: baseReferral.priority || "routine",
    status: baseReferral.status || "pending",
    ...baseReferral,
  } as Referral;
}

/**
 * Get quick actions for a hub
 */
export function getHubQuickActions(hubId: HubId) {
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
      hubId,
    },
  ];
}

