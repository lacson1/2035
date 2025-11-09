/**
 * Auto-save Hook
 * Automatically saves form data to prevent data loss
 */

import { useEffect, useRef, useCallback } from 'react';
import { persistData, loadPersistedData, clearPersistedData } from '../utils/persistence';
import { debounce } from '../utils/debounce';

interface UseAutoSaveOptions<T> {
  key: string;
  data: T;
  enabled?: boolean;
  debounceMs?: number;
  onSave?: (data: T) => void;
  onLoad?: (data: T) => void;
  ttl?: number;
}

/**
 * Auto-save hook that persists form data automatically
 */
export function useAutoSave<T>(options: UseAutoSaveOptions<T>) {
  const {
    key,
    data,
    enabled = true,
    debounceMs = 1000,
    onSave,
    onLoad,
    ttl,
  } = options;

  const isInitialLoad = useRef(true);
  const lastSavedRef = useRef<T | null>(null);

  // Load saved data on mount
  useEffect(() => {
    if (!enabled || !isInitialLoad.current) {
      return;
    }

    const saved = loadPersistedData<T>(key);
    if (saved && onLoad) {
      onLoad(saved);
    }
    isInitialLoad.current = false;
  }, [key, enabled, onLoad]);

  // Auto-save function
  const saveData = useCallback(
    debounce((dataToSave: T) => {
      if (!enabled) {
        return;
      }

      // Only save if data has changed
      if (JSON.stringify(dataToSave) === JSON.stringify(lastSavedRef.current)) {
        return;
      }

      const success = persistData(dataToSave, {
        key,
        ttl,
        syncToServer: false, // Auto-save is local only
      });

      if (success) {
        lastSavedRef.current = dataToSave;
        if (onSave) {
          onSave(dataToSave);
        }
      }
    }, debounceMs),
    [key, enabled, debounceMs, onSave, ttl]
  );

  // Save whenever data changes
  useEffect(() => {
    if (!enabled || isInitialLoad.current) {
      return;
    }

    saveData(data);
  }, [data, enabled, saveData]);

  // Manual save function
  const manualSave = useCallback(() => {
    saveData(data);
    saveData.flush?.(); // Flush debounced function if available
  }, [data, saveData]);

  // Clear saved data
  const clearSaved = useCallback(() => {
    clearPersistedData(key);
    lastSavedRef.current = null;
  }, [key]);

  return {
    manualSave,
    clearSaved,
    hasSavedData: lastSavedRef.current !== null,
  };
}

