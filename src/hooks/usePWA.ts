import { useState, useEffect } from 'react';
import { pushNotificationService, NotificationPayload } from '../services/pushNotificationService';

export interface PWAInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export interface PWABeforeInstallPromptEvent extends PWAInstallPromptEvent {
  platforms: string[];
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<PWABeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }

      // Also check for iOS Safari
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWABeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }

    return false;
  };

  return {
    isInstallable,
    isInstalled,
    install
  };
}

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger sync when coming back online
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'TRIGGER_SYNC'
          });
        }
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    wasOffline
  };
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const supported = 'serviceWorker' in navigator && 'PushManager' in window;
        setIsSupported(supported);

        if (supported) {
          await pushNotificationService.initialize();
          setIsSubscribed(pushNotificationService.isSubscribed());
          setPermission(pushNotificationService.getPermissionStatus());
        }
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  const subscribe = async () => {
    try {
      const subscription = await pushNotificationService.subscribe();
      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        return true;
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      setPermission('denied');
    }
    return false;
  };

  const unsubscribe = async () => {
    try {
      await pushNotificationService.unsubscribe();
      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
    return false;
  };

  const sendTestNotification = async () => {
    try {
      await pushNotificationService.sendTestNotification();
      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
    return false;
  };

  const sendNotification = async (payload: NotificationPayload) => {
    try {
      await pushNotificationService.sendNotification(payload);
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
    return false;
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    isInitializing,
    subscribe,
    unsubscribe,
    sendTestNotification,
    sendNotification
  };
}

export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setIsRegistered(true);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              setIsUpdating(true);

              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  setIsUpdating(false);
                }
              });
            }
          });

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'SYNC_SUCCESS') {
              console.log('Background sync completed');
            }
          });
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    }
  }, []);

  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          setUpdateAvailable(false);
          window.location.reload();
        }
      });
    }
  };

  return {
    isRegistered,
    isUpdating,
    updateAvailable,
    updateServiceWorker
  };
}

export function useNetworkStatus() {
  const [connection, setConnection] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null>(null);

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnection({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      });

      const handleChange = () => {
        setConnection({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
      };

      connection.addEventListener('change', handleChange);
      return () => connection.removeEventListener('change', handleChange);
    }
  }, []);

  return connection;
}
