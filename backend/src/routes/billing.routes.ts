import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Billing Settings - Admin/Billing role only
router.get('/settings', 
  requireRole('admin', 'billing'),
  billingController.getBillingSettings.bind(billingController)
);

router.put('/settings',
  requireRole('admin', 'billing'),
  billingController.updateBillingSettings.bind(billingController)
);

// Invoices
router.get('/invoices', billingController.getInvoices.bind(billingController));
router.get('/invoices/:id', billingController.getInvoice.bind(billingController));
router.post('/invoices', 
  requireRole('admin', 'billing', 'physician', 'receptionist'),
  billingController.createInvoice.bind(billingController)
);
router.put('/invoices/:id',
  requireRole('admin', 'billing'),
  billingController.updateInvoice.bind(billingController)
);
router.delete('/invoices/:id',
  requireRole('admin', 'billing'),
  billingController.deleteInvoice.bind(billingController)
);

// Patient invoices
router.get('/patients/:patientId/invoices', billingController.getPatientInvoices.bind(billingController));

// Payments
router.post('/payments',
  requireRole('admin', 'billing', 'receptionist'),
  billingController.createPayment.bind(billingController)
);
router.get('/payments', billingController.getPayments.bind(billingController));

export default router;

