/**
 * Risk-related utility functions
 * Shared across components to avoid duplication
 */

/**
 * Get risk level label (Low, Medium, High)
 */
export function getRiskLabel(risk: number): "Low" | "Medium" | "High" {
  if (risk >= 60) return "High";
  if (risk >= 40) return "Medium";
  return "Low";
}

/**
 * Get risk color as Tailwind CSS classes
 */
export function getRiskColorClasses(risk: number): string {
  if (risk >= 60) return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
  if (risk >= 40) return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
  return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
}

/**
 * Get risk color as hex value (for charts/SVG)
 */
export function getRiskColorHex(risk: number): string {
  if (risk >= 60) return "#ef4444"; // red
  if (risk >= 40) return "#f59e0b"; // yellow
  return "#10b981"; // green
}

