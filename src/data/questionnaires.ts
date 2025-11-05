/**
 * Questionnaires - Reference Data
 * 
 * In production, these should be loaded from the backend API or database.
 * For now, kept as minimal reference data.
 */

export interface Question {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
}

export interface Questionnaire {
  id: string;
  name: string;
  hubId: string;
  questions: Question[];
}

// Minimal questionnaires - should be loaded from API in production
const questionnaires: Questionnaire[] = [];

export function getQuestionnairesByHub(hubId: string): Questionnaire[] {
  return questionnaires.filter(q => q.hubId === hubId);
}

export function getQuestionnaireById(id: string): Questionnaire | undefined {
  return questionnaires.find(q => q.id === id);
}

