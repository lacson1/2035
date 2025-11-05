import { Patient, SpecialtyType, Appointment, Referral } from "../types";
import { Hub, HubId, getHubById, getHubBySpecialty, getAllHubs } from "../data/hubs";
import { getSpecialtyTemplate } from "../data/specialtyTemplates";

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
  if (patient.condition) {
    const conditionLower = patient.condition.toLowerCase();
    for (const hub of getAllHubs()) {
      if (hub.commonConditions.some(cond => 
        conditionLower.includes(cond.toLowerCase()) || 
        cond.toLowerCase().includes(conditionLower)
      )) {
        return hub;
      }
    }
  }

  return null;
}

/**
 * Filter patients by hub
 */
export function filterPatientsByHub(patients: Patient[], hubId: HubId): Patient[] {
  const hub = getHubById(hubId);
  if (!hub) return [];

  return patients.filter(patient => {
    // Check if patient has appointments in this hub's specialties
    if (patient.appointments) {
      const hasHubAppointment = patient.appointments.some(apt => 
        apt.specialty && hub.specialties.includes(apt.specialty)
      );
      if (hasHubAppointment) return true;
    }

    // Check if patient has notes in this hub's specialties
    if (patient.clinicalNotes) {
      const hasHubNote = patient.clinicalNotes.some(note => 
        note.specialty && hub.specialties.includes(note.specialty)
      );
      if (hasHubNote) return true;
    }

    // Check if patient condition matches hub's common conditions
    if (patient.condition) {
      const conditionLower = patient.condition.toLowerCase();
      const matchesCondition = hub.commonConditions.some(cond => 
        conditionLower.includes(cond.toLowerCase()) || 
        cond.toLowerCase().includes(conditionLower)
      );
      if (matchesCondition) return true;
    }

    // Check referrals
    if (patient.referrals) {
      const hasHubReferral = patient.referrals.some(ref => {
        if (typeof ref.specialty === 'string') {
          return hub.specialties.some(spec => 
            getSpecialtyTemplate(spec).name.toLowerCase() === ref.specialty.toLowerCase()
          );
        }
        return ref.specialty && hub.specialties.includes(ref.specialty);
      });
      if (hasHubReferral) return true;
    }

    return false;
  });
}

/**
 * Get hub statistics for a list of patients
 */
export function getHubStats(patients: Patient[], hubId: HubId) {
  const hub = getHubById(hubId);
  if (!hub) return null;

  const hubPatients = filterPatientsByHub(patients, hubId);
  const activeAppointments = hubPatients.reduce((count, patient) => {
    if (!patient.appointments) return count;
    return count + patient.appointments.filter(apt => 
      apt.status === "scheduled" && 
      apt.specialty && 
      hub.specialties.includes(apt.specialty)
    ).length;
  }, 0);

  const recentNotes = hubPatients.reduce((count, patient) => {
    if (!patient.clinicalNotes) return count;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return count + patient.clinicalNotes.filter(note => 
      note.specialty && 
      hub.specialties.includes(note.specialty) &&
      new Date(note.date) >= sevenDaysAgo
    ).length;
  }, 0);

  return {
    totalPatients: hubPatients.length,
    activeAppointments,
    recentNotes,
    hub,
  };
}

/**
 * Create appointment pre-filled with hub specialty
 */
export function createHubAppointment(hubId: HubId, _patient: Patient, baseAppointment: Partial<Appointment>): Appointment {
  const hub = getHubById(hubId);
  const specialty = hub?.specialties[0] as SpecialtyType | undefined;

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
  const specialty = hub?.specialties[0] as SpecialtyType | undefined;

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

  return [
    {
      id: "schedule-appointment",
      label: "Schedule Appointment",
      action: "schedule",
      tab: "appointments",
      specialty: hub.specialties[0],
    },
    {
      id: "create-consultation",
      label: "Create Consultation",
      action: "consultation",
      tab: "consultation",
      specialty: hub.specialties[0],
    },
    {
      id: "create-referral",
      label: "Create Referral",
      action: "referral",
      tab: "referrals",
      specialty: hub.specialties[0],
    },
    {
      id: "view-patients",
      label: "View Hub Patients",
      action: "filter-patients",
      hubId: hub.id,
    },
  ];
}

