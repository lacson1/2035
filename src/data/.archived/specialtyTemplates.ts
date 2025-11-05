import { SpecialtyType } from "../types";

export interface SpecialtyTemplate {
  specialty: SpecialtyType;
  name: string;
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

const specialtyTemplates: SpecialtyTemplate[] = [
  {
    specialty: "cardiology",
    name: "Cardiology",
    consultationTemplate: {
      chiefComplaint: "Cardiac evaluation",
      historyOfPresentIllness: "Patient presents for cardiac evaluation. Review cardiovascular risk factors, symptoms, and current cardiac status.",
      reviewOfSystems: [
        "No chest pain or pressure",
        "No dyspnea on exertion",
        "No palpitations or irregular heartbeat",
        "No lower extremity edema",
        "No syncope or near-syncope",
        "No orthopnea or paroxysmal nocturnal dyspnea"
      ],
      physicalExamination: [
        "Vital signs: BP, HR, RR, O2 sat",
        "Cardiac: Regular rate and rhythm, no murmurs, rubs, or gallops",
        "Pulmonary: Clear to auscultation bilaterally",
        "Extremities: No edema, pulses intact",
        "Jugular venous distention: Not present"
      ],
      assessment: "Cardiovascular evaluation - assess for cardiovascular disease, risk factors, and need for further workup.",
      plan: [
        "Review cardiovascular risk factors",
        "Consider ECG if indicated",
        "Lipid panel evaluation",
        "Blood pressure monitoring",
        "Lifestyle modifications (diet, exercise)",
        "Medication review and optimization",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "Hypertension",
        "Coronary artery disease",
        "Heart failure",
        "Arrhythmias",
        "Valvular heart disease",
        "Dyslipidemia"
      ],
      commonTests: [
        "ECG",
        "Echocardiogram",
        "Stress test",
        "Holter monitor",
        "Lipid panel",
        "BNP",
        "Cardiac enzymes"
      ],
      commonMedications: [
        "ACE inhibitors",
        "Beta blockers",
        "Statins",
        "Aspirin",
        "Diuretics",
        "Anticoagulants"
      ]
    }
  },
  {
    specialty: "endocrinology",
    name: "Endocrinology",
    consultationTemplate: {
      chiefComplaint: "Endocrine evaluation",
      historyOfPresentIllness: "Patient presents for endocrine evaluation. Review glucose control, thyroid function, and other endocrine parameters.",
      reviewOfSystems: [
        "No polyuria or polydipsia",
        "No weight changes",
        "No fatigue or weakness",
        "No heat or cold intolerance",
        "No hair loss or skin changes",
        "No changes in libido"
      ],
      physicalExamination: [
        "Vital signs: BP, HR, RR, O2 sat, BMI",
        "General appearance: Well-appearing",
        "Thyroid: Normal size, no nodules",
        "Skin: No acanthosis nigricans, no dry skin",
        "Extremities: No edema, no peripheral neuropathy",
        "Neurological: Intact sensation, reflexes normal"
      ],
      assessment: "Endocrine evaluation - assess for diabetes, thyroid disorders, and other endocrine conditions.",
      plan: [
        "HbA1c and glucose monitoring",
        "Thyroid function tests if indicated",
        "Lipid panel",
        "Medication review",
        "Diabetes education if needed",
        "Dietary counseling",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "Type 2 Diabetes",
        "Type 1 Diabetes",
        "Hypothyroidism",
        "Hyperthyroidism",
        "Metabolic syndrome",
        "Obesity"
      ],
      commonTests: [
        "HbA1c",
        "Fasting glucose",
        "TSH, T3, T4",
        "Lipid panel",
        "C-peptide",
        "Thyroid antibodies"
      ],
      commonMedications: [
        "Metformin",
        "Insulin",
        "Levothyroxine",
        "GLP-1 agonists",
        "SGLT2 inhibitors",
        "Thiazolidinediones"
      ]
    }
  },
  {
    specialty: "neurology",
    name: "Neurology",
    consultationTemplate: {
      chiefComplaint: "Neurological evaluation",
      historyOfPresentIllness: "Patient presents for neurological evaluation. Review neurological symptoms, cognitive function, and motor function.",
      reviewOfSystems: [
        "No headaches or migraines",
        "No seizures or convulsions",
        "No weakness or numbness",
        "No vision changes",
        "No balance problems or dizziness",
        "No cognitive decline"
      ],
      physicalExamination: [
        "Mental status: Alert and oriented",
        "Cranial nerves: II-XII intact",
        "Motor: Strength 5/5 in all extremities",
        "Sensation: Intact to light touch",
        "Reflexes: Symmetric, 2+",
        "Coordination: Intact, no ataxia",
        "Gait: Normal"
      ],
      assessment: "Neurological evaluation - assess for neurological disorders, cognitive changes, and motor function.",
      plan: [
        "Neurological examination",
        "Cognitive assessment if indicated",
        "Consider imaging if needed",
        "Medication review",
        "Safety evaluation",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "Migraine",
        "Epilepsy",
        "Peripheral neuropathy",
        "Stroke",
        "Dementia",
        "Parkinson's disease"
      ],
      commonTests: [
        "MRI brain",
        "EEG",
        "EMG/NCS",
        "Cognitive assessment",
        "Lumbar puncture",
        "Blood work (B12, folate, etc.)"
      ],
      commonMedications: [
        "Antiepileptics",
        "Triptans",
        "Antidepressants",
        "Cholinesterase inhibitors",
        "Dopamine agonists",
        "Anticoagulants"
      ]
    }
  },
  {
    specialty: "oncology",
    name: "Oncology",
    consultationTemplate: {
      chiefComplaint: "Oncology consultation",
      historyOfPresentIllness: "Patient presents for oncology consultation. Review cancer history, current status, and treatment response.",
      reviewOfSystems: [
        "No unexplained weight loss",
        "No persistent fevers or night sweats",
        "No new lumps or masses",
        "No changes in bowel or bladder habits",
        "No persistent cough or hoarseness",
        "No bone pain"
      ],
      physicalExamination: [
        "Vital signs: BP, HR, RR, O2 sat, temperature",
        "General: Performance status assessment",
        "Lymph nodes: No lymphadenopathy",
        "HEENT: No masses or abnormalities",
        "Abdomen: No organomegaly or masses",
        "Extremities: No edema or clubbing"
      ],
      assessment: "Oncology consultation - assess cancer status, treatment response, and need for further evaluation.",
      plan: [
        "Review imaging studies",
        "Tumor markers if applicable",
        "Treatment response assessment",
        "Side effect management",
        "Supportive care",
        "Follow-up imaging",
        "Multidisciplinary discussion if needed"
      ],
      commonDiagnoses: [
        "Solid tumor malignancies",
        "Hematologic malignancies",
        "Metastatic disease",
        "Treatment-related complications"
      ],
      commonTests: [
        "CT scan",
        "PET scan",
        "Tumor markers",
        "Biopsy",
        "Bone marrow biopsy",
        "Genetic testing"
      ],
      commonMedications: [
        "Chemotherapy agents",
        "Immunotherapy",
        "Targeted therapy",
        "Hormonal therapy",
        "Supportive medications (antiemetics, etc.)"
      ]
    }
  },
  {
    specialty: "orthopedics",
    name: "Orthopedics",
    consultationTemplate: {
      chiefComplaint: "Orthopedic evaluation",
      historyOfPresentIllness: "Patient presents for orthopedic evaluation. Review musculoskeletal complaints, pain, and functional limitations.",
      reviewOfSystems: [
        "No joint pain or swelling",
        "No back pain",
        "No muscle weakness",
        "No numbness or tingling",
        "No gait disturbances",
        "No limitations in range of motion"
      ],
      physicalExamination: [
        "Musculoskeletal: Full range of motion in all joints",
        "Spine: No tenderness, normal alignment",
        "Extremities: No deformities, no swelling",
        "Neurological: Intact sensation, reflexes normal",
        "Gait: Normal, no antalgia",
        "Strength: 5/5 in all muscle groups"
      ],
      assessment: "Orthopedic evaluation - assess musculoskeletal complaints, joint function, and need for further intervention.",
      plan: [
        "Physical examination",
        "Imaging if indicated (X-ray, MRI)",
        "Pain management",
        "Physical therapy referral if needed",
        "Activity modifications",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "Osteoarthritis",
        "Rheumatoid arthritis",
        "Fractures",
        "Tendonitis",
        "Herniated disc",
        "Rotator cuff tear"
      ],
      commonTests: [
        "X-ray",
        "MRI",
        "CT scan",
        "Bone scan",
        "Ultrasound",
        "Joint aspiration"
      ],
      commonMedications: [
        "NSAIDs",
        "Acetaminophen",
        "Corticosteroids",
        "Muscle relaxants",
        "Topical analgesics",
        "Bisphosphonates"
      ]
    }
  },
  {
    specialty: "dermatology",
    name: "Dermatology",
    consultationTemplate: {
      chiefComplaint: "Dermatology consultation",
      historyOfPresentIllness: "Patient presents for dermatology consultation. Review skin conditions, lesions, and dermatological concerns.",
      reviewOfSystems: [
        "No new skin lesions",
        "No rashes or itching",
        "No hair loss",
        "No nail changes",
        "No sun exposure concerns",
        "No skin cancer history"
      ],
      physicalExamination: [
        "Skin: Full body skin examination",
        "Lesions: Document size, shape, color, borders",
        "Hair: Normal distribution, no alopecia",
        "Nails: Normal appearance",
        "Mucous membranes: Normal",
        "Lymph nodes: No enlargement"
      ],
      assessment: "Dermatology consultation - assess skin conditions, lesions, and need for biopsy or treatment.",
      plan: [
        "Full body skin examination",
        "Dermoscopy if indicated",
        "Biopsy if suspicious lesions",
        "Topical treatment",
        "Photoprotection counseling",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "Basal cell carcinoma",
        "Squamous cell carcinoma",
        "Melanoma",
        "Actinic keratosis",
        "Eczema",
        "Psoriasis"
      ],
      commonTests: [
        "Skin biopsy",
        "Dermoscopy",
        "Patch testing",
        "Wood's lamp examination"
      ],
      commonMedications: [
        "Topical corticosteroids",
        "Topical retinoids",
        "Antifungals",
        "Antibiotics",
        "Immunosuppressants",
        "Biologics"
      ]
    }
  },
  {
    specialty: "gastroenterology",
    name: "Gastroenterology",
    consultationTemplate: {
      chiefComplaint: "Gastroenterology consultation",
      historyOfPresentIllness: "Patient presents for gastroenterology consultation. Review gastrointestinal symptoms, digestive issues, and abdominal concerns.",
      reviewOfSystems: [
        "No abdominal pain",
        "No nausea or vomiting",
        "No changes in bowel habits",
        "No blood in stool",
        "No difficulty swallowing",
        "No weight loss"
      ],
      physicalExamination: [
        "Abdomen: Soft, non-tender, non-distended",
        "Bowel sounds: Normal",
        "No organomegaly",
        "No masses or hernias",
        "Rectal examination: Normal if indicated",
        "No signs of jaundice"
      ],
      assessment: "Gastroenterology consultation - assess gastrointestinal symptoms, digestive function, and need for further evaluation.",
      plan: [
        "Review gastrointestinal symptoms",
        "Consider endoscopy if indicated",
        "Dietary modifications",
        "Medication review",
        "Screening colonoscopy if age-appropriate",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "GERD",
        "Irritable bowel syndrome",
        "Inflammatory bowel disease",
        "Peptic ulcer disease",
        "Colon polyps",
        "Hepatitis"
      ],
      commonTests: [
        "Upper endoscopy",
        "Colonoscopy",
        "H. pylori testing",
        "Liver function tests",
        "Celiac serology",
        "Stool studies"
      ],
      commonMedications: [
        "PPIs",
        "H2 blockers",
        "Antacids",
        "Antispasmodics",
        "Aminosalicylates",
        "Immunosuppressants"
      ]
    }
  },
  {
    specialty: "pulmonology",
    name: "Pulmonology",
    consultationTemplate: {
      chiefComplaint: "Pulmonology consultation",
      historyOfPresentIllness: "Patient presents for pulmonology consultation. Review respiratory symptoms, lung function, and breathing concerns.",
      reviewOfSystems: [
        "No shortness of breath",
        "No cough or sputum production",
        "No wheezing",
        "No chest tightness",
        "No hemoptysis",
        "No sleep apnea symptoms"
      ],
      physicalExamination: [
        "Vital signs: BP, HR, RR, O2 sat",
        "Respiratory: Clear to auscultation bilaterally",
        "No wheezes, rales, or rhonchi",
        "Chest wall: Normal configuration",
        "No cyanosis or clubbing",
        "No use of accessory muscles"
      ],
      assessment: "Pulmonology consultation - assess respiratory symptoms, lung function, and need for further evaluation.",
      plan: [
        "Pulmonary function tests if indicated",
        "Chest imaging review",
        "Smoking cessation counseling if applicable",
        "Medication review",
        "Oxygen assessment if needed",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "COPD",
        "Asthma",
        "Pneumonia",
        "Interstitial lung disease",
        "Sleep apnea",
        "Pulmonary embolism"
      ],
      commonTests: [
        "Pulmonary function tests",
        "Chest X-ray",
        "CT chest",
        "Arterial blood gas",
        "Sleep study",
        "Bronchoscopy"
      ],
      commonMedications: [
        "Bronchodilators",
        "Inhaled corticosteroids",
        "Antibiotics",
        "Oxygen therapy",
        "CPAP/BiPAP",
        "Mucolytics"
      ]
    }
  },
  {
    specialty: "rheumatology",
    name: "Rheumatology",
    consultationTemplate: {
      chiefComplaint: "Rheumatology consultation",
      historyOfPresentIllness: "Patient presents for rheumatology consultation. Review joint symptoms, autoimmune concerns, and inflammatory conditions.",
      reviewOfSystems: [
        "No joint pain or swelling",
        "No morning stiffness",
        "No muscle weakness",
        "No skin rashes",
        "No fatigue",
        "No Raynaud's phenomenon"
      ],
      physicalExamination: [
        "Joints: No swelling, tenderness, or deformity",
        "Range of motion: Full in all joints",
        "Skin: No rashes or lesions",
        "Muscle strength: Normal",
        "Neurological: Intact",
        "Vital signs: Normal"
      ],
      assessment: "Rheumatology consultation - assess for autoimmune conditions, inflammatory arthritis, and connective tissue diseases.",
      plan: [
        "Rheumatologic examination",
        "Laboratory workup (RF, ANA, etc.)",
        "Imaging if indicated",
        "Medication review",
        "Physical therapy if needed",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "Rheumatoid arthritis",
        "Osteoarthritis",
        "Systemic lupus erythematosus",
        "Fibromyalgia",
        "Gout",
        "Psoriatic arthritis"
      ],
      commonTests: [
        "Rheumatoid factor",
        "ANA",
        "ESR/CRP",
        "Uric acid",
        "Joint aspiration",
        "X-rays"
      ],
      commonMedications: [
        "NSAIDs",
        "DMARDs",
        "Biologics",
        "Corticosteroids",
        "Colchicine",
        "Allopurinol"
      ]
    }
  },
  {
    specialty: "nephrology",
    name: "Nephrology",
    consultationTemplate: {
      chiefComplaint: "Nephrology consultation",
      historyOfPresentIllness: "Patient presents for nephrology consultation. Review kidney function, renal concerns, and electrolyte status.",
      reviewOfSystems: [
        "No changes in urination",
        "No blood in urine",
        "No foamy urine",
        "No edema",
        "No fatigue",
        "No hypertension concerns"
      ],
      physicalExamination: [
        "Vital signs: BP, HR, RR",
        "Cardiac: Normal",
        "Lungs: Clear",
        "Abdomen: No masses",
        "Extremities: No edema",
        "No signs of fluid overload"
      ],
      assessment: "Nephrology consultation - assess kidney function, renal disease, and need for further evaluation.",
      plan: [
        "Review kidney function tests",
        "Urinalysis",
        "Electrolyte panel",
        "Blood pressure management",
        "Medication review",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "Chronic kidney disease",
        "Acute kidney injury",
        "Hypertension",
        "Nephrotic syndrome",
        "Kidney stones",
        "Diabetic nephropathy"
      ],
      commonTests: [
        "Creatinine",
        "eGFR",
        "Urinalysis",
        "24-hour urine collection",
        "Renal ultrasound",
        "Kidney biopsy"
      ],
      commonMedications: [
        "ACE inhibitors",
        "ARBs",
        "Diuretics",
        "Phosphate binders",
        "Erythropoietin",
        "Sodium bicarbonate"
      ]
    }
  },
  {
    specialty: "psychiatry",
    name: "Psychiatry",
    consultationTemplate: {
      chiefComplaint: "Psychiatric consultation",
      historyOfPresentIllness: "Patient presents for psychiatric consultation. Review mental health status, mood, anxiety, and psychiatric symptoms.",
      reviewOfSystems: [
        "Mood: Stable",
        "No anxiety or panic",
        "No depression",
        "No suicidal or homicidal ideation",
        "No psychotic symptoms",
        "Sleep: Normal"
      ],
      physicalExamination: [
        "Mental status: Alert and oriented",
        "Appearance: Well-groomed",
        "Behavior: Appropriate",
        "Speech: Normal rate and tone",
        "Mood: Euthymic",
        "Thought process: Linear and goal-directed"
      ],
      assessment: "Psychiatric consultation - assess mental health status, psychiatric symptoms, and need for treatment.",
      plan: [
        "Mental status examination",
        "Psychiatric evaluation",
        "Medication review",
        "Therapy referral if indicated",
        "Safety assessment",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "Major depressive disorder",
        "Generalized anxiety disorder",
        "Bipolar disorder",
        "Schizophrenia",
        "PTSD",
        "ADHD"
      ],
      commonTests: [
        "PHQ-9",
        "GAD-7",
        "MMSE",
        "Thyroid function tests",
        "B12, folate",
        "Toxicology screen"
      ],
      commonMedications: [
        "SSRIs",
        "SNRIs",
        "Atypical antipsychotics",
        "Mood stabilizers",
        "Benzodiazepines",
        "Stimulants"
      ]
    }
  },
  {
    specialty: "ophthalmology",
    name: "Ophthalmology",
    consultationTemplate: {
      chiefComplaint: "Ophthalmology consultation",
      historyOfPresentIllness: "Patient presents for ophthalmology consultation. Review vision changes, eye symptoms, and ocular concerns.",
      reviewOfSystems: [
        "No vision changes",
        "No eye pain or redness",
        "No floaters or flashes",
        "No double vision",
        "No dry eyes",
        "No eye discharge"
      ],
      physicalExamination: [
        "Visual acuity: Normal",
        "Pupils: Equal, round, reactive to light",
        "Extraocular movements: Full",
        "Visual fields: Full",
        "Fundoscopic: Normal",
        "Slit lamp: Normal anterior segment"
      ],
      assessment: "Ophthalmology consultation - assess vision, eye health, and need for further evaluation.",
      plan: [
        "Comprehensive eye examination",
        "Dilated fundus examination",
        "Visual field testing if indicated",
        "OCT if needed",
        "IOP measurement",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "Cataracts",
        "Glaucoma",
        "Diabetic retinopathy",
        "Macular degeneration",
        "Dry eye syndrome",
        "Refractive errors"
      ],
      commonTests: [
        "Visual acuity",
        "Tonometry",
        "Fundus photography",
        "OCT",
        "Visual field testing",
        "Angiography"
      ],
      commonMedications: [
        "Eye drops (glaucoma)",
        "Artificial tears",
        "Antibiotic eye drops",
        "Steroid eye drops",
        "Anti-VEGF injections"
      ]
    }
  },
  {
    specialty: "urology",
    name: "Urology",
    consultationTemplate: {
      chiefComplaint: "Urology consultation",
      historyOfPresentIllness: "Patient presents for urology consultation. Review urinary symptoms, prostate concerns, and urological issues.",
      reviewOfSystems: [
        "No urinary frequency or urgency",
        "No dysuria",
        "No hematuria",
        "No incontinence",
        "No difficulty voiding",
        "No sexual dysfunction"
      ],
      physicalExamination: [
        "Abdomen: Soft, no masses",
        "Flank: No tenderness",
        "Genital examination: Normal",
        "Digital rectal examination: Normal prostate if applicable",
        "No hernias",
        "No costovertebral angle tenderness"
      ],
      assessment: "Urology consultation - assess urinary symptoms, prostate health, and need for further evaluation.",
      plan: [
        "Urinalysis",
        "PSA if indicated",
        "Imaging if needed",
        "Cystoscopy if indicated",
        "Medication review",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "Benign prostatic hyperplasia",
        "Urinary tract infection",
        "Kidney stones",
        "Prostate cancer",
        "Overactive bladder",
        "Erectile dysfunction"
      ],
      commonTests: [
        "Urinalysis",
        "PSA",
        "Renal ultrasound",
        "CT urogram",
        "Cystoscopy",
        "Urodynamics"
      ],
      commonMedications: [
        "Alpha blockers",
        "5-alpha reductase inhibitors",
        "Antibiotics",
        "Anticholinergics",
        "PDE5 inhibitors",
        "Tamsulosin"
      ]
    }
  },
  {
    specialty: "gynecology",
    name: "Gynecology",
    consultationTemplate: {
      chiefComplaint: "Gynecology consultation",
      historyOfPresentIllness: "Patient presents for gynecology consultation. Review gynecological concerns, menstrual history, and reproductive health.",
      reviewOfSystems: [
        "Menstrual cycle: Regular",
        "No abnormal bleeding",
        "No pelvic pain",
        "No vaginal discharge",
        "No urinary symptoms",
        "No sexual dysfunction"
      ],
      physicalExamination: [
        "Vital signs: Normal",
        "Breast examination: Normal",
        "Pelvic examination: Normal",
        "Cervix: Normal appearance",
        "Uterus: Normal size and position",
        "Adnexa: No masses or tenderness"
      ],
      assessment: "Gynecology consultation - assess gynecological health, reproductive concerns, and need for screening.",
      plan: [
        "Pelvic examination",
        "Pap smear if indicated",
        "STI screening if indicated",
        "Ultrasound if needed",
        "Contraception counseling if needed",
        "Follow-up as needed"
      ],
      commonDiagnoses: [
        "Menorrhagia",
        "Endometriosis",
        "PCOS",
        "Fibroids",
        "Ovarian cysts",
        "Cervical dysplasia"
      ],
      commonTests: [
        "Pap smear",
        "HPV testing",
        "Pelvic ultrasound",
        "STI screening",
        "Hormone levels",
        "Endometrial biopsy"
      ],
      commonMedications: [
        "Oral contraceptives",
        "Hormone therapy",
        "Antibiotics",
        "Antifungals",
        "GnRH agonists",
        "Progestins"
      ]
    }
  }
];

export function getSpecialtyTemplate(specialty: SpecialtyType): SpecialtyTemplate {
  const template = specialtyTemplates.find(t => t.specialty === specialty);
  if (!template) {
    // Return a generic template if specialty not found
    return {
      specialty: "other",
      name: "Other",
      consultationTemplate: {
        chiefComplaint: "Specialty consultation",
        historyOfPresentIllness: "Patient presents for specialty consultation.",
        reviewOfSystems: ["Review of systems as indicated"],
        physicalExamination: ["Physical examination as indicated"],
        assessment: "Specialty consultation evaluation",
        plan: ["Further evaluation as needed", "Follow-up as indicated"],
        commonDiagnoses: ["To be determined"],
        commonTests: ["As clinically indicated"],
        commonMedications: ["As clinically indicated"]
      }
    };
  }
  return template;
}

export function getAllSpecialties(): SpecialtyTemplate[] {
  return specialtyTemplates;
}
