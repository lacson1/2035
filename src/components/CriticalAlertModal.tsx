import { AlertTriangle, X, CheckCircle, ExternalLink } from "lucide-react";
import { Alert } from "../utils/alertSystem";
import { useToast } from "../context/ToastContext";

interface CriticalAlertModalProps {
  alert: Alert;
  onAcknowledge: (alertId: string) => void;
  onDismiss: () => void;
  onViewDetails?: () => void;
}

export default function CriticalAlertModal({
  alert,
  onAcknowledge,
  onDismiss,
  onViewDetails,
}: CriticalAlertModalProps) {
  const toast = useToast();

  const handleAcknowledge = () => {
    onAcknowledge(alert.id);
    toast.success("Alert acknowledged");
    onDismiss();
  };

  const severityStyles = {
    critical: "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100",
    high: "bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-900 dark:text-orange-100",
    medium: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-900 dark:text-yellow-100",
    low: "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-900 dark:text-blue-100",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`
          bg-white dark:bg-gray-800 rounded-lg shadow-2xl
          border-2 ${severityStyles[alert.severity]}
          max-w-md w-full
          animate-in fade-in zoom-in duration-200
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-current/20">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-2 rounded-full bg-current/20">
              <AlertTriangle
                size={24}
                className={`${alert.severity === "critical" ? "animate-pulse" : ""}`}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{alert.title}</h3>
              <p className="text-sm opacity-90">{alert.message}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-current/10 transition-colors"
            title="Close (cannot dismiss critical alerts)"
            disabled={alert.severity === "critical"}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {alert.relatedData && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-semibold mb-2">Related Information:</div>
              {alert.relatedData.medications && (
                <div className="text-sm">
                  <div className="font-medium mb-1">Medications:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {alert.relatedData.medications.map((med: string, idx: number) => (
                      <li key={idx}>{med}</li>
                    ))}
                  </ul>
                </div>
              )}
              {alert.relatedData.lab && (
                <div className="text-sm">
                  <div className="font-medium mb-1">Lab Result:</div>
                  <div>
                    {alert.relatedData.lab.testName}: {alert.relatedData.lab.value}{" "}
                    {alert.relatedData.lab.unit}
                  </div>
                </div>
              )}
            </div>
          )}

          {alert.actionRequired && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
              <div className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                Action Required
              </div>
              <div className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                This alert requires your attention before proceeding.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-current/20 gap-3">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-current/30 hover:bg-current/10 transition-colors"
            >
              <ExternalLink size={16} />
              View Details
            </button>
          )}
          <div className="flex items-center gap-3 ml-auto">
            {alert.severity !== "critical" && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Dismiss
              </button>
            )}
            <button
              onClick={handleAcknowledge}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                bg-current text-white hover:opacity-90 transition-opacity
              `}
            >
              <CheckCircle size={16} />
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

