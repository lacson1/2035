/**
 * Validation utilities
 * Shared validation helpers to reduce duplication
 */

import { BackendPatientSchema } from '../schemas/patient.schema';
import { Patient } from '../types';
import { logger } from './logger';

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
    age: calculateAge(data.dateOfBirth),
    gender: data.gender,
    bp: data.bloodPressure || '',
    condition: data.condition || '',
    risk: data.riskScore || 0,
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
    const transformed = transformBackendPatient(patient);
    if (transformed.id && transformed.name) {
      return transformed;
    }
    
    // Only log in development to avoid console noise
    if (import.meta.env.DEV) {
      logger.warn('Invalid patient data:', backendValidated.error);
    }
    return null;
  } catch (error) {
    if (import.meta.env.DEV) {
      logger.warn('Error validating patient:', error);
    }
    return null;
  }
}

/**
 * Validate multiple patients
 */
export function validatePatients(patients: unknown[]): Patient[] {
  return patients
    .map(validatePatient)
    .filter((patient): patient is Patient => patient !== null);
}

/**
 * Validate partial patient data (for create/update operations)
 */
export function validatePartialPatient(patient: unknown): Partial<Patient> | null {
  try {
    // For partial validation, we need to handle the case where we're creating a new patient
    // The input might be in frontend format or backend format
    const data = patient as any;
    
    // Convert frontend format to backend format
    const backendData: any = { ...data };
    
    // Convert dob to dateOfBirth
    if (data.dob && !data.dateOfBirth) {
      // If dob is a string, try to convert to ISO string
      if (typeof data.dob === 'string') {
        const dobDate = new Date(data.dob);
        if (!isNaN(dobDate.getTime())) {
          backendData.dateOfBirth = dobDate.toISOString();
        } else {
          backendData.dateOfBirth = data.dob; // Assume it's already ISO string
        }
      } else if (data.dob instanceof Date) {
        backendData.dateOfBirth = data.dob.toISOString();
      } else {
        backendData.dateOfBirth = data.dob;
      }
      delete backendData.dob;
    }
    
    // Convert bp to bloodPressure
    if (data.bp !== undefined && data.bloodPressure === undefined) {
      backendData.bloodPressure = data.bp || null;
      delete backendData.bp;
    }
    
    // Remove frontend-only fields that backend doesn't need
    delete backendData.age; // Backend calculates this from dateOfBirth
    delete backendData.risk; // Backend uses riskScore
    
    // If it looks like backend format (has dateOfBirth), return it as-is for backend
    if (backendData.dateOfBirth && !backendData.age && !backendData.bp) {
      // This is backend format, return it directly (backend will validate)
      return backendData as Partial<Patient>;
    }
    
    // Otherwise, try to transform it
    const transformed = transformBackendPatient(backendData);
    // Return only the fields that exist
    const partial: Partial<Patient> = {};
    Object.keys(transformed).forEach((key) => {
      const value = (transformed as any)[key];
      if (value !== undefined && value !== null) {
        (partial as any)[key] = value;
      }
    });
    return partial;
  } catch (error) {
    if (import.meta.env.DEV) {
      logger.warn('Error validating partial patient:', error);
    }
    // For create operations, be more lenient - return the original data
    // But still try to convert dob to dateOfBirth
    const data = patient as any;
    if (data.dob && !data.dateOfBirth) {
      const converted = { ...data };
      if (typeof data.dob === 'string') {
        const dobDate = new Date(data.dob);
        converted.dateOfBirth = !isNaN(dobDate.getTime()) ? dobDate.toISOString() : data.dob;
      } else if (data.dob instanceof Date) {
        converted.dateOfBirth = data.dob.toISOString();
      } else {
        converted.dateOfBirth = data.dob;
      }
      delete converted.dob;
      if (converted.bp !== undefined && converted.bloodPressure === undefined) {
        converted.bloodPressure = converted.bp || null;
        delete converted.bp;
      }
      return converted as Partial<Patient>;
    }
    return patient as Partial<Patient>;
  }
}

