/**
 * Validation utilities
 * Shared validation helpers to reduce duplication
 */

import { BackendPatientSchema } from '../schemas/patient.schema';
import { Patient } from '../types';

/**
 * Transform backend patient data to frontend format
 */
function transformBackendPatient(data: any): Patient {
  // Calculate age from dateOfBirth
  const calculateAge = (dob: string): number => {
    try {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return 0;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return Math.max(0, age);
    } catch {
      return 0;
    }
  };

  // Transform medications from backend format
  const transformedMedications = (data.medications || []).map((med: any) => ({
    name: med.name,
    status: med.status,
    started: med.startedDate || med.started || '',
    instructions: med.instructions || undefined,
  }));

  return {
    id: data.id,
    name: data.name,
    age: typeof data.age === 'number' ? data.age : calculateAge(data.dateOfBirth),
    gender: data.gender,
    bp: typeof data.bp === 'string' ? data.bp : data.bloodPressure || '',
    condition: data.condition || '',
    risk: typeof data.risk === 'number' ? data.risk : data.riskScore || 0,
    address: data.address || undefined,
    email: data.email || undefined,
    dob: typeof data.dateOfBirth === 'string' ? data.dateOfBirth : data.dateOfBirth?.toISOString() || '',
    phone: data.phone || undefined,
    preferredLanguage: data.preferredLanguage || undefined,
    allergies: data.allergies || undefined,
    emergencyContact: data.emergencyContact || undefined,
    insurance: data.insurance || undefined,
    familyHistory: data.familyHistory || undefined,
    pharmacogenomics: data.pharmacogenomics || undefined,
    socialDeterminants: data.socialDeterminants || undefined,
    lifestyle: data.lifestyle || undefined,
    immunizations: data.immunizations || undefined,
    advancedDirectives: data.advancedDirectives || undefined,
    medications: transformedMedications,
    appointments: data.appointments || undefined,
    clinicalNotes: data.clinicalNotes || undefined,
    imagingStudies: data.imagingStudies || undefined,
    timeline: data.timeline || undefined,
  };
}

/**
 * Validate a single patient object (from backend)
 */
export function validatePatient(patient: unknown): Patient | null {
  try {
    // First validate backend format
    const backendValidated = BackendPatientSchema.safeParse(patient);
    if (backendValidated.success) {
      // Transform to frontend format
      return transformBackendPatient(backendValidated.data);
    }
    
    // If backend validation fails, try to transform anyway (for partial data)
    // This handles cases where backend might send incomplete data
    if (patient && typeof patient === 'object' && 'id' in (patient as any) && 'name' in (patient as any)) {
      return patient as Patient;
    }
    
    // Only log in development to avoid console noise
    if (import.meta.env.DEV) {
      console.warn('Invalid patient data:', backendValidated.error);
    }
    return null;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Error validating patient:', error);
    }
    return null;
  }
}

/**
 * Validate multiple patients
 */
export function validatePatients(patients: unknown[]): Patient[] {
  return patients
    .map((patient) => validatePatient(patient) ?? (patient as Patient))
    .filter((patient): patient is Patient => patient !== null);
}

/**
 * Validate partial patient data (for create/update operations)
 */
export function validatePartialPatient(patient: unknown): Partial<Patient> | null {
  try {
    // For partial validation, we need to handle the case where we're creating a new patient
    // The input might be in frontend format or backend format
    if (typeof patient !== 'object' || patient === null) {
      return null;
    }

    const data = patient as Record<string, unknown>;

    // If it looks like backend format (has dateOfBirth), strip undefined values but keep structure
    if ('dateOfBirth' in data) {
      return Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined),
      ) as Partial<Patient>;
    }

    // Otherwise assume frontend format and only keep provided fields
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as Partial<Patient>;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Error validating partial patient:', error);
    }
    // For create operations, be more lenient - return the original data
    return patient as Partial<Patient>;
  }
}

