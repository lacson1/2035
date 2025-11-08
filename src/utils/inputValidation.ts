import DOMPurify from 'isomorphic-dompurify';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

export interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedChars?: RegExp;
  sanitize?: boolean;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  // Only letters, numbers, spaces, hyphens, apostrophes
  name: /^[a-zA-Z0-9\s\-']+$/,
  // Email pattern
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Phone pattern (flexible)
  phone: /^[\+]?[\d\s\-\(\)\.]{10,}$/,
  // Alphanumeric with spaces and punctuation
  text: /^[a-zA-Z0-9\s\.,!?'"()\-]+$/
} as const;

/**
 * Sanitizes input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });
}

/**
 * Validates and sanitizes input based on options
 */
export function validateInput(
  value: string,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    required = false,
    minLength,
    maxLength,
    pattern,
    allowedChars,
    sanitize = true
  } = options;

  // Check if required
  if (required && (!value || value.trim().length === 0)) {
    return {
      isValid: false,
      error: 'This field is required'
    };
  }

  // Skip further validation if empty and not required
  if (!value || value.trim().length === 0) {
    return { isValid: true };
  }

  const trimmedValue = value.trim();

  // Check minimum length
  if (minLength && trimmedValue.length < minLength) {
    return {
      isValid: false,
      error: `Must be at least ${minLength} characters long`
    };
  }

  // Check maximum length
  if (maxLength && trimmedValue.length > maxLength) {
    return {
      isValid: false,
      error: `Must be no more than ${maxLength} characters long`
    };
  }

  // Check pattern
  if (pattern && !pattern.test(trimmedValue)) {
    return {
      isValid: false,
      error: 'Invalid format'
    };
  }

  // Check allowed characters
  if (allowedChars && !allowedChars.test(trimmedValue)) {
    return {
      isValid: false,
      error: 'Contains invalid characters'
    };
  }

  // Sanitize if requested
  const sanitizedValue = sanitize ? sanitizeInput(trimmedValue) : trimmedValue;

  return {
    isValid: true,
    sanitizedValue
  };
}

/**
 * Predefined validation functions for common use cases
 */
export const validators = {
  searchTerm: (value: string) => validateInput(value, {
    maxLength: 100,
    allowedChars: VALIDATION_PATTERNS.text,
    sanitize: true
  }),

  hubName: (value: string) => validateInput(value, {
    required: true,
    minLength: 2,
    maxLength: 50,
    allowedChars: VALIDATION_PATTERNS.name,
    sanitize: true
  }),

  functionName: (value: string) => validateInput(value, {
    required: true,
    minLength: 2,
    maxLength: 100,
    allowedChars: VALIDATION_PATTERNS.text,
    sanitize: true
  }),

  description: (value: string) => validateInput(value, {
    maxLength: 500,
    allowedChars: VALIDATION_PATTERNS.text,
    sanitize: true
  }),

  url: (value: string) => {
    if (!value) return { isValid: true };

    try {
      new URL(value);
      return validateInput(value, {
        maxLength: 2000,
        sanitize: true
      });
    } catch {
      return {
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  },

  email: (value: string) => validateInput(value, {
    pattern: VALIDATION_PATTERNS.email,
    maxLength: 254,
    sanitize: true
  }),

  phone: (value: string) => validateInput(value, {
    pattern: VALIDATION_PATTERNS.phone,
    maxLength: 20,
    sanitize: true
  })
};

/**
 * Debounced validation for search inputs
 */
export function createDebouncedValidator<T>(
  validator: (value: string) => ValidationResult,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;

  return (value: string): Promise<ValidationResult> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        resolve(validator(value));
      }, delay);
    });
  };
}

/**
 * Batch validation for multiple fields
 */
export function validateFormFields(
  fields: Record<string, { value: string; validator: (value: string) => ValidationResult }>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [fieldName, { value, validator }] of Object.entries(fields)) {
    results[fieldName] = validator(value);
  }

  return results;
}

/**
 * Check if any validation results have errors
 */
export function hasValidationErrors(results: Record<string, ValidationResult>): boolean {
  return Object.values(results).some(result => !result.isValid);
}

/**
 * Get the first validation error message
 */
export function getFirstValidationError(results: Record<string, ValidationResult>): string | null {
  for (const result of Object.values(results)) {
    if (!result.isValid && result.error) {
      return result.error;
    }
  }
  return null;
}
