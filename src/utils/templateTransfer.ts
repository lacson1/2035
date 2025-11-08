/**
 * Utility functions for transferring template data between components
 * Uses sessionStorage to temporarily store template data when navigating
 */

export interface PendingTemplateData {
  content: string;
  title: string;
  specialty?: string;
  timestamp: number;
}

const TEMPLATE_STORAGE_KEY = 'pendingConsultationTemplate';

/**
 * Store template data for transfer to Consultation component
 */
export function storeTemplateForConsultation(data: {
  content: string;
  title: string;
  specialty?: string;
}): void {
  const templateData: PendingTemplateData = {
    ...data,
    timestamp: Date.now(),
  };
  
  try {
    sessionStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templateData));
  } catch (error) {
    console.warn('Failed to store template data:', error);
  }
}

/**
 * Retrieve and clear pending template data
 */
export function getPendingTemplate(): PendingTemplateData | null {
  try {
    const stored = sessionStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (!stored) return null;
    
    const data: PendingTemplateData = JSON.parse(stored);
    
    // Clear after retrieval
    sessionStorage.removeItem(TEMPLATE_STORAGE_KEY);
    
    // Check if data is still valid (not older than 5 minutes)
    const age = Date.now() - data.timestamp;
    if (age > 5 * 60 * 1000) {
      return null; // Data expired
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to retrieve template data:', error);
    sessionStorage.removeItem(TEMPLATE_STORAGE_KEY);
    return null;
  }
}

/**
 * Check if there's a pending template without retrieving it
 */
export function hasPendingTemplate(): boolean {
  try {
    return sessionStorage.getItem(TEMPLATE_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Clear any pending template data
 */
export function clearPendingTemplate(): void {
  try {
    sessionStorage.removeItem(TEMPLATE_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear template data:', error);
  }
}

