import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import { AuditActionType } from '@prisma/client';

/**
 * Extract patient ID from request params or body
 */
function extractPatientId(req: Request): string | undefined {
  // Check route params first (nested routes like /patients/:patientId/medications)
  if (req.params.patientId) {
    return req.params.patientId;
  }
  
  // Check body for patientId
  if (req.body?.patientId) {
    return req.body.patientId;
  }
  
  // Check query params
  if (req.query?.patientId) {
    return req.query.patientId as string;
  }
  
  return undefined;
}

/**
 * Determine audit action from HTTP method
 */
function getAuditAction(method: string): AuditActionType {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'READ';
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'READ';
  }
}

/**
 * Extract resource type from request path
 */
function getResourceType(path: string): string {
  // Remove /api/v1 prefix
  const cleanPath = path.replace(/^\/api\/v1\//, '');
  
  // Extract resource from path segments
  const segments = cleanPath.split('/');
  
  // Handle nested routes like /patients/:id/medications
  if (segments[0] === 'patients' && segments.length > 2) {
    return segments[2].replace(/s$/, ''); // Remove plural 's'
  }
  
  // Handle direct routes like /patients, /medications
  const resource = segments[0]?.replace(/s$/, '') || 'Unknown';
  
  // Capitalize first letter
  return resource.charAt(0).toUpperCase() + resource.slice(1);
}

/**
 * Audit middleware - logs all requests automatically
 * This is critical for HIPAA compliance
 */
export const auditMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip health checks and public endpoints
  if (req.path === '/health' || req.path.startsWith('/api/v1/auth/login')) {
    return next();
  }

  // Store original res.json to capture response
  const originalJson = res.json.bind(res);
  let responseData: any;
  let statusCode: number = 200;

  res.json = function (body: any) {
    responseData = body;
    statusCode = res.statusCode;
    return originalJson(body);
  };

  // Capture request start time
  const startTime = Date.now();

  // Continue to next middleware
  next();

  // Log after response is sent (but don't block)
  res.once('finish', async () => {
    try {
      const user = req.user;
      const patientId = extractPatientId(req);
      const action = getAuditAction(req.method);
      const resourceType = getResourceType(req.path);
      
      // Extract resource ID from params or body
      const resourceId = req.params.id || 
                        req.params.patientId || 
                        req.body?.id || 
                        responseData?.data?.id;

      // Determine if this is a patient-related action
      const isPatientRelated = patientId !== undefined || 
                              resourceType === 'Patient' ||
                              req.path.includes('/patients/');

      // Log audit event
      await auditService.logAuditEvent({
        userId: user?.userId,
        userEmail: user?.email,
        userRole: user?.role,
        action,
        resourceType,
        resourceId,
        patientId: isPatientRelated ? (patientId || resourceId) : undefined,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string,
        userAgent: req.headers['user-agent'],
        requestMethod: req.method,
        requestPath: req.path,
        statusCode: statusCode,
        success: statusCode < 400,
        errorMessage: statusCode >= 400 ? (responseData?.message || 'Request failed') : undefined,
        metadata: {
          duration: Date.now() - startTime,
          query: Object.keys(req.query).length > 0 ? req.query : undefined,
        },
      });
    } catch (error) {
      // Audit logging should never break the app
      console.error('Audit logging error:', error);
    }
  });
};

/**
 * Manual audit logging helper for complex operations
 */
export const logAuditEvent = async (
  req: Request,
  action: AuditActionType,
  resourceType: string,
  resourceId?: string,
  changes?: Record<string, any>,
  metadata?: Record<string, any>
) => {
  const user = req.user;
  const patientId = extractPatientId(req);

  await auditService.logAuditEvent({
    userId: user?.userId,
    userEmail: user?.email,
    userRole: user?.role,
    action,
    resourceType,
    resourceId,
    patientId: patientId || (resourceType === 'Patient' ? resourceId : undefined),
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string,
    userAgent: req.headers['user-agent'],
    requestMethod: req.method,
    requestPath: req.path,
    changes,
    metadata,
    success: true,
  });
};

