import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  DollarSign,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Printer,
} from "lucide-react";
import { billingService, Invoice, CreatePaymentData, Payment, CreateInvoiceData, CreateInvoiceItemData } from "../services/billing";
import { formatCurrency } from "../utils/currency";
import { ApiError } from "../services/api";
import { useDashboard } from "../context/DashboardContext";

interface InvoiceListProps {
  onSelectInvoice: (invoice: Invoice) => void;
  onCreateInvoice: () => void;
}

function InvoiceList({ onSelectInvoice, onCreateInvoice }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await billingService.getInvoices({
        page: currentPage,
        limit,
        status: statusFilter !== "all" ? (statusFilter as Invoice["status"]) : undefined,
      });

      if (response.data) {
        setInvoices(response.data.invoices || []);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load invoices");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, limit]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      invoice.patient?.name?.toLowerCase().includes(query) ||
      invoice.patient?.email?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={14} />;
      case "sent":
      case "pending":
        return <Clock size={14} />;
      case "overdue":
        return <XCircle size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  if (isLoading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Invoices</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage patient invoices and payments
          </p>
        </div>
        <button
          onClick={onCreateInvoice}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Plus size={16} />
          New Invoice
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Invoice List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Invoice #</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Patient</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{invoice.invoiceNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{invoice.patient?.name || "N/A"}</div>
                      {invoice.patient?.email && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{invoice.patient.email}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(Number(invoice.totalAmount), invoice.currency)}
                      </div>
                      {Number(invoice.balanceAmount) > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Balance: {formatCurrency(Number(invoice.balanceAmount), invoice.currency)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {getStatusIcon(invoice.status)}
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectInvoice(invoice)}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="View Invoice"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} invoices
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface InvoiceDetailProps {
  invoice: Invoice;
  onClose: () => void;
  onPayment: (payment: CreatePaymentData) => void;
}

function InvoiceDetail({ invoice, onClose, onPayment }: InvoiceDetailProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Payment["paymentMethod"]>("cash");
  const [paymentNotes, setPaymentNotes] = useState("");

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!isNaN(amount) && amount > 0 && amount <= Number(invoice.balanceAmount)) {
      onPayment({
        invoiceId: invoice.id,
        amount,
        currency: invoice.currency,
        paymentMethod,
        paymentDate: new Date().toISOString(),
        notes: paymentNotes,
      });
      setShowPaymentForm(false);
      setPaymentAmount("");
      setPaymentNotes("");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const issueDate = new Date(invoice.issueDate).toLocaleDateString();
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A';
    const currentDate = new Date().toLocaleString();
    
    const itemsHtml = invoice.items && invoice.items.length > 0
      ? invoice.items.map(item => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.description || 'N/A'}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">${item.quantity || 0}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(Number(item.unitPrice || 0), invoice.currency)}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${formatCurrency(Number(item.totalAmount || 0), invoice.currency)}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #6b7280;">No items</td></tr>';

    const paymentsHtml = invoice.payments && invoice.payments.length > 0
      ? invoice.payments.map(payment => `
          <div style="padding: 10px; margin-bottom: 8px; background: #f9fafb; border-radius: 4px; border-left: 3px solid #10b981;">
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">
              ${formatCurrency(Number(payment.amount || 0), payment.currency || invoice.currency)}
            </div>
            <div style="font-size: 12px; color: #6b7280;">
              ${payment.paymentMethod?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown'} • 
              ${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        `).join('')
      : '<div style="padding: 10px; color: #6b7280; font-size: 13px;">No payments recorded</div>';

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            @page { margin: 0.75in; size: letter; }
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 0; 
            }
            .header { 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 24px; 
              color: #1e40af; 
              font-weight: 700;
            }
            .header h2 { 
              margin: 8px 0 0 0; 
              font-size: 18px; 
              color: #4b5563; 
              font-weight: 500;
            }
            .invoice-number {
              font-size: 16px;
              color: #6b7280;
              margin-top: 5px;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin: 25px 0; 
            }
            .info-item { 
              padding: 12px; 
              background: #f9fafb; 
              border-radius: 4px; 
              border: 1px solid #e5e7eb; 
            }
            .info-label { 
              font-size: 11px; 
              color: #6b7280; 
              text-transform: uppercase; 
              letter-spacing: 0.5px; 
              margin-bottom: 5px; 
              font-weight: 600;
            }
            .info-value { 
              font-size: 14px; 
              font-weight: 600; 
              color: #111827; 
            }
            .items-section {
              margin: 30px 0;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items-table th {
              background: #f3f4f6;
              padding: 10px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #e5e7eb;
            }
            .items-table th.text-right {
              text-align: right;
            }
            .items-table td {
              padding: 10px;
              font-size: 13px;
              color: #111827;
            }
            .totals-section {
              margin: 25px 0;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .total-row.total {
              font-size: 18px;
              font-weight: 700;
              padding-top: 15px;
              border-top: 2px solid #e5e7eb;
              margin-top: 10px;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-draft { background: #f3f4f6; color: #374151; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-sent { background: #dbeafe; color: #1e40af; }
            .status-paid { background: #d1fae5; color: #065f46; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
            .status-cancelled { background: #f3f4f6; color: #6b7280; }
            .payments-section {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
            }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              font-size: 11px; 
              color: #6b7280; 
              text-align: center; 
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>Bluequee2.0</h2>
            <div class="invoice-number">${invoice.invoiceNumber}</div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Information</div>
              <div class="info-value">${invoice.patient?.name || 'N/A'}</div>
              ${invoice.patient?.email ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${invoice.patient.email}</div>` : ''}
              ${invoice.patient?.phone ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${invoice.patient.phone}</div>` : ''}
            </div>
            <div class="info-item">
              <div class="info-label">Invoice Information</div>
              <div style="font-size: 13px; line-height: 1.8;">
                <div><strong>Issue Date:</strong> ${issueDate}</div>
                ${invoice.dueDate ? `<div><strong>Due Date:</strong> ${dueDate}</div>` : ''}
                <div><strong>Status:</strong> <span class="status-badge status-${invoice.status}">${invoice.status}</span></div>
                <div><strong>Currency:</strong> ${invoice.currency}</div>
              </div>
            </div>
          </div>

          <div class="items-section">
            <h3 style="font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
              Invoice Items
            </h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(Number(invoice.subtotal), invoice.currency)}</span>
            </div>
            ${Number(invoice.taxAmount) > 0 ? `
            <div class="total-row">
              <span>Tax:</span>
              <span>${formatCurrency(Number(invoice.taxAmount), invoice.currency)}</span>
            </div>
            ` : ''}
            ${Number(invoice.discountAmount) > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-${formatCurrency(Number(invoice.discountAmount), invoice.currency)}</span>
            </div>
            ` : ''}
            <div class="total-row total">
              <span>Total Amount:</span>
              <span>${formatCurrency(Number(invoice.totalAmount), invoice.currency)}</span>
            </div>
            ${Number(invoice.paidAmount) > 0 ? `
            <div class="total-row">
              <span>Paid Amount:</span>
              <span>${formatCurrency(Number(invoice.paidAmount), invoice.currency)}</span>
            </div>
            ` : ''}
            ${Number(invoice.balanceAmount) > 0 ? `
            <div class="total-row" style="color: #dc2626; font-weight: 600;">
              <span>Balance Due:</span>
              <span>${formatCurrency(Number(invoice.balanceAmount), invoice.currency)}</span>
            </div>
            ` : ''}
          </div>

          ${invoice.notes ? `
          <div style="margin: 25px 0; padding: 15px; background: #f9fafb; border-radius: 4px; border-left: 3px solid #2563eb;">
            <div style="font-size: 12px; font-weight: 600; color: #1e40af; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Notes</div>
            <div style="font-size: 13px; color: #111827; white-space: pre-wrap;">${invoice.notes}</div>
          </div>
          ` : ''}

          ${invoice.payments && invoice.payments.length > 0 ? `
          <div class="payments-section">
            <h3 style="font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
              Payment History
            </h3>
            ${paymentsHtml}
          </div>
          ` : ''}

          <div class="footer">
            <div>Generated: ${currentDate}</div>
            <div style="margin-top: 5px;">Bluequee2.0 - Electronic Health Record System</div>
            <div style="margin-top: 5px; font-size: 10px;">This is an official invoice document. Please retain for your records.</div>
            <div style="margin-top: 5px; font-size: 10px;">Confidential Medical Document - For Authorized Personnel Only</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Invoice Details</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{invoice.invoiceNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Patient Information</h3>
            <div className="space-y-1 text-sm">
              <div className="text-gray-900 dark:text-gray-100 font-medium">{invoice.patient?.name}</div>
              {invoice.patient?.email && (
                <div className="text-gray-600 dark:text-gray-400">{invoice.patient.email}</div>
              )}
              {invoice.patient?.phone && (
                <div className="text-gray-600 dark:text-gray-400">{invoice.patient.phone}</div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Invoice Information</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Issue Date:</span>
                <span className="text-gray-900 dark:text-gray-100">{new Date(invoice.issueDate).toLocaleDateString()}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                  <span className="text-gray-900 dark:text-gray-100">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="text-gray-900 dark:text-gray-100 capitalize">{invoice.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item) => {
                    if (!item || !item.id) return null;
                    return (
                      <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-sm text-gray-900 dark:text-gray-100">{item.description || "N/A"}</td>
                        <td className="py-2 text-sm text-right text-gray-700 dark:text-gray-300">{item.quantity || 0}</td>
                        <td className="py-2 text-sm text-right text-gray-700 dark:text-gray-300">
                          {formatCurrency(Number(item.unitPrice || 0), invoice.currency)}
                        </td>
                        <td className="py-2 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(Number(item.totalAmount || 0), invoice.currency)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(Number(invoice.subtotal), invoice.currency)}</span>
            </div>
            {Number(invoice.taxAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <span className="text-gray-900 dark:text-gray-100">{formatCurrency(Number(invoice.taxAmount), invoice.currency)}</span>
              </div>
            )}
            {Number(invoice.discountAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                <span className="text-gray-900 dark:text-gray-100">-{formatCurrency(Number(invoice.discountAmount), invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-gray-100">Total:</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(Number(invoice.totalAmount), invoice.currency)}</span>
            </div>
            {Number(invoice.paidAmount) > 0 && (
              <div className="flex justify-between text-sm pt-2">
                <span className="text-gray-600 dark:text-gray-400">Paid:</span>
                <span className="text-gray-900 dark:text-gray-100">{formatCurrency(Number(invoice.paidAmount), invoice.currency)}</span>
              </div>
            )}
            {Number(invoice.balanceAmount) > 0 && (
              <div className="flex justify-between text-sm font-semibold pt-2">
                <span className="text-gray-700 dark:text-gray-300">Balance:</span>
                <span className="text-red-600 dark:text-red-400">{formatCurrency(Number(invoice.balanceAmount), invoice.currency)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Button */}
        {Number(invoice.balanceAmount) > 0 && invoice.status !== "cancelled" && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {!showPaymentForm ? (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <DollarSign size={16} />
                Record Payment
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={Number(invoice.balanceAmount)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Balance: {formatCurrency(Number(invoice.balanceAmount), invoice.currency)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as Payment["paymentMethod"])}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="insurance">Insurance</option>
                    <option value="check">Check</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePayment}
                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > Number(invoice.balanceAmount)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Record Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentForm(false);
                      setPaymentAmount("");
                      setPaymentNotes("");
                    }}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payments History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment History</h3>
            <div className="space-y-2">
              {invoice.payments.map((payment) => {
                if (!payment || !payment.id) return null;
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(Number(payment.amount || 0), payment.currency || invoice.currency)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.paymentMethod?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown"} • {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "N/A"}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                      payment.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {payment.status || "unknown"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CreateInvoiceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateInvoiceForm({ onClose, onSuccess }: CreateInvoiceFormProps) {
  const { patients } = useDashboard();
  const [patientId, setPatientId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<CreateInvoiceItemData[]>([
    { description: "", quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const calculateItemTotal = (item: CreateInvoiceItemData): number => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.unitPrice || 0);
    const discount = Number(item.discount || 0);
    const taxRate = Number(item.taxRate || 0);
    
    const subtotal = qty * price;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * (taxRate / 100);
    return afterDiscount + tax;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.unitPrice || 0);
      return sum + (qty * price);
    }, 0);
    
    const totalDiscount = items.reduce((sum, item) => sum + Number(item.discount || 0), 0);
    const totalTax = items.reduce((sum, item) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.unitPrice || 0);
      const discount = Number(item.discount || 0);
      const taxRate = Number(item.taxRate || 0);
      const afterDiscount = (qty * price) - discount;
      return sum + (afterDiscount * (taxRate / 100));
    }, 0);
    
    const total = subtotal - totalDiscount + totalTax;
    
    return { subtotal, discountAmount: totalDiscount, taxAmount: totalTax, totalAmount: total };
  };

  const totals = calculateTotals();

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof CreateInvoiceItemData, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!patientId) {
      setError("Please select a patient");
      return;
    }

    if (items.some(item => !item.description || Number(item.unitPrice || 0) <= 0)) {
      setError("Please fill in all item details (description and price required)");
      return;
    }

    setIsSubmitting(true);
    try {
      const invoiceData: CreateInvoiceData = {
        patientId,
        currency,
        issueDate,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        items: items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity || 1),
          unitPrice: Number(item.unitPrice || 0),
          taxRate: Number(item.taxRate || 0),
          discount: Number(item.discount || 0),
          serviceCode: item.serviceCode,
          category: item.category,
        })),
      };

      await billingService.createInvoice(invoiceData);
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create invoice. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Invoice</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create a new invoice for a patient</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <XCircle size={20} />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Patient Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Patient <span className="text-red-500">*</span>
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="NGN">NGN (₦)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Invoice Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Invoice Items <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus size={14} />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      required
                      placeholder="Service or item description"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity || 1}
                      onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 1)}
                      min="1"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Unit Price</label>
                    <input
                      type="number"
                      value={item.unitPrice || 0}
                      onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={item.taxRate || 0}
                      onChange={(e) => handleItemChange(index, "taxRate", parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Discount</label>
                    <input
                      type="number"
                      value={item.discount || 0}
                      onChange={(e) => handleItemChange(index, "discount", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-12 md:col-span-2 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(calculateItemTotal(item), currency)}
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes for this invoice..."
          />
        </div>

        {/* Totals Summary */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(totals.subtotal, currency)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                <span className="text-gray-900 dark:text-gray-100">-{formatCurrency(totals.discountAmount, currency)}</span>
              </div>
            )}
            {totals.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <span className="text-gray-900 dark:text-gray-100">{formatCurrency(totals.taxAmount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-gray-100">Total:</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(totals.totalAmount, currency)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Invoice"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Billing() {
  const [view, setView] = useState<"list" | "detail" | "create">("list");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setView("detail");
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setView("create");
  };

  const handleInvoiceCreated = () => {
    setView("list");
    // The InvoiceList will reload automatically via useEffect
  };

  const handlePayment = async (paymentData: CreatePaymentData) => {
    try {
      await billingService.createPayment(paymentData);
      // Reload invoice
      if (selectedInvoice) {
        const response = await billingService.getInvoice(selectedInvoice.id);
        if (response.data) {
          setSelectedInvoice(response.data);
        }
      }
      // Show success message - payment recorded
      // The invoice will be reloaded automatically
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("Payment error:", error.message);
      } else {
        console.error("Payment error:", error);
      }
    }
  };

  if (view === "detail" && selectedInvoice) {
    return (
      <div className="section-spacing">
        <InvoiceDetail invoice={selectedInvoice} onClose={() => setView("list")} onPayment={handlePayment} />
      </div>
    );
  }

  if (view === "create") {
    return (
      <div className="section-spacing">
        <CreateInvoiceForm onClose={() => setView("list")} onSuccess={handleInvoiceCreated} />
      </div>
    );
  }

  return (
    <div className="section-spacing">
      <InvoiceList onSelectInvoice={handleSelectInvoice} onCreateInvoice={handleCreateInvoice} />
    </div>
  );
}

