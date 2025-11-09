export interface Medication {
  name: string;
  status: "Active" | "Discontinued" | "Historical" | "Archived";
  started: string;
  instructions?: string;
  prescriptionType?: "repeat" | "acute";
  refillsRemaining?: number;
  refillsAuthorized?: number;
  durationDays?: number;
  expiryDate?: string;
}

export type UserRole = 
  | "admin"
  | "physician"
  | "nurse"
  | "nurse_practitioner"
  | "physician_assistant"
  | "medical_assistant"
  | "receptionist"
  | "billing"
  | "pharmacist"
  | "lab_technician"
  | "radiologist"
  | "therapist"
  | "social_worker"
  | "care_coordinator"
  | "read_only";

export type Permission = 
  | "view_patients"
  | "edit_patients"
  | "delete_patients"
  | "view_medications"
  | "prescribe_medications"
  | "view_notes"
  | "create_notes"
  | "edit_notes"
  | "delete_notes"
  | "view_appointments"
  | "schedule_appointments"
  | "cancel_appointments"
  | "view_imaging"
  | "order_imaging"
  | "view_labs"
  | "order_labs"
  | "view_billing"
  | "edit_billing"
  | "manage_users"
  | "manage_settings"
  | "view_telemedicine"
  | "conduct_telemedicine"
  | "view_consultations"
  | "create_consultations"
  | "view_reports"
  | "export_data";

export interface RolePermissions {
  role: UserRole;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  specialty?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ConsultationType = "general" | "specialty";
export type SpecialtyType = 
  | "cardiology"
  | "endocrinology"
  | "neurology"
  | "oncology"
  | "orthopedics"
  | "dermatology"
  | "gastroenterology"
  | "pulmonology"
  | "rheumatology"
  | "nephrology"
  | "psychiatry"
  | "psychology"
  | "ophthalmology"
  | "urology"
  | "gynecology"
  | "obstetrics"
  | "pediatrics"
  | "geriatrics"
  | "anesthesiology"
  | "radiology"
  | "pathology"
  | "emergency_medicine"
  | "family_medicine"
  | "internal_medicine"
  | "surgery"
  | "neurosurgery"
  | "plastic_surgery"
  | "vascular_surgery"
  | "general_surgery"
  | "orthopedic_surgery"
  | "otolaryngology"
  | "allergy_immunology"
  | "infectious_disease"
  | "hematology"
  | "sports_medicine"
  | "physical_medicine"
  | "pain_management"
  | "sleep_medicine"
  | "critical_care"
  | "other";

export interface SpecialtyTemplate {
  specialty: SpecialtyType;
  name: string;
  icon?: string;
  consultationTemplate: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: string[];
    physicalExamination: string[];
    assessment: string;
    plan: string[];
    commonDiagnoses: string[];
    commonTests: string[];
    commonMedications: string[];
  };
}

export interface CustomConsultationTemplate {
  id: string;
  name: string;
  description?: string;
  hubId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  consultationTemplate: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: string[];
    physicalExamination: string[];
    assessment: string;
    plan: string[];
    commonDiagnoses: string[];
    commonTests: string[];
    commonMedications: string[];
  };
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  provider: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  consultationType?: ConsultationType;
  specialty?: SpecialtyType;
  duration?: number; // in minutes
  location?: string; // "in-person" | "telemedicine" | "hybrid"
  reason?: string;
  referralRequired?: boolean;
}

export interface ClinicalNote {
  id: string;
  date: string;
  author: string;
  title: string;
  content: string;
  type: "visit" | "consultation" | "procedure" | "follow-up" | "general_consultation" | "specialty_consultation";
  consultationType?: ConsultationType;
  specialty?: SpecialtyType;
}

export interface ImagingStudy {
  id: string;
  date: string;
  type: string;
  modality: "CT" | "MRI" | "X-Ray" | "Ultrasound" | "PET";
  bodyPart: string;
  findings: string;
  status: "completed" | "pending" | "cancelled";
  reportUrl?: string;
}

export type LabStatus = "ordered" | "in_progress" | "completed" | "cancelled" | "pending_review";

export interface LabResult {
  id: string;
  testName: string;
  testCode?: string;
  category?: string;
  orderedDate: string;
  collectedDate?: string;
  resultDate?: string;
  status: LabStatus;
  results?: {
    [key: string]: {
      value: string | number;
      unit?: string;
      flag?: "normal" | "high" | "low" | "critical";
      referenceRange?: string;
    };
  };
  referenceRanges?: {
    [key: string]: string;
  };
  interpretation?: string;
  notes?: string;
  orderingPhysician?: string;
  orderingPhysicianId?: string;
  reviewedById?: string;
  reviewedAt?: string;
  assignedForReview?: string | null; // User ID assigned for review
  labName?: string;
  labLocation?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: "appointment" | "note" | "imaging" | "medication" | "lab" | "referral" | "consent" | "surgery" | "nutrition" | "vaccination";
  title: string;
  description: string;
  icon: string;
}

export type ReferralStatus = "pending" | "sent" | "accepted" | "completed" | "cancelled" | "declined";
export type ReferralPriority = "routine" | "urgent" | "stat" | "emergency";

