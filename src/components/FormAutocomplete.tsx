import { useState, useRef, useEffect, useId } from "react";
import { Search, CheckCircle, X, HelpCircle, Loader2 } from "lucide-react";
import { AutocompleteOption, searchAutocomplete, getFieldHint } from "../utils/formHelpers";

interface FormAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  fieldName?: string;
  showHelp?: boolean;
  className?: string;
  maxSuggestions?: number;
  onSelect?: (option: AutocompleteOption) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  ariaLabel?: string;
}

export default function FormAutocomplete({
  value,
  onChange,
  options,
  placeholder = "Start typing...",
  label,
  required = false,
  fieldName,
  showHelp = true,
  className = "",
  maxSuggestions = 10,
  onSelect,
  disabled = false,
  loading = false,
  error,
  ariaLabel,
}: FormAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [helpVisible, setHelpVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const errorId = useId();
  const helpId = useId();
  const listboxId = useId();

  const hint = fieldName ? getFieldHint(fieldName) : null;

  useEffect(() => {
    if (value.length >= 1) {
      setIsSearching(true);
      // Simulate async search for better UX (can be replaced with actual async search)
      setTimeout(() => {
        const results = searchAutocomplete(value, options, maxSuggestions);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setIsSearching(false);
      }, 100);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
    }
    setSelectedIndex(-1);
  }, [value, options, maxSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.value);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(option);
    }
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSelect(suggestions[0]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
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
      )}
      
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
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
          size={18} 
          aria-hidden="true"
        />
        <input
          id={fieldId}
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 1 && setShowSuggestions(suggestions.length > 0)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          aria-label={ariaLabel || label || "Autocomplete input"}
          aria-required={required}
          aria-invalid={!!error}
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={listboxId}
          aria-describedby={
            [
              error ? errorId : undefined,
              helpVisible && hint ? helpId : undefined,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`w-full pl-10 pr-10 py-2 text-sm border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"
          } ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""} ${
            (isSearching || loading) ? "pr-20" : ""
          }`}
        />
        {(isSearching || loading) && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-teal-500" size={18} />
          </div>
        )}
        {value && !disabled && !loading && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear input"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {error && (
        <p 
          id={errorId}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div 
          id={listboxId}
          role="listbox"
          aria-label="Suggestions"
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              type="button"
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={index === selectedIndex || value === option.value}
              className={`w-full px-4 py-3 text-left hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 focus:outline-none focus:bg-teal-50 dark:focus:bg-teal-900/20 ${
                index === selectedIndex ? "bg-teal-50 dark:bg-teal-900/20" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{option.description}</div>
                  )}
                  {option.category && (
                    <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">{option.category}</div>
                  )}
                </div>
                {value === option.value && (
                  <CheckCircle className="text-green-500 ml-2" size={18} aria-hidden="true" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {value && suggestions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No matches found. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}

