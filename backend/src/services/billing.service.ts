import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { PaginationParams, PaginatedResponse } from '../types';
import { Invoice, InvoiceItem, Payment, InvoiceStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { isValidCurrency, getCurrencyInfo } from '../utils/currency';

export interface InvoiceListParams extends PaginationParams {
  patientId?: string;
  status?: InvoiceStatus;
  currency?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateInvoiceData {
  patientId: string;
  currency?: string;
  issueDate?: Date | string; // Accept both Date and string (ISO date string)
  dueDate?: Date | string; // Accept both Date and string (ISO date string)
  notes?: string;
  items: CreateInvoiceItemData[];
  billingAddress?: any;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface CreateInvoiceItemData {
  description: string;
  quantity?: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
  serviceCode?: string;
  category?: string;
}

export interface UpdateInvoiceData {
  status?: InvoiceStatus;
  currency?: string;
  issueDate?: Date | string; // Accept both Date and string (ISO date string)
  dueDate?: Date | string; // Accept both Date and string (ISO date string)
  notes?: string;
  items?: CreateInvoiceItemData[];
  billingAddress?: any;
}

export interface CreatePaymentData {
  invoiceId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  transactionId?: string;
  notes?: string;
}

export interface InvoiceWithRelations extends Invoice {
  patient: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  items: InvoiceItem[];
  payments: Payment[];
}

/**
 * Calculate invoice totals from items
 */
function calculateInvoiceTotals(
  items: CreateInvoiceItemData[],
  currency: string = 'USD'
): {
  subtotal: Decimal;
  taxAmount: Decimal;
  discountAmount: Decimal;
  totalAmount: Decimal;
} {
  let subtotal = new Decimal(0);
  let totalTax = new Decimal(0);
  let totalDiscount = new Decimal(0);

  items.forEach((item) => {
    const quantity = new Decimal(item.quantity || 1);
    const unitPrice = new Decimal(item.unitPrice);
    const discount = new Decimal(item.discount || 0);
    const taxRate = new Decimal(item.taxRate || 0);

    const itemSubtotal = quantity.mul(unitPrice);
    const itemDiscount = discount;
    const itemTotalAfterDiscount = itemSubtotal.sub(itemDiscount);
    const itemTax = itemTotalAfterDiscount.mul(taxRate).div(100);

    subtotal = subtotal.add(itemSubtotal);
    totalDiscount = totalDiscount.add(itemDiscount);
    totalTax = totalTax.add(itemTax);
  });

  const totalAmount = subtotal.sub(totalDiscount).add(totalTax);

  return {
    subtotal,
    taxAmount: totalTax,
    discountAmount: totalDiscount,
    totalAmount,
  };
}

/**
 * Generate unique invoice number
 */
async function generateInvoiceNumber(prefix: string = 'INV'): Promise<string> {
  // Get or create billing settings
  let settings = await prisma.billingSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.billingSettings.create({
      data: {
        invoicePrefix: prefix,
        invoiceNumber: 1,
      },
    });
  }

  const invoiceNumber = settings.invoiceNumber;
  
  // Increment invoice number
  await prisma.billingSettings.update({
    where: { id: settings.id },
    data: {
      invoiceNumber: invoiceNumber + 1,
    },
  });

  // Format: INV-0001, INV-0002, etc.
  const paddedNumber = invoiceNumber.toString().padStart(4, '0');
  return `${settings.invoicePrefix}-${paddedNumber}`;
}

export class BillingService {
  /**
   * Get billing settings
   */
  async getBillingSettings() {
    let settings = await prisma.billingSettings.findFirst();

    if (!settings) {
      // Create default settings
      settings = await prisma.billingSettings.create({
        data: {
          defaultCurrency: 'USD',
          invoicePrefix: 'INV',
          invoiceNumber: 1,
          paymentTerms: 30,
        },
      });
    }

    return settings;
  }

  /**
   * Update billing settings
   */
  async updateBillingSettings(data: any) {
    let settings = await prisma.billingSettings.findFirst();

    if (!settings) {
      settings = await prisma.billingSettings.create({
        data: {
          ...data,
          defaultCurrency: data.defaultCurrency || 'USD',
          invoicePrefix: data.invoicePrefix || 'INV',
          invoiceNumber: data.invoiceNumber || 1,
          paymentTerms: data.paymentTerms || 30,
        },
      });
    } else {
      settings = await prisma.billingSettings.update({
        where: { id: settings.id },
        data,
      });
    }

    return settings;
  }

  /**
   * Get invoices with pagination and filters
   */
  async getInvoices(params: InvoiceListParams = {}): Promise<PaginatedResponse<InvoiceWithRelations>> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.patientId) {
      where.patientId = params.patientId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.currency) {
      where.currency = params.currency.toUpperCase();
    }

    if (params.startDate || params.endDate) {
      where.issueDate = {};
      if (params.startDate) {
        where.issueDate.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.issueDate.lte = new Date(params.endDate);
      }
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issueDate: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          items: true,
          payments: {
            orderBy: { paymentDate: 'desc' },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      items: invoices as InvoiceWithRelations[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<InvoiceWithRelations> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          orderBy: { createdAt: 'asc' },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice', id);
    }

    return invoice as InvoiceWithRelations;
  }

  /**
   * Create new invoice
   */
  async createInvoice(data: CreateInvoiceData, userId: string): Promise<InvoiceWithRelations> {
    // Validate patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient', data.patientId);
    }

    // Get billing settings for default currency
    const settings = await this.getBillingSettings();
    const currency = (data.currency || settings.defaultCurrency).toUpperCase();

    // Validate currency
    if (!isValidCurrency(currency)) {
      throw new ValidationError(`Invalid currency code: ${currency}`);
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new ValidationError('Invoice must have at least one item');
    }

    // Calculate totals
    const totals = calculateInvoiceTotals(data.items, currency);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(settings.invoicePrefix);

    // Set dates - convert string dates to Date objects if needed
    const issueDate = data.issueDate 
      ? (typeof data.issueDate === 'string' ? new Date(data.issueDate) : data.issueDate)
      : new Date();
    const paymentTerms = settings.paymentTerms || 30;
    const dueDate = data.dueDate 
      ? (typeof data.dueDate === 'string' ? new Date(data.dueDate) : data.dueDate)
      : new Date(issueDate.getTime() + paymentTerms * 24 * 60 * 60 * 1000);

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        patientId: data.patientId,
        invoiceNumber,
        status: InvoiceStatus.draft,
        currency,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        totalAmount: totals.totalAmount,
        paidAmount: new Decimal(0),
        balanceAmount: totals.totalAmount,
        issueDate,
        dueDate,
        notes: data.notes,
        billingAddress: data.billingAddress,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        createdById: userId,
        items: {
          create: data.items.map((item) => {
            const quantity = new Decimal(item.quantity || 1);
            const unitPrice = new Decimal(item.unitPrice);
            const discount = new Decimal(item.discount || 0);
            const taxRate = new Decimal(item.taxRate || 0);

            const itemSubtotal = quantity.mul(unitPrice);
            const itemTotalAfterDiscount = itemSubtotal.sub(discount);
            const itemTax = itemTotalAfterDiscount.mul(taxRate).div(100);
            const itemTotal = itemTotalAfterDiscount.add(itemTax);

            return {
              description: item.description,
              quantity,
              unitPrice,
              taxRate,
              discount,
              totalAmount: itemTotal,
              serviceCode: item.serviceCode,
              category: item.category,
            };
          }),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: true,
        payments: true,
      },
    });

    return invoice as InvoiceWithRelations;
  }

  /**
   * Update invoice
   */
  async updateInvoice(id: string, data: UpdateInvoiceData, userId: string): Promise<InvoiceWithRelations> {
    const invoice = await this.getInvoiceById(id);

    // Can't update paid or cancelled invoices
    if (invoice.status === InvoiceStatus.paid || invoice.status === InvoiceStatus.cancelled) {
      throw new ValidationError('Cannot update paid or cancelled invoice');
    }

    const updateData: any = {};

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.currency !== undefined) {
      const currency = data.currency.toUpperCase();
      if (!isValidCurrency(currency)) {
        throw new ValidationError(`Invalid currency code: ${currency}`);
      }
      updateData.currency = currency;
    }

    if (data.issueDate !== undefined) {
      // Convert string date to Date object if needed
      updateData.issueDate = typeof data.issueDate === 'string' 
        ? new Date(data.issueDate) 
        : data.issueDate;
    }

    if (data.dueDate !== undefined) {
      // Convert string date to Date object if needed
      updateData.dueDate = typeof data.dueDate === 'string' 
        ? new Date(data.dueDate) 
        : data.dueDate;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    if (data.billingAddress !== undefined) {
      updateData.billingAddress = data.billingAddress;
    }

    // Update items if provided
    if (data.items) {
      if (data.items.length === 0) {
        throw new ValidationError('Invoice must have at least one item');
      }

      const currency = data.currency?.toUpperCase() || invoice.currency;
      const totals = calculateInvoiceTotals(data.items, currency);

      // Delete existing items and create new ones
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      updateData.subtotal = totals.subtotal;
      updateData.taxAmount = totals.taxAmount;
      updateData.discountAmount = totals.discountAmount;
      updateData.totalAmount = totals.totalAmount;
      
      // Recalculate balance
      const paidAmount = invoice.paidAmount;
      updateData.balanceAmount = totals.totalAmount.sub(paidAmount);

      // Create new items
      await prisma.invoiceItem.createMany({
        data: data.items.map((item) => {
          const quantity = new Decimal(item.quantity || 1);
          const unitPrice = new Decimal(item.unitPrice);
          const discount = new Decimal(item.discount || 0);
          const taxRate = new Decimal(item.taxRate || 0);

          const itemSubtotal = quantity.mul(unitPrice);
          const itemTotalAfterDiscount = itemSubtotal.sub(discount);
          const itemTax = itemTotalAfterDiscount.mul(taxRate).div(100);
          const itemTotal = itemTotalAfterDiscount.add(itemTax);

          return {
            invoiceId: id,
            description: item.description,
            quantity,
            unitPrice,
            taxRate,
            discount,
            totalAmount: itemTotal,
            serviceCode: item.serviceCode,
            category: item.category,
          };
        }),
      });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    return updatedInvoice as InvoiceWithRelations;
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id: string): Promise<void> {
    const invoice = await this.getInvoiceById(id);

    // Can't delete paid invoices
    if (invoice.status === InvoiceStatus.paid) {
      throw new ValidationError('Cannot delete paid invoice');
    }

    await prisma.invoice.delete({
      where: { id },
    });
  }

  /**
   * Create payment
   */
  async createPayment(data: CreatePaymentData, userId: string): Promise<Payment> {
    const invoice = await this.getInvoiceById(data.invoiceId);

    // Get currency from invoice or use provided
    const currency = (data.currency || invoice.currency).toUpperCase();

    if (!isValidCurrency(currency)) {
      throw new ValidationError(`Invalid currency code: ${currency}`);
    }

    // Validate amount
    const paymentAmount = new Decimal(data.amount);
    if (paymentAmount.lte(0)) {
      throw new ValidationError('Payment amount must be greater than 0');
    }

    // Check if payment exceeds balance
    if (paymentAmount.gt(invoice.balanceAmount)) {
      throw new ValidationError('Payment amount cannot exceed invoice balance');
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        amount: paymentAmount,
        currency,
        paymentMethod: data.paymentMethod,
        status: PaymentStatus.completed, // Default to completed, can be changed
        transactionId: data.transactionId,
        paymentDate: data.paymentDate,
        notes: data.notes,
        processedById: userId,
      },
    });

    // Update invoice with payment
    const newPaidAmount = invoice.paidAmount.add(paymentAmount);
    const newBalanceAmount = invoice.totalAmount.sub(newPaidAmount);

    let newStatus = invoice.status;
    if (newBalanceAmount.lte(0)) {
      newStatus = InvoiceStatus.paid;
      await prisma.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: new Decimal(0),
          status: InvoiceStatus.paid,
          paidDate: data.paymentDate,
        },
      });
    } else {
      await prisma.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          status: InvoiceStatus.sent, // Update to sent if not already paid
        },
      });
    }

    return payment;
  }

  /**
   * Get payments
   */
  async getPayments(invoiceId?: string): Promise<Payment[]> {
    const where: any = {};
    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    return prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Get patient invoices
   */
  async getPatientInvoices(patientId: string): Promise<InvoiceWithRelations[]> {
    const invoices = await prisma.invoice.findMany({
      where: { patientId },
      orderBy: { issueDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    return invoices as InvoiceWithRelations[];
  }
}

export const billingService = new BillingService();

