/**
 * Patient data utility functions
 * Shared helpers for common patient data operations
 */

import { Patient, Appointment, Medication } from '../types';

/**
 * Get active medications from a patient
 */
export function getActiveMedications(patient: Patient): Medication[] {
  return patient.medications.filter((med) => med.status === "Active");
}

/**
 * Get count of active medications
 */
export function getActiveMedicationsCount(patient: Patient): number {
  return getActiveMedications(patient).length;
}

/**
 * Get upcoming (scheduled and future) appointments
 */
export function getUpcomingAppointments(patient: Patient): Appointment[] {
  if (!patient.appointments) return [];
  return patient.appointments.filter(
    (apt) => apt.status === "scheduled" && new Date(apt.date) >= new Date()
  );
}

/**
 * Get count of upcoming appointments
 */
export function getUpcomingAppointmentsCount(patient: Patient): number {
  return getUpcomingAppointments(patient).length;
}

/**
 * Sort items by date (newest first)
 */
export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Sort items by date (oldest first)
 */
export function sortByDateAsc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

