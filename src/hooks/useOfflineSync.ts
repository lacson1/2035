/**
 * Offline Sync Hook
 * Handles data synchronization when connection is restored
 */

import { useState, useEffect, useCallback } from 'react';
import { getPersistedKeys, loadPersistedData, clearPersistedData } from '../utils/persistence';

interface SyncItem {
  key: string;
  data: any;
  timestamp: number;
}

interface UseOfflineSyncOptions {
  onSync?: (items: SyncItem[]) => Promise<void>;
  syncInterval?: number;
}

/**
 * Hook for managing offline data synchronization
 */
export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const { onSync, syncInterval = 30000 } = options;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingItems, setPendingItems] = useState<SyncItem[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Collect pending sync items
  const collectPendingItems = useCallback((): SyncItem[] => {
    const keys = getPersistedKeys();
    const items: SyncItem[] = [];

    for (const key of keys) {
      // Only sync items that need server sync
      if (key.startsWith('sync:')) {
        const data = loadPersistedData(key);
        if (data) {
          const metaStr = localStorage.getItem(`persist:${key}:meta`);
          if (metaStr) {
            const meta = JSON.parse(metaStr);
            items.push({
              key: key.replace('sync:', ''),
              data,
              timestamp: meta.createdAt,
            });
          }
        }
      }
    }

    return items;
  }, []);

  // Sync function
  const sync = useCallback(async () => {
    if (!isOnline || isSyncing || !onSync) {
      return;
    }

    setIsSyncing(true);
    try {
      const items = collectPendingItems();
      setPendingItems(items);

      if (items.length > 0) {
        await onSync(items);

        // Clear synced items
        for (const item of items) {
          clearPersistedData(`sync:${item.key}`);
        }

        setLastSyncTime(Date.now());
      }
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, onSync, collectPendingItems]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && !isSyncing) {
      // Small delay to ensure connection is stable
      const timeout = setTimeout(() => {
        sync().catch(console.error);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isOnline, isSyncing, sync]);

  // Periodic sync
  useEffect(() => {
    if (!isOnline || !onSync) {
      return;
    }

    const interval = setInterval(() => {
      sync().catch(console.error);
    }, syncInterval);

    return () => clearInterval(interval);
  }, [isOnline, onSync, syncInterval, sync]);

  // Update pending items count
  useEffect(() => {
    const items = collectPendingItems();
    setPendingItems(items);
  }, [collectPendingItems]);

  return {
    isOnline,
    isSyncing,
    pendingItems,
    pendingCount: pendingItems.length,
    lastSyncTime,
    sync,
    retrySync: sync,
  };
}

