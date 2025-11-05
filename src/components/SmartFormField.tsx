import { useState, useEffect } from "react";
import { HelpCircle, CheckCircle, AlertCircle } from "lucide-react";
import { getSmartDefaults, validateField, getFieldHint, ValidationResult } from "../utils/formHelpers";
import FormAutocomplete from "./FormAutocomplete";
import { AutocompleteOption } from "../utils/formHelpers";

interface SmartFormFieldProps {
  type?: "text" | "number" | "email" | "phone" | "date" | "time" | "textarea" | "select" | "autocomplete";
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
  options?: AutocompleteOption[] | { value: string; label: string }[];
  patientData?: any;
  currentUser?: any;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => ValidationResult;
  };
  autoFormat?: boolean;
  showHelp?: boolean;
  helpText?: string;
}

export default function SmartFormField({
  type = "text",
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  rows = 3,
  options = [],
  patientData,
  currentUser,
  validation,
  autoFormat = false,
  showHelp = true,
  helpText,
}: SmartFormFieldProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  const [touched, setTouched] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  const hint = helpText || getFieldHint(name);
  const smartDefault = getSmartDefaults(name, patientData, currentUser);

  useEffect(() => {
    if (smartDefault && !value) {
      onChange(smartDefault);
    }
  }, [smartDefault, name]);

  useEffect(() => {
    if (touched && validation) {
      const result = validateField(name, value, validation);
      setValidationResult(result);
    }
  }, [value, touched, validation, name]);

  const handleBlur = () => {
    setTouched(true);
    if (validation) {
      const result = validateField(name, value, validation);
      setValidationResult(result);
    }
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (touched && validation) {
      const result = validateField(name, newValue, validation);
      setValidationResult(result);
    }
  };

  if (type === "autocomplete" && Array.isArray(options) && options.length > 0) {
    return (
      <FormAutocomplete
        value={value}
        onChange={handleChange}
        options={options as AutocompleteOption[]}
        placeholder={placeholder}
        label={label}
        required={required}
        fieldName={name}
        showHelp={showHelp}
        className={className}
        disabled={disabled}
        error={touched && !validationResult.isValid ? validationResult.error : undefined}
      />
    );
  }

  if (type === "select") {
    return (
      <div className={className}>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {showHelp && hint && (
            <button
              type="button"
              onClick={() => setHelpVisible(!helpVisible)}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Show help"
            >
              <HelpCircle size={14} />
            </button>
          )}
        </label>

        {helpVisible && hint && (
          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
            {hint}
          </div>
        )}

        <select
          name={name}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          className={`w-full px-4 py-2 text-sm border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 transition-all ${
            touched && !validationResult.isValid
              ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <option value="">Select {label.toLowerCase()}...</option>
          {options.map((option) => (
            <option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>
              {typeof option === "string" ? option : option.label}
            </option>
          ))}
        </select>

        {touched && !validationResult.isValid && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={14} />
            {validationResult.error}
          </p>
        )}

        {touched && validationResult.isValid && value && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle size={14} />
            Looks good
          </p>
        )}

        {validationResult.suggestion && (
          <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
            💡 {validationResult.suggestion}
          </p>
        )}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={className}>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {showHelp && hint && (
            <button
              type="button"
              onClick={() => setHelpVisible(!helpVisible)}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Show help"
            >
              <HelpCircle size={14} />
            </button>
          )}
        </label>

        {helpVisible && hint && (
          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
            {hint}
          </div>
        )}

        <textarea
          name={name}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={`w-full px-4 py-2 text-sm border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 transition-all resize-none ${
            touched && !validationResult.isValid
              ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />

        {touched && !validationResult.isValid && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={14} />
            {validationResult.error}
          </p>
        )}

        {validationResult.suggestion && (
          <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
            💡 {validationResult.suggestion}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {showHelp && hint && (
          <button
            type="button"
            onClick={() => setHelpVisible(!helpVisible)}
            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Show help"
          >
            <HelpCircle size={14} />
          </button>
        )}
      </label>

      {helpVisible && hint && (
        <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
          {hint}
        </div>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => {
          let newValue = e.target.value;
          if (autoFormat && type === "phone") {
            newValue = formatPhoneNumber(newValue);
          }
          handleChange(newValue);
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 text-sm border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 transition-all ${
          touched && !validationResult.isValid
            ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />

      {touched && !validationResult.isValid && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle size={14} />
          {validationResult.error}
        </p>
      )}

      {touched && validationResult.isValid && value && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle size={14} />
          Looks good
        </p>
      )}

      {validationResult.suggestion && (
        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
          💡 {validationResult.suggestion}
        </p>
      )}
    </div>
  );
}

// Phone formatting helper
function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 0) return "";
  
  if (cleaned.length <= 3) {
    return `(${cleaned}`;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
}

