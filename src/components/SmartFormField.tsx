import { useState, useEffect, useId } from "react";
import { HelpCircle, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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
  loading?: boolean;
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
  showCharCount?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
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
  loading = false,
  className = "",
  rows = 3,
  options = [],
  patientData,
  currentUser,
  validation,
  autoFormat = false,
  showHelp = true,
  helpText,
  showCharCount = false,
  ariaLabel,
  ariaDescribedBy,
}: SmartFormFieldProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  const [touched, setTouched] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const fieldId = useId();
  const errorId = useId();
  const helpId = useId();

  const hint = helpText || getFieldHint(name);
  const smartDefault = getSmartDefaults(name, patientData, currentUser);
  
  // Character count for textareas and text inputs with maxLength
  const charCount = value.length;
  const maxChars = validation?.maxLength;
  const showCounter = showCharCount && (type === "textarea" || (type === "text" && maxChars));

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
        <label 
          htmlFor={fieldId}
          className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          {showHelp && hint && (
            <button
              type="button"
              onClick={() => setHelpVisible(!helpVisible)}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Show help"
              aria-label="Show help for this field"
              aria-expanded={helpVisible}
              aria-controls={helpId}
            >
              <HelpCircle size={14} />
            </button>
          )}
        </label>

        {helpVisible && hint && (
          <div 
            id={helpId}
            className="mb-2 p-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded text-xs text-teal-800 dark:text-teal-200"
            role="tooltip"
          >
            {hint}
          </div>
        )}

        <div className="relative">
          <select
            id={fieldId}
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            required={required}
            disabled={disabled || loading}
            aria-label={ariaLabel || label}
            aria-required={required}
            aria-invalid={touched && !validationResult.isValid}
            aria-describedby={
              [
                touched && !validationResult.isValid ? errorId : undefined,
                helpVisible && hint ? helpId : undefined,
                ariaDescribedBy,
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            className={`w-full px-4 py-2 text-sm border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 transition-all appearance-none ${
              touched && !validationResult.isValid
                ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"
            } ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""} ${
              loading ? "pr-10" : ""
            }`}
          >
            <option value="">Select {label.toLowerCase()}...</option>
            {options.map((option) => (
              <option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>
                {typeof option === "string" ? option : option.label}
              </option>
            ))}
          </select>
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="animate-spin text-teal-500" size={18} />
            </div>
          )}
        </div>

        {touched && !validationResult.isValid && (
          <p 
            id={errorId}
            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle size={14} aria-hidden="true" />
            <span>{validationResult.error}</span>
          </p>
        )}

        {touched && validationResult.isValid && value && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle size={14} aria-hidden="true" />
            <span>Looks good</span>
          </p>
        )}

        {validationResult.suggestion && (
          <p className="mt-1 text-sm text-teal-600 dark:text-teal-400">
            💡 {validationResult.suggestion}
          </p>
        )}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={className}>
        <label 
          htmlFor={fieldId}
          className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          {showHelp && hint && (
            <button
              type="button"
              onClick={() => setHelpVisible(!helpVisible)}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Show help"
              aria-label="Show help for this field"
              aria-expanded={helpVisible}
              aria-controls={helpId}
            >
              <HelpCircle size={14} />
            </button>
          )}
        </label>

        {helpVisible && hint && (
          <div 
            id={helpId}
            className="mb-2 p-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded text-xs text-teal-800 dark:text-teal-200"
            role="tooltip"
          >
            {hint}
          </div>
        )}

        <div className="relative">
          <textarea
            id={fieldId}
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled || loading}
            rows={rows}
            aria-label={ariaLabel || label}
            aria-required={required}
            aria-invalid={touched && !validationResult.isValid}
            aria-describedby={
              [
                touched && !validationResult.isValid ? errorId : undefined,
                helpVisible && hint ? helpId : undefined,
                ariaDescribedBy,
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            className={`w-full px-4 py-2 text-sm border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 transition-all resize-y ${
              touched && !validationResult.isValid
                ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"
            } ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""} ${
              loading ? "pr-10" : ""
            }`}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin text-teal-500" size={18} />
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex-1">
            {touched && !validationResult.isValid && (
              <p 
                id={errorId}
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle size={14} aria-hidden="true" />
                <span>{validationResult.error}</span>
              </p>
            )}

            {touched && validationResult.isValid && value && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle size={14} aria-hidden="true" />
                <span>Looks good</span>
              </p>
            )}

            {validationResult.suggestion && (
              <p className="text-sm text-teal-600 dark:text-teal-400">
                💡 {validationResult.suggestion}
              </p>
            )}
          </div>
          
          {showCounter && maxChars && (
            <div className={`text-xs ml-2 ${
              charCount > maxChars 
                ? "text-red-600 dark:text-red-400" 
                : charCount > maxChars * 0.9 
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-gray-500 dark:text-gray-400"
            }`}>
              {charCount}/{maxChars}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        {showHelp && hint && (
          <button
            type="button"
            onClick={() => setHelpVisible(!helpVisible)}
            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Show help"
            aria-label="Show help for this field"
            aria-expanded={helpVisible}
            aria-controls={helpId}
          >
            <HelpCircle size={14} />
          </button>
        )}
      </label>

      {helpVisible && hint && (
        <div 
          id={helpId}
          className="mb-2 p-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded text-xs text-teal-800 dark:text-teal-200"
          role="tooltip"
        >
          {hint}
        </div>
      )}

      <div className="relative">
        <input
          id={fieldId}
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
          disabled={disabled || loading}
          aria-label={ariaLabel || label}
          aria-required={required}
          aria-invalid={touched && !validationResult.isValid}
          aria-describedby={
            [
              touched && !validationResult.isValid ? errorId : undefined,
              helpVisible && hint ? helpId : undefined,
              ariaDescribedBy,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`w-full px-4 py-2 text-sm border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 transition-all ${
            touched && !validationResult.isValid
              ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"
          } ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""} ${
            loading ? "pr-10" : ""
          }`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-teal-500" size={18} />
          </div>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div className="flex-1">
          {touched && !validationResult.isValid && (
            <p 
              id={errorId}
              className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle size={14} aria-hidden="true" />
              <span>{validationResult.error}</span>
            </p>
          )}

          {touched && validationResult.isValid && value && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle size={14} aria-hidden="true" />
              <span>Looks good</span>
            </p>
          )}

          {validationResult.suggestion && (
            <p className="text-sm text-teal-600 dark:text-teal-400">
              💡 {validationResult.suggestion}
            </p>
          )}
        </div>
        
        {showCounter && maxChars && (
          <div className={`text-xs ml-2 ${
            charCount > maxChars 
              ? "text-red-600 dark:text-red-400" 
              : charCount > maxChars * 0.9 
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-gray-500 dark:text-gray-400"
          }`}>
            {charCount}/{maxChars}
          </div>
        )}
      </div>
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

