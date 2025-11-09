import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import prisma from '../config/database';

export class AuditController {
  /**
   * Check if user has access to a patient
   * Users have access if they are:
   * - Admin role
   * - In the patient's care team (active assignment)
   */
  private async checkPatientAccess(userId: string, patientId: string): Promise<boolean> {
    // Admin has access to all patients
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === 'admin') {
      return true;
    }

    // Check if user is in patient's care team
    const careTeamAssignment = await prisma.careTeamAssignment.findFirst({
      where: {
        patientId,
        userId,
        isActive: true,
      },
    });

    return !!careTeamAssignment;
  }

  /**
   * Get audit logs for a specific patient
   * Only accessible to admin or users with access to that patient
   */
  async getPatientAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { patientId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      // Only admin can view audit logs for any patient
      // Other users can only view logs for patients they have access to
      if (req.user.role !== 'admin') {
        const hasAccess = await this.checkPatientAccess(req.user.userId, patientId);
        if (!hasAccess) {
          throw new ForbiddenError('You do not have access to this patient\'s audit logs');
        }
      }

      const logs = await auditService.getPatientAuditLogs(patientId, limit, offset);

      res.json({
        data: logs,
        total: logs.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs for the current user
   */
  async getMyAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const logs = await auditService.getUserAuditLogs(req.user.userId, limit, offset);

      res.json({
        data: logs,
        total: logs.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs for a resource (admin only)
   */
  async getResourceAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (req.user.role !== 'admin') {
        throw new ForbiddenError('Admin access required');
      }

      const { resourceType, resourceId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const logs = await auditService.getResourceAuditLogs(
        resourceType,
        resourceId,
        limit,
        offset
      );

      res.json({
        data: logs,
        total: logs.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();

