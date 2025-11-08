// Common conditions and treatments by hub
export const hubConditionsAndTreatments: Record<string, {
  conditions: string[];
  treatments: string[];
}> = {
  cardiology: {
    conditions: [
      "Hypertension",
      "Coronary artery disease",
      "Heart failure",
      "Arrhythmias",
      "Valvular heart disease",
      "Dyslipidemia"
    ],
    treatments: [
      "Medication management",
      "Cardiac procedures",
      "Lifestyle modifications",
      "Cardiac rehabilitation",
      "Device implantation"
    ]
  },
  oncology: {
    conditions: [
      "Solid tumors",
      "Hematologic malignancies",
      "Metastatic disease",
      "Treatment-related complications"
    ],
    treatments: [
      "Chemotherapy",
      "Immunotherapy",
      "Targeted therapy",
      "Radiation therapy",
      "Surgical oncology",
      "Supportive care"
    ]
  },
  pediatrics: {
    conditions: [
      "Childhood infections",
      "Developmental disorders",
      "Asthma",
      "Allergies",
      "Growth concerns",
      "Behavioral issues"
    ],
    treatments: [
      "Vaccinations",
      "Growth monitoring",
      "Developmental assessments",
      "Family counseling",
      "Preventive care"
    ]
  },
  orthopedics: {
    conditions: [
      "Osteoarthritis",
      "Rheumatoid arthritis",
      "Fractures",
      "Tendonitis",
      "Herniated disc",
      "Rotator cuff injuries",
      "Sports injuries",
      "Back pain"
    ],
    treatments: [
      "Physical therapy",
      "Joint injections",
      "Pain management",
      "Surgical interventions",
      "Rehabilitation"
    ]
  },
  neurology: {
    conditions: [
      "Epilepsy",
      "Migraine",
      "Stroke",
      "Parkinson's disease",
      "Multiple sclerosis",
      "Neuropathy",
      "Dementia"
    ],
    treatments: [
      "Medication management",
      "Neurological assessments",
      "Rehabilitation therapy",
      "Surgical interventions",
      "Cognitive therapy"
    ]
  },
  psychiatry: {
    conditions: [
      "Depression",
      "Anxiety disorders",
      "Bipolar disorder",
      "Schizophrenia",
      "PTSD",
      "ADHD",
      "Eating disorders",
      "Substance use disorders"
    ],
    treatments: [
      "Psychotherapy",
      "Medication management",
      "Cognitive behavioral therapy",
      "Group therapy",
      "Crisis intervention"
    ]
  },
  dermatology: {
    conditions: [
      "Acne",
      "Eczema",
      "Psoriasis",
      "Skin cancer",
      "Melanoma",
      "Contact dermatitis",
      "Rosacea"
    ],
    treatments: [
      "Topical treatments",
      "Phototherapy",
      "Surgical procedures",
      "Biologic therapy",
      "Cosmetic procedures"
    ]
  },
  endocrinology: {
    conditions: [
      "Diabetes",
      "Thyroid disorders",
      "Hormone imbalances",
      "Metabolic syndrome",
      "Obesity",
      "Adrenal disorders"
    ],
    treatments: [
      "Hormone therapy",
      "Medication management",
      "Lifestyle counseling",
      "Metabolic monitoring",
      "Diabetes management"
    ]
  },
  gastroenterology: {
    conditions: [
      "GERD",
      "IBD",
      "Irritable bowel syndrome",
      "Liver disease",
      "Pancreatic disorders",
      "Celiac disease"
    ],
    treatments: [
      "Endoscopic procedures",
      "Medication management",
      "Dietary counseling",
      "Surgical interventions",
      "Liver disease management"
    ]
  },
  emergency: {
    conditions: [
      "Acute coronary syndrome",
      "Stroke",
      "Trauma",
      "Sepsis",
      "Respiratory distress",
      "Anaphylaxis",
      "Overdose",
      "Cardiac arrest"
    ],
    treatments: [
      "Resuscitation",
      "Trauma protocols",
      "Emergency procedures",
      "Critical care",
      "Rapid response"
    ]
  }
};

/**
 * Get common conditions for a hub by its ID
 */
export function getHubConditions(hubId: string): string[] {
  return hubConditionsAndTreatments[hubId]?.conditions || [];
}

/**
 * Get common treatments for a hub by its ID
 */
export function getHubTreatments(hubId: string): string[] {
  return hubConditionsAndTreatments[hubId]?.treatments || [];
}

/**
 * Get actual conditions from patients in a hub
 */
export function getPatientConditions(patients: any[]): string[] {
  const conditionCounts: Record<string, number> = {};
  
  patients.forEach(patient => {
    if (patient.condition) {
      conditionCounts[patient.condition] = (conditionCounts[patient.condition] || 0) + 1;
    }
  });
  
  // Return top 6 most common conditions
  return Object.entries(conditionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([condition]) => condition);
}

