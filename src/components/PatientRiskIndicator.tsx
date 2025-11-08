import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Patient } from "../types";

interface PatientRiskIndicatorProps {
  patient: Patient;
  size?: "sm" | "md" | "lg";
  showTrend?: boolean;
}

export default function PatientRiskIndicator({
  patient,
  size = "md",
  showTrend = false,
}: PatientRiskIndicatorProps) {
  const risk = patient.risk || 0;

  const getRiskLevel = (riskValue: number): {
    level: "low" | "medium" | "high" | "critical";
    color: string;
    bgColor: string;
    borderColor: string;
    label: string;
  } => {
    if (riskValue >= 80) {
      return {
        level: "critical",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-300 dark:border-red-700",
        label: "Critical",
      };
    } else if (riskValue >= 60) {
      return {
        level: "high",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        borderColor: "border-orange-300 dark:border-orange-700",
        label: "High",
      };
    } else if (riskValue >= 40) {
      return {
        level: "medium",
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        borderColor: "border-yellow-300 dark:border-yellow-700",
        label: "Medium",
      };
    } else {
      return {
        level: "low",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-300 dark:border-green-700",
        label: "Low",
      };
    }
  };

  const riskInfo = getRiskLevel(risk);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  // Calculate trend (mock - would need historical data)
  // Use a variable that can change to avoid TypeScript narrowing
  const trendValue: "up" | "down" | "stable" = "stable" as "up" | "down" | "stable";

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-lg border shadow-md
        ${riskInfo.bgColor} ${riskInfo.borderColor} ${riskInfo.color}
        ${sizeClasses[size]} font-medium
        transition-all duration-300 hover:shadow-lg
        backdrop-blur-sm
      `}
    >
      {risk >= 60 && (
        <AlertTriangle
          size={iconSizes[size]}
          className={risk >= 80 ? "animate-pulse" : ""}
        />
      )}
      <span>
        Risk: {riskInfo.label} ({risk}%)
      </span>
      {showTrend && (
        <span className="ml-1">
          {trendValue === "up" && (
            <TrendingUp size={iconSizes[size] - 4} className="text-red-500" />
          )}
          {trendValue === "down" && (
            <TrendingDown size={iconSizes[size] - 4} className="text-green-500" />
          )}
          {trendValue === "stable" && (
            <Minus size={iconSizes[size] - 4} className="text-gray-500" />
          )}
        </span>
      )}
    </div>
  );
}

// Risk badge for patient cards
export function PatientRiskBadge({ patient }: { patient: Patient }) {
  const risk = patient.risk || 0;
  
  const getRiskColor = (riskValue: number): string => {
    if (riskValue >= 80) return "bg-red-500";
    if (riskValue >= 60) return "bg-orange-500";
    if (riskValue >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div
      className={`
        absolute top-2 right-2 w-3.5 h-3.5 rounded-full shadow-lg
        ${getRiskColor(risk)}
        ${risk >= 80 ? "animate-pulse" : ""}
        ring-2 ring-white dark:ring-gray-800
        transition-all duration-300 hover:scale-125
      `}
      title={`Risk Level: ${risk}%`}
    />
  );
}

