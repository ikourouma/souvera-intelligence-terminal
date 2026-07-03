// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Invoices Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  MoreVertical,
  Receipt,
  Calendar,
  Download,
  FileSpreadsheet,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  X,
  DollarSign,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { InvoiceEditorModal } from './InvoiceEditorModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';

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

interface InvoiceStats {
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalRevenue: number;
  pendingRevenue: number;
}

const STATUS_BADGES: Record<string, { bg: string; text: string; icon: typeof Receipt; label: string }> = {
  draft: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', icon: FileText, label: 'Draft' },
  sent: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock, label: 'Sent' },
  paid: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle, label: 'Paid' },
  overdue: { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertTriangle, label: 'Overdue' },
  cancelled: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', icon: X, label: 'Cancelled' },
};

const ITEMS_PER_PAGE = 20;

export function InvoicesClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/v1/admin/billing/invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setTotalCount(data.pagination?.total || 0);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('[Invoices] Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowExportMenu(false);
      setShowActionMenu(null);
    };
    if (showExportMenu || showActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu, showActionMenu]);

  const handleCreateNew = () => {
    setSelectedInvoice(null);
    setIsEditMode(false);
    setShowEditorModal(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditMode(true);
    setShowEditorModal(true);
    setShowActionMenu(null);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
    setShowActionMenu(null);
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/billing/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
        }),
      });

      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error('[Invoices] Error marking as paid:', error);
    } finally {
      setActionLoading(false);
      setShowActionMenu(null);
    }
  };

  const handleCancel = async (invoice: Invoice) => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/billing/invoices/${invoice.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error('[Invoices] Error cancelling:', error);
    } finally {
      setActionLoading(false);
      setShowActionMenu(null);
    }
  };

  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      if (isEditMode && selectedInvoice) {
        const response = await fetch(`/api/v1/admin/billing/invoices/${selectedInvoice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoiceData),
        });
        if (response.ok) {
          fetchInvoices();
          setShowEditorModal(false);
        }
      } else {
        const response = await fetch('/api/v1/admin/billing/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoiceData),
        });
        if (response.ok) {
          fetchInvoices();
          setShowEditorModal(false);
        }
      }
    } catch (error) {
      console.error('[Invoices] Error saving:', error);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const exportToCSV = async (exportAll: boolean) => {
    setExporting(true);
    setShowExportMenu(false);

    try {
      let dataToExport = invoices;

      if (exportAll) {
        const params = new URLSearchParams({
          page: '1',
          limit: '10000',
          ...(searchQuery && { search: searchQuery }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
        });

        const response = await fetch(`/api/v1/admin/billing/invoices?${params}`);
        if (response.ok) {
          const data = await response.json();
          dataToExport = data.invoices || [];
        }
      }

      const headers = ['Invoice #', 'User Email', 'User Name', 'Plan', 'Amount', 'Currency', 'Status', 'Invoice Date', 'Due Date', 'Paid Date', 'Payment Method'];
      const rows = dataToExport.map((inv: Invoice) => [
        inv.invoiceNumber,
        inv.userEmail,
        inv.userName,
        inv.planName,
        inv.amount.toFixed(2),
        inv.currency,
        inv.status,
        inv.invoiceDate,
        inv.dueDate,
        inv.paidDate || '',
        inv.paymentMethod || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('[Invoices] Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/billing"
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Invoice Management
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {totalCount} total invoices
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchInvoices}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExportMenu(!showExportMenu);
              }}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${exporting ? 'animate-pulse' : ''}`} />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => exportToCSV(false)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-zinc-300 hover:bg-zinc-700 rounded-t-lg"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Current Page
                </button>
                <button
                  onClick={() => exportToCSV(true)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-zinc-300 hover:bg-zinc-700 rounded-b-lg"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export All ({totalCount})
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Receipt className="w-4 h-4" />
              <span className="text-xs font-medium">Total Invoices</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.totalInvoices}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Paid</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.totalPaid}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Pending</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.totalPending}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Overdue</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.totalOverdue}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Total Revenue</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Pending Revenue</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(stats.pendingRevenue)}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by invoice number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters || statusFilter !== 'all'
              ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
              : 'border-zinc-700/50 bg-zinc-800/50 text-zinc-400 hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {statusFilter !== 'all' && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded">
              1
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {statusFilter !== 'all' && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
                className="self-end px-3 py-2 text-sm text-zinc-400 hover:text-white"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <LoadingSkeleton />
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Invoices Found</h3>
            <p className="text-zinc-500 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'No invoices match your search criteria.'
                : 'Create your first invoice to get started.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Invoice
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {invoices.map((invoice) => {
                    const statusBadge = STATUS_BADGES[invoice.status] || STATUS_BADGES.draft;
                    const StatusIcon = statusBadge.icon;

                    return (
                      <tr key={invoice.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                              <Receipt className="w-5 h-5 text-zinc-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white font-mono">
                                {invoice.invoiceNumber}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {formatDate(invoice.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-white">{invoice.userName}</p>
                          <p className="text-xs text-zinc-500">{invoice.userEmail}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-white">{invoice.planName}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-white">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(invoice.invoiceDate)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Due: {formatDate(invoice.dueDate)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(showActionMenu === invoice.id ? null : invoice.id);
                              }}
                              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {showActionMenu === invoice.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10">
                                <button
                                  onClick={() => handleView(invoice)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-zinc-300 hover:bg-zinc-700 rounded-t-lg"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleEdit(invoice)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-zinc-300 hover:bg-zinc-700"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Invoice
                                </button>
                                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleMarkAsPaid(invoice)}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-emerald-400 hover:bg-zinc-700"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark as Paid
                                  </button>
                                )}
                                {invoice.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleCancel(invoice)}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-zinc-700 rounded-b-lg"
                                  >
                                    <X className="w-4 h-4" />
                                    Cancel Invoice
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
                <p className="text-sm text-zinc-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} invoices
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-zinc-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showEditorModal && (
        <InvoiceEditorModal
          invoice={isEditMode ? selectedInvoice : null}
          isEdit={isEditMode}
          onClose={() => {
            setShowEditorModal(false);
            setSelectedInvoice(null);
          }}
          onSave={handleSaveInvoice}
        />
      )}

      {showDetailModal && selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInvoice(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setIsEditMode(true);
            setShowEditorModal(true);
          }}
          onMarkAsPaid={() => {
            handleMarkAsPaid(selectedInvoice);
            setShowDetailModal(false);
          }}
        />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-zinc-800">
          <div className="w-10 h-10 bg-zinc-800 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-800 rounded w-32" />
            <div className="h-3 bg-zinc-800 rounded w-24" />
          </div>
          <div className="h-4 bg-zinc-800 rounded w-24" />
          <div className="h-4 bg-zinc-800 rounded w-20" />
          <div className="h-6 bg-zinc-800 rounded-full w-16" />
          <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
