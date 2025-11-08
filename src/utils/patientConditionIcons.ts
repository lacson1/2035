import {
  Heart,
  AlertTriangle,
  Activity,
  Brain,
  Pill,
  Stethoscope,
  Shield,
  Zap,
  User,
  LucideIcon,
} from "lucide-react";

export interface ConditionIconConfig {
  icon: LucideIcon;
  color: string;
  darkColor: string;
  label: string;
}

/**
 * Get condition icon configuration based on patient condition and risk level
 */
export function getConditionIcon(patient: {
  condition?: string;
  risk?: number;
  age?: number;
}): ConditionIconConfig {
  const conditionLower = patient.condition?.toLowerCase() || "";
  const risk = patient.risk || 0;
  const age = patient.age || 0;

  // High risk patients (risk >= 60)
  if (risk >= 60) {
    return {
      icon: AlertTriangle,
      color: "text-destructive-600",
      darkColor: "dark:text-destructive-400",
      label: "High Risk",
    };
  }

  // Cardiac conditions
  if (
    conditionLower.includes("cardiac") ||
    conditionLower.includes("heart") ||
    conditionLower.includes("coronary") ||
    conditionLower.includes("hypertension") ||
    conditionLower.includes("arrhythmia") ||
    conditionLower.includes("cardiac") ||
    conditionLower.includes("cvd") ||
    conditionLower.includes("cardiovascular")
  ) {
    return {
      icon: Heart,
      color: "text-red-600",
      darkColor: "dark:text-red-400",
      label: "Cardiac",
    };
  }

  // Frailty indicators (age-based or condition-based)
  if (
    age >= 75 ||
    conditionLower.includes("frail") ||
    conditionLower.includes("frailty") ||
    conditionLower.includes("elderly") ||
    conditionLower.includes("geriatric")
  ) {
    return {
      icon: Shield,
      color: "text-amber-600",
      darkColor: "dark:text-amber-400",
      label: "Frailty",
    };
  }

  // Neurological conditions
  if (
    conditionLower.includes("stroke") ||
    conditionLower.includes("neurological") ||
    conditionLower.includes("dementia") ||
    conditionLower.includes("alzheimer") ||
    conditionLower.includes("parkinson") ||
    conditionLower.includes("epilepsy") ||
    conditionLower.includes("seizure")
  ) {
    return {
      icon: Brain,
      color: "text-purple-600",
      darkColor: "dark:text-purple-400",
      label: "Neurological",
    };
  }

  // Diabetes/Metabolic
  if (
    conditionLower.includes("diabetes") ||
    conditionLower.includes("diabetic") ||
    conditionLower.includes("metabolic") ||
    conditionLower.includes("insulin")
  ) {
    return {
      icon: Zap,
      color: "text-yellow-600",
      darkColor: "dark:text-yellow-400",
      label: "Metabolic",
    };
  }

  // Respiratory conditions
  if (
    conditionLower.includes("copd") ||
    conditionLower.includes("asthma") ||
    conditionLower.includes("respiratory") ||
    conditionLower.includes("pulmonary") ||
    conditionLower.includes("lung")
  ) {
    return {
      icon: Activity,
      color: "text-cyan-600",
      darkColor: "dark:text-cyan-400",
      label: "Respiratory",
    };
  }

  // Oncology/Cancer
  if (
    conditionLower.includes("cancer") ||
    conditionLower.includes("oncology") ||
    conditionLower.includes("tumor") ||
    conditionLower.includes("malignancy") ||
    conditionLower.includes("chemotherapy")
  ) {
    return {
      icon: Stethoscope,
      color: "text-pink-600",
      darkColor: "dark:text-pink-400",
      label: "Oncology",
    };
  }

  // Medium risk (40-59)
  if (risk >= 40 && risk < 60) {
    return {
      icon: AlertTriangle,
      color: "text-warning-600",
      darkColor: "dark:text-warning-400",
      label: "Medium Risk",
    };
  }

  // Multiple medications or complex care
  // This would need to be passed from the component

  // Default/General
  return {
    icon: User,
    color: "text-gray-600",
    darkColor: "dark:text-gray-400",
    label: "General",
  };
}

/**
 * Get multiple condition icons for patients with multiple conditions
 */
export function getConditionIcons(patient: {
  condition?: string;
  risk?: number;
  age?: number;
  medications?: Array<{ status?: string }>;
}): ConditionIconConfig[] {
  const icons: ConditionIconConfig[] = [];
  const risk = patient.risk || 0;
  const age = patient.age || 0;
  const activeMeds = patient.medications?.filter((m) => m.status === "Active").length || 0;

  // Primary condition icon
  const primaryIcon = getConditionIcon(patient);
  icons.push(primaryIcon);

  // Add high risk indicator if applicable (and not already shown)
  if (risk >= 60 && primaryIcon.label !== "High Risk") {
    icons.push({
      icon: AlertTriangle,
      color: "text-destructive-600",
      darkColor: "dark:text-destructive-400",
      label: "High Risk",
    });
  }

  // Add frailty indicator for elderly patients (if not already shown)
  if (age >= 75 && primaryIcon.label !== "Frailty") {
    icons.push({
      icon: Shield,
      color: "text-amber-600",
      darkColor: "dark:text-amber-400",
      label: "Frailty",
    });
  }

  // Add polypharmacy indicator (5+ medications)
  if (activeMeds >= 5) {
    icons.push({
      icon: Pill,
      color: "text-orange-600",
      darkColor: "dark:text-orange-400",
      label: "Polypharmacy",
    });
  }

  return icons;
}

