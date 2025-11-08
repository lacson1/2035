import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import Toast from "../components/Toast";

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "warning" | "info" | "loading";
  duration?: number; // 0 = no auto-dismiss
  title?: string;
  action?: {
    label: string;
    onClick: () => void;
    dismissOnClick?: boolean;
  };
}

interface ToastContextType {
  toast: (toast: Omit<Toast, "id">) => void;
  success: (message: string, options?: Partial<Toast>) => void;
  error: (message: string, options?: Partial<Toast>) => void;
  warning: (message: string, options?: Partial<Toast>) => void;
  info: (message: string, options?: Partial<Toast>) => void;
  loading: (message: string, options?: Partial<Toast>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((newToast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...newToast, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (message: string, options?: Partial<Toast>) => {
      addToast({ message, type: "success", duration: 3000, ...options });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: Partial<Toast>) => {
      addToast({ message, type: "error", duration: 5000, ...options });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: Partial<Toast>) => {
      addToast({ message, type: "warning", duration: 4000, ...options });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: Partial<Toast>) => {
      addToast({ message, type: "info", duration: 4000, ...options });
    },
    [addToast]
  );

  const loading = useCallback(
    (message: string, options?: Partial<Toast>) => {
      addToast({ message, type: "loading", duration: 0, ...options });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success,
        error,
        warning,
        info,
        loading,
        dismiss,
        dismissAll,
      }}
    >
      {children}
      
      {/* Toast Container */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
            aria-live="polite"
            aria-atomic="true"
          >
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <Toast toast={toast} onDismiss={dismiss} />
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

