import { useEffect, useRef } from "react";
import { logger } from "../utils/logger";

/**
 * Hook to auto-save form drafts to localStorage
 * Restores draft on mount and saves on change
 */
export function useFormDraft<T>(
  formKey: string,
  formData: T,
  enabled: boolean = true
) {
  const isRestoringRef = useRef(false);
  const lastSavedRef = useRef<string>("");

  // Note: Restoration should be handled by component calling getDraft()

  // Auto-save draft on change (debounced)
  useEffect(() => {
    if (!enabled || isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }

    const currentData = JSON.stringify(formData);
    if (currentData === lastSavedRef.current) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`form_draft_${formKey}`, JSON.stringify(formData));
        lastSavedRef.current = currentData;
      } catch (error) {
        logger.warn('Failed to save form draft:', error);
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timeoutId);
  }, [formData, formKey, enabled]);

  // Clear draft function
  const clearDraft = () => {
    try {
      localStorage.removeItem(`form_draft_${formKey}`);
      lastSavedRef.current = "";
    } catch (error) {
      logger.warn('Failed to clear form draft:', error);
    }
  };

  // Get draft function
  const getDraft = (): T | null => {
    try {
      const saved = localStorage.getItem(`form_draft_${formKey}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      logger.warn('Failed to get form draft:', error);
    }
    return null;
  };

  return { clearDraft, getDraft };
}

