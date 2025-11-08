/**
 * Specialty Templates - Reference Data
 * 
 * TODO: In production, these should be loaded from the backend API endpoint (e.g., /api/v1/specialty-templates)
 * This file currently contains hardcoded reference data that should be replaced with API calls.
 */

import { SpecialtyType, SpecialtyTemplate as ISpecialtyTemplate } from "../types";

// Minimal templates - should be loaded from API in production
// This provides a basic list of available specialties
const availableSpecialties: SpecialtyType[] = [
  "cardiology",
  "endocrinology",
  "neurology",
  "oncology",
  "orthopedics",
  "dermatology",
  "gastroenterology",
  "pulmonology",
  "rheumatology",
  "nephrology",
  "urology",
  "ophthalmology",
  "otolaryngology",
  "psychiatry",
  "pediatrics",
  "geriatrics",
  "gynecology",
  "obstetrics",
  "emergency_medicine",
  "family_medicine",
  "internal_medicine",
  "surgery",
  "anesthesiology",
  "radiology",
  "pathology",
  "pain_management",
  "sleep_medicine",
  "critical_care",
  "other"
];

const specialtyNames: Record<SpecialtyType, string> = {
  cardiology: "Cardiology",
  endocrinology: "Endocrinology",
  neurology: "Neurology",
  oncology: "Oncology",
  orthopedics: "Orthopedics",
  dermatology: "Dermatology",
  gastroenterology: "Gastroenterology",
  pulmonology: "Pulmonology",
  rheumatology: "Rheumatology",
  nephrology: "Nephrology",
  urology: "Urology",
  ophthalmology: "Ophthalmology",
  otolaryngology: "Otolaryngology",
  psychiatry: "Psychiatry",
  psychology: "Psychology",
  pediatrics: "Pediatrics",
  geriatrics: "Geriatrics",
  gynecology: "Gynecology",
  obstetrics: "Obstetrics",
  emergency_medicine: "Emergency Medicine",
  family_medicine: "Family Medicine",
  internal_medicine: "Internal Medicine",
  surgery: "Surgery",
  neurosurgery: "Neurosurgery",
  plastic_surgery: "Plastic Surgery",
  vascular_surgery: "Vascular Surgery",
  general_surgery: "General Surgery",
  orthopedic_surgery: "Orthopedic Surgery",
  anesthesiology: "Anesthesiology",
  radiology: "Radiology",
  pathology: "Pathology",
  allergy_immunology: "Allergy & Immunology",
  infectious_disease: "Infectious Disease",
  hematology: "Hematology",
  sports_medicine: "Sports Medicine",
  physical_medicine: "Physical Medicine",
  pain_management: "Pain Management",
  sleep_medicine: "Sleep Medicine",
  critical_care: "Critical Care",
  other: "Other"
};

export function getAllSpecialties(): SpecialtyType[] {
  return availableSpecialties.filter(s => s !== "other");
}

