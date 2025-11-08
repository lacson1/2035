import { useEffect } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Toast as ToastType } from "../context/ToastContext";

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const {
    id,
    message,
    type = "info",
    duration = 5000,
    action,
  } = toast;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const icons = {
    success: <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />,
    error: <AlertCircle size={20} className="text-red-600 dark:text-red-400" />,
    warning: <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />,
    info: <Info size={20} className="text-blue-600 dark:text-blue-400" />,
    loading: <Loader2 size={20} className="text-gray-600 dark:text-gray-400 animate-spin" />,
  };

  const styles = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    loading: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800",
  };

  const toastContent = (
    <>
      <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50">
        {icons[type]}
      </div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {toast.title}
          </h4>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {message}
        </p>

        {action && (
          <div className="mt-3">
            <button
              onClick={() => {
                action.onClick();
                if (action.dismissOnClick) {
                  onDismiss(id);
                }
              }}
              className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={16} className="text-gray-500 dark:text-gray-400" />
      </button>

      {/* Progress bar for auto-dismiss - Enhanced */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-xl overflow-hidden">
          <div
            className={`h-full animate-shrink ${type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' :
                type === 'warning' ? 'bg-amber-500' :
                  type === 'info' ? 'bg-blue-500' :
                    'bg-gray-400 dark:bg-gray-500'
              }`}
          />
        </div>
      )}
    </>
  );

  // Use separate return statements to avoid expressions in ARIA attributes
  if (type === "error") {
    return (
      <div
        role="alert"
        aria-live="assertive"
        data-duration={duration > 0 ? duration : undefined}
        style={duration > 0 ? { "--toast-duration": `${duration}ms` } as React.CSSProperties : undefined}
        className={`
          relative flex items-start gap-3 p-4 rounded-xl border shadow-xl
          animate-slide-up max-w-md backdrop-blur-sm
          ${styles[type]}
          hover:shadow-2xl transition-shadow duration-300
        `}
      >
        {toastContent}
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      data-duration={duration > 0 ? duration : undefined}
      style={duration > 0 ? { "--toast-duration": `${duration}ms` } as React.CSSProperties : undefined}
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border shadow-xl
        animate-slide-up max-w-md backdrop-blur-sm
        ${styles[type]}
        hover:shadow-2xl transition-shadow duration-300
      `}
    >
      {toastContent}
    </div>
  );
}

