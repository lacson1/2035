import { Patient } from "../types";
import { getActiveMedications } from "./patientUtils";

export interface TemplateMacro {
  shortcut: string;
  description: string;
  expand: (patient: Patient) => string;
}

/**
 * Template shortcuts that can be typed in note editors
 * Usage: Type #diabetes to insert diabetes template
 */
export const templateShortcuts: Record<string, (patient: Patient) => string> = {
  "#diabetes": (patient) => {
    const age = patient.age || 0;
    const meds = getActiveMedications(patient);
    const diabetesMeds = meds.filter(m => 
      m.name.toLowerCase().includes("metformin") ||
      m.name.toLowerCase().includes("insulin") ||
      m.name.toLowerCase().includes("glipizide") ||
      m.name.toLowerCase().includes("glimepiride")
    );
    
    return `DIABETES VISIT

Chief Complaint: Follow-up for diabetes management

History of Present Illness:
Patient is a ${age}-year-old ${patient.gender} with type 2 diabetes mellitus. ${diabetesMeds.length > 0 ? `Currently on ${diabetesMeds.map(m => m.name).join(", ")}.` : "No current diabetes medications."}

Review of Systems:
- No polyuria, polydipsia, or polyphagia
- No vision changes
- No numbness or tingling in extremities
- No foot ulcers or wounds

Assessment:
Type 2 Diabetes Mellitus - ${patient.condition?.toLowerCase().includes("diabetes") ? "Well controlled" : "Needs optimization"}

Plan:
- Continue current diabetes medications
- Monitor HbA1c every 3 months
- Annual diabetic eye exam
- Annual diabetic foot exam
- Continue diet and exercise counseling`;
  },

  "#hypertension": (patient) => {
    const bp = patient.bp || "N/A";
    const meds = getActiveMedications(patient);
    const bpMeds = meds.filter(m => 
      m.name.toLowerCase().includes("lisinopril") ||
      m.name.toLowerCase().includes("amlodipine") ||
      m.name.toLowerCase().includes("losartan") ||
      m.name.toLowerCase().includes("metoprolol")
    );
    
    return `HYPERTENSION VISIT

Chief Complaint: Follow-up for hypertension management

History of Present Illness:
Patient is a ${patient.age || "N/A"}-year-old ${patient.gender} with hypertension. Current BP: ${bp}. ${bpMeds.length > 0 ? `Currently on ${bpMeds.map(m => m.name).join(", ")}.` : "No current antihypertensive medications."}

Review of Systems:
- No chest pain or palpitations
- No headaches
- No vision changes
- No shortness of breath

Assessment:
Hypertension - ${bp.includes("/") ? (parseInt(bp.split("/")[0]) < 140 ? "Well controlled" : "Needs optimization") : "Status unknown"}

Plan:
- Continue current antihypertensive medications
- Monitor blood pressure regularly
- Lifestyle modifications: DASH diet, regular exercise
- Follow-up in 3 months`;
  },

  "#wellness": (patient) => {
    const age = patient.age || 0;
    const meds = getActiveMedications(patient);
    
    return `ANNUAL WELLNESS VISIT

Chief Complaint: Annual wellness examination

History of Present Illness:
Patient is a ${age}-year-old ${patient.gender} presenting for annual wellness visit. ${meds.length > 0 ? `Currently taking ${meds.length} medication(s).` : "No current medications."}

Review of Systems:
- General: No weight changes, fatigue, or fever
- Cardiovascular: No chest pain, palpitations, or shortness of breath
- Respiratory: No cough, wheezing, or dyspnea
- Gastrointestinal: No abdominal pain, nausea, or changes in bowel habits
- Genitourinary: No dysuria, frequency, or urgency
- Neurological: No headaches, dizziness, or weakness
- Musculoskeletal: No joint pain or stiffness
- Skin: No rashes or lesions

Assessment:
- Healthy ${age}-year-old ${patient.gender}
- Continue preventive care measures

Plan:
- Annual screening labs
- Age-appropriate cancer screenings
- Vaccination review
- Lifestyle counseling: diet, exercise, smoking cessation if applicable
- Follow-up in 1 year`;
  },

  "#cold": (patient) => {
    return `UPPER RESPIRATORY INFECTION

Chief Complaint: Cold symptoms

History of Present Illness:
Patient presents with ${patient.age ? `${patient.age}-day` : "recent"} history of:
- Nasal congestion
- Rhinorrhea
- Cough
- Sore throat

Review of Systems:
- No fever
- No shortness of breath
- No chest pain

Assessment:
Upper Respiratory Infection, likely viral

Plan:
- Supportive care: rest, fluids, saline nasal spray
- Symptomatic treatment as needed
- Return if symptoms worsen or persist >10 days
- Follow-up PRN`;
  },
};

