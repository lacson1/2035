import React, { useState } from 'react';
import { usePWAInstall, useOfflineStatus, usePushNotifications, useServiceWorker, useNetworkStatus } from '../hooks/usePWA';
import { Bell, Download, Wifi, WifiOff, RefreshCw, TestTube, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PWASettingsProps {
  className?: string;
}

export const PWASettings: React.FC<PWASettingsProps> = ({ className = '' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { isOnline, wasOffline } = useOfflineStatus();
  const { isSupported: pushSupported, isSubscribed, permission, isInitializing, subscribe, unsubscribe, sendTestNotification } = usePushNotifications();
  const { isRegistered, isUpdating, updateAvailable, updateServiceWorker } = useServiceWorker();
  const networkStatus = useNetworkStatus();

  const [installing, setInstalling] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  const handlePushSubscribe = async () => {
    setSubscribing(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } finally {
      setSubscribing(false);
    }
  };

  const handleTestNotification = async () => {
    setSendingTest(true);
    try {
      await sendTestNotification();
    } finally {
      setSendingTest(false);
    }
  };

  const StatusIcon = ({ status }: { status: 'success' | 'error' | 'warning' | 'info' }) => {
    const iconClass = "w-4 h-4";
    switch (status) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <AlertCircle className={`${iconClass} text-yellow-500`} />;
      default:
        return <div className={`${iconClass} rounded-full bg-blue-500`} />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">PWA Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Network Status */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            {isOnline ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
            <h3 className="font-medium text-gray-900">Network Status</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Online Status:</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={isOnline ? 'success' : 'error'} />
                <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {wasOffline && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Previously Offline:</span>
                <span className="text-yellow-600">Reconnected</span>
              </div>
            )}

            {networkStatus && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Connection Type:</span>
                  <span className="text-gray-900">{networkStatus.effectiveType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Downlink:</span>
                  <span className="text-gray-900">{networkStatus.downlink} Mbps</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">RTT:</span>
                  <span className="text-gray-900">{networkStatus.rtt}ms</span>
                </div>
                {networkStatus.saveData && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Data Saver:</span>
                    <span className="text-blue-600">Enabled</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* PWA Installation */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-gray-900">App Installation</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Install Status:</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={isInstalled ? 'success' : isInstallable ? 'warning' : 'info'} />
                <span className={isInstalled ? 'text-green-600' : isInstallable ? 'text-yellow-600' : 'text-gray-600'}>
                  {isInstalled ? 'Installed' : isInstallable ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>

            {isInstallable && !isInstalled && (
              <button
                onClick={handleInstall}
                disabled={installing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {installing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Install App
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium text-gray-900">Push Notifications</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Browser Support:</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={pushSupported ? 'success' : 'error'} />
                <span className={pushSupported ? 'text-green-600' : 'text-red-600'}>
                  {pushSupported ? 'Supported' : 'Not Supported'}
                </span>
              </div>
            </div>

            {pushSupported && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Permission:</span>
                  <span className={`capitalize ${
                    permission === 'granted' ? 'text-green-600' :
                    permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {permission}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subscription:</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={isInitializing ? 'warning' : isSubscribed ? 'success' : 'info'} />
                    <span className={
                      isInitializing ? 'text-yellow-600' :
                      isSubscribed ? 'text-green-600' : 'text-gray-600'
                    }>
                      {isInitializing ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                    </span>
                  </div>
                </div>

                {!isInitializing && (
                  <div className="flex gap-2">
                    <button
                      onClick={handlePushSubscribe}
                      disabled={subscribing || permission === 'denied'}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {subscribing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          {isSubscribed ? 'Unsubscribing...' : 'Subscribing...'}
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleTestNotification}
                      disabled={sendingTest || !isSubscribed}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {sendingTest ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4" />
                          Test Notification
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Service Worker */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-5 h-5 text-indigo-500" />
            <h3 className="font-medium text-gray-900">Service Worker</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Registration:</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={isRegistered ? 'success' : 'error'} />
                <span className={isRegistered ? 'text-green-600' : 'text-red-600'}>
                  {isRegistered ? 'Registered' : 'Not Registered'}
                </span>
              </div>
            </div>

            {isUpdating && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-yellow-600 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating...
                </span>
              </div>
            )}

            {updateAvailable && (
              <button
                onClick={updateServiceWorker}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Update Available - Refresh
              </button>
            )}
          </div>
        </div>

        {/* Offline Features Info */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Offline Features</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Cached patient data remains accessible</li>
            <li>• Previously loaded forms are available</li>
            <li>• Appointment history is stored locally</li>
            <li>• Failed requests sync when reconnected</li>
            <li>• Images and fonts are cached for performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
