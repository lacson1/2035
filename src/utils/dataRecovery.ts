/**
 * Data Recovery Utilities
 * Helps recover lost data and prevent data loss
 */

import { persistData, loadPersistedData, getPersistedKeys } from './persistence';

interface RecoverySnapshot {
  timestamp: number;
  data: any;
  key: string;
}

const SNAPSHOT_PREFIX = 'recovery:';
const MAX_SNAPSHOTS = 10; // Keep last 10 snapshots

/**
 * Create a recovery snapshot
 */
export function createSnapshot(key: string, data: any): void {
  try {
    const snapshot: RecoverySnapshot = {
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      key,
    };

    const snapshotKey = `${SNAPSHOT_PREFIX}${key}:${snapshot.timestamp}`;
    localStorage.setItem(snapshotKey, JSON.stringify(snapshot));

    // Clean up old snapshots
    cleanupOldSnapshots(key);
  } catch (error) {
    console.error('Failed to create snapshot:', error);
  }
}

/**
 * Get latest snapshot for a key
 */
export function getLatestSnapshot(key: string): RecoverySnapshot | null {
  try {
    const snapshots: RecoverySnapshot[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey?.startsWith(`${SNAPSHOT_PREFIX}${key}:`)) {
        const snapshot = JSON.parse(localStorage.getItem(storageKey) || '{}');
        snapshots.push(snapshot);
      }
    }

    if (snapshots.length === 0) {
      return null;
    }

    // Sort by timestamp (newest first)
    snapshots.sort((a, b) => b.timestamp - a.timestamp);
    return snapshots[0];
  } catch (error) {
    console.error('Failed to get snapshot:', error);
    return null;
  }
}

/**
 * Recover data from snapshot
 */
export function recoverFromSnapshot(key: string): any | null {
  const snapshot = getLatestSnapshot(key);
  if (snapshot) {
    // Restore to main storage
    persistData(snapshot.data, { key });
    return snapshot.data;
  }
  return null;
}

/**
 * Clean up old snapshots
 */
function cleanupOldSnapshots(key: string): void {
  try {
    const snapshots: { key: string; timestamp: number }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey?.startsWith(`${SNAPSHOT_PREFIX}${key}:`)) {
        const snapshot = JSON.parse(localStorage.getItem(storageKey) || '{}');
        snapshots.push({
          key: storageKey,
          timestamp: snapshot.timestamp || 0,
        });
      }
    }

    // Sort by timestamp (oldest first)
    snapshots.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest snapshots if we exceed max
    if (snapshots.length > MAX_SNAPSHOTS) {
      const toRemove = snapshots.slice(0, snapshots.length - MAX_SNAPSHOTS);
      for (const item of toRemove) {
        localStorage.removeItem(item.key);
      }
    }
  } catch (error) {
    console.error('Failed to cleanup snapshots:', error);
  }
}

/**
 * Check for unsaved changes
 */
export function hasUnsavedChanges(key: string, currentData: any): boolean {
  const saved = loadPersistedData(key);
  if (!saved) {
    return true; // No saved data, so there are unsaved changes
  }

  return JSON.stringify(saved) !== JSON.stringify(currentData);
}

/**
 * Warn before leaving page with unsaved changes
 */
export function setupBeforeUnloadWarning(key: string, currentData: any): () => void {
  const handler = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges(key, currentData)) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    }
  };

  window.addEventListener('beforeunload', handler);

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handler);
  };
}

/**
 * Export data for backup
 */
export function exportData(keys?: string[]): string {
  const dataToExport: Record<string, any> = {};
  const keysToExport = keys || getPersistedKeys();

  for (const key of keysToExport) {
    const data = loadPersistedData(key);
    if (data) {
      dataToExport[key] = data;
    }
  }

  return JSON.stringify({
    version: '1.0.0',
    timestamp: Date.now(),
    data: dataToExport,
  }, null, 2);
}

/**
 * Import data from backup
 */
export function importData(jsonString: string): { imported: number; failed: number } {
  let imported = 0;
  let failed = 0;

  try {
    const backup = JSON.parse(jsonString);
    if (!backup.data || typeof backup.data !== 'object') {
      throw new Error('Invalid backup format');
    }

    for (const [key, data] of Object.entries(backup.data)) {
      try {
        persistData(data, { key });
        imported++;
      } catch (error) {
        console.error(`Failed to import key: ${key}`, error);
        failed++;
      }
    }
  } catch (error) {
    console.error('Failed to import backup:', error);
    throw error;
  }

  return { imported, failed };
}

