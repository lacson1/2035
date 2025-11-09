import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser, createTestPatient, deleteTestUser, deleteTestPatient, prisma } from '../utils/test-helpers';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config/env';

describe('Patients API Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testPatientIds: string[] = [];

  beforeEach(async () => {
    // Create test user and get auth token
    const user = await createTestUser({
      email: 'test@example.com',
      role: 'physician',
    });
    testUserId = user.id;
    
    authToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '15m' }
    );
    
    testPatientIds = [];
  });

  afterEach(async () => {
    // Clean up test data
    for (const id of testPatientIds) {
      try {
        await deleteTestPatient(id);
      } catch (error) {
        // Ignore errors
      }
    }
    
    try {
      await deleteTestUser(testUserId);
    } catch (error) {
      // Ignore errors
    }
  });

  describe('GET /api/v1/patients', () => {
    it('should return patients list with authentication', async () => {
      const patient = await createTestPatient({ name: 'Test Patient' });
      testPatientIds.push(patient.id);

      const response = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.patients).toBeDefined();
      expect(Array.isArray(response.body.data.patients)).toBe(true);
      expect(response.body.data.total).toBeGreaterThanOrEqual(1);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/patients')
        .expect(401);
    });

    it('should support pagination', async () => {
      // Create multiple patients
      for (let i = 0; i < 5; i++) {
        const patient = await createTestPatient({ name: `Patient ${i}` });
        testPatientIds.push(patient.id);
      }

      const response = await request(app)
        .get('/api/v1/patients?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.patients.length).toBeLessThanOrEqual(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
    });

    it('should support search query', async () => {
      const patient = await createTestPatient({ name: 'John Doe' });
      testPatientIds.push(patient.id);

      const response = await request(app)
        .get('/api/v1/patients?search=John')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const found = response.body.data.patients.find((p: any) => p.name.includes('John'));
      expect(found).toBeDefined();
    });
  });

  describe('GET /api/v1/patients/:id', () => {
    it('should return single patient by id', async () => {
      const patient = await createTestPatient({ name: 'Single Patient' });
      testPatientIds.push(patient.id);

      const response = await request(app)
        .get(`/api/v1/patients/${patient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(patient.id);
      expect(response.body.data.name).toBe('Single Patient');
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .get(`/api/v1/patients/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      const patient = await createTestPatient();
      testPatientIds.push(patient.id);

      await request(app)
        .get(`/api/v1/patients/${patient.id}`)
        .expect(401);
    });
  });

  describe('POST /api/v1/patients', () => {
    it('should create a new patient', async () => {
      const patientData = {
        name: 'New Patient',
        dateOfBirth: '1990-01-01T00:00:00.000Z',
        gender: 'Male',
      };

      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(patientData)
        .expect(201);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('New Patient');
      expect(response.body.message).toBe('Patient created successfully');
      
      if (response.body.data.id) {
        testPatientIds.push(response.body.data.id);
      }
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/patients')
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('PUT /api/v1/patients/:id', () => {
    it('should update an existing patient', async () => {
      const patient = await createTestPatient({ name: 'Original Name' });
      testPatientIds.push(patient.id);

      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .put(`/api/v1/patients/${patient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.message).toBe('Patient updated successfully');
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .put(`/api/v1/patients/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/patients/:id', () => {
    it('should delete a patient (admin only)', async () => {
      // Create admin user
      const admin = await createTestUser({ role: 'admin' });
      const adminToken = jwt.sign(
        { userId: admin.id, email: admin.email, role: 'admin' },
        config.jwt.secret,
        { expiresIn: '15m' }
      );

      const patient = await createTestPatient();
      testPatientIds.push(patient.id);

      await request(app)
        .delete(`/api/v1/patients/${patient.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Clean up admin user
      await deleteTestUser(admin.id);
    });

    it('should require admin role', async () => {
      const patient = await createTestPatient();
      testPatientIds.push(patient.id);

      await request(app)
        .delete(`/api/v1/patients/${patient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
});
