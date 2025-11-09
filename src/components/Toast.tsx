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
    success: <CheckCircle2 size={16} className="text-green-500 dark:text-green-400" />,
    error: <AlertCircle size={16} className="text-red-500 dark:text-red-400" />,
    warning: <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400" />,
    info: <Info size={16} className="text-blue-500 dark:text-blue-400" />,
    loading: <Loader2 size={16} className="text-gray-500 dark:text-gray-400 animate-spin" />,
  };

  const styles = {
    success: "bg-white/90 dark:bg-slate-800/90 border-slate-200/50 dark:border-slate-700/50",
    error: "bg-white/90 dark:bg-slate-800/90 border-red-200/50 dark:border-red-800/50",
    warning: "bg-white/90 dark:bg-slate-800/90 border-amber-200/50 dark:border-amber-800/50",
    info: "bg-white/90 dark:bg-slate-800/90 border-blue-200/50 dark:border-blue-800/50",
    loading: "bg-white/90 dark:bg-slate-800/90 border-slate-200/50 dark:border-slate-700/50",
  };

  const toastContent = (
    <>
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
            {toast.title}
          </h4>
        )}
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {message}
        </p>

        {action && (
          <div className="mt-2">
            <button
              onClick={() => {
                action.onClick();
                if (action.dismissOnClick) {
                  onDismiss(id);
                }
              }}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 p-1 rounded hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} className="text-slate-400 dark:text-slate-500" />
      </button>

      {/* Progress bar for auto-dismiss - Subtle */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-200/30 dark:bg-slate-700/30 rounded-b-xl overflow-hidden">
          <div
            className={`h-full animate-shrink ${type === 'success' ? 'bg-green-400/60' :
              type === 'error' ? 'bg-red-400/60' :
                type === 'warning' ? 'bg-amber-400/60' :
                  type === 'info' ? 'bg-blue-400/60' :
                    'bg-slate-400/60'
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
          relative flex items-start gap-2.5 p-3 rounded-lg border shadow-sm
          animate-slide-up max-w-sm backdrop-blur-md
          ${styles[type]}
          hover:shadow-md transition-all duration-200
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
        relative flex items-start gap-2.5 p-3 rounded-lg border shadow-sm
        animate-slide-up max-w-sm backdrop-blur-md
        ${styles[type]}
        hover:shadow-md transition-all duration-200
      `}
    >
      {toastContent}
    </div>
  );
}

