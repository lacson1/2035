/**
 * Measurement utility functions for handling UK (metric) and US (imperial) units
 */

export type MeasurementSystem = "uk" | "us";

// Temperature conversion functions
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9) / 5 + 32;
};

export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return ((fahrenheit - 32) * 5) / 9;
};

// Weight conversion functions
export const kgToLbs = (kg: number): number => {
  return kg * 2.20462;
};

export const lbsToKg = (lbs: number): number => {
  return lbs / 2.20462;
};

// Height conversion functions
export const cmToInches = (cm: number): number => {
  return cm / 2.54;
};

export const inchesToCm = (inches: number): number => {
  return inches * 2.54;
};

/**
 * Format temperature based on measurement system
 */
export const formatTemperature = (
  value: number,
  system: MeasurementSystem,
  storedInCelsius: boolean = false
): string => {
  // If stored value is in Celsius, convert to Fahrenheit if needed
  let displayValue = value;
  if (storedInCelsius && system === "us") {
    displayValue = celsiusToFahrenheit(value);
  } else if (!storedInCelsius && system === "uk") {
    // If stored in Fahrenheit, convert to Celsius
    displayValue = fahrenheitToCelsius(value);
  }

  const unit = system === "uk" ? "°C" : "°F";
  return `${displayValue.toFixed(1)}${unit}`;
};

/**
 * Get temperature input placeholder based on system
 */
export const getTemperaturePlaceholder = (system: MeasurementSystem): string => {
  return system === "uk" ? "e.g., 37.0" : "e.g., 98.6";
};

/**
 * Get temperature input min/max based on system
 */
export const getTemperatureRange = (system: MeasurementSystem): { min: number; max: number } => {
  if (system === "uk") {
    return { min: 32, max: 43 }; // Celsius: roughly 89.6°F to 109.4°F
  }
  return { min: 90, max: 110 }; // Fahrenheit
};

/**
 * Convert temperature input value based on measurement system
 * When storing, always store in Celsius (UK standard)
 */
export const convertTemperatureForStorage = (
  value: number,
  system: MeasurementSystem
): number => {
  if (system === "us") {
    // Convert Fahrenheit input to Celsius for storage
    return fahrenheitToCelsius(value);
  }
  // Already in Celsius
  return value;
};

/**
 * Convert stored temperature (Celsius) to display value based on system
 */
export const convertTemperatureForDisplay = (
  value: number,
  system: MeasurementSystem
): number => {
  if (system === "us") {
    // Convert stored Celsius to Fahrenheit for display
    return celsiusToFahrenheit(value);
  }
  // Already in Celsius
  return value;
};

/**
 * Format weight based on measurement system
 */
export const formatWeight = (value: number, system: MeasurementSystem): string => {
  const unit = system === "uk" ? "kg" : "lbs";
  return `${value.toFixed(1)} ${unit}`;
};

/**
 * Format height based on measurement system
 */
export const formatHeight = (value: number, system: MeasurementSystem): string => {
  const unit = system === "uk" ? "cm" : "inches";
  return `${value.toFixed(1)} ${unit}`;
};

/**
 * Get measurement system preference from localStorage
 */
export const getMeasurementSystem = (): MeasurementSystem => {
  if (typeof window === "undefined") return "uk";
  
  try {
    const stored = localStorage.getItem("measurementSystem");
    if (stored === "us" || stored === "uk") {
      return stored;
    }
  } catch (e) {
    // Silently fail
  }
  
  return "uk"; // Default to UK (metric)
};

/**
 * Save measurement system preference to localStorage
 */
export const setMeasurementSystem = (system: MeasurementSystem): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem("measurementSystem", system);
  } catch (e) {
    // Silently fail
  }
};

