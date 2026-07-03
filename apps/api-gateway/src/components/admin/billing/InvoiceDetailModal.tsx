// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Invoice Detail Modal Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import {
  X,
  Edit,
  Receipt,
  User,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  CreditCard,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoiceDate: string;
  dueDate: string;
  paidDate: string | null;
  paymentMethod: string | null;
  notes: string | null;
  lineItems: unknown[];
  createdAt: string;
  updatedAt: string;
}

interface InvoiceDetailModalProps {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
  onMarkAsPaid: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; icon: typeof Receipt; label: string; borderColor: string }
> = {
  draft: {
    bg: 'bg-zinc-500/20',
    text: 'text-zinc-400',
    icon: FileText,
    label: 'Draft',
    borderColor: 'border-zinc-500/30',
  },
  sent: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    icon: Clock,
    label: 'Sent',
    borderColor: 'border-blue-500/30',
  },
  paid: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    icon: CheckCircle,
    label: 'Paid',
    borderColor: 'border-emerald-500/30',
  },
  overdue: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    icon: AlertTriangle,
    label: 'Overdue',
    borderColor: 'border-red-500/30',
  },
  cancelled: {
    bg: 'bg-zinc-500/20',
    text: 'text-zinc-400',
    icon: X,
    label: 'Cancelled',
    borderColor: 'border-zinc-500/30',
  },
};

export function InvoiceDetailModal({
  invoice,
  onClose,
  onEdit,
  onMarkAsPaid,
}: InvoiceDetailModalProps) {
  const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue =
    invoice.status !== 'paid' &&
    invoice.status !== 'cancelled' &&
    new Date(invoice.dueDate) < new Date();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className={`p-6 border-b ${statusConfig.borderColor}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
                <Receipt className={`w-6 h-6 ${statusConfig.text}`} />
              </div>
              <div>
                <h3
                  className="text-xl font-bold text-white font-mono"
                  style={{ fontFamily: 'Space Grotesk, monospace' }}
                >
                  {invoice.invoiceNumber}
                </h3>
                <p className="text-sm text-zinc-500">Created {formatShortDate(invoice.createdAt)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}
            >
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </span>
            {isOverdue && invoice.status === 'sent' && (
              <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                <AlertTriangle className="w-3 h-3" />
                Payment Overdue
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Amount */}
          <div className="text-center py-4 bg-zinc-800/50 rounded-xl">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Total Amount
            </p>
            <p
              className="text-4xl font-bold text-white"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {formatCurrency(invoice.amount, invoice.currency)}
            </p>
          </div>

          {/* User Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Bill To</span>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-white font-medium">{invoice.userName}</p>
              <p className="text-sm text-zinc-400">{invoice.userEmail}</p>
              <p className="text-xs text-zinc-500 mt-1">
                Plan: <span className="text-zinc-400">{invoice.planName}</span>
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Invoice Date</span>
              </div>
              <p className="text-sm text-white">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Due Date</span>
              </div>
              <p className={`text-sm ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>

          {/* Payment Info (if paid) */}
          {invoice.status === 'paid' && invoice.paidDate && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Payment Received</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Paid On</p>
                  <p className="text-sm text-white">{formatShortDate(invoice.paidDate)}</p>
                </div>
                {invoice.paymentMethod && (
                  <div>
                    <p className="text-xs text-zinc-500">Method</p>
                    <p className="text-sm text-white flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {invoice.paymentMethod}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-400">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Notes</span>
              </div>
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-zinc-600 space-y-1">
            <p>Invoice ID: {invoice.id}</p>
            <p>Last Updated: {formatShortDate(invoice.updatedAt)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <button
                onClick={onMarkAsPaid}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Paid
              </button>
            )}
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
