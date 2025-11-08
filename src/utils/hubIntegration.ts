import { Patient, SpecialtyType, Appointment, Referral } from "../types";
import { Hub, HubId, getHubById, getHubBySpecialty } from "../data/hubs";

/**
 * Get hub for a patient based on their condition or appointments
 */
export function getPatientHub(patient: Patient): Hub | null {
  // First check if patient has explicit hubId (if added to Patient type in future)
  if ((patient as any).hubId) {
    const hub = getHubById((patient as any).hubId);
    if (hub) return hub;
  }

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

  // Try to match condition to hub based on condition keywords
  if (patient.condition) {
    const condition = patient.condition.toLowerCase();
    const hub = getHubBySpecialty(condition);
    if (hub) return hub;
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
    // Direct hubId match (if patient has hubId property)
    if ((patient as any).hubId === hubId) {
      return true;
    }

    // Check if patient's hub matches
    const patientHub = getPatientHub(patient);
    if (patientHub && patientHub.id === hubId) {
      return true;
    }

    // Check if patient has appointments with matching specialty
    if (patient.appointments) {
      const hasMatchingAppointment = patient.appointments.some(apt => {
        if (!apt.specialty) return false;
        const aptHub = getHubBySpecialty(apt.specialty);
        return aptHub && aptHub.id === hubId;
      });
      if (hasMatchingAppointment) return true;
    }

    // Check if patient has clinical notes with matching specialty
    if (patient.clinicalNotes) {
      const hasMatchingNote = patient.clinicalNotes.some(note => {
        if (!note.specialty) return false;
        const noteHub = getHubBySpecialty(note.specialty);
        return noteHub && noteHub.id === hubId;
      });
      if (hasMatchingNote) return true;
    }

    // Check if patient has referrals with matching specialty
    if (patient.referrals) {
      const hasMatchingReferral = patient.referrals.some(ref => {
        if (!ref.specialty) return false;
        const refHub = getHubBySpecialty(ref.specialty as SpecialtyType);
        return refHub && refHub.id === hubId;
      });
      if (hasMatchingReferral) return true;
    }

    // Check if hub's specialties match patient's condition
    if (hub.specialties && hub.specialties.length > 0 && patient.condition) {
      const condition = patient.condition.toLowerCase();
      const matchesSpecialty = hub.specialties.some(spec => 
        condition.includes(spec.toLowerCase()) || spec.toLowerCase().includes(condition)
      );
      if (matchesSpecialty) return true;
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
  
  // Count active appointments (scheduled or confirmed)
  const activeAppointments = hubPatients.reduce((count, patient) => {
    if (!patient.appointments) return count;
    const active = patient.appointments.filter(apt => 
      apt.status === 'scheduled' || apt.status === 'completed' || apt.status === 'cancelled'
    );
    return count + active.length;
  }, 0);

  // Count recent clinical notes (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentNotes = hubPatients.reduce((count, patient) => {
    if (!patient.clinicalNotes) return count;
    const recent = patient.clinicalNotes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate >= thirtyDaysAgo;
    });
    return count + recent.length;
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
  let specialty: SpecialtyType | undefined = undefined;

  // Try to get specialty from hub's specialties array
  if (hub && hub.specialties && hub.specialties.length > 0) {
    // Use the first specialty as the default
    const firstSpecialty = hub.specialties[0].toLowerCase();
    // Map to SpecialtyType if it matches
    if (['cardiology', 'endocrinology', 'neurology', 'oncology', 'orthopedics', 
         'dermatology', 'gastroenterology', 'psychiatry', 'pediatrics'].includes(firstSpecialty)) {
      specialty = firstSpecialty as SpecialtyType;
    }
  }

  // If no specialty from hub, try to infer from hub name/id
  if (!specialty && hub) {
    const hubName = hub.name.toLowerCase();
    if (hubName.includes('cardio')) specialty = 'cardiology';
    else if (hubName.includes('endocrine')) specialty = 'endocrinology';
    else if (hubName.includes('neuro')) specialty = 'neurology';
    else if (hubName.includes('onco')) specialty = 'oncology';
    else if (hubName.includes('ortho')) specialty = 'orthopedics';
    else if (hubName.includes('derm')) specialty = 'dermatology';
    else if (hubName.includes('gastro')) specialty = 'gastroenterology';
    else if (hubName.includes('psych')) specialty = 'psychiatry';
    else if (hubName.includes('pediatr')) specialty = 'pediatrics';
  }

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
  let specialty: SpecialtyType | string = "";

  // Try to get specialty from hub's specialties array
  if (hub && hub.specialties && hub.specialties.length > 0) {
    specialty = hub.specialties[0];
  } else if (hub) {
    // Fallback to hub name
    specialty = hub.name;
  }

  return {
    id: `ref-${Date.now()}`,
    date: baseReferral.date || new Date().toISOString().split('T')[0],
    specialty: specialty as SpecialtyType,
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

  // Get specialty from hub
  let specialty: SpecialtyType | undefined = undefined;
  if (hub.specialties && hub.specialties.length > 0) {
    const firstSpecialty = hub.specialties[0].toLowerCase();
    if (['cardiology', 'endocrinology', 'neurology', 'oncology', 'orthopedics', 
         'dermatology', 'gastroenterology', 'psychiatry', 'pediatrics'].includes(firstSpecialty)) {
      specialty = firstSpecialty as SpecialtyType;
    }
  }

  return [
    {
      id: "schedule-appointment",
      label: "Schedule Appointment",
      action: "schedule",
      tab: "appointments",
      specialty,
    },
    {
      id: "create-consultation",
      label: "Create Consultation",
      action: "consultation",
      tab: "consultation",
      specialty,
    },
    {
      id: "create-referral",
      label: "Create Referral",
      action: "referral",
      tab: "referrals",
      specialty,
    },
    {
      id: "view-patients",
      label: "View Hub Patients",
      action: "filter-patients",
      hubId: hub.id,
    },
  ];
}