export interface Referral {
  id: string;
  date: string;
  referringPhysician?: string;
  referringPhysicianId?: string;
  specialty: SpecialtyType | string;
  reason: string;
  diagnosis?: string;
  priority: ReferralPriority;
  status: ReferralStatus;
  referredToProvider?: string;
  referredToProviderId?: string;
  referredToFacility?: string;
  referredToAddress?: string;
  referredToPhone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string;
  attachments?: string[];
  insurancePreAuth?: boolean;
  preAuthNumber?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export type ConsentType = "procedure" | "surgery" | "anesthesia" | "blood_transfusion" | "imaging_contrast" | "research" | "photography" | "other";
export type ConsentStatus = "pending" | "signed" | "declined" | "expired" | "revoked";

export interface Consent {
  id: string;
  date: string;
  type: ConsentType;
  title: string;
  description: string;
  status: ConsentStatus;
  procedureName?: string;
  risks?: string[];
  benefits?: string[];
  alternatives?: string[];
  signedBy?: string; // Patient or guardian name
  signedById?: string;
  witnessName?: string;
  witnessId?: string;
  physicianName?: string;
  physicianId?: string;
  signedDate?: string;
  signedTime?: string;
  expirationDate?: string;
  notes?: string;
  digitalSignature?: string;
  printedSignature?: boolean;
}

export type SurgicalProcedureType = "elective" | "emergency" | "urgent" | "scheduled";
export type SurgicalStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed";

export interface SurgicalNote {
  id: string;
  date: string;
  procedureName: string;
  procedureType: SurgicalProcedureType;
  status: SurgicalStatus;
  surgeon?: string;
  surgeonId?: string;
  assistantSurgeons?: string[];
  anesthesiologist?: string;
  anesthesiologistId?: string;
  anesthesiaType?: string;
  indication: string;
  preoperativeDiagnosis: string;
  postoperativeDiagnosis?: string;
  procedureDescription: string;
  findings?: string;
  complications?: string;
  estimatedBloodLoss?: string;
  specimens?: string[];
  drains?: string;
  postOpInstructions?: string;
  recoveryNotes?: string;
  followUpDate?: string;
  operatingRoom?: string;
  duration?: number; // in minutes
  startTime?: string;
  endTime?: string;
}

export interface NutritionEntry {
  id: string;
  date: string;
  type: "assessment" | "plan" | "consultation" | "monitoring";
  dietitian?: string;
  dietitianId?: string;
  dietaryRestrictions?: string[];
  allergies?: string[];
  currentDiet?: string;
  recommendedDiet?: string;
  nutritionalGoals?: string[];
  caloricNeeds?: number;
  proteinNeeds?: number; // grams
  fluidNeeds?: number; // ml
  supplements?: {
    name: string;
    dosage: string;
    frequency: string;
    reason?: string;
  }[];
  mealPlan?: {
    meal: string;
    description: string;
    calories?: number;
  }[];
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
  notes?: string;
  followUpDate?: string;
}

export interface Vaccination {
  id: string;
  vaccineName: string;
  vaccineCode?: string;
  date: string;
  administeredBy?: string;
  administeredById?: string;
  location?: string;
  route?: "intramuscular" | "subcutaneous" | "oral" | "intranasal" | "intradermal";
  site?: string;
  lotNumber?: string;
  manufacturer?: string;
  expirationDate?: string;
  doseNumber?: number;
  totalDoses?: number;
  nextDoseDate?: string;
  adverseReactions?: string[];
  notes?: string;
  verified?: boolean;
  verifiedBy?: string;
  verifiedById?: string;
  verifiedDate?: string;
}

export type HubId = string;

export interface Hub {
  id: HubId;
  name: string;
  description: string;
  color: string;
  specialties: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HubFunction {
  id: string;
  hubId: HubId;
  name: string;
  description?: string | null;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HubResource {
  id: string;
  hubId: HubId;
  title: string;
  type: "protocol" | "guideline" | "reference" | "tool" | "link" | string;
  url?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HubNote {
  id: string;
  hubId: HubId;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface HubTemplate {
  id: string;
  hubId?: HubId | null;
  name: string;
  description?: string | null;
  template: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface HubTeamMember {
  id: string;
  hubId: HubId;
  userId: string;
  role?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bp: string;
  condition: string;
  risk: number;
  address?: string;
  email?: string;
  dob?: string;
  phone?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  familyHistory?: string[];
  pharmacogenomics?: {
    tested: boolean;
    variants?: string[];
    notes?: string;
  };
  socialDeterminants?: {
    housingStability?: "stable" | "unstable" | "homeless";
    foodSecurity?: "secure" | "insecure";
    transportation?: "reliable" | "limited" | "none";
    healthLiteracy?: "high" | "medium" | "low";
  };
  lifestyle?: {
    activityLevel?: "sedentary" | "moderate" | "active" | "very_active";
    sleepHours?: number;
    smokingStatus?: "never" | "former" | "current";
    alcoholUse?: "none" | "occasional" | "moderate" | "heavy";
  };
  immunizations?: {
    lastFluShot?: string;
    covidVaccinated?: boolean;
    lastCovidBooster?: string;
    other?: { name: string; date: string }[];
  };
  preferredLanguage?: string;
  advancedDirectives?: {
    livingWill?: boolean;
    powerOfAttorney?: string;
    dnrStatus?: boolean;
  };
  medications: Medication[];
  appointments?: Appointment[];
  clinicalNotes?: ClinicalNote[];
  imagingStudies?: ImagingStudy[];
  labResults?: LabResult[];
  referrals?: Referral[];
  consents?: Consent[];
  surgicalNotes?: SurgicalNote[];
  nutritionEntries?: NutritionEntry[];
  vaccinations?: Vaccination[];
  timeline?: TimelineEvent[];
}

