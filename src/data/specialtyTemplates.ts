/**
 * Specialty Templates - Reference Data
 * 
 * In production, these should be loaded from the backend API or database.
 * For now, kept as minimal reference data.
 */

export interface SpecialtyTemplate {
  id: string;
  name: string;
  specialty: string;
  fields: any[];
}

// Minimal templates - should be loaded from API in production
const specialtyTemplates: SpecialtyTemplate[] = [];

export function getAllSpecialties(): string[] {
  return Array.from(new Set(specialtyTemplates.map(t => t.specialty)));
}

export function getSpecialtyTemplate(specialty: string): SpecialtyTemplate | undefined {
  return specialtyTemplates.find(t => t.specialty === specialty);
}

