import { z } from 'zod';

export const EmergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
});

export const InsuranceSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  groupNumber: z.string().optional(),
});

export const PharmacogenomicsSchema = z.object({
  tested: z.boolean(),
  variants: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const SocialDeterminantsSchema = z.object({
  housingStability: z.enum(['stable', 'unstable', 'homeless']).optional(),
  foodSecurity: z.enum(['secure', 'insecure']).optional(),
  transportation: z.enum(['reliable', 'limited', 'none']).optional(),
  healthLiteracy: z.enum(['high', 'medium', 'low']).optional(),
});

export const LifestyleSchema = z.object({
  activityLevel: z.enum(['sedentary', 'moderate', 'active', 'very_active']).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  smokingStatus: z.enum(['never', 'former', 'current']).optional(),
  alcoholUse: z.enum(['none', 'occasional', 'moderate', 'heavy']).optional(),
});

export const ImmunizationsSchema = z.object({
  lastFluShot: z.string().optional(),
  covidVaccinated: z.boolean().optional(),
  lastCovidBooster: z.string().optional(),
  other: z.array(z.object({
    name: z.string(),
    date: z.string(),
  })).optional(),
});

export const AdvancedDirectivesSchema = z.object({
  livingWill: z.boolean().optional(),
  powerOfAttorney: z.string().optional(),
  dnrStatus: z.boolean().optional(),
});

// Backend Medication Schema (matches Prisma model)
export const BackendMedicationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Medication name is required'),
  status: z.enum(['Active', 'Discontinued', 'Historical', 'Archived']),
  startedDate: z.union([z.string(), z.date()]).transform((val) =>
    typeof val === 'string' ? val : val.toISOString()
  ),
  instructions: z.string().nullable().optional(),
});

// Frontend Medication Schema (transformed)
export const MedicationSchema = BackendMedicationSchema.transform((data) => ({
  name: data.name,
  status: data.status,
  started: data.startedDate,
  instructions: data.instructions || undefined,
}));

export const AppointmentSchema = z.object({
  id: z.string(),
  type: z.string(),
  date: z.string(),
  time: z.string(),
  provider: z.string(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

export const ClinicalNoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  author: z.string(),
  date: z.string(),
  type: z.enum(['visit', 'consultation', 'procedure', 'follow-up', 'general_consultation', 'specialty_consultation']),
});

export const ImagingStudySchema = z.object({
  id: z.string(),
  type: z.string(),
  modality: z.enum(["CT", "MRI", "X-Ray", "Ultrasound", "PET"]),
  bodyPart: z.string(),
  date: z.string(),
  status: z.enum(["completed", "pending", "cancelled"]),
  findings: z.string(),
  orderingPhysician: z.string().optional(),
  reportUrl: z.string().optional(),
});

export const TimelineEventSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.enum(['appointment', 'note', 'medication', 'imaging', 'lab']),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
});

// Backend Patient Schema (matches Prisma model)
export const BackendPatientSchema = z.object({
  id: z.string().min(1, 'Patient ID is required'),
  name: z.string().min(1, 'Patient name is required'),
  dateOfBirth: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? val : val.toISOString()
  ),
  gender: z.string().min(1, 'Gender is required'),
  bloodPressure: z.string().nullable().optional(),
  condition: z.string().nullable().optional(),
  riskScore: z.number().nullable().optional(),
  address: z.string().nullable().optional(),
  email: z.string().email('Invalid email address').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  preferredLanguage: z.string().nullable().optional(),
  allergies: z.array(z.string()).optional(),
  emergencyContact: z.union([EmergencyContactSchema, z.null()]).optional(),
  insurance: z.union([InsuranceSchema, z.null()]).optional(),
  familyHistory: z.array(z.string()).optional(),
  pharmacogenomics: z.union([PharmacogenomicsSchema, z.null()]).optional(),
  socialDeterminants: z.union([SocialDeterminantsSchema, z.null()]).optional(),
  lifestyle: z.union([LifestyleSchema, z.null()]).optional(),
  immunizations: z.union([ImmunizationsSchema, z.null()]).optional(),
  advancedDirectives: z.union([AdvancedDirectivesSchema, z.null()]).optional(),
  medications: z.array(BackendMedicationSchema).optional(),
  appointments: z.array(AppointmentSchema).optional(),
  clinicalNotes: z.array(ClinicalNoteSchema).optional(),
  imagingStudies: z.array(ImagingStudySchema).optional(),
  timeline: z.array(TimelineEventSchema).optional(),
});

// Frontend Patient Schema (transformed from backend)
export const PatientSchema = BackendPatientSchema.transform((data) => {
  // Calculate age from dateOfBirth
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return {
    ...data,
    // Transform backend fields to frontend format
    age: calculateAge(data.dateOfBirth),
    bp: data.bloodPressure || '',
    risk: data.riskScore || 0,
    dob: data.dateOfBirth,
    // Handle null values - convert to undefined
    pharmacogenomics: data.pharmacogenomics || undefined,
    socialDeterminants: data.socialDeterminants || undefined,
    lifestyle: data.lifestyle || undefined,
    immunizations: data.immunizations || undefined,
    advancedDirectives: data.advancedDirectives || undefined,
    emergencyContact: data.emergencyContact || undefined,
    insurance: data.insurance || undefined,
    medications: data.medications || [],
  };
});

export type PatientInput = z.infer<typeof PatientSchema>;
export type PatientOutput = z.infer<typeof PatientSchema>;

