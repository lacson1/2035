import { useState, useRef, useEffect, useId } from "react";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { validateDate, ValidationResult } from "../utils/formHelpers";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  error?: string;
  ariaLabel?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  required = false,
  disabled = false,
  minDate,
  maxDate,
  className = "",
  error,
  ariaLabel,
}: DatePickerProps) {
  const [touched, setTouched] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  const [showCalendar, setShowCalendar] = useState(false);
  const fieldId = useId();
  const errorId = useId();
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate on value change
  useEffect(() => {
    if (touched && value) {
      const result = validateDate(value, { minDate, maxDate });
      setValidationResult(result);
    }
  }, [value, touched, minDate, maxDate]);

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCalendar]);

  const handleBlur = () => {
    setTouched(true);
    if (value) {
      const result = validateDate(value, { minDate, maxDate });
      setValidationResult(result);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const displayError = error || (touched && !validationResult.isValid ? validationResult.error : undefined);

  return (
    <div className={className}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>

      <div className="relative" ref={calendarRef}>
        <Calendar 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
          size={18} 
          aria-hidden="true"
        />
        <input
          id={fieldId}
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => setShowCalendar(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={minDate}
          max={maxDate || today}
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

      {touched && validationResult.isValid && value && !displayError && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle size={14} aria-hidden="true" />
          <span>Valid date</span>
        </p>
      )}
    </div>
  );
}