export function getSpecialtyTemplate(specialty: SpecialtyType): ISpecialtyTemplate | undefined {
  // Return a template structure - in production this would come from API
  const name = specialtyNames[specialty] || specialty;
  
  // Enhanced default templates with specialty-specific content
  const specialtyDefaults: Partial<Record<SpecialtyType, Partial<ISpecialtyTemplate['consultationTemplate']>>> = {
    cardiology: {
      chiefComplaint: "Cardiac evaluation",
      historyOfPresentIllness: "Patient presents for cardiac evaluation. Review cardiovascular risk factors, symptoms, and current cardiac status.",
      reviewOfSystems: [
        "No chest pain or pressure",
        "No dyspnea on exertion",
        "No palpitations or irregular heartbeat",
        "No lower extremity edema",
        "No syncope or near-syncope"
      ],
      physicalExamination: [
        "Vital signs: BP, HR, RR, O2 sat",
        "Cardiac: Regular rate and rhythm, no murmurs, rubs, or gallops",
        "Pulmonary: Clear to auscultation bilaterally",
        "Extremities: No edema, pulses intact"
      ],
      assessment: "Cardiovascular evaluation - assess for cardiovascular disease, risk factors, and need for further workup.",
      plan: [
        "Review cardiovascular risk factors",
        "Consider ECG if indicated",
        "Lipid panel evaluation",
        "Blood pressure monitoring",
        "Lifestyle modifications (diet, exercise)",
        "Medication review and optimization"
      ],
      commonDiagnoses: ["Hypertension", "Coronary artery disease", "Heart failure", "Arrhythmias", "Dyslipidemia"],
      commonTests: ["ECG", "Echocardiogram", "Stress test", "Lipid panel", "BNP"],
      commonMedications: ["ACE inhibitors", "Beta blockers", "Statins", "Aspirin", "Diuretics"]
    },
    endocrinology: {
      chiefComplaint: "Endocrine evaluation",
      historyOfPresentIllness: "Patient presents for endocrine evaluation. Review glucose control, thyroid function, and other endocrine parameters.",
      reviewOfSystems: [
        "No polyuria or polydipsia",
        "No weight changes",
        "No fatigue or weakness",
        "No heat or cold intolerance",
        "No hair loss or skin changes"
      ],
      physicalExamination: [
        "Vital signs: BP, HR, RR, O2 sat, BMI",
        "Thyroid: Normal size, no nodules",
        "Skin: No acanthosis nigricans",
        "Extremities: No peripheral neuropathy"
      ],
      assessment: "Endocrine evaluation - assess for diabetes, thyroid disorders, and other endocrine conditions.",
      plan: [
        "Review glucose control",
        "Thyroid function evaluation",
        "Hormone level assessment",
        "Medication review",
        "Lifestyle counseling"
      ],
      commonDiagnoses: ["Type 2 diabetes", "Hypothyroidism", "Hyperthyroidism", "Metabolic syndrome"],
      commonTests: ["HbA1c", "TSH", "Free T4", "Lipid panel", "CMP"],
      commonMedications: ["Metformin", "Levothyroxine", "Insulin", "GLP-1 agonists"]
    },
    neurology: {
      chiefComplaint: "Neurological evaluation",
      historyOfPresentIllness: "Patient presents for neurological evaluation. Review neurological symptoms, cognitive function, and motor function.",
      reviewOfSystems: [
        "No headaches",
        "No seizures",
        "No weakness or numbness",
        "No coordination problems",
        "No memory issues"
      ],
      physicalExamination: [
        "Neurological: Mental status, cranial nerves",
        "Motor: Strength, tone, coordination",
        "Sensory: Light touch, proprioception",
        "Reflexes: Deep tendon reflexes",
        "Gait: Normal, no ataxia"
      ],
      assessment: "Neurological evaluation - assess for neurological disorders, cognitive impairment, and need for further workup.",
      plan: [
        "Neurological examination",
        "Consider imaging if indicated",
        "Medication review",
        "Follow-up as needed"
      ],
      commonDiagnoses: ["Migraine", "Epilepsy", "Parkinson's disease", "Multiple sclerosis", "Peripheral neuropathy"],
      commonTests: ["MRI brain", "EEG", "EMG", "Lumbar puncture"],
      commonMedications: ["Antiepileptics", "Triptans", "Dopamine agonists", "Anticholinergics"]
    },
    orthopedics: {
      chiefComplaint: "Orthopedic evaluation",
      historyOfPresentIllness: "Patient presents for orthopedic evaluation. Review musculoskeletal symptoms, joint function, and mobility.",
      reviewOfSystems: [
        "No joint pain or stiffness",
        "No muscle weakness",
        "No gait abnormalities",
        "No range of motion limitations",
        "No swelling or redness"
      ],
      physicalExamination: [
        "Musculoskeletal: Range of motion, strength testing",
        "Joints: Inspection, palpation, stability",
        "Gait: Normal, no limping",
        "Spine: Alignment, range of motion",
        "Extremities: Symmetry, no deformities"
      ],
      assessment: "Orthopedic evaluation - assess musculoskeletal function, joint health, and need for further evaluation.",
      plan: [
        "Physical examination",
        "Consider imaging if indicated",
        "Physical therapy referral if needed",
        "Pain management",
        "Follow-up as needed"
      ],
      commonDiagnoses: ["Osteoarthritis", "Rheumatoid arthritis", "Fracture", "Tendonitis", "Bursitis", "Spinal stenosis"],
      commonTests: ["X-ray", "MRI", "CT scan", "Bone scan", "Joint aspiration"],
      commonMedications: ["NSAIDs", "Acetaminophen", "Corticosteroids", "Muscle relaxants", "Opioids"]
    },
    pulmonology: {
      chiefComplaint: "Pulmonary evaluation",
      historyOfPresentIllness: "Patient presents for pulmonary evaluation. Review respiratory symptoms, smoking history, and lung function.",
      reviewOfSystems: [
        "No shortness of breath",
        "No chronic cough",
        "No wheezing",
        "No chest tightness",
        "No hemoptysis"
      ],
      physicalExamination: [
        "Respiratory: Rate, effort, use of accessory muscles",
        "Lungs: Auscultation, percussion",
        "Chest: Symmetry, expansion",
        "Oxygen saturation: Normal",
        "Clubbing: Not present"
      ],
      assessment: "Pulmonary evaluation - assess respiratory function, lung disease, and need for further workup.",
      plan: [
        "Pulmonary function tests if indicated",
        "Chest imaging if needed",
        "Smoking cessation counseling if applicable",
        "Medication review",
        "Follow-up as needed"
      ],
      commonDiagnoses: ["COPD", "Asthma", "Pneumonia", "Pulmonary embolism", "Interstitial lung disease"],
      commonTests: ["PFT", "Chest X-ray", "CT chest", "ABG", "Bronchoscopy"],
      commonMedications: ["Bronchodilators", "Inhaled corticosteroids", "Antibiotics", "Oxygen therapy"]
    },
    gastroenterology: {
      chiefComplaint: "Gastroenterology evaluation",
      historyOfPresentIllness: "Patient presents for gastroenterology evaluation. Review GI symptoms, diet, and bowel habits.",
      reviewOfSystems: [
        "No abdominal pain",
        "No nausea or vomiting",
        "No diarrhea or constipation",
        "No blood in stool",
        "No weight loss"
      ],
      physicalExamination: [
        "Abdomen: Inspection, auscultation, palpation, percussion",
        "Liver: Size, consistency",
        "Spleen: Not enlarged",
        "Rectal: As indicated",
        "Signs of malnutrition: None"
      ],
      assessment: "Gastroenterology evaluation - assess GI function, digestive disorders, and need for further evaluation.",
      plan: [
        "Dietary assessment",
        "Consider endoscopy if indicated",
        "Lab work (LFTs, etc.)",
        "Medication review",
        "Follow-up as needed"
      ],
      commonDiagnoses: ["GERD", "IBD", "IBS", "Hepatitis", "Cirrhosis", "Colon polyps"],
      commonTests: ["Endoscopy", "Colonoscopy", "LFTs", "H. pylori test", "Stool studies"],
      commonMedications: ["PPIs", "H2 blockers", "Antacids", "Antibiotics", "Immunosuppressants"]
    },
    dermatology: {
      chiefComplaint: "Dermatology evaluation",
      historyOfPresentIllness: "Patient presents for dermatology evaluation. Review skin conditions, lesions, and dermatological history.",
      reviewOfSystems: [
        "No new skin lesions",
        "No rashes",
        "No itching",
        "No changes in moles",
        "No hair loss"
      ],
      physicalExamination: [
        "Skin: Full body examination",
        "Lesions: Description, distribution, morphology",
        "Hair: Scalp, body hair",
        "Nails: Appearance, changes",
        "Mucous membranes: Inspection"
      ],
      assessment: "Dermatology evaluation - assess skin conditions, lesions, and need for biopsy or further treatment.",
      plan: [
        "Skin examination",
        "Consider biopsy if indicated",
        "Topical treatments",
        "Phototherapy if needed",
        "Follow-up as needed"
      ],
      commonDiagnoses: ["Eczema", "Psoriasis", "Acne", "Basal cell carcinoma", "Melanoma", "Contact dermatitis"],
      commonTests: ["Skin biopsy", "Patch testing", "Wood's lamp", "KOH prep"],
      commonMedications: ["Topical corticosteroids", "Antifungals", "Antibiotics", "Retinoids", "Immunosuppressants"]
    },
    psychiatry: {
      chiefComplaint: "Psychiatric evaluation",
      historyOfPresentIllness: "Patient presents for psychiatric evaluation. Review mental health symptoms, mood, and cognitive function.",
      reviewOfSystems: [
        "No depression or anxiety",
        "No mood swings",
        "No sleep disturbances",
        "No suicidal ideation",
        "No hallucinations"
      ],
      physicalExamination: [
        "Mental status: Appearance, behavior, speech",
        "Mood and affect: Assessment",
        "Thought process: Organized, logical",
        "Cognition: Orientation, memory",
        "Insight and judgment: Intact"
      ],
      assessment: "Psychiatric evaluation - assess mental health status, mood disorders, and need for treatment.",
      plan: [
        "Mental status examination",
        "Psychotherapy if indicated",
        "Medication review",
        "Safety assessment",
        "Follow-up as needed"
      ],
      commonDiagnoses: ["Major depression", "Anxiety disorders", "Bipolar disorder", "Schizophrenia", "PTSD"],
      commonTests: ["PHQ-9", "GAD-7", "MMSE", "CBC, CMP", "Thyroid function"],
      commonMedications: ["SSRIs", "SNRIs", "Antipsychotics", "Mood stabilizers", "Benzodiazepines"]
    },
    family_medicine: {
      chiefComplaint: "Primary care visit",
      historyOfPresentIllness: "Patient presents for primary care visit. Comprehensive health evaluation and preventive care.",
      reviewOfSystems: [
        "Constitutional: No fever, weight changes",
        "HEENT: No vision or hearing changes",
        "Cardiovascular: No chest pain, palpitations",
        "Respiratory: No cough, shortness of breath",
        "GI: No abdominal pain, changes in bowel habits"
      ],
      physicalExamination: [
        "Vital signs: Complete",
        "General appearance: Well-appearing",
        "HEENT: Normal",
        "Cardiovascular: Regular rate and rhythm",
        "Respiratory: Clear to auscultation",
        "Abdomen: Soft, non-tender"
      ],
      assessment: "Primary care evaluation - comprehensive health assessment, preventive care, and management of chronic conditions.",
      plan: [
        "Preventive care screening",
        "Chronic disease management",
        "Health maintenance",
        "Medication review",
        "Lifestyle counseling",
        "Follow-up as needed"
      ],
      commonDiagnoses: ["Hypertension", "Diabetes", "Hyperlipidemia", "Obesity", "Depression", "Anxiety"],
      commonTests: ["CBC", "CMP", "Lipid panel", "HbA1c", "TSH", "Mammogram", "Colonoscopy"],
      commonMedications: ["Antihypertensives", "Metformin", "Statins", "SSRIs", "Multivitamins"]
    }
  };

  const defaults = specialtyDefaults[specialty];
  
  return {
    specialty,
    name,
    consultationTemplate: {
      chiefComplaint: defaults?.chiefComplaint || `${name} evaluation`,
      historyOfPresentIllness: defaults?.historyOfPresentIllness || `Patient presents for ${name.toLowerCase()} evaluation.`,
      reviewOfSystems: defaults?.reviewOfSystems || [],
      physicalExamination: defaults?.physicalExamination || [],
      assessment: defaults?.assessment || `${name} consultation - assessment to be documented`,
      plan: defaults?.plan || [],
      commonDiagnoses: defaults?.commonDiagnoses || [],
      commonTests: defaults?.commonTests || [],
      commonMedications: defaults?.commonMedications || []
    }
  };
}

