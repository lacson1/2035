// Form helpers and autocomplete utilities
export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  category?: string;
}

// Common diagnoses/conditions
export const commonDiagnoses: AutocompleteOption[] = [
  { value: "Type 2 Diabetes", label: "Type 2 Diabetes", category: "Endocrine" },
  { value: "Hypertension", label: "Hypertension", category: "Cardiovascular" },
  { value: "Hyperlipidemia", label: "Hyperlipidemia", category: "Cardiovascular" },
  { value: "Coronary Artery Disease", label: "Coronary Artery Disease", category: "Cardiovascular" },
  { value: "Chronic Kidney Disease", label: "Chronic Kidney Disease", category: "Nephrology" },
  { value: "Depression", label: "Depression", category: "Psychiatry" },
  { value: "Anxiety", label: "Anxiety", category: "Psychiatry" },
  { value: "Asthma", label: "Asthma", category: "Pulmonology" },
  { value: "COPD", label: "COPD", category: "Pulmonology" },
  { value: "Osteoarthritis", label: "Osteoarthritis", category: "Orthopedics" },
  { value: "Rheumatoid Arthritis", label: "Rheumatoid Arthritis", category: "Rheumatology" },
  { value: "Hypothyroidism", label: "Hypothyroidism", category: "Endocrine" },
  { value: "Hyperthyroidism", label: "Hyperthyroidism", category: "Endocrine" },
  { value: "GERD", label: "GERD", category: "Gastroenterology" },
  { value: "Migraine", label: "Migraine", category: "Neurology" },
  { value: "Epilepsy", label: "Epilepsy", category: "Neurology" },
  { value: "Anemia", label: "Anemia", category: "Hematology" },
  { value: "Osteoporosis", label: "Osteoporosis", category: "Endocrine" },
  { value: "Pregnancy", label: "Pregnancy", category: "Obstetrics" },
  { value: "Long-COVID", label: "Long-COVID", category: "Infectious Disease" },
];

// Common procedure names
export const commonProcedures: AutocompleteOption[] = [
  { value: "Physical Examination", label: "Physical Examination", category: "General" },
  { value: "Blood Pressure Check", label: "Blood Pressure Check", category: "General" },
  { value: "Laboratory Draw", label: "Laboratory Draw", category: "Lab" },
  { value: "Echocardiogram", label: "Echocardiogram", category: "Cardiology" },
  { value: "Stress Test", label: "Stress Test", category: "Cardiology" },
  { value: "Chest X-Ray", label: "Chest X-Ray", category: "Imaging" },
  { value: "CT Scan", label: "CT Scan", category: "Imaging" },
  { value: "MRI", label: "MRI", category: "Imaging" },
  { value: "Ultrasound", label: "Ultrasound", category: "Imaging" },
  { value: "Colonoscopy", label: "Colonoscopy", category: "Gastroenterology" },
  { value: "Endoscopy", label: "Endoscopy", category: "Gastroenterology" },
  { value: "Biopsy", label: "Biopsy", category: "Surgery" },
  { value: "Laparoscopic Appendectomy", label: "Laparoscopic Appendectomy", category: "Surgery" },
  { value: "Total Hip Replacement", label: "Total Hip Replacement", category: "Orthopedics" },
  { value: "Knee Replacement", label: "Knee Replacement", category: "Orthopedics" },
  { value: "Cataract Surgery", label: "Cataract Surgery", category: "Ophthalmology" },
];

