import { SpecialtyType } from "../types";
import { 
  Brain, Bone, Heart, Baby, Microscope, Stethoscope, Eye, 
  AlertTriangle, Sparkles, Activity, Droplet, Zap, 
  Shield, Droplets, Scissors
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export type HubId = 
  | "mental-health"
  | "msk"
  | "gynae"
  | "cardiology"
  | "pediatrics"
  | "oncology"
  | "primary-care"
  | "ophthalmology"
  | "emergency"
  | "dermatology"
  | "gastroenterology"
  | "neurology"
  | "nephrology"
  | "pulmonology"
  | "endocrinology"
  | "urology"
  | "infectious-disease"
  | "allergy-immunology"
  | "pain-management"
  | "sleep-medicine"
  | "critical-care"
  | "surgery";

export interface HubQuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: string;
  url?: string;
}

export interface HubResource {
  id: string;
  title: string;
  type: "protocol" | "guideline" | "reference" | "tool" | "link";
  url?: string;
  description?: string;
}

export interface Hub {
  id: HubId;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  specialties: SpecialtyType[];
  commonConditions: string[];
  commonTreatments: string[];
  quickActions?: HubQuickAction[];
  resources?: HubResource[];
}

export const hubs: Hub[] = [
  {
    id: "mental-health",
    name: "Mental Health Hub",
    description: "Comprehensive mental health and behavioral care services",
    icon: Brain,
    color: "purple",
    specialties: ["psychiatry", "psychology"],
    commonConditions: [
      "Depression",
      "Anxiety disorders",
      "Bipolar disorder",
      "Schizophrenia",
      "PTSD",
      "ADHD",
      "Eating disorders",
      "Substance use disorders"
    ],
    commonTreatments: [
      "Psychotherapy",
      "Medication management",
      "Cognitive behavioral therapy",
      "Group therapy",
      "Crisis intervention"
    ]
  },
  {
    id: "msk",
    name: "MSK Hub",
    description: "Musculoskeletal care including orthopedics, sports medicine, and physical medicine",
    icon: Bone,
    color: "blue",
    specialties: ["orthopedics", "sports_medicine", "physical_medicine", "rheumatology", "orthopedic_surgery"],
    commonConditions: [
      "Osteoarthritis",
      "Rheumatoid arthritis",
      "Fractures",
      "Tendonitis",
      "Herniated disc",
      "Rotator cuff injuries",
      "Sports injuries",
      "Back pain"
    ],
    commonTreatments: [
      "Physical therapy",
      "Joint injections",
      "Pain management",
      "Surgical interventions",
      "Rehabilitation"
    ]
  },
  {
    id: "gynae",
    name: "Gynae Hub",
    description: "Women's health and reproductive care services",
    icon: Heart,
    color: "pink",
    specialties: ["gynecology", "obstetrics"],
    commonConditions: [
      "Menorrhagia",
      "Endometriosis",
      "PCOS",
      "Fibroids",
      "Ovarian cysts",
      "Cervical dysplasia",
      "Menopause",
      "Pregnancy complications"
    ],
    commonTreatments: [
      "Hormone therapy",
      "Contraception counseling",
      "Surgical procedures",
      "Prenatal care",
      "Gynecologic oncology"
    ]
  },
  {
    id: "cardiology",
    name: "Cardiology Hub",
    description: "Cardiovascular health and heart care services",
    icon: Heart,
    color: "red",
    specialties: ["cardiology"],
    commonConditions: [
      "Hypertension",
      "Coronary artery disease",
      "Heart failure",
      "Arrhythmias",
      "Valvular heart disease",
      "Dyslipidemia"
    ],
    commonTreatments: [
      "Medication management",
      "Cardiac procedures",
      "Lifestyle modifications",
      "Cardiac rehabilitation",
      "Device implantation"
    ]
  },
  {
    id: "pediatrics",
    name: "Pediatrics Hub",
    description: "Comprehensive care for infants, children, and adolescents",
    icon: Baby,
    color: "yellow",
    specialties: ["pediatrics"],
    commonConditions: [
      "Childhood infections",
      "Developmental disorders",
      "Asthma",
      "Allergies",
      "Growth concerns",
      "Behavioral issues"
    ],
    commonTreatments: [
      "Vaccinations",
      "Growth monitoring",
      "Developmental assessments",
      "Family counseling",
      "Preventive care"
    ]
  },
  {
    id: "oncology",
    name: "Oncology Hub",
    description: "Cancer care and treatment services",
    icon: Microscope,
    color: "orange",
    specialties: ["oncology", "hematology"],
    commonConditions: [
      "Solid tumors",
      "Hematologic malignancies",
      "Metastatic disease",
      "Treatment-related complications"
    ],
    commonTreatments: [
      "Chemotherapy",
      "Immunotherapy",
      "Targeted therapy",
      "Radiation therapy",
      "Surgical oncology",
      "Supportive care"
    ]
  },
  {
    id: "primary-care",
    name: "Primary Care Hub",
    description: "General health and preventive care services",
    icon: Stethoscope,
    color: "green",
    specialties: ["family_medicine", "internal_medicine", "general_surgery"],
    commonConditions: [
      "Diabetes",
      "Hypertension",
      "Respiratory infections",
      "Chronic disease management",
      "Preventive care"
    ],
    commonTreatments: [
      "Health screenings",
      "Chronic disease management",
      "Preventive care",
      "Health education",
      "Referral coordination"
    ]
  },
  {
    id: "ophthalmology",
    name: "Ophthalmology Hub",
    description: "Eye care and vision services",
    icon: Eye,
    color: "indigo",
    specialties: ["ophthalmology"],
    commonConditions: [
      "Cataracts",
      "Glaucoma",
      "Diabetic retinopathy",
      "Macular degeneration",
      "Refractive errors",
      "Dry eye syndrome"
    ],
    commonTreatments: [
      "Eye examinations",
      "Surgical procedures",
      "Medical management",
      "Vision correction",
      "Retinal treatments"
    ]
  },
  {
    id: "emergency",
    name: "Emergency & Trauma Hub",
    description: "Emergency medicine and trauma care services",
    icon: AlertTriangle,
    color: "red",
    specialties: ["emergency_medicine", "critical_care"],
    commonConditions: [
      "Acute coronary syndrome",
      "Stroke",
      "Trauma",
      "Sepsis",
      "Respiratory distress",
      "Anaphylaxis",
      "Overdose",
      "Cardiac arrest"
    ],
    commonTreatments: [
      "Resuscitation",
      "Trauma protocols",
      "Emergency procedures",
      "Critical care",
      "Rapid response"
    ],
    quickActions: [
      { id: "triage", label: "Triage Protocol", icon: AlertTriangle, action: "triage" },
      { id: "resuscitation", label: "Resuscitation", icon: Activity, action: "resuscitation" },
    ]
  },
  {
    id: "dermatology",
    name: "Dermatology Hub",
    description: "Skin, hair, and nail care services",
    icon: Sparkles,
    color: "purple",
    specialties: ["dermatology"],
    commonConditions: [
      "Acne",
      "Eczema",
      "Psoriasis",
      "Skin cancer",
      "Melanoma",
      "Basal cell carcinoma",
      "Squamous cell carcinoma",
      "Alopecia"
    ],
    commonTreatments: [
      "Topical treatments",
      "Phototherapy",
      "Biologics",
      "Surgical procedures",
      "Mohs surgery",
      "Cryotherapy"
    ]
  },
  {
    id: "gastroenterology",
    name: "Gastroenterology Hub",
    description: "Digestive system and gastrointestinal care",
    icon: Activity,
    color: "green",
    specialties: ["gastroenterology"],
    commonConditions: [
      "GERD",
      "Irritable bowel syndrome",
      "Inflammatory bowel disease",
      "Crohn's disease",
      "Ulcerative colitis",
      "Peptic ulcer disease",
      "Hepatitis",
      "Cirrhosis"
    ],
    commonTreatments: [
      "Endoscopy",
      "Colonoscopy",
      "Medication management",
      "Dietary modifications",
      "Liver biopsy",
      "ERCP"
    ]
  },
  {
    id: "neurology",
    name: "Neurology Hub",
    description: "Brain, nervous system, and neurological disorders",
    icon: Brain,
    color: "indigo",
    specialties: ["neurology", "neurosurgery"],
    commonConditions: [
      "Migraine",
      "Epilepsy",
      "Stroke",
      "Multiple sclerosis",
      "Parkinson's disease",
      "Alzheimer's disease",
      "Peripheral neuropathy",
      "Seizures"
    ],
    commonTreatments: [
      "Medication management",
      "EEG monitoring",
      "Nerve conduction studies",
      "Botulinum toxin injections",
      "Deep brain stimulation",
      "Epilepsy surgery"
    ]
  },
  {
    id: "nephrology",
    name: "Nephrology Hub",
    description: "Kidney care and renal disease management",
    icon: Droplet,
    color: "blue",
    specialties: ["nephrology"],
    commonConditions: [
      "Chronic kidney disease",
      "Acute kidney injury",
      "Kidney stones",
      "Nephrotic syndrome",
      "Hypertension",
      "Diabetic nephropathy",
      "Polycystic kidney disease",
      "Glomerulonephritis"
    ],
    commonTreatments: [
      "Dialysis",
      "Kidney transplantation",
      "Medication management",
      "Fluid management",
      "Electrolyte correction",
      "Biopsy"
    ]
  },
  {
    id: "pulmonology",
    name: "Pulmonology Hub",
    description: "Lung and respiratory system care",
    icon: Activity,
    color: "cyan",
    specialties: ["pulmonology"],
    commonConditions: [
      "COPD",
      "Asthma",
      "Pneumonia",
      "Interstitial lung disease",
      "Sleep apnea",
      "Pulmonary embolism",
      "Lung cancer",
      "Bronchiectasis"
    ],
    commonTreatments: [
      "Bronchodilators",
      "Inhaled corticosteroids",
      "Pulmonary function tests",
      "Bronchoscopy",
      "CPAP/BiPAP",
      "Oxygen therapy"
    ]
  },
  {
    id: "endocrinology",
    name: "Endocrinology Hub",
    description: "Hormone and metabolic disorder management",
    icon: Zap,
    color: "yellow",
    specialties: ["endocrinology"],
    commonConditions: [
      "Type 1 Diabetes",
      "Type 2 Diabetes",
      "Hypothyroidism",
      "Hyperthyroidism",
      "Metabolic syndrome",
      "Obesity",
      "Adrenal disorders",
      "Pituitary disorders"
    ],
    commonTreatments: [
      "Insulin management",
      "Hormone replacement",
      "Metabolic monitoring",
      "Weight management",
      "Medication optimization",
      "Lifestyle counseling"
    ]
  },
  {
    id: "urology",
    name: "Urology Hub",
    description: "Urinary tract and male reproductive health",
    icon: Droplets,
    color: "blue",
    specialties: ["urology"],
    commonConditions: [
      "Benign prostatic hyperplasia",
      "Urinary tract infections",
      "Kidney stones",
      "Prostate cancer",
      "Bladder cancer",
      "Erectile dysfunction",
      "Incontinence",
      "Overactive bladder"
    ],
    commonTreatments: [
      "Medication management",
      "Minimally invasive procedures",
      "Surgical interventions",
      "Urodynamics",
      "Cystoscopy",
      "Laser therapy"
    ]
  },
  {
    id: "infectious-disease",
    name: "Infectious Disease Hub",
    description: "Infection prevention, diagnosis, and treatment",
    icon: Shield,
    color: "orange",
    specialties: ["infectious_disease"],
    commonConditions: [
      "Bacterial infections",
      "Viral infections",
      "Fungal infections",
      "HIV/AIDS",
      "Tuberculosis",
      "Sepsis",
      "Antibiotic resistance",
      "Travel medicine"
    ],
    commonTreatments: [
      "Antimicrobial therapy",
      "Infection control",
      "Vaccination",
      "Contact tracing",
      "Antimicrobial stewardship",
      "Isolation protocols"
    ]
  },
  {
    id: "allergy-immunology",
    name: "Allergy & Immunology Hub",
    description: "Allergic reactions and immune system disorders",
    icon: Shield,
    color: "green",
    specialties: ["allergy_immunology"],
    commonConditions: [
      "Allergic rhinitis",
      "Asthma",
      "Food allergies",
      "Drug allergies",
      "Atopic dermatitis",
      "Immunodeficiency",
      "Autoimmune disorders",
      "Anaphylaxis"
    ],
    commonTreatments: [
      "Allergy testing",
      "Immunotherapy",
      "Medication management",
      "Epinephrine training",
      "Avoidance strategies",
      "Biologic therapies"
    ]
  },
  {
    id: "pain-management",
    name: "Pain Management Hub",
    description: "Chronic and acute pain treatment",
    icon: Activity,
    color: "purple",
    specialties: ["pain_management"],
    commonConditions: [
      "Chronic pain",
      "Neuropathic pain",
      "Post-surgical pain",
      "Fibromyalgia",
      "Migraine",
      "Back pain",
      "Arthritis pain",
      "Cancer pain"
    ],
    commonTreatments: [
      "Medication management",
      "Interventional procedures",
      "Physical therapy",
      "Acupuncture",
      "Nerve blocks",
      "Multimodal therapy"
    ]
  },
  {
    id: "sleep-medicine",
    name: "Sleep Medicine Hub",
    description: "Sleep disorders and sleep health",
    icon: Activity,
    color: "indigo",
    specialties: ["sleep_medicine"],
    commonConditions: [
      "Obstructive sleep apnea",
      "Insomnia",
      "Narcolepsy",
      "Restless leg syndrome",
      "Sleep-disordered breathing",
      "Circadian rhythm disorders",
      "Parasomnias",
      "Sleep deprivation"
    ],
    commonTreatments: [
      "Sleep studies",
      "CPAP/BiPAP therapy",
      "Medication management",
      "Cognitive behavioral therapy",
      "Sleep hygiene",
      "Oral appliances"
    ]
  },
  {
    id: "critical-care",
    name: "Critical Care Hub",
    description: "Intensive care and critical patient management",
    icon: Activity,
    color: "red",
    specialties: ["critical_care"],
    commonConditions: [
      "Sepsis",
      "Acute respiratory distress syndrome",
      "Multi-organ failure",
      "Shock",
      "Traumatic brain injury",
      "Post-operative care",
      "Cardiac arrest",
      "Severe infections"
    ],
    commonTreatments: [
      "Mechanical ventilation",
      "Hemodynamic monitoring",
      "Vasoactive medications",
      "Renal replacement therapy",
      "Sedation management",
      "Procedures"
    ]
  },
  {
    id: "surgery",
    name: "Surgery Hub",
    description: "General and specialized surgical services",
    icon: Scissors,
    color: "red",
    specialties: ["surgery", "general_surgery", "neurosurgery", "plastic_surgery", "vascular_surgery"],
    commonConditions: [
      "Appendicitis",
      "Gallstones",
      "Hernias",
      "Tumors",
      "Trauma",
      "Vascular disease",
      "Cosmetic concerns",
      "Reconstructive needs"
    ],
    commonTreatments: [
      "Minimally invasive surgery",
      "Open procedures",
      "Robotic surgery",
      "Reconstructive surgery",
      "Emergency surgery",
      "Elective procedures"
    ]
  }
];

export function getHubById(id: HubId): Hub | undefined {
  return hubs.find(hub => hub.id === id);
}

export function getHubBySpecialty(specialty: SpecialtyType): Hub | undefined {
  return hubs.find(hub => hub.specialties.includes(specialty));
}

export function getAllHubs(): Hub[] {
  return hubs;
}

export function getHubColorClass(hub: Hub): string {
  const colorMap: Record<string, string> = {
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
    pink: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300",
    orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300",
    cyan: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300",
  };
  return colorMap[hub.color] || "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300";
}