/**
 * Macros that expand to patient data
 * Usage: Type @bp to get "Blood pressure: 120/80"
 */
export const dataMacros: Record<string, (patient: Patient) => string> = {
  "@bp": (patient) => `Blood pressure: ${patient.bp || "Not recorded"}`,
  "@age": (patient) => `Age: ${patient.age || "N/A"} years`,
  "@gender": (patient) => `Gender: ${patient.gender || "N/A"}`,
  "@meds": (patient) => {
    const meds = getActiveMedications(patient);
    if (meds.length === 0) return "Current medications: None";
    return `Current medications:\n${meds.map((m, i) => `${i + 1}. ${m.name}`).join("\n")}`;
  },
  "@allergies": (patient) => {
    const allergies = patient.allergies || [];
    if (allergies.length === 0) return "Allergies: None known";
    return `Allergies: ${allergies.join(", ")}`;
  },
  "@condition": (patient) => `Primary condition: ${patient.condition || "None documented"}`,
  "@risk": (patient) => `Risk score: ${patient.risk || 0}%`,
  "@dob": (patient) => {
    if (!patient.dob) return "Date of birth: Not recorded";
    const dob = new Date(patient.dob);
    return `Date of birth: ${dob.toLocaleDateString()} (Age: ${patient.age || "N/A"} years)`;
  },
  "@phone": (patient) => `Phone: ${patient.phone || "Not recorded"}`,
  "@email": (patient) => `Email: ${patient.email || "Not recorded"}`,
  "@address": (patient) => `Address: ${patient.address || "Not recorded"}`,
};

/**
 * Process text and expand any shortcuts or macros
 */
export function processTemplateShortcuts(text: string, patient: Patient): string {
  let processed = text;

  // Process template shortcuts (#diabetes, #hypertension, etc.)
  for (const [shortcut, templateFn] of Object.entries(templateShortcuts)) {
    if (processed.includes(shortcut)) {
      processed = processed.replace(shortcut, templateFn(patient));
    }
  }

  // Process data macros (@bp, @meds, etc.)
  for (const [macro, macroFn] of Object.entries(dataMacros)) {
    if (processed.includes(macro)) {
      processed = processed.replace(macro, macroFn(patient));
    }
  }

  return processed;
}

/**
 * Get available shortcuts for autocomplete
 */
export function getAvailableShortcuts(): Array<{ shortcut: string; description: string; type: "template" | "macro" }> {
  const shortcuts: Array<{ shortcut: string; description: string; type: "template" | "macro" }> = [];

  // Template shortcuts
  shortcuts.push(
    { shortcut: "#diabetes", description: "Insert diabetes visit template", type: "template" },
    { shortcut: "#hypertension", description: "Insert hypertension visit template", type: "template" },
    { shortcut: "#wellness", description: "Insert annual wellness visit template", type: "template" },
    { shortcut: "#cold", description: "Insert upper respiratory infection template", type: "template" }
  );

  // Data macros
  shortcuts.push(
    { shortcut: "@bp", description: "Insert blood pressure", type: "macro" },
    { shortcut: "@age", description: "Insert patient age", type: "macro" },
    { shortcut: "@gender", description: "Insert patient gender", type: "macro" },
    { shortcut: "@meds", description: "Insert current medications list", type: "macro" },
    { shortcut: "@allergies", description: "Insert allergies list", type: "macro" },
    { shortcut: "@condition", description: "Insert primary condition", type: "macro" },
    { shortcut: "@risk", description: "Insert risk score", type: "macro" },
    { shortcut: "@dob", description: "Insert date of birth", type: "macro" },
    { shortcut: "@phone", description: "Insert phone number", type: "macro" },
    { shortcut: "@email", description: "Insert email address", type: "macro" },
    { shortcut: "@address", description: "Insert address", type: "macro" }
  );

  return shortcuts;
}

/**
 * Check if text contains any shortcuts
 */
export function hasShortcuts(text: string): boolean {
  const allShortcuts = [
    ...Object.keys(templateShortcuts),
    ...Object.keys(dataMacros),
  ];
  return allShortcuts.some(shortcut => text.includes(shortcut));
}

