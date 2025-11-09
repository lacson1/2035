import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PatientsService } from '../../../src/services/patients.service';
import { setupTestDatabase, cleanupTestDatabase, createTestPatient, deleteTestPatient, prisma } from '../../utils/test-helpers';

describe('PatientsService', () => {
  let service: PatientsService;
  let testPatientIds: string[] = [];

  beforeEach(async () => {
    await setupTestDatabase();
    service = new PatientsService();
    testPatientIds = [];
  });

  afterEach(async () => {
    // Clean up test patients
    for (const id of testPatientIds) {
      try {
        await deleteTestPatient(id);
      } catch (error) {
        // Ignore errors if already deleted
      }
    }
    await cleanupTestDatabase();
  });

  describe('getPatients', () => {
    it('should return paginated patients', async () => {
      // Create test data
      const patient1 = await createTestPatient({ name: 'Patient One' });
      const patient2 = await createTestPatient({ name: 'Patient Two' });
      testPatientIds.push(patient1.id, patient2.id);

      const result = await service.getPatients({ page: 1, limit: 10 });

      expect(result.items.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.page).toBe(1);
    });

    it('should filter by search query', async () => {
      const patient1 = await createTestPatient({ name: 'John Doe' });
      const patient2 = await createTestPatient({ name: 'Jane Smith' });
      testPatientIds.push(patient1.id, patient2.id);

      const result = await service.getPatients({ search: 'John' });

      expect(result.items.length).toBeGreaterThanOrEqual(1);
      const foundPatient = result.items.find(p => p.name.includes('John'));
      expect(foundPatient).toBeDefined();
    });

    it('should filter by risk score', async () => {
      const lowRisk = await createTestPatient({ name: 'Low Risk Patient', riskScore: 20 });
      const highRisk = await createTestPatient({ name: 'High Risk Patient', riskScore: 80 });
      testPatientIds.push(lowRisk.id, highRisk.id);

      const result = await service.getPatients({ risk: 'low' });

      expect(result.items.length).toBeGreaterThanOrEqual(1);
      const lowRiskPatients = result.items.filter(p => (p.riskScore || 0) <= 33);
      expect(lowRiskPatients.length).toBeGreaterThan(0);
    });

    it('should handle empty results', async () => {
      const result = await service.getPatients({ search: 'NonExistentPatient12345' });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getPatientById', () => {
    it('should return patient by id', async () => {
      const patient = await createTestPatient({ name: 'Test Patient' });
      testPatientIds.push(patient.id);

      const result = await service.getPatientById(patient.id);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Patient');
      expect(result.id).toBe(patient.id);
    });

    it('should throw NotFoundError for invalid id', async () => {
      await expect(
        service.getPatientById('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow();
    });
  });

  describe('createPatient', () => {
    it('should create a new patient', async () => {
      const patientData = {
        name: 'New Test Patient',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'Female',
      };

      const result = await service.createPatient(patientData, 'test-user-id');
      testPatientIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Test Patient');
      expect(result.gender).toBe('Female');
    });
  });
});
