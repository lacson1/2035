import { describe, it, expect, beforeEach, vi } from 'vitest';
import { auditService } from '../../../../src/services/audit.service';
import prisma from '../../../../src/config/database';

// Mock Prisma
vi.mock('../../../../src/config/database', () => ({
  default: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logAuditEvent', () => {
    it('should create audit log', async () => {
      const auditData = {
        userId: 'user-123',
        userEmail: 'test@example.com',
        userRole: 'physician',
        action: 'READ' as const,
        resourceType: 'Patient',
        resourceId: 'patient-123',
        patientId: 'patient-123',
        success: true,
      };

      await auditService.logAuditEvent(auditData);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: auditData.userId,
          userEmail: auditData.userEmail,
          action: auditData.action,
          resourceType: auditData.resourceType,
        }),
      });
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(prisma.auditLog.create).mockRejectedValueOnce(new Error('DB Error'));

      const auditData = {
        action: 'READ' as const,
        resourceType: 'Patient',
      };

      // Should not throw
      await expect(auditService.logAuditEvent(auditData)).resolves.not.toThrow();
    });
  });

  describe('logPatientAccess', () => {
    it('should log patient access with correct fields', async () => {
      await auditService.logPatientAccess(
        'user-123',
        'test@example.com',
        'physician',
        'patient-456',
        'READ'
      );

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          userEmail: 'test@example.com',
          userRole: 'physician',
          action: 'READ',
          resourceType: 'Patient',
          resourceId: 'patient-456',
          patientId: 'patient-456',
          success: true,
        }),
      });
    });
  });

  describe('logAuthEvent', () => {
    it('should log successful login', async () => {
      await auditService.logAuthEvent(
        'user-123',
        'test@example.com',
        'LOGIN',
        '192.168.1.1',
        'Mozilla/5.0',
        true
      );

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          userEmail: 'test@example.com',
          action: 'LOGIN',
          resourceType: 'Auth',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          success: true,
        }),
      });
    });

    it('should log failed login with error message', async () => {
      await auditService.logAuthEvent(
        undefined,
        'test@example.com',
        'LOGIN',
        '192.168.1.1',
        'Mozilla/5.0',
        false,
        'Invalid credentials'
      );

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          success: false,
          errorMessage: 'Invalid credentials',
        }),
      });
    });
  });
});

