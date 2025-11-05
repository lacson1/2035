import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import { auditService } from '../../src/services/audit.service';

describe('Audit Logging', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test user and get auth token
    // This is a simplified example - in real tests you'd use a test database
    const testUser = await prisma.user.findFirst({
      where: { email: 'admin@hospital2035.com' },
    });
    
    if (testUser) {
      testUserId = testUser.id;
      // Login to get token
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@hospital2035.com',
          password: 'admin123',
        });
      
      if (loginRes.body.data?.tokens?.accessToken) {
        authToken = loginRes.body.data.tokens.accessToken;
      }
    }
  });

  afterAll(async () => {
    // Cleanup test data if needed
  });

  describe('Patient Access Logging', () => {
    it('should log patient access', async () => {
      const patientRes = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Wait a bit for async audit logging
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check audit log was created
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          resourceType: 'Patient',
          action: 'READ',
        },
        orderBy: { timestamp: 'desc' },
        take: 1,
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].resourceType).toBe('Patient');
      expect(auditLogs[0].action).toBe('READ');
      expect(auditLogs[0].success).toBe(true);
    });

    it('should log patient modification', async () => {
      // First, get a patient
      const patientsRes = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const patients = patientsRes.body.data?.items || [];
      if (patients.length === 0) {
        return; // Skip if no patients
      }

      const patientId = patients[0].id;

      // Update patient
      await request(app)
        .put(`/api/v1/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          condition: 'Updated condition',
        })
        .expect(200);

      // Wait for async audit logging
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check audit log
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          resourceType: 'Patient',
          resourceId: patientId,
          action: 'UPDATE',
        },
        orderBy: { timestamp: 'desc' },
        take: 1,
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].action).toBe('UPDATE');
      expect(auditLogs[0].patientId).toBe(patientId);
    });
  });

  describe('Authentication Logging', () => {
    it('should log successful login', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@hospital2035.com',
          password: 'admin123',
        })
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await prisma.auditLog.findMany({
        where: {
          resourceType: 'Auth',
          action: 'LOGIN',
          success: true,
        },
        orderBy: { timestamp: 'desc' },
        take: 1,
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].action).toBe('LOGIN');
      expect(auditLogs[0].success).toBe(true);
    });

    it('should log failed login', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@hospital2035.com',
          password: 'wrongpassword',
        })
        .expect(401);

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await prisma.auditLog.findMany({
        where: {
          resourceType: 'Auth',
          action: 'LOGIN',
          success: false,
        },
        orderBy: { timestamp: 'desc' },
        take: 1,
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].success).toBe(false);
      expect(auditLogs[0].errorMessage).toBeDefined();
    });
  });
});

