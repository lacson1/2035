/**
 * Questionnaires - Reference Data
 * 
 * Common questionnaires for all medical specialties/hubs.
 * In production, these should be loaded from the backend API or database.
 */

export interface QuestionOption {
  id: string;
  label: string;
  value: string | number;
}

export interface Question {
  id: string;
  question: string;
  label?: string;
  type: "text" | "number" | "select" | "radio" | "checkbox" | "scale" | "date" | "boolean";
  required?: boolean;
  options?: QuestionOption[] | string[];
  placeholder?: string;
  min?: number;
  max?: number;
  scaleLabels?: { min: string; max: string };
  category?: string;
}

export interface Questionnaire {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  hubId?: string;
  questions: Question[];
  estimatedTime?: number;
  hasScoring?: boolean; // Whether this questionnaire has a calculable score
  maxScore?: number; // Maximum possible score
  scoringFunction?: string; // ID of the scoring function to use
}

// Common questionnaires for all specialties
const questionnaires: Questionnaire[] = [
  // CARDIOLOGY
  {
    id: "cardiac-risk-assessment",
    title: "Cardiac Risk Assessment",
    name: "Cardiac Risk Assessment",
    description: "Comprehensive cardiovascular risk evaluation",
    hubId: "cardiology",
    estimatedTime: 10,
    hasScoring: true,
    maxScore: 10,
    scoringFunction: "cardiac-risk",
    questions: [
      {
        id: "q1",
        question: "Do you have a history of chest pain or discomfort?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q2",
        question: "Do you experience shortness of breath during normal activities?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q3",
        question: "Do you have a family history of heart disease?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q4",
        question: "What is your current blood pressure?",
        type: "text",
        required: false,
        placeholder: "e.g., 120/80",
      },
      {
        id: "q5",
        question: "Do you smoke or use tobacco products?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
          { id: "former", label: "Former smoker", value: "former" },
        ],
      },
      {
        id: "q6",
        question: "Do you have diabetes?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
          { id: "prediabetes", label: "Prediabetes", value: "prediabetes" },
        ],
      },
      {
        id: "q7",
        question: "What is your most recent total cholesterol level (mg/dL)?",
        type: "number",
        required: false,
        placeholder: "e.g., 200",
      },
      {
        id: "q8",
        question: "How often do you engage in physical exercise?",
        type: "select",
        required: true,
        options: [
          { id: "none", label: "No exercise", value: "none" },
          { id: "rare", label: "Rarely (less than once per week)", value: "rare" },
          { id: "weekly", label: "1-2 times per week", value: "weekly" },
          { id: "regular", label: "3-4 times per week", value: "regular" },
          { id: "daily", label: "5+ times per week", value: "daily" },
        ],
      },
      {
        id: "q9",
        question: "Do you have a history of high blood pressure?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q10",
        question: "What is your age?",
        type: "number",
        required: true,
        placeholder: "Age in years",
        min: 18,
        max: 120,
      },
    ],
  },
  {
    id: "heart-failure-assessment",
    title: "Heart Failure Assessment",
    name: "Heart Failure Assessment",
    description: "Evaluation of heart failure symptoms and functional capacity",
    hubId: "cardiology",
    estimatedTime: 10,
    questions: [
      {
        id: "q1",
        question: "Rate your level of fatigue (0-10, where 10 is most severe)",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "No fatigue", max: "Severe fatigue" },
      },
      {
        id: "q2",
        question: "Do you experience swelling in your legs or ankles?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q3",
        question: "How many flights of stairs can you climb without stopping?",
        type: "number",
        required: false,
        placeholder: "Number of flights",
      },
      {
        id: "q4",
        question: "Do you experience shortness of breath at rest?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q5",
        question: "Do you wake up at night due to shortness of breath?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q6",
        question: "Have you noticed increased swelling or weight gain?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q7",
        question: "Are you taking heart failure medications?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
    ],
  },

  // ONCOLOGY
  {
    id: "cancer-symptom-assessment",
    title: "Cancer Symptom Assessment",
    name: "Cancer Symptom Assessment",
    description: "Comprehensive evaluation of cancer-related symptoms",
    hubId: "oncology",
    estimatedTime: 15,
    questions: [
      {
        id: "q1",
        question: "Rate your current pain level (0-10)",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "No pain", max: "Severe pain" },
      },
      {
        id: "q2",
        question: "Have you experienced any unexplained weight loss?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q3",
        question: "Are you currently receiving chemotherapy or radiation?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q4",
        question: "Rate your level of nausea (0-10)",
        type: "scale",
        required: false,
        min: 0,
        max: 10,
        scaleLabels: { min: "None", max: "Severe" },
      },
      {
        id: "q5",
        question: "Rate your level of fatigue (0-10)",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "No fatigue", max: "Severe fatigue" },
      },
      {
        id: "q6",
        question: "Have you experienced any changes in appetite?",
        type: "radio",
        required: true,
        options: [
          { id: "decreased", label: "Decreased appetite", value: "decreased" },
          { id: "increased", label: "Increased appetite", value: "increased" },
          { id: "normal", label: "Normal", value: "normal" },
        ],
      },
      {
        id: "q7",
        question: "Are you experiencing any sleep disturbances?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q8",
        question: "How would you rate your overall quality of life?",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "Very poor", max: "Excellent" },
      },
    ],
  },
  {
    id: "quality-of-life-oncology",
    title: "Quality of Life Assessment",
    name: "Quality of Life Assessment",
    description: "Patient-reported quality of life measures",
    hubId: "oncology",
    estimatedTime: 12,
    questions: [
      {
        id: "q1",
        question: "How would you rate your overall quality of life?",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "Very poor", max: "Excellent" },
      },
      {
        id: "q2",
        question: "Are you able to perform your daily activities?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes, without difficulty", value: "yes" },
          { id: "some", label: "Yes, with some difficulty", value: "some" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q3",
        question: "How would you rate your physical well-being?",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "Very poor", max: "Excellent" },
      },
      {
        id: "q4",
        question: "How would you rate your emotional well-being?",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "Very poor", max: "Excellent" },
      },
      {
        id: "q5",
        question: "Are you able to work or engage in your usual activities?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes, fully", value: "yes" },
          { id: "partial", label: "Partially", value: "partial" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q6",
        question: "How satisfied are you with your social relationships?",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "Very dissatisfied", max: "Very satisfied" },
      },
    ],
  },

  // PEDIATRICS
  {
    id: "pediatric-development",
    title: "Pediatric Development Assessment",
    name: "Pediatric Development Assessment",
    description: "Evaluation of child development milestones",
    hubId: "pediatrics",
    estimatedTime: 15,
    questions: [
      {
        id: "q1",
        question: "Child's age",
        type: "number",
        required: true,
        placeholder: "Age in months",
      },
      {
        id: "q2",
        question: "Is your child meeting age-appropriate milestones?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
          { id: "unsure", label: "Unsure", value: "unsure" },
        ],
      },
      {
        id: "q3",
        question: "Has your child received all recommended vaccinations?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
          { id: "partial", label: "Partial", value: "partial" },
        ],
      },
      {
        id: "q4",
        question: "Any concerns about your child's eating or sleeping?",
        type: "text",
        required: false,
        placeholder: "Describe any concerns",
      },
      {
        id: "q5",
        question: "Is your child able to sit, crawl, or walk (age-appropriate)?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
          { id: "partial", label: "Partially", value: "partial" },
        ],
      },
      {
        id: "q6",
        question: "Is your child able to communicate verbally (age-appropriate)?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
          { id: "partial", label: "Partially", value: "partial" },
        ],
      },
      {
        id: "q7",
        question: "Any concerns about your child's behavior or social interactions?",
        type: "text",
        required: false,
        placeholder: "Describe any concerns",
      },
    ],
  },
  {
    id: "pediatric-growth",
    title: "Growth and Nutrition Assessment",
    name: "Growth and Nutrition Assessment",
    description: "Evaluation of child growth patterns and nutrition",
    hubId: "pediatrics",
    estimatedTime: 12,
    questions: [
      {
        id: "q1",
        question: "Child's current weight (kg)",
        type: "number",
        required: true,
        placeholder: "Weight in kg",
      },
      {
        id: "q2",
        question: "Child's current height (cm)",
        type: "number",
        required: true,
        placeholder: "Height in cm",
      },
      {
        id: "q3",
        question: "Is your child's growth on track?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q4",
        question: "How would you describe your child's appetite?",
        type: "select",
        required: true,
        options: [
          { id: "excellent", label: "Excellent", value: "excellent" },
          { id: "good", label: "Good", value: "good" },
          { id: "fair", label: "Fair", value: "fair" },
          { id: "poor", label: "Poor", value: "poor" },
        ],
      },
      {
        id: "q5",
        question: "Is your child eating a balanced diet?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
          { id: "sometimes", label: "Sometimes", value: "sometimes" },
        ],
      },
      {
        id: "q6",
        question: "Any feeding difficulties or concerns?",
        type: "text",
        required: false,
        placeholder: "Describe any concerns",
      },
    ],
  },

  // ORTHOPEDICS
  {
    id: "musculoskeletal-pain",
    title: "Musculoskeletal Pain Assessment",
    name: "Musculoskeletal Pain Assessment",
    description: "Evaluation of bone, joint, and muscle pain",
    hubId: "orthopedics",
    estimatedTime: 10,
    hasScoring: true,
    maxScore: 10,
    scoringFunction: "pain-score",
    questions: [
      {
        id: "q1",
        question: "Location of pain",
        type: "select",
        required: true,
        options: [
          { id: "back", label: "Back", value: "back" },
          { id: "knee", label: "Knee", value: "knee" },
          { id: "shoulder", label: "Shoulder", value: "shoulder" },
          { id: "hip", label: "Hip", value: "hip" },
          { id: "other", label: "Other", value: "other" },
        ],
      },
      {
        id: "q2",
        question: "Rate your pain level (0-10)",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "No pain", max: "Severe pain" },
      },
      {
        id: "q3",
        question: "Does the pain limit your daily activities?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q4",
        question: "When did the pain start?",
        type: "date",
        required: false,
      },
      {
        id: "q5",
        question: "What makes the pain worse?",
        type: "text",
        required: false,
        placeholder: "e.g., movement, sitting, standing",
      },
      {
        id: "q6",
        question: "What makes the pain better?",
        type: "text",
        required: false,
        placeholder: "e.g., rest, heat, medication",
      },
      {
        id: "q7",
        question: "Have you had any previous injuries to this area?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q8",
        question: "Are you currently taking any pain medications?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
    ],
  },
  {
    id: "mobility-assessment",
    title: "Mobility and Function Assessment",
    name: "Mobility and Function Assessment",
    description: "Evaluation of movement and functional capacity",
    hubId: "orthopedics",
    estimatedTime: 10,
    questions: [
      {
        id: "q1",
        question: "Can you walk without assistance?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
          { id: "partial", label: "With assistance", value: "partial" },
        ],
      },
      {
        id: "q2",
        question: "How far can you walk without stopping?",
        type: "select",
        required: false,
        options: [
          { id: "unlimited", label: "Unlimited", value: "unlimited" },
          { id: "blocks", label: "Several blocks", value: "blocks" },
          { id: "short", label: "Short distance", value: "short" },
          { id: "none", label: "Cannot walk", value: "none" },
        ],
      },
      {
        id: "q3",
        question: "Can you climb stairs?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes, without difficulty", value: "yes" },
          { id: "some", label: "Yes, with difficulty", value: "some" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q4",
        question: "Can you bend down or squat?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q5",
        question: "Are you able to lift objects?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes, heavy objects", value: "heavy" },
          { id: "light", label: "Yes, light objects only", value: "light" },
          { id: "no", label: "No", value: "no" },
        ],
      },
    ],
  },

  // NEUROLOGY
  {
    id: "headache-assessment",
    title: "Headache Assessment",
    name: "Headache Assessment",
    description: "Comprehensive evaluation of headache patterns",
    hubId: "neurology",
    estimatedTime: 12,
    hasScoring: true,
    maxScore: 10,
    scoringFunction: "pain-score",
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
        question: "Rate the severity of your headaches (0-10)",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "Mild", max: "Severe" },
      },
      {
        id: "q3",
        question: "Do you experience any visual disturbances with headaches?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q4",
        question: "Duration of typical headache",
        type: "select",
        required: false,
        options: [
          { id: "minutes", label: "Minutes", value: "minutes" },
          { id: "hours", label: "Hours", value: "hours" },
          { id: "days", label: "Days", value: "days" },
        ],
      },
      {
        id: "q5",
        question: "Location of headache",
        type: "select",
        required: true,
        options: [
          { id: "frontal", label: "Frontal (forehead)", value: "frontal" },
          { id: "temporal", label: "Temporal (sides)", value: "temporal" },
          { id: "occipital", label: "Occipital (back of head)", value: "occipital" },
          { id: "generalized", label: "Generalized (all over)", value: "generalized" },
        ],
      },
      {
        id: "q6",
        question: "Type of pain",
        type: "select",
        required: true,
        options: [
          { id: "throbbing", label: "Throbbing", value: "throbbing" },
          { id: "pressure", label: "Pressure", value: "pressure" },
          { id: "sharp", label: "Sharp", value: "sharp" },
          { id: "dull", label: "Dull ache", value: "dull" },
        ],
      },
      {
        id: "q7",
        question: "Do you experience nausea or vomiting with headaches?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q8",
        question: "Are you sensitive to light or sound during headaches?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
    ],
  },
  {
    id: "neurological-symptoms",
    title: "Neurological Symptoms Assessment",
    name: "Neurological Symptoms Assessment",
    description: "Evaluation of neurological symptoms",
    hubId: "neurology",
    estimatedTime: 12,
    questions: [
      {
        id: "q1",
        question: "Do you experience dizziness or vertigo?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q2",
        question: "Have you experienced any seizures?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q3",
        question: "Do you have any numbness or tingling?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q4",
        question: "Location of numbness or tingling",
        type: "text",
        required: false,
        placeholder: "e.g., hands, feet, face",
      },
      {
        id: "q5",
        question: "Do you experience muscle weakness?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q6",
        question: "Have you noticed any changes in coordination or balance?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q7",
        question: "Do you experience any vision problems?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q8",
        question: "Have you noticed any memory or cognitive changes?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
    ],
  },

  // PSYCHIATRY
  {
    id: "phq-9",
    title: "PHQ-9 Depression Screening",
    name: "PHQ-9 Depression Screening",
    description: "Patient Health Questionnaire for depression screening (9-item scale)",
    hubId: "psychiatry",
    estimatedTime: 5,
    hasScoring: true,
    maxScore: 27,
    scoringFunction: "phq-9",
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
    name: "GAD-7 Anxiety Screening",
    description: "Generalized Anxiety Disorder 7-item scale",
    hubId: "psychiatry",
    estimatedTime: 5,
    hasScoring: true,
    maxScore: 21,
    scoringFunction: "gad-7",
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

  // DERMATOLOGY
  {
    id: "skin-condition-assessment",
    title: "Skin Condition Assessment",
    name: "Skin Condition Assessment",
    description: "Evaluation of skin conditions and symptoms",
    hubId: "dermatology",
    estimatedTime: 12,
    questions: [
      {
        id: "q1",
        question: "Location of skin condition",
        type: "select",
        required: true,
        options: [
          { id: "face", label: "Face", value: "face" },
          { id: "arms", label: "Arms", value: "arms" },
          { id: "legs", label: "Legs", value: "legs" },
          { id: "torso", label: "Torso", value: "torso" },
          { id: "other", label: "Other", value: "other" },
        ],
      },
      {
        id: "q2",
        question: "Rate the severity of itching (0-10)",
        type: "scale",
        required: false,
        min: 0,
        max: 10,
        scaleLabels: { min: "No itching", max: "Severe itching" },
      },
      {
        id: "q3",
        question: "How long have you had this condition?",
        type: "select",
        required: false,
        options: [
          { id: "days", label: "Days", value: "days" },
          { id: "weeks", label: "Weeks", value: "weeks" },
          { id: "months", label: "Months", value: "months" },
          { id: "years", label: "Years", value: "years" },
        ],
      },
      {
        id: "q4",
        question: "Description of the skin condition",
        type: "text",
        required: false,
        placeholder: "e.g., red, scaly, raised, etc.",
      },
      {
        id: "q5",
        question: "Does the condition spread or change?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q6",
        question: "Have you tried any treatments?",
        type: "text",
        required: false,
        placeholder: "List any treatments or medications tried",
      },
      {
        id: "q7",
        question: "Any family history of skin conditions?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
    ],
  },

  // ENDOCRINOLOGY
  {
    id: "diabetes-assessment",
    title: "Diabetes Assessment",
    name: "Diabetes Assessment",
    description: "Comprehensive diabetes evaluation and monitoring",
    hubId: "endocrinology",
    estimatedTime: 15,
    questions: [
      {
        id: "q1",
        question: "What is your most recent HbA1c level?",
        type: "number",
        required: false,
        placeholder: "e.g., 7.0",
      },
      {
        id: "q2",
        question: "How often do you check your blood glucose?",
        type: "select",
        required: false,
        options: [
          { id: "daily", label: "Daily", value: "daily" },
          { id: "weekly", label: "Weekly", value: "weekly" },
          { id: "rarely", label: "Rarely", value: "rarely" },
          { id: "never", label: "Never", value: "never" },
        ],
      },
      {
        id: "q3",
        question: "Do you experience frequent urination or excessive thirst?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q4",
        question: "Have you had any episodes of low blood sugar?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q5",
        question: "Are you following a diabetic diet?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes, strictly", value: "strict" },
          { id: "somewhat", label: "Somewhat", value: "somewhat" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q6",
        question: "Do you exercise regularly?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes, regularly", value: "yes" },
          { id: "sometimes", label: "Sometimes", value: "sometimes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q7",
        question: "Have you noticed any vision changes?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q8",
        question: "Do you have any foot problems or numbness?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
    ],
  },
  {
    id: "thyroid-assessment",
    title: "Thyroid Function Assessment",
    name: "Thyroid Function Assessment",
    description: "Evaluation of thyroid symptoms and function",
    hubId: "endocrinology",
    estimatedTime: 12,
    questions: [
      {
        id: "q1",
        question: "Do you experience fatigue or low energy?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q2",
        question: "Have you noticed changes in your weight?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes, weight gain", value: "gain" },
          { id: "loss", label: "Yes, weight loss", value: "loss" },
          { id: "no", label: "No change", value: "no" },
        ],
      },
      {
        id: "q3",
        question: "Do you take thyroid medication?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q4",
        question: "What is your most recent TSH level?",
        type: "number",
        required: false,
        placeholder: "e.g., 2.5",
      },
      {
        id: "q5",
        question: "Do you experience hair loss or changes in hair texture?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q6",
        question: "Do you feel cold or heat intolerant?",
        type: "radio",
        required: true,
        options: [
          { id: "cold", label: "Cold intolerant", value: "cold" },
          { id: "heat", label: "Heat intolerant", value: "heat" },
          { id: "no", label: "No issues", value: "no" },
        ],
      },
      {
        id: "q7",
        question: "Have you noticed changes in your heart rate?",
        type: "radio",
        required: true,
        options: [
          { id: "fast", label: "Fast heart rate", value: "fast" },
          { id: "slow", label: "Slow heart rate", value: "slow" },
          { id: "no", label: "No change", value: "no" },
        ],
      },
      {
        id: "q8",
        question: "Do you have any family history of thyroid problems?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
    ],
  },

  // GASTROENTEROLOGY
  {
    id: "gi-symptoms",
    title: "Gastrointestinal Symptoms Assessment",
    name: "Gastrointestinal Symptoms Assessment",
    description: "Evaluation of digestive system symptoms",
    hubId: "gastroenterology",
    estimatedTime: 10,
    questions: [
      {
        id: "q1",
        question: "Do you experience abdominal pain?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q2",
        question: "Rate the severity of your symptoms (0-10)",
        type: "scale",
        required: false,
        min: 0,
        max: 10,
        scaleLabels: { min: "Mild", max: "Severe" },
      },
      {
        id: "q3",
        question: "Location of abdominal pain",
        type: "select",
        required: false,
        options: [
          { id: "upper", label: "Upper abdomen", value: "upper" },
          { id: "lower", label: "Lower abdomen", value: "lower" },
          { id: "generalized", label: "Generalized", value: "generalized" },
        ],
      },
      {
        id: "q4",
        question: "Do you experience nausea or vomiting?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q5",
        question: "Do you experience diarrhea or constipation?",
        type: "radio",
        required: true,
        options: [
          { id: "diarrhea", label: "Diarrhea", value: "diarrhea" },
          { id: "constipation", label: "Constipation", value: "constipation" },
          { id: "both", label: "Both", value: "both" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q6",
        question: "Do you experience bloating or gas?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q7",
        question: "Have you noticed any blood in your stool?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q8",
        question: "Have you noticed any changes in your appetite?",
        type: "radio",
        required: true,
        options: [
          { id: "decreased", label: "Decreased", value: "decreased" },
          { id: "increased", label: "Increased", value: "increased" },
          { id: "no", label: "No change", value: "no" },
        ],
      },
    ],
  },

  // EMERGENCY
  {
    id: "emergency-triage",
    title: "Emergency Triage Assessment",
    name: "Emergency Triage Assessment",
    description: "Rapid assessment of emergency symptoms",
    hubId: "emergency",
    estimatedTime: 8,
    questions: [
      {
        id: "q1",
        question: "What is your chief complaint?",
        type: "text",
        required: true,
        placeholder: "Describe your main concern",
      },
      {
        id: "q2",
        question: "Rate your pain level (0-10)",
        type: "scale",
        required: true,
        min: 0,
        max: 10,
        scaleLabels: { min: "No pain", max: "Severe pain" },
      },
      {
        id: "q3",
        question: "When did symptoms start?",
        type: "select",
        required: true,
        options: [
          { id: "minutes", label: "Within minutes", value: "minutes" },
          { id: "hours", label: "Within hours", value: "hours" },
          { id: "days", label: "Within days", value: "days" },
        ],
      },
      {
        id: "q4",
        question: "Are you experiencing difficulty breathing?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q5",
        question: "Are you experiencing chest pain?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q6",
        question: "Do you feel dizzy or lightheaded?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q7",
        question: "Have you experienced any loss of consciousness?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
      {
        id: "q8",
        question: "Any recent trauma or injury?",
        type: "radio",
        required: true,
        options: [
          { id: "yes", label: "Yes", value: "yes" },
          { id: "no", label: "No", value: "no" },
        ],
      },
    ],
  },
];

export function getQuestionnairesByHub(hubId: string): Questionnaire[] {
  return questionnaires.filter(q => q.hubId === hubId);
}

export function getQuestionnaireById(id: string): Questionnaire | undefined {
  return questionnaires.find(q => q.id === id);
}

export function getAllQuestionnaires(): Questionnaire[] {
  return questionnaires;
}
