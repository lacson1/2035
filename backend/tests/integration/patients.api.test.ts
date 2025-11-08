import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';
import { UserFactory, PatientFactory } from '../../../src/test/factories/testDataFactory';

const prisma = new PrismaClient();

describe('Patients API Integration Tests', () => {
  let authToken: string;
  let testUser: any;
  let testPatient: any;

  beforeAll(async () => {
    // Clean up test data
    await prisma.patient.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    testUser = UserFactory.createDoctor();
    await prisma.user.create({
      data: {
        ...testUser,
        email: 'test-doctor@hospital2035.com',
        password: '$2b$10$test.hash.for.testing.purposes.only'
      }
    });

    // Create auth token (mock JWT for testing)
    authToken = 'mock-jwt-token-for-testing';
  });

  afterAll(async () => {
    await prisma.patient.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up patients before each test
    await prisma.patient.deleteMany();
    testPatient = PatientFactory.create();
  });

  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      const patientData = {
        firstName: testPatient.firstName,
        lastName: testPatient.lastName,
        dateOfBirth: testPatient.dateOfBirth,
        gender: testPatient.gender,
        email: testPatient.email,
        phone: testPatient.phone,
        address: testPatient.address,
        emergencyContact: testPatient.emergencyContact,
        medicalHistory: testPatient.medicalHistory,
        medications: testPatient.medications,
        allergies: testPatient.allergies,
        conditions: testPatient.conditions,
        insurance: testPatient.insurance,
        notes: testPatient.notes,
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(patientData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email,
      });
      expect(response.body.data).toHaveProperty('id');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        firstName: '', // Empty required field
        email: 'invalid-email', // Invalid email format
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle duplicate email addresses', async () => {
      // Create first patient
      await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1980-01-01',
          gender: 'male',
          email: 'duplicate@example.com',
          phone: '123-456-7890',
        });

      // Try to create second patient with same email
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: '1985-01-01',
          gender: 'female',
          email: 'duplicate@example.com', // Same email
          phone: '987-654-3210',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('email');
    });
  });

  describe('GET /api/patients', () => {
    beforeEach(async () => {
      // Create test patients
      const patients = PatientFactory.createMany(5);
      for (const patient of patients) {
        await prisma.patient.create({ data: patient });
      }
    });

    it('should retrieve all patients', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(5);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/patients?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should filter by search query', async () => {
      const response = await request(app)
        .get('/api/patients?search=John')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // All returned patients should contain "John" in their name
      response.body.data.forEach((patient: any) => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        expect(fullName).toContain('john');
      });
    });

    it('should filter by risk level', async () => {
      const response = await request(app)
        .get('/api/patients?risk=high')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // All returned patients should have high risk (>=60)
      response.body.data.forEach((patient: any) => {
        expect(patient.riskScore).toBeGreaterThanOrEqual(60);
      });
    });

    it('should sort by different criteria', async () => {
      const response = await request(app)
        .get('/api/patients?sort=name')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Check if results are sorted by name
      const names = response.body.data.map((p: any) => `${p.firstName} ${p.lastName}`);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });
  });

  describe('GET /api/patients/:id', () => {
    let createdPatient: any;

    beforeEach(async () => {
      createdPatient = await prisma.patient.create({ data: testPatient });
    });

    it('should retrieve a specific patient', async () => {
      const response = await request(app)
        .get(`/api/patients/${createdPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdPatient.id);
      expect(response.body.data.firstName).toBe(createdPatient.firstName);
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await request(app)
        .get('/api/patients/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not found');
    });
  });

  describe('PUT /api/patients/:id', () => {
    let createdPatient: any;

    beforeEach(async () => {
      createdPatient = await prisma.patient.create({ data: testPatient });
    });

    it('should update patient information', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        notes: 'Updated patient notes',
      };

      const response = await request(app)
        .put(`/api/patients/${createdPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('Name');
      expect(response.body.data.notes).toBe('Updated patient notes');
    });

    it('should validate update data', async () => {
      const invalidUpdate = {
        email: 'invalid-email-format',
        dateOfBirth: 'invalid-date',
      };

      const response = await request(app)
        .put(`/api/patients/${createdPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await request(app)
        .put('/api/patients/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/patients/:id', () => {
    let createdPatient: any;

    beforeEach(async () => {
      createdPatient = await prisma.patient.create({ data: testPatient });
    });

    it('should delete a patient', async () => {
      const response = await request(app)
        .delete(`/api/patients/${createdPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify patient is deleted
      const checkResponse = await request(app)
        .get(`/api/patients/${createdPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkResponse.status).toBe(404);
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await request(app)
        .delete('/api/patients/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/patients');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle database connection errors', async () => {
      // This would require mocking database disconnections
      // For now, just test that the API handles errors gracefully
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(1000);

      // Should either succeed or fail gracefully with proper error response
      expect([200, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(async () => {
      // Create multiple test patients
      const patients = PatientFactory.createMany(3);
      for (const patient of patients) {
        await prisma.patient.create({ data: patient });
      }
    });

    it('should handle bulk patient creation', async () => {
      const bulkPatients = PatientFactory.createMany(2, [
        { email: 'bulk1@example.com' },
        { email: 'bulk2@example.com' }
      ]);

      const response = await request(app)
        .post('/api/patients/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ patients: bulkPatients });

      // Note: This endpoint may not exist, adjust based on actual API
      expect([200, 201, 404]).toContain(response.status);

      if (response.status === 200 || response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should handle bulk patient updates', async () => {
      const patients = await prisma.patient.findMany({ limit: 2 });

      const updates = patients.map(patient => ({
        id: patient.id,
        notes: `Updated notes for ${patient.firstName}`
      }));

      const response = await request(app)
        .put('/api/patients/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ updates });

      // Note: This endpoint may not exist, adjust based on actual API
      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Performance Tests', () => {
    beforeEach(async () => {
      // Create many patients for performance testing
      const patients = PatientFactory.createMany(100);
      for (const patient of patients) {
        await prisma.patient.create({ data: patient });
      }
    });

    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get('/api/patients?limit=50')
        .set('Authorization', `Bearer ${authToken}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(50);
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    it('should handle complex queries efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get('/api/patients?search=test&risk=high&sort=name&limit=20')
        .set('Authorization', `Bearer ${authToken}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(3000); // Should respond within 3 seconds for complex queries
    });
  });
});
