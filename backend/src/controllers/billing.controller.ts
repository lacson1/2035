import { Request, Response, NextFunction } from 'express';
import { billingService, InvoiceListParams } from '../services/billing.service';
import { UnauthorizedError } from '../utils/errors';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

export class BillingController {
  // Billing Settings
  async getBillingSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await billingService.getBillingSettings();
      res.json({
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBillingSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await billingService.updateBillingSettings(req.body);
      res.json({
        data: settings,
        message: 'Billing settings updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Invoices
  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const params: InvoiceListParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        patientId: req.query.patientId as string,
        status: req.query.status as InvoiceStatus,
        currency: req.query.currency as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await billingService.getInvoices(params);

      res.json({
        data: {
          invoices: result.items,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invoice = await billingService.getInvoiceById(id);

      res.json({
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const invoice = await billingService.createInvoice(req.body, req.user.userId);

      res.status(201).json({
        data: invoice,
        message: 'Invoice created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;
      const invoice = await billingService.updateInvoice(id, req.body, req.user.userId);

      res.json({
        data: invoice,
        message: 'Invoice updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await billingService.deleteInvoice(id);

      res.json({
        message: 'Invoice deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPatientInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const invoices = await billingService.getPatientInvoices(patientId);

      res.json({
        data: invoices,
      });
    } catch (error) {
      next(error);
    }
  }

  // Payments
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const payment = await billingService.createPayment(req.body, req.user.userId);

      res.status(201).json({
        data: payment,
        message: 'Payment recorded successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceId = req.query.invoiceId as string;
      const payments = await billingService.getPayments(invoiceId);

      res.json({
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const billingController = new BillingController();

