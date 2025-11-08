import { AlertTriangle, X, CheckCircle } from "lucide-react";
import { Alert, AlertSeverity } from "../utils/alertSystem";

interface AlertBadgeProps {
  alert: Alert;
  onAcknowledge?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  size?: "sm" | "md" | "lg";
  showMessage?: boolean;
}

export default function AlertBadge({
  alert,
  onAcknowledge,
  onDismiss,
  size = "md",
  showMessage = false,
}: AlertBadgeProps) {
  const severityColors: Record<AlertSeverity, string> = {
    critical: "bg-red-500 text-white border-red-600",
    high: "bg-orange-500 text-white border-orange-600",
    medium: "bg-yellow-500 text-yellow-900 border-yellow-600",
    low: "bg-blue-500 text-white border-blue-600",
  };

  const severityIcons: Record<AlertSeverity, typeof AlertTriangle> = {
    critical: AlertTriangle,
    high: AlertTriangle,
    medium: AlertTriangle,
    low: AlertTriangle,
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const Icon = severityIcons[alert.severity];

  if (alert.acknowledged) {
    return (
      <div
        className={`
          inline-flex items-center gap-1.5 rounded-lg border
          bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400
          border-gray-300 dark:border-gray-600
          ${sizeClasses[size]}
        `}
      >
        <CheckCircle size={size === "sm" ? 12 : size === "md" ? 14 : 16} />
        <span className="font-medium">{alert.title}</span>
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-lg border
        ${severityColors[alert.severity]}
        ${sizeClasses[size]}
        ${alert.actionRequired ? "ring-2 ring-offset-2 ring-red-300 dark:ring-red-700" : ""}
        transition-all duration-200
      `}
    >
      <Icon
        size={size === "sm" ? 12 : size === "md" ? 14 : 16}
        className={alert.severity === "critical" ? "animate-pulse" : ""}
      />
      <div className="flex-1">
        <div className="font-semibold">{alert.title}</div>
        {showMessage && (
          <div className="text-xs opacity-90 mt-0.5">{alert.message}</div>
        )}
      </div>
      {onAcknowledge && !alert.acknowledged && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAcknowledge(alert.id);
          }}
          className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
          title="Acknowledge alert"
        >
          <CheckCircle size={14} />
        </button>
      )}
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(alert.id);
          }}
          className="ml-1 p-1 rounded hover:bg-white/20 transition-colors"
          title="Dismiss alert"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

interface AlertBadgeListProps {
  alerts: Alert[];
  maxDisplay?: number;
  onAcknowledge?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  size?: "sm" | "md" | "lg";
}

export function AlertBadgeList({
  alerts,
  maxDisplay = 3,
  onAcknowledge,
  onDismiss,
  size = "sm",
}: AlertBadgeListProps) {
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter((a) => a.severity === "critical");
  const highAlerts = unacknowledgedAlerts.filter((a) => a.severity === "high");
  const otherAlerts = unacknowledgedAlerts.filter(
    (a) => a.severity !== "critical" && a.severity !== "high"
  );

  const displayAlerts = [
    ...criticalAlerts.slice(0, maxDisplay),
    ...highAlerts.slice(0, maxDisplay - criticalAlerts.length),
    ...otherAlerts.slice(0, maxDisplay - criticalAlerts.length - highAlerts.length),
  ].slice(0, maxDisplay);

  if (displayAlerts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displayAlerts.map((alert) => (
        <AlertBadge
          key={alert.id}
          alert={alert}
          onAcknowledge={onAcknowledge}
          onDismiss={onDismiss}
          size={size}
        />
      ))}
      {unacknowledgedAlerts.length > maxDisplay && (
        <div
          className={`
            inline-flex items-center justify-center rounded-lg border
            bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400
            border-gray-300 dark:border-gray-600
            ${size === "sm" ? "text-xs px-2 py-1" : size === "md" ? "text-sm px-3 py-1.5" : "text-base px-4 py-2"}
            font-medium
          `}
        >
          +{unacknowledgedAlerts.length - maxDisplay} more
        </div>
      )}
    </div>
  );
}

