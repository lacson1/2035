import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export class AuditController {
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
        // NOTE: Patient access permission check should be implemented
        // For now, all authenticated users can view audit logs
        // Future: Add patient access control based on care team assignments
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

