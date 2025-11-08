import { useState, useEffect, useId } from "react";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  ariaLabel?: string;
  format?: "12h" | "24h";
}

export default function TimePicker({
  label,
  value,
  onChange,
  placeholder = "HH:MM",
  required = false,
  disabled = false,
  className = "",
  error,
  ariaLabel,
  format = "24h",
}: TimePickerProps) {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const fieldId = useId();
  const errorId = useId();

  const validateTime = (timeValue: string): boolean => {
    if (!timeValue) return !required;
    
    if (format === "24h") {
      const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return timePattern.test(timeValue);
    } else {
      const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
      return timePattern.test(timeValue);
    }
  };

  useEffect(() => {
    if (touched) {
      setIsValid(validateTime(value));
    }
  }, [value, touched, format]);

  const handleBlur = () => {
    setTouched(true);
    setIsValid(validateTime(value));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Auto-format for 24h
    if (format === "24h" && newValue.length === 5) {
      // Ensure format is HH:MM
      const parts = newValue.split(":");
      if (parts.length === 2) {
        const hours = parts[0].padStart(2, "0");
        const minutes = parts[1].padStart(2, "0");
        if (parseInt(hours) <= 23 && parseInt(minutes) <= 59) {
          newValue = `${hours}:${minutes}`;
        }
      }
    }
    
    onChange(newValue);
  };

  const displayError = error || (touched && !isValid ? "Invalid time format" : undefined);

  return (
    <div className={className}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>

      <div className="relative">
        <Clock 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
          size={18} 
          aria-hidden="true"
        />
        <input
          id={fieldId}
          type="time"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-label={ariaLabel || label}
          aria-required={required}
          aria-invalid={!!displayError}
          aria-describedby={displayError ? errorId : undefined}
          className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 transition-all ${
            displayError
              ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
      </div>

      {displayError && (
        <p 
          id={errorId}
          className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle size={14} aria-hidden="true" />
          <span>{displayError}</span>
        </p>
      )}

      {touched && isValid && value && !displayError && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle size={14} aria-hidden="true" />
          <span>Valid time</span>
        </p>
      )}
    </div>
  );
}

