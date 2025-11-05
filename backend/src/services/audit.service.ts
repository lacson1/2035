import prisma from '../config/database';
import { AuditActionType } from '@prisma/client';
import { logger } from '../utils/logger';

export interface AuditLogData {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: AuditActionType;
  resourceType: string;
  resourceId?: string;
  patientId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  statusCode?: number;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
}

export class AuditService {
  /**
   * Log an audit event
   * This is critical for HIPAA compliance - all PHI access must be logged
   */
  async logAuditEvent(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          userEmail: data.userEmail,
          userRole: data.userRole,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          patientId: data.patientId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          requestMethod: data.requestMethod,
          requestPath: data.requestPath,
          statusCode: data.statusCode,
          changes: data.changes ? JSON.parse(JSON.stringify(data.changes)) : null,
          metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
          success: data.success ?? true,
          errorMessage: data.errorMessage,
        },
      });
    } catch (error) {
      // Don't throw - audit logging failure shouldn't break the app
      // But log it for monitoring
      logger.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log patient data access (HIPAA requirement)
   */
  async logPatientAccess(
    userId: string,
    userEmail: string,
    userRole: string,
    patientId: string,
    action: AuditActionType,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAuditEvent({
      userId,
      userEmail,
      userRole,
      action,
      resourceType: 'Patient',
      resourceId: patientId,
      patientId,
      metadata,
      success: true,
    });
  }

  /**
   * Log patient data modification
   */
  async logPatientModification(
    userId: string,
    userEmail: string,
    userRole: string,
    patientId: string,
    action: AuditActionType,
    changes?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAuditEvent({
      userId,
      userEmail,
      userRole,
      action,
      resourceType: 'Patient',
      resourceId: patientId,
      patientId,
      changes,
      metadata,
      success: true,
    });
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    userId: string | undefined,
    userEmail: string | undefined,
    action: 'LOGIN' | 'LOGOUT' | 'REGISTER',
    ipAddress?: string,
    userAgent?: string,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    await this.logAuditEvent({
      userId,
      userEmail,
      action: action as AuditActionType,
      resourceType: 'Auth',
      ipAddress,
      userAgent,
      success,
      errorMessage,
    });
  }

  /**
   * Get audit logs for a patient (HIPAA compliance - track all access)
   */
  async getPatientAuditLogs(
    patientId: string,
    limit: number = 100,
    offset: number = 0
  ) {
    return prisma.auditLog.findMany({
      where: {
        patientId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get audit logs for a user
   */
  async getUserAuditLogs(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ) {
    return prisma.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Get audit logs by resource
   */
  async getResourceAuditLogs(
    resourceType: string,
    resourceId: string,
    limit: number = 100,
    offset: number = 0
  ) {
    return prisma.auditLog.findMany({
      where: {
        resourceType,
        resourceId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }
}

export const auditService = new AuditService();

