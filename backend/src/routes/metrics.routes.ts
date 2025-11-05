import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { metricsCollector } from '../utils/metrics';

const router = Router();

/**
 * @swagger
 * /api/v1/metrics:
 *   get:
 *     summary: Get application metrics (Admin only)
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application metrics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  (req: Request, res: Response) => {
    const metrics = metricsCollector.getMetrics();
    res.json({
      data: metrics,
    });
  }
);

export default router;