// Common symptoms/chief complaints
export const commonSymptoms: AutocompleteOption[] = [
  { value: "Chest pain", label: "Chest pain", category: "Cardiac" },
  { value: "Shortness of breath", label: "Shortness of breath", category: "Pulmonary" },
  { value: "Headache", label: "Headache", category: "Neurological" },
  { value: "Fever", label: "Fever", category: "Infectious" },
  { value: "Cough", label: "Cough", category: "Pulmonary" },
  { value: "Abdominal pain", label: "Abdominal pain", category: "Gastrointestinal" },
  { value: "Nausea", label: "Nausea", category: "Gastrointestinal" },
  { value: "Vomiting", label: "Vomiting", category: "Gastrointestinal" },
  { value: "Fatigue", label: "Fatigue", category: "General" },
  { value: "Dizziness", label: "Dizziness", category: "Neurological" },
  { value: "Joint pain", label: "Joint pain", category: "Musculoskeletal" },
  { value: "Back pain", label: "Back pain", category: "Musculoskeletal" },
  { value: "Rash", label: "Rash", category: "Dermatological" },
  { value: "Weight loss", label: "Weight loss", category: "General" },
  { value: "Weight gain", label: "Weight gain", category: "General" },
  { value: "Insomnia", label: "Insomnia", category: "Psychiatric" },
  { value: "Anxiety", label: "Anxiety", category: "Psychiatric" },
  { value: "Depression", label: "Depression", category: "Psychiatric" },
];

// Common lab test names
export const commonLabTests: AutocompleteOption[] = [
  { value: "Complete Blood Count", label: "Complete Blood Count (CBC)", category: "Hematology" },
  { value: "Complete Metabolic Panel", label: "Complete Metabolic Panel (CMP)", category: "Chemistry" },
  { value: "Basic Metabolic Panel", label: "Basic Metabolic Panel (BMP)", category: "Chemistry" },
  { value: "Lipid Panel", label: "Lipid Panel", category: "Chemistry" },
  { value: "Hemoglobin A1C", label: "Hemoglobin A1C", category: "Endocrine" },
  { value: "TSH", label: "TSH", category: "Endocrine" },
  { value: "Free T4", label: "Free T4", category: "Endocrine" },
  { value: "INR", label: "INR", category: "Coagulation" },
  { value: "PT", label: "PT", category: "Coagulation" },
  { value: "PTT", label: "PTT", category: "Coagulation" },
  { value: "Glucose Tolerance Test", label: "Glucose Tolerance Test (GTT)", category: "Endocrine" },
  { value: "Urinalysis", label: "Urinalysis", category: "Urine" },
  { value: "Urine Culture", label: "Urine Culture", category: "Microbiology" },
  { value: "Blood Culture", label: "Blood Culture", category: "Microbiology" },
  { value: "Vitamin D", label: "Vitamin D", category: "Endocrine" },
  { value: "B12", label: "Vitamin B12", category: "Hematology" },
  { value: "Folate", label: "Folate", category: "Hematology" },
  { value: "Creatinine", label: "Creatinine", category: "Chemistry" },
  { value: "eGFR", label: "eGFR", category: "Chemistry" },
];

// Common allergies
export const commonAllergies: AutocompleteOption[] = [
  { value: "Penicillin", label: "Penicillin", category: "Antibiotic" },
  { value: "Sulfa drugs", label: "Sulfa drugs", category: "Antibiotic" },
  { value: "Aspirin", label: "Aspirin", category: "NSAID" },
  { value: "Ibuprofen", label: "Ibuprofen", category: "NSAID" },
  { value: "Codeine", label: "Codeine", category: "Opioid" },
  { value: "Morphine", label: "Morphine", category: "Opioid" },
  { value: "Latex", label: "Latex", category: "Other" },
  { value: "Shellfish", label: "Shellfish", category: "Food" },
  { value: "Peanuts", label: "Peanuts", category: "Food" },
  { value: "Iodine contrast", label: "Iodine contrast", category: "Contrast" },
  { value: "Eggs", label: "Eggs", category: "Food" },
  { value: "Dairy", label: "Dairy", category: "Food" },
];

// Common appointment types
export const appointmentTypes: AutocompleteOption[] = [
  { value: "Follow-up", label: "Follow-up", category: "Routine" },
  { value: "Consultation", label: "Consultation", category: "Routine" },
  { value: "Annual Exam", label: "Annual Exam", category: "Preventive" },
  { value: "Prenatal Visit", label: "Prenatal Visit", category: "Obstetrics" },
  { value: "Post-op Follow-up", label: "Post-op Follow-up", category: "Surgical" },
  { value: "Psychiatry Follow-up", label: "Psychiatry Follow-up", category: "Psychiatry" },
  { value: "Emergency", label: "Emergency", category: "Urgent" },
  { value: "Urgent Care", label: "Urgent Care", category: "Urgent" },
];

