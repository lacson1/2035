import { useState, useEffect } from "react";
import { AlertCircle, X, Settings, RefreshCw } from "lucide-react";

interface PopupBlockedNotificationProps {
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function PopupBlockedNotification({ 
  onRetry, 
  onDismiss 
}: PopupBlockedNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-5">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
              Pop-ups Blocked
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
              To enable printing and other features, please allow pop-ups for this site.
            </p>
            <div className="space-y-2 text-xs text-yellow-700 dark:text-yellow-300 mb-3">
              <div className="flex items-start gap-2">
                <span className="font-semibold">1.</span>
                <span>Click the pop-up blocker icon in your browser's address bar</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">2.</span>
                <span>Select "Always allow pop-ups from this site"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">3.</span>
                <span>Or go to your browser settings and add this site to the allowed list</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onRetry && (
                <button
                  onClick={() => {
                    setIsVisible(false);
                    if (onRetry) onRetry();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-xs font-medium transition-colors"
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
              )}
              <button
                onClick={() => {
                  setIsVisible(false);
                  if (onDismiss) onDismiss();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/40 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 text-yellow-900 dark:text-yellow-100 rounded-md text-xs font-medium transition-colors"
              >
                <Settings size={14} />
                Open Settings
              </button>
              <button
                onClick={() => {
                  setIsVisible(false);
                  if (onDismiss) onDismiss();
                }}
                className="ml-auto p-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

