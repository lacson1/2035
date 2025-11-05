import { describe, it, expect } from 'vitest';
import { getRiskLabel, getRiskColorClasses, getRiskColorHex } from '../riskUtils';

describe('riskUtils', () => {
  describe('getRiskLabel', () => {
    it('should return "Low" for risk < 40', () => {
      expect(getRiskLabel(0)).toBe('Low');
      expect(getRiskLabel(20)).toBe('Low');
      expect(getRiskLabel(39)).toBe('Low');
    });

    it('should return "Medium" for risk 40-59', () => {
      expect(getRiskLabel(40)).toBe('Medium');
      expect(getRiskLabel(50)).toBe('Medium');
      expect(getRiskLabel(59)).toBe('Medium');
    });

    it('should return "High" for risk >= 60', () => {
      expect(getRiskLabel(60)).toBe('High');
      expect(getRiskLabel(75)).toBe('High');
      expect(getRiskLabel(100)).toBe('High');
    });
  });

  describe('getRiskColorClasses', () => {
    it('should return green classes for low risk', () => {
      const classes = getRiskColorClasses(20);
      expect(classes).toContain('green');
      expect(classes).toContain('text-green');
    });

    it('should return yellow classes for medium risk', () => {
      const classes = getRiskColorClasses(50);
      expect(classes).toContain('yellow');
      expect(classes).toContain('text-yellow');
    });

    it('should return red classes for high risk', () => {
      const classes = getRiskColorClasses(75);
      expect(classes).toContain('red');
      expect(classes).toContain('text-red');
    });

    it('should include dark mode classes', () => {
      const classes = getRiskColorClasses(50);
      expect(classes).toContain('dark:');
    });

    it('should handle edge cases', () => {
      expect(getRiskColorClasses(0)).toBeTruthy();
      expect(getRiskColorClasses(100)).toBeTruthy();
      expect(getRiskColorClasses(40)).toBeTruthy();
      expect(getRiskColorClasses(60)).toBeTruthy();
    });
  });

  describe('getRiskColorHex', () => {
    it('should return green hex for low risk', () => {
      expect(getRiskColorHex(20)).toBe('#10b981');
    });

    it('should return yellow hex for medium risk', () => {
      expect(getRiskColorHex(50)).toBe('#f59e0b');
    });

    it('should return red hex for high risk', () => {
      expect(getRiskColorHex(75)).toBe('#ef4444');
    });
  });
});