// Common anesthesia types
export const anesthesiaTypes: AutocompleteOption[] = [
  { value: "General", label: "General", category: "General" },
  { value: "Regional", label: "Regional", category: "Regional" },
  { value: "Local", label: "Local", category: "Local" },
  { value: "General with regional block", label: "General with regional block", category: "Combined" },
  { value: "Spinal", label: "Spinal", category: "Regional" },
  { value: "Epidural", label: "Epidural", category: "Regional" },
];

// Common operating rooms
export const operatingRooms: AutocompleteOption[] = [
  { value: "OR-1", label: "OR-1", category: "Main" },
  { value: "OR-2", label: "OR-2", category: "Main" },
  { value: "OR-3", label: "OR-3", category: "Main" },
  { value: "OR-4", label: "OR-4", category: "Main" },
  { value: "OR-5", label: "OR-5", category: "Main" },
  { value: "OR-6", label: "OR-6", category: "Main" },
];

// Search function for autocomplete
export function searchAutocomplete<T extends AutocompleteOption>(
  query: string,
  options: T[],
  maxResults: number = 10
): T[] {
  if (!query || query.length < 1) return [];
  
  const lowerQuery = query.toLowerCase();
  return options
    .filter((option) => {
      const matchesValue = option.value.toLowerCase().includes(lowerQuery);
      const matchesLabel = option.label.toLowerCase().includes(lowerQuery);
      const matchesCategory = option.category?.toLowerCase().includes(lowerQuery);
      return matchesValue || matchesLabel || matchesCategory;
    })
    .slice(0, maxResults);
}

// Get suggestions based on patient history
export function getPatientHistorySuggestions(
  field: string,
  patientData?: any
): AutocompleteOption[] {
  const suggestions: AutocompleteOption[] = [];
  
  if (!patientData) return suggestions;
  
  switch (field) {
    case "diagnosis":
    case "preoperativeDiagnosis":
    case "postoperativeDiagnosis":
      if (patientData.condition) {
        suggestions.push({ value: patientData.condition, label: patientData.condition });
      }
      if (patientData.clinicalNotes) {
        patientData.clinicalNotes.forEach((note: any) => {
          // Extract potential diagnoses from notes
          const words = note.content?.split(/\s+/) || [];
          words.forEach((word: string) => {
            if (word.length > 5) {
              const match = commonDiagnoses.find(d => 
                word.toLowerCase().includes(d.value.toLowerCase()) ||
                d.value.toLowerCase().includes(word.toLowerCase())
              );
              if (match && !suggestions.find(s => s.value === match.value)) {
                suggestions.push(match);
              }
            }
          });
        });
      }
      break;
      
    case "allergies":
      if (patientData.allergies) {
        patientData.allergies.forEach((allergy: string) => {
          suggestions.push({ value: allergy, label: allergy });
        });
      }
      break;
      
    case "medication":
      if (patientData.medications) {
        patientData.medications.forEach((med: any) => {
          const medName = med.name.split(" ")[0]; // Extract drug name
          suggestions.push({ value: medName, label: medName });
        });
      }
      break;
  }
  
  return suggestions;
}

// Smart defaults based on context
export function getSmartDefaults(
  field: string,
  patientData?: any,
  currentUser?: any
): string | null {
  if (!patientData && !currentUser) return null;
  
  switch (field) {
    case "date":
      return new Date().toISOString().split("T")[0];
      
    case "time":
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
      
    case "provider":
      return currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : null;
      
    case "author":
      return currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : null;
      
    case "surgeon":
      return currentUser?.role === "physician" 
        ? `${currentUser.firstName} ${currentUser.lastName}` 
        : null;
        
    case "anesthesiologist":
      return null; // Usually different person
      
    case "procedureType":
      return "scheduled";
      
    case "status":
      return "scheduled";
      
    case "duration":
      return "30"; // Default 30 minutes
      
    default:
      return null;
  }
}

