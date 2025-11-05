import apiClient, { ApiResponse } from './api';

export interface Invoice {
  id: string;
  patientId: string;
  invoiceNumber: string;
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  currency: string;
  subtotal: number | string;
  taxAmount: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  paidAmount: number | string;
  balanceAmount: number | string;
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  notes?: string;
  billingAddress?: any;
  relatedEntityType?: string;
  relatedEntityId?: string;
  patient?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  taxRate: number | string;
  discount: number | string;
  totalAmount: number | string;
  serviceCode?: string;
  category?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number | string;
  currency: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'insurance' | 'check' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transactionId?: string;
  paymentDate: string;
  notes?: string;
  processedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface BillingSettings {
  id: string;
  organizationName?: string;
  defaultCurrency: string;
  taxRate: number | string;
  taxEnabled: boolean;
  currencySymbols?: Record<string, string>;
  exchangeRates?: Record<string, number>;
  invoicePrefix: string;
  invoiceNumber: number;
  paymentTerms: number;
  billingAddress?: any;
  contactInfo?: any;
  bankDetails?: any;
}

export interface CreateInvoiceData {
  patientId: string;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
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

export interface CreatePaymentData {
  invoiceId: string;
  amount: number;
  currency?: string;
  paymentMethod: Payment['paymentMethod'];
  paymentDate: string;
  transactionId?: string;
  notes?: string;
}

class BillingService {
  // Billing Settings
  async getBillingSettings(): Promise<ApiResponse<BillingSettings>> {
    return apiClient.get<BillingSettings>('/v1/billing/settings');
  }

  async updateBillingSettings(data: Partial<BillingSettings>): Promise<ApiResponse<BillingSettings>> {
    return apiClient.put<BillingSettings>('/v1/billing/settings', data);
  }

  // Invoices
  async getInvoices(params?: {
    page?: number;
    limit?: number;
    patientId?: string;
    status?: Invoice['status'];
    currency?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ invoices: Invoice[]; total: number; page: number; limit: number; totalPages: number }>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.patientId) queryParams.patientId = params.patientId;
    if (params?.status) queryParams.status = params.status;
    if (params?.currency) queryParams.currency = params.currency;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;

    return apiClient.get('/v1/billing/invoices', queryParams);
  }

  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<Invoice>(`/v1/billing/invoices/${id}`);
  }

  async createInvoice(data: CreateInvoiceData): Promise<ApiResponse<Invoice>> {
    return apiClient.post<Invoice>('/v1/billing/invoices', data);
  }

  async updateInvoice(id: string, data: Partial<CreateInvoiceData> & { status?: Invoice['status'] }): Promise<ApiResponse<Invoice>> {
    return apiClient.put<Invoice>(`/v1/billing/invoices/${id}`, data);
  }

  async deleteInvoice(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/v1/billing/invoices/${id}`);
  }

  async getPatientInvoices(patientId: string): Promise<ApiResponse<Invoice[]>> {
    return apiClient.get<Invoice[]>(`/v1/billing/patients/${patientId}/invoices`);
  }

  // Payments
  async createPayment(data: CreatePaymentData): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>('/v1/billing/payments', data);
  }

  async getPayments(invoiceId?: string): Promise<ApiResponse<Payment[]>> {
    const params = invoiceId ? { invoiceId } : undefined;
    return apiClient.get<Payment[]>('/v1/billing/payments', params);
  }
}

export const billingService = new BillingService();

