import { describe, it, expect } from 'vitest';
import { validateField, validateEmail, formatDate } from '../formHelpers';

describe('formHelpers', () => {
  describe('validateField', () => {
    it('should validate required field', () => {
      const result = validateField('test', '', { required: true });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    it('should pass validation for non-empty required field', () => {
      const result = validateField('test', 'value', { required: true });
      expect(result.isValid).toBe(true);
    });

    it('should validate minLength', () => {
      const result = validateField('test', 'ab', { minLength: 3 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('should validate maxLength', () => {
      const result = validateField('test', 'abcdefghij', { maxLength: 5 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('no more than 5 characters');
    });

    it('should validate pattern', () => {
      const result = validateField('test', 'abc', { pattern: /^\d+$/ });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid format');
    });

    it('should pass pattern validation', () => {
      const result = validateField('test', '123', { pattern: /^\d+$/ });
      expect(result.isValid).toBe(true);
    });

    it('should use custom validator', () => {
      const customValidator = (value: string) => {
        if (value === 'invalid') {
          return { isValid: false, error: 'Custom error' };
        }
        return { isValid: true };
      };
      
      const result = validateField('test', 'invalid', { customValidator });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Custom error');
    });

    it('should pass for valid field with no options', () => {
      const result = validateField('test', 'any value');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('should validate empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should validate invalid email format', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid email');
    });

    it('should validate valid email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });

    it('should validate email with subdomain', () => {
      const result = validateEmail('test@mail.example.com');
      expect(result.isValid).toBe(true);
    });
  });


  describe('formatDate', () => {
    it('should format date string as MM/DD/YYYY', () => {
      const result = formatDate('12252023');
      expect(result).toBe('12/25/2023');
    });

    it('should format partial date string', () => {
      expect(formatDate('12')).toBe('12');
      expect(formatDate('1225')).toBe('12/25');
      expect(formatDate('122520')).toBe('12/25/2020');
    });

    it('should handle empty string', () => {
      const result = formatDate('');
      expect(result).toBe('');
    });

    it('should strip non-numeric characters', () => {
      const result = formatDate('12-25-2023');
      expect(result).toBe('12/25/2023');
    });
  });
});

