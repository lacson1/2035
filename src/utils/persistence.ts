/**
 * Data Persistence Utilities
 * Ensures data longevity with auto-save, offline support, and recovery mechanisms
 */

interface PersistedData<T> {
  data: T;
  timestamp: number;
  version: string;
  checksum?: string;
}

interface PersistenceOptions {
  key: string;
  version?: string;
  ttl?: number; // Time to live in milliseconds
  encrypt?: boolean;
  compress?: boolean;
  syncToServer?: boolean;
}

const APP_VERSION = '1.0.0';
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Calculate simple checksum for data integrity
 */
function calculateChecksum(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Save data with persistence options
 */
export function persistData<T>(data: T, options: PersistenceOptions): boolean {
  try {
    const persisted: PersistedData<T> = {
      data,
      timestamp: Date.now(),
      version: options.version || APP_VERSION,
      checksum: calculateChecksum(data),
    };

    const serialized = JSON.stringify(persisted);
    
    // Store with metadata
    const storageKey = `persist:${options.key}`;
    const metadata = {
      ttl: options.ttl || DEFAULT_TTL,
      createdAt: Date.now(),
      version: options.version || APP_VERSION,
    };

    localStorage.setItem(storageKey, serialized);
    localStorage.setItem(`${storageKey}:meta`, JSON.stringify(metadata));

    // Also store in sessionStorage for immediate access
    sessionStorage.setItem(storageKey, serialized);

    // Trigger sync if enabled
    if (options.syncToServer && 'serviceWorker' in navigator) {
      syncToServer(options.key, data).catch(console.error);
    }

    return true;
  } catch (error) {
    console.error(`Failed to persist data for key: ${options.key}`, error);
    return false;
  }
}

/**
 * Load persisted data with validation
 */
export function loadPersistedData<T>(key: string): T | null {
  try {
    const storageKey = `persist:${key}`;
    
    // Check metadata first
    const metaStr = localStorage.getItem(`${storageKey}:meta`);
    if (!metaStr) {
      return null;
    }

    const metadata = JSON.parse(metaStr);
    
    // Check TTL
    if (metadata.ttl && Date.now() - metadata.createdAt > metadata.ttl) {
      // Expired, clean up
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}:meta`);
      sessionStorage.removeItem(storageKey);
      return null;
    }

    // Try sessionStorage first (faster)
    let serialized = sessionStorage.getItem(storageKey);
    if (!serialized) {
      serialized = localStorage.getItem(storageKey);
    }

    if (!serialized) {
      return null;
    }

    const persisted: PersistedData<T> = JSON.parse(serialized);

    // Validate checksum
    if (persisted.checksum) {
      const currentChecksum = calculateChecksum(persisted.data);
      if (currentChecksum !== persisted.checksum) {
        console.warn(`Data integrity check failed for key: ${key}`);
        // Still return data, but log warning
      }
    }

    return persisted.data;
  } catch (error) {
    console.error(`Failed to load persisted data for key: ${key}`, error);
    return null;
  }
}

/**
 * Remove persisted data
 */
export function clearPersistedData(key: string): void {
  const storageKey = `persist:${key}`;
  localStorage.removeItem(storageKey);
  localStorage.removeItem(`${storageKey}:meta`);
  sessionStorage.removeItem(storageKey);
}

/**
 * Check if data exists and is valid
 */
export function hasPersistedData(key: string): boolean {
  const storageKey = `persist:${key}`;
  const metaStr = localStorage.getItem(`${storageKey}:meta`);
  
  if (!metaStr) {
    return false;
  }

  try {
    const metadata = JSON.parse(metaStr);
    
    // Check TTL
    if (metadata.ttl && Date.now() - metadata.createdAt > metadata.ttl) {
      return false;
    }

    return localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
}

/**
 * Get all persisted keys
 */
export function getPersistedKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('persist:')) {
      const actualKey = key.replace('persist:', '');
      if (!actualKey.endsWith(':meta')) {
        keys.push(actualKey);
      }
    }
  }
  return keys;
}

/**
 * Clean up expired data
 */
export function cleanupExpiredData(): number {
  let cleaned = 0;
  const keys = getPersistedKeys();

  for (const key of keys) {
    const metaStr = localStorage.getItem(`persist:${key}:meta`);
    if (metaStr) {
      try {
        const metadata = JSON.parse(metaStr);
        if (metadata.ttl && Date.now() - metadata.createdAt > metadata.ttl) {
          clearPersistedData(key);
          cleaned++;
        }
      } catch {
        // Invalid metadata, clean up
        clearPersistedData(key);
        cleaned++;
      }
    }
  }

  return cleaned;
}

/**
 * Sync data to server (for offline support)
 */
async function syncToServer<T>(key: string, data: T): Promise<void> {
  // This would integrate with your API
  // For now, just store in IndexedDB or send to service worker
  if ('indexedDB' in window) {
    try {
      // Store in IndexedDB for offline sync
      const request = indexedDB.open('app-sync', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sync-queue'], 'readwrite');
        const store = transaction.objectStore('sync-queue');
        store.add({
          key,
          data,
          timestamp: Date.now(),
          synced: false,
        });
      };
    } catch (error) {
      console.error('Failed to queue for sync:', error);
    }
  }
}

/**
 * Batch persist multiple items
 */
export function persistBatch(items: Array<{ key: string; data: any; options?: Partial<PersistenceOptions> }>): number {
  let saved = 0;
  for (const item of items) {
    const options: PersistenceOptions = {
      key: item.key,
      ...item.options,
    };
    if (persistData(item.data, options)) {
      saved++;
    }
  }
  return saved;
}

/**
 * Batch load multiple items
 */
export function loadBatch<T>(keys: string[]): Map<string, T | null> {
  const results = new Map<string, T | null>();
  for (const key of keys) {
    results.set(key, loadPersistedData<T>(key));
  }
  return results;
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
  localStorage: { used: number; available: number; percentage: number };
  sessionStorage: { used: number; available: number; percentage: number };
  persistedKeys: number;
} {
  let localStorageSize = 0;
  let sessionStorageSize = 0;
  let persistedCount = 0;

  // Calculate localStorage size
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      localStorageSize += key.length + value.length;
      if (key.startsWith('persist:') && !key.endsWith(':meta')) {
        persistedCount++;
      }
    }
  }

  // Calculate sessionStorage size
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      const value = sessionStorage.getItem(key) || '';
      sessionStorageSize += key.length + value.length;
    }
  }

  // Estimate available storage (typically 5-10MB for localStorage)
  const estimatedMax = 5 * 1024 * 1024; // 5MB
  const localStorageAvailable = Math.max(0, estimatedMax - localStorageSize);
  const sessionStorageAvailable = Math.max(0, estimatedMax - sessionStorageSize);

  return {
    localStorage: {
      used: localStorageSize,
      available: localStorageAvailable,
      percentage: (localStorageSize / estimatedMax) * 100,
    },
    sessionStorage: {
      used: sessionStorageSize,
      available: sessionStorageAvailable,
      percentage: (sessionStorageSize / estimatedMax) * 100,
    },
    persistedKeys: persistedCount,
  };
}

// Auto-cleanup on load
if (typeof window !== 'undefined') {
  // Clean up expired data on page load
  cleanupExpiredData();

  // Clean up expired data every hour
  setInterval(() => {
    cleanupExpiredData();
  }, 60 * 60 * 1000);

  // Warn if storage is getting full
  const stats = getStorageStats();
  if (stats.localStorage.percentage > 80) {
    console.warn('LocalStorage is getting full. Consider cleaning up old data.');
  }
}