// Form validation helpers
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export function validateField(
  _field: string,
  value: string,
  options?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => ValidationResult;
  }
): ValidationResult {
  const { required, minLength, maxLength, pattern, customValidator } = options || {};
  
  if (required && (!value || value.trim().length === 0)) {
    return {
      isValid: false,
      error: "This field is required",
    };
  }
  
  if (value && minLength && value.length < minLength) {
    return {
      isValid: false,
      error: `Must be at least ${minLength} characters`,
    };
  }
  
  if (value && maxLength && value.length > maxLength) {
    return {
      isValid: false,
      error: `Must be no more than ${maxLength} characters`,
    };
  }
  
  if (value && pattern && !pattern.test(value)) {
    return {
      isValid: false,
      error: "Invalid format",
    };
  }
  
  if (customValidator) {
    return customValidator(value);
  }
  
  return { isValid: true };
}

// Validate email
export function validateEmail(email: string): ValidationResult {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }
  if (!emailPattern.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  return { isValid: true };
}

// Validate phone
export function validatePhone(phone: string): ValidationResult {
  const phonePattern = /^[\d\s\(\)\-\+\.]+$/;
  if (!phone) {
    return { isValid: false, error: "Phone number is required" };
  }
  if (!phonePattern.test(phone)) {
    return { isValid: false, error: "Please enter a valid phone number" };
  }
  return { isValid: true };
}

// Validate date
export function validateDate(date: string, options?: { minDate?: string; maxDate?: string }): ValidationResult {
  if (!date) {
    return { isValid: false, error: "Date is required" };
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: "Invalid date format" };
  }
  
  if (options?.minDate && date < options.minDate) {
    return { isValid: false, error: `Date must be on or after ${options.minDate}` };
  }
  
  if (options?.maxDate && date > options.maxDate) {
    return { isValid: false, error: `Date must be on or before ${options.maxDate}` };
  }
  
  return { isValid: true };
}

// Auto-format phone number
export function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 0) return "";
  
  if (cleaned.length <= 3) {
    return `(${cleaned}`;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
}

// Auto-format date
export function formatDate(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 0) return "";
  
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 4) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  } else {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  }
}

// Get field hints/help text
export function getFieldHint(field: string): string | null {
  const hints: Record<string, string> = {
    procedureName: "Enter the full procedure name (e.g., 'Laparoscopic Appendectomy')",
    indication: "Brief reason for the procedure or visit",
    preoperativeDiagnosis: "Diagnosis before the procedure",
    postoperativeDiagnosis: "Diagnosis after the procedure (if different)",
    procedureDescription: "Detailed description of what was performed",
    findings: "Any significant findings during the procedure",
    complications: "Any complications encountered (enter 'None' if none)",
    estimatedBloodLoss: "Estimated blood loss in mL or descriptive (e.g., 'Minimal (<50ml)')",
    duration: "Procedure duration in minutes",
    operatingRoom: "Operating room number (e.g., 'OR-1')",
    anesthesiaType: "Type of anesthesia used",
    startTime: "Procedure start time in 24-hour format (e.g., '08:00')",
    endTime: "Procedure end time in 24-hour format (e.g., '09:30')",
    diagnosis: "Primary diagnosis code or description",
    chiefComplaint: "Patient's main complaint in their own words",
    historyOfPresentIllness: "Chronological description of current illness",
    assessment: "Clinical assessment and differential diagnosis",
    plan: "Treatment plan and follow-up instructions",
    medicationName: "Enter medication name (autocomplete available)",
    dose: "Dosage amount (e.g., '1000mg', '10mg')",
    frequency: "How often to take (QD, BID, TID, QID, QHS, PRN)",
    instructions: "Special instructions for the patient",
    testName: "Lab test name (autocomplete available)",
    testCode: "Optional test code (e.g., 'CMP', 'CBC')",
    category: "Test category (e.g., 'Chemistry', 'Hematology')",
  };
  
  return hints[field] || null;
}

