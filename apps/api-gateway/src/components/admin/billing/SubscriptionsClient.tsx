// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Subscriptions Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  MoreVertical,
  Clock,
  CreditCard,
  User,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Check,
  Eye,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { SubscriptionDetailModal } from './SubscriptionDetailModal';
import { CreateSubscriptionModal } from './CreateSubscriptionModal';

interface Subscription {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  plan: string;
  status: 'active' | 'cancelled' | 'pending' | 'expired';
  startDate: string;
  endDate: string | null;
  amount: number;
  billingCycle: 'monthly' | 'annual';
  lastPayment: string | null;
}

const PLAN_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  explorer: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Explorer' },
  professional: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Professional' },
  business: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Business' },
  investor: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Investor' },
  institutional: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', label: 'Institutional' },
};

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Active' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
  pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Pending' },
  expired: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Expired' },
};

const ITEMS_PER_PAGE = 20;

export function SubscriptionsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(planFilter !== 'all' && { plan: planFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/v1/admin/billing/subscriptions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error('[Subscriptions] Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, planFilter, statusFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowExportMenu(false);
    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

  const handleAction = async (action: 'cancel' | 'reactivate' | 'extend', subscription: Subscription) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/billing/subscriptions/${subscription.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('[Subscriptions] Action error:', error);
    } finally {
      setActionLoading(false);
      setShowActionMenu(null);
    }
  };

  const handleChangePlan = async (newPlan: string) => {
    if (!selectedSubscription) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/billing/subscriptions/${selectedSubscription.id}/change-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlan }),
      });

      if (response.ok) {
        fetchSubscriptions();
        setShowChangePlanModal(false);
        setSelectedSubscription(null);
      }
    } catch (error) {
      console.error('[Subscriptions] Change plan error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const exportToCSV = async (exportAll: boolean) => {
    setExporting(true);
    setShowExportMenu(false);
    
    try {
      let dataToExport = subscriptions;
      
      if (exportAll) {
        // Fetch all subscriptions without pagination
        const params = new URLSearchParams({
          page: '1',
          limit: '10000', // Large limit to get all
          ...(searchQuery && { search: searchQuery }),
          ...(planFilter !== 'all' && { plan: planFilter }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
        });
        
        const response = await fetch(`/api/v1/admin/billing/subscriptions?${params}`);
        if (response.ok) {
          const data = await response.json();
          dataToExport = data.subscriptions || [];
        }
      }
      
      // Create CSV content
      const headers = ['Email', 'Full Name', 'Plan', 'Status', 'Amount', 'Billing Cycle', 'Start Date', 'End Date', 'Last Payment'];
      const rows = dataToExport.map((sub: Subscription) => [
        sub.email,
        sub.fullName,
        sub.plan,
        sub.status,
        sub.amount.toString(),
        sub.billingCycle,
        sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '',
        sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '',
        sub.lastPayment ? new Date(sub.lastPayment).toLocaleDateString() : '',
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map((cell: string) => `"${cell.replace(/"/g, '""')}"`).join(',')),
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `souvera-subscriptions-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[Export] Error:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
              Subscriptions
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {totalCount} total subscriptions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSubscriptions()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {/* Export Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 z-20">
                <button
                  onClick={() => exportToCSV(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Current View
                </button>
                <button
                  onClick={() => exportToCSV(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export All ({totalCount})
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Create Subscription
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-lg transition-colors ${
            showFilters
              ? 'text-white bg-indigo-600 border-indigo-500'
              : 'text-zinc-400 hover:text-white bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-700/50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Plan</label>
              <select
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="all">All Plans</option>
                <option value="explorer">Explorer</option>
                <option value="professional">Professional</option>
                <option value="business">Business</option>
                <option value="investor">Investor</option>
                <option value="institutional">Institutional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  End Date
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-4 bg-zinc-800 rounded w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 bg-zinc-800 rounded w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 bg-zinc-800 rounded w-16" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-zinc-800 rounded w-16" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-zinc-800 rounded w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-zinc-800 rounded w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-zinc-800 rounded w-8 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription) => {
                  const planBadge = PLAN_BADGES[subscription.plan] || PLAN_BADGES.explorer;
                  const statusBadge = STATUS_BADGES[subscription.status] || STATUS_BADGES.active;

                  return (
                    <tr key={subscription.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{subscription.fullName}</p>
                            <p className="text-xs text-zinc-500">{subscription.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${planBadge.bg} ${planBadge.text}`}>
                          {planBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white">{formatCurrency(subscription.amount)}</span>
                        <span className="text-xs text-zinc-500 ml-1">/{subscription.billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-zinc-400">{formatDate(subscription.startDate)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-zinc-400">{formatDate(subscription.endDate)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative flex justify-end">
                          <button
                            onClick={() => setShowActionMenu(showActionMenu === subscription.id ? null : subscription.id)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {showActionMenu === subscription.id && (
                            <div className="absolute right-0 top-8 z-10 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1">
                              <button
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setShowDetailModal(true);
                                  setShowActionMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setShowChangePlanModal(true);
                                  setShowActionMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-colors"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                                Change Plan
                              </button>
                              {subscription.status === 'active' ? (
                                <button
                                  onClick={() => handleAction('cancel', subscription)}
                                  disabled={actionLoading}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-700/50 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel Subscription
                                </button>
                              ) : subscription.status === 'cancelled' ? (
                                <button
                                  onClick={() => handleAction('reactivate', subscription)}
                                  disabled={actionLoading}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-zinc-700/50 transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                  Reactivate
                                </button>
                              ) : null}
                              <button
                                onClick={() => handleAction('extend', subscription)}
                                disabled={actionLoading}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-colors"
                              >
                                <Calendar className="w-4 h-4" />
                                Extend 30 Days
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Plan Modal */}
      {showChangePlanModal && selectedSubscription && (
        <ChangePlanModal
          subscription={selectedSubscription}
          onClose={() => {
            setShowChangePlanModal(false);
            setSelectedSubscription(null);
          }}
          onConfirm={handleChangePlan}
          loading={actionLoading}
        />
      )}

      {/* Subscription Detail Modal */}
      {showDetailModal && selectedSubscription && (
        <SubscriptionDetailModal
          subscription={selectedSubscription}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSubscription(null);
          }}
          onAction={(action, sub) => {
            handleAction(action, sub);
          }}
          onChangePlan={(sub) => {
            setShowDetailModal(false);
            setSelectedSubscription(sub);
            setShowChangePlanModal(true);
          }}
          actionLoading={actionLoading}
        />
      )}

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <CreateSubscriptionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchSubscriptions();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function ChangePlanModal({
  subscription,
  onClose,
  onConfirm,
  loading,
}: {
  subscription: Subscription;
  onClose: () => void;
  onConfirm: (plan: string) => void;
  loading: boolean;
}) {
  const [selectedPlan, setSelectedPlan] = useState(subscription.plan);

  const plans = [
    { id: 'explorer', name: 'Explorer', price: 0 },
    { id: 'professional', name: 'Professional', price: 49 },
    { id: 'business', name: 'Business', price: 199 },
    { id: 'investor', name: 'Investor', price: 499 },
    { id: 'institutional', name: 'Institutional', price: 1999 },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">Change Plan</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <p className="text-sm text-zinc-400">Changing plan for</p>
            <p className="text-white font-medium">{subscription.email}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Select New Plan</label>
            <div className="space-y-2">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-sm">${plan.price}/mo</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedPlan)}
            disabled={loading || selectedPlan === subscription.plan}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Confirm Change'}
          </button>
        </div>
      </div>
    </div>
  );
}
