/**
 * Questionnaires - Reference Data
 * 
 * In production, these should be loaded from the backend API or database.
 * For now, kept as minimal reference data.
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
}

// Minimal questionnaires - should be loaded from API in production
const questionnaires: Questionnaire[] = [];

export function getQuestionnairesByHub(hubId: string): Questionnaire[] {
  return questionnaires.filter(q => q.hubId === hubId);
}

export function getQuestionnaireById(id: string): Questionnaire | undefined {
  return questionnaires.find(q => q.id === id);
}

