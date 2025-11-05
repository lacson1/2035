import { SpecialtyType } from "../types";
import { HubId } from "./hubs";

export interface QuestionOption {
  id: string;
  label: string;
  value: string | number;
}

export interface Question {
  id: string;
  question: string;
  type: "text" | "number" | "select" | "radio" | "checkbox" | "scale" | "date" | "boolean";
  required?: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  scaleLabels?: { min: string; max: string };
  category?: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  specialty: SpecialtyType;
  hubId?: HubId;
  category: "screening" | "assessment" | "follow-up" | "diagnostic" | "monitoring";
  questions: Question[];
  estimatedTime?: number; // in minutes
}

// Specialty-specific questionnaires
export const specialtyQuestionnaires: Questionnaire[] = [
  // Mental Health Hub
  {
    id: "phq-9",
    title: "PHQ-9 Depression Screening",
    description: "Patient Health Questionnaire for depression screening",
    specialty: "psychiatry",
    hubId: "mental-health",
    category: "screening",
    estimatedTime: 5,
    questions: [
      {
        id: "q1",
        question: "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q2",
        question: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q3",
        question: "Trouble falling or staying asleep, or sleeping too much?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q4",
        question: "Feeling tired or having little energy?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q5",
        question: "Poor appetite or overeating?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q6",
        question: "Feeling bad about yourself or that you are a failure or have let yourself or your family down?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q7",
        question: "Trouble concentrating on things, such as reading the newspaper or watching television?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q8",
        question: "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q9",
        question: "Thoughts that you would be better off dead, or of hurting yourself?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
    ],
  },
  {
    id: "gad-7",
    title: "GAD-7 Anxiety Screening",
    description: "Generalized Anxiety Disorder 7-item scale",
    specialty: "psychiatry",
    hubId: "mental-health",
    category: "screening",
    estimatedTime: 3,
    questions: [
      {
        id: "q1",
        question: "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q2",
        question: "Not being able to stop or control worrying?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q3",
        question: "Worrying too much about different things?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q4",
        question: "Trouble relaxing?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q5",
        question: "Being so restless that it is hard to sit still?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q6",
        question: "Becoming easily annoyed or irritable?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
      {
        id: "q7",
        question: "Feeling afraid, as if something awful might happen?",
        type: "radio",
        required: true,
        options: [
          { id: "0", label: "Not at all", value: 0 },
          { id: "1", label: "Several days", value: 1 },
          { id: "2", label: "More than half the days", value: 2 },
          { id: "3", label: "Nearly every day", value: 3 },
        ],
      },
    ],
  },
  // Cardiology Hub
  {
    id: "cardiac-risk",
    title: "Cardiac Risk Assessment",
    description: "Comprehensive cardiovascular risk evaluation",
    specialty: "cardiology",
    hubId: "cardiology",
    category: "assessment",
    estimatedTime: 10,
    questions: [
      {
        id: "q1",
        question: "Do you have chest pain or discomfort?",
        type: "boolean",
        required: true,
      },
      {
        id: "q2",
        question: "Do you experience shortness of breath with exertion?",
        type: "boolean",
        required: true,
      },
      {
        id: "q3",
        question: "Do you have a history of high blood pressure?",
        type: "boolean",
        required: true,
      },
      {
        id: "q4",
        question: "Do you have a history of diabetes?",
        type: "boolean",
        required: true,
      },
      {
        id: "q5",
        question: "Do you smoke or have you smoked in the past?",
        type: "boolean",
        required: true,
      },
      {
        id: "q6",
        question: "What is your current blood pressure? (mmHg)",
        type: "text",
        required: false,
        placeholder: "e.g., 120/80",
      },
      {
        id: "q7",
        question: "What is your most recent cholesterol level? (mg/dL)",
        type: "number",
        required: false,
        placeholder: "Total cholesterol",
      },
      {
        id: "q8",
        question: "Rate your exercise frequency per week",
        type: "select",
        required: true,
        options: [
          { id: "0", label: "No exercise", value: 0 },
          { id: "1", label: "1-2 times per week", value: 1 },
          { id: "2", label: "3-4 times per week", value: 2 },
          { id: "3", label: "5+ times per week", value: 3 },
        ],
      },
    ],
  },
  // MSK Hub
  {
    id: "pain-assessment",
    title: "Musculoskeletal Pain Assessment",
    description: "Comprehensive pain and function evaluation",
    specialty: "orthopedics",
    hubId: "msk",
    category: "assessment",
    estimatedTime: 8,
    questions: [
      {
        id: "q1",
        question: "Rate your current pain level (0-10 scale)",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "No pain", max: "Severe pain" },
      },
      {
        id: "q2",
        question: "Where is the pain located?",
        type: "text",
        required: true,
        placeholder: "e.g., Lower back, right knee",
      },
      {
        id: "q3",
        question: "How long have you been experiencing this pain?",
        type: "select",
        required: true,
        options: [
          { id: "acute", label: "Less than 6 weeks", value: "acute" },
          { id: "subacute", label: "6-12 weeks", value: "subacute" },
          { id: "chronic", label: "More than 12 weeks", value: "chronic" },
        ],
      },
      {
        id: "q4",
        question: "Does the pain worsen with activity?",
        type: "boolean",
        required: true,
      },
      {
        id: "q5",
        question: "Does the pain improve with rest?",
        type: "boolean",
        required: true,
      },
      {
        id: "q6",
        question: "Rate your functional limitation (0-10 scale)",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "No limitation", max: "Complete limitation" },
      },
      {
        id: "q7",
        question: "Have you tried any treatments?",
        type: "checkbox",
        required: false,
        options: [
          { id: "medication", label: "Medication", value: "medication" },
          { id: "physical-therapy", label: "Physical therapy", value: "physical-therapy" },
          { id: "injection", label: "Injection", value: "injection" },
          { id: "surgery", label: "Surgery", value: "surgery" },
          { id: "other", label: "Other", value: "other" },
        ],
      },
    ],
  },
  // Gynecology Hub
  {
    id: "gynae-screening",
    title: "Gynecological Health Screening",
    description: "Comprehensive women's health assessment",
    specialty: "gynecology",
    hubId: "gynae",
    category: "screening",
    estimatedTime: 7,
    questions: [
      {
        id: "q1",
        question: "When was your last menstrual period?",
        type: "date",
        required: false,
      },
      {
        id: "q2",
        question: "Is your menstrual cycle regular?",
        type: "boolean",
        required: true,
      },
      {
        id: "q3",
        question: "Do you experience abnormal bleeding?",
        type: "boolean",
        required: true,
      },
      {
        id: "q4",
        question: "Do you experience pelvic pain?",
        type: "boolean",
        required: true,
      },
      {
        id: "q5",
        question: "When was your last Pap smear?",
        type: "date",
        required: false,
      },
      {
        id: "q6",
        question: "Are you currently using contraception?",
        type: "boolean",
        required: true,
      },
      {
        id: "q7",
        question: "Do you have any concerns about menopause?",
        type: "boolean",
        required: false,
      },
    ],
  },
  // Endocrinology Hub
  {
    id: "diabetes-assessment",
    title: "Diabetes Management Assessment",
    description: "Comprehensive diabetes care evaluation",
    specialty: "endocrinology",
    hubId: "endocrinology",
    category: "monitoring",
    estimatedTime: 10,
    questions: [
      {
        id: "q1",
        question: "What is your most recent HbA1c? (%)",
        type: "number",
        required: false,
        placeholder: "e.g., 7.2",
        min: 0,
        max: 15,
      },
      {
        id: "q2",
        question: "What is your average fasting blood glucose? (mg/dL)",
        type: "number",
        required: false,
        placeholder: "e.g., 120",
      },
      {
        id: "q3",
        question: "How often do you check your blood sugar?",
        type: "select",
        required: true,
        options: [
          { id: "never", label: "Never", value: "never" },
          { id: "daily", label: "Daily", value: "daily" },
          { id: "multiple", label: "Multiple times per day", value: "multiple" },
          { id: "weekly", label: "Weekly", value: "weekly" },
        ],
      },
      {
        id: "q4",
        question: "Do you experience episodes of low blood sugar?",
        type: "boolean",
        required: true,
      },
      {
        id: "q5",
        question: "Do you experience episodes of high blood sugar?",
        type: "boolean",
        required: true,
      },
      {
        id: "q6",
        question: "Rate your adherence to your diabetes medication (0-10)",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "Never take", max: "Always take" },
      },
      {
        id: "q7",
        question: "Do you follow a diabetic diet?",
        type: "boolean",
        required: true,
      },
      {
        id: "q8",
        question: "Do you have any diabetes-related complications?",
        type: "checkbox",
        required: false,
        options: [
          { id: "retinopathy", label: "Retinopathy", value: "retinopathy" },
          { id: "nephropathy", label: "Nephropathy", value: "nephropathy" },
          { id: "neuropathy", label: "Neuropathy", value: "neuropathy" },
          { id: "none", label: "None", value: "none" },
        ],
      },
    ],
  },
  // Neurology Hub
  {
    id: "headache-assessment",
    title: "Headache Assessment",
    description: "Comprehensive headache and migraine evaluation",
    specialty: "neurology",
    hubId: "neurology",
    category: "assessment",
    estimatedTime: 8,
    questions: [
      {
        id: "q1",
        question: "How often do you experience headaches?",
        type: "select",
        required: true,
        options: [
          { id: "daily", label: "Daily", value: "daily" },
          { id: "weekly", label: "Weekly", value: "weekly" },
          { id: "monthly", label: "Monthly", value: "monthly" },
          { id: "rarely", label: "Rarely", value: "rarely" },
        ],
      },
      {
        id: "q2",
        question: "Rate the severity of your headaches (0-10 scale)",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "Mild", max: "Severe" },
      },
      {
        id: "q3",
        question: "Where is the pain located?",
        type: "checkbox",
        required: true,
        options: [
          { id: "frontal", label: "Frontal", value: "frontal" },
          { id: "temporal", label: "Temporal", value: "temporal" },
          { id: "occipital", label: "Occipital", value: "occipital" },
          { id: "unilateral", label: "Unilateral", value: "unilateral" },
          { id: "bilateral", label: "Bilateral", value: "bilateral" },
        ],
      },
      {
        id: "q4",
        question: "Do you experience any associated symptoms?",
        type: "checkbox",
        required: false,
        options: [
          { id: "nausea", label: "Nausea", value: "nausea" },
          { id: "vomiting", label: "Vomiting", value: "vomiting" },
          { id: "photophobia", label: "Light sensitivity", value: "photophobia" },
          { id: "phonophobia", label: "Sound sensitivity", value: "phonophobia" },
          { id: "aura", label: "Aura", value: "aura" },
        ],
      },
      {
        id: "q5",
        question: "What triggers your headaches?",
        type: "text",
        required: false,
        placeholder: "e.g., Stress, certain foods, weather",
      },
      {
        id: "q6",
        question: "How long do your headaches typically last?",
        type: "select",
        required: true,
        options: [
          { id: "minutes", label: "Minutes", value: "minutes" },
          { id: "hours", label: "Hours", value: "hours" },
          { id: "days", label: "Days", value: "days" },
        ],
      },
    ],
  },
  // Primary Care Hub
  {
    id: "preventive-care",
    title: "Preventive Care Screening",
    description: "General health and preventive care assessment",
    specialty: "family_medicine",
    hubId: "primary-care",
    category: "screening",
    estimatedTime: 12,
    questions: [
      {
        id: "q1",
        question: "When was your last physical examination?",
        type: "date",
        required: false,
      },
      {
        id: "q2",
        question: "Do you have any current health concerns?",
        type: "text",
        required: false,
        placeholder: "Describe any concerns",
      },
      {
        id: "q3",
        question: "Are you up to date with your vaccinations?",
        type: "boolean",
        required: true,
      },
      {
        id: "q4",
        question: "Do you smoke?",
        type: "boolean",
        required: true,
      },
      {
        id: "q5",
        question: "How many alcoholic drinks do you consume per week?",
        type: "number",
        required: false,
        min: 0,
        placeholder: "0",
      },
      {
        id: "q6",
        question: "How many hours of sleep do you get per night?",
        type: "number",
        required: false,
        min: 0,
        max: 24,
        placeholder: "e.g., 7",
      },
      {
        id: "q7",
        question: "Rate your stress level (0-10 scale)",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "No stress", max: "Extreme stress" },
      },
      {
        id: "q8",
        question: "Do you have a family history of any significant medical conditions?",
        type: "text",
        required: false,
        placeholder: "e.g., Heart disease, diabetes, cancer",
      },
    ],
  },
];

/**
 * Get questionnaires for a specific hub
 */
export function getQuestionnairesByHub(hubId: HubId): Questionnaire[] {
  return specialtyQuestionnaires.filter((q) => q.hubId === hubId);
}

/**
 * Get questionnaires for a specific specialty
 */
export function getQuestionnairesBySpecialty(specialty: SpecialtyType): Questionnaire[] {
  return specialtyQuestionnaires.filter((q) => q.specialty === specialty);
}

/**
 * Get all questionnaires
 */
export function getAllQuestionnaires(): Questionnaire[] {
  return specialtyQuestionnaires;
}

/**
 * Get questionnaire by ID
 */
export function getQuestionnaireById(id: string): Questionnaire | undefined {
  return specialtyQuestionnaires.find((q) => q.id === id);
}

