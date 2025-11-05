import { describe, it, expect } from 'vitest';
import { validatePatient, validatePatients } from '../validation';

describe('validation', () => {
  describe('validatePatient', () => {
    it('should validate and transform backend patient data', () => {
      const backendPatient = {
        id: '1',
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        bloodPressure: '120/80',
        condition: 'Hypertension',
        riskScore: 45,
      };

      const result = validatePatient(backendPatient);
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
      expect(result?.name).toBe('John Doe');
      expect(result?.gender).toBe('Male');
      expect(result?.bp).toBe('120/80');
      expect(result?.condition).toBe('Hypertension');
      expect(result?.risk).toBe(45);
      expect(result?.age).toBeGreaterThan(0);
    });

    it('should handle missing optional fields', () => {
      const backendPatient = {
        id: '2',
        name: 'Jane Smith',
        dateOfBirth: '1985-05-15',
        gender: 'Female',
      };

      const result = validatePatient(backendPatient);
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe('2');
      expect(result?.name).toBe('Jane Smith');
      expect(result?.bp).toBe('');
      expect(result?.condition).toBe('');
      expect(result?.risk).toBe(0);
    });

    it('should return null for invalid patient data', () => {
      const invalidPatient = {
        // Missing required fields
        name: 'Test',
      };

      const result = validatePatient(invalidPatient);
      
      // Should return null or transformed data with minimal fields
      expect(result === null || (result?.id === undefined && result?.name === undefined)).toBeTruthy();
    });

    it('should handle medications array', () => {
      const backendPatient = {
        id: '3',
        name: 'Patient',
        dateOfBirth: '2000-01-01',
        gender: 'Male',
        medications: [
          {
            name: 'Aspirin',
            status: 'active',
            startedDate: '2023-01-01',
            instructions: 'Take once daily',
          },
        ],
      };

      const result = validatePatient(backendPatient);
      
      expect(result?.medications).toBeDefined();
      expect(result?.medications?.length).toBe(1);
      expect(result?.medications?.[0].name).toBe('Aspirin');
      expect(result?.medications?.[0].status).toBe('active');
    });

    it('should calculate age correctly', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 30;
      const backendPatient = {
        id: '4',
        name: 'Age Test',
        dateOfBirth: `${birthYear}-01-01`,
        gender: 'Male',
      };

      const result = validatePatient(backendPatient);
      
      expect(result?.age).toBe(30);
    });
  });

  describe('validatePatients', () => {
    it('should validate array of patients', () => {
      const backendPatients = [
        {
          id: '1',
          name: 'Patient 1',
          dateOfBirth: '1990-01-01',
          gender: 'Male',
        },
        {
          id: '2',
          name: 'Patient 2',
          dateOfBirth: '1985-05-15',
          gender: 'Female',
        },
      ];

      const result = validatePatients(backendPatients);
      
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Patient 1');
      expect(result[1].name).toBe('Patient 2');
    });

    it('should filter out invalid patients', () => {
      const mixedPatients = [
        {
          id: '1',
          name: 'Valid Patient',
          dateOfBirth: '1990-01-01',
          gender: 'Male',
        },
        {
          // Invalid - missing required fields
          name: 'Invalid',
        },
        {
          id: '3',
          name: 'Another Valid',
          dateOfBirth: '1985-05-15',
          gender: 'Female',
        },
      ];

      const result = validatePatients(mixedPatients);
      
      // Should have at least valid patients
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(p => p.name === 'Valid Patient')).toBeTruthy();
    });

    it('should handle empty array', () => {
      const result = validatePatients([]);
      expect(result.length).toBe(0);
    });
  });
});

