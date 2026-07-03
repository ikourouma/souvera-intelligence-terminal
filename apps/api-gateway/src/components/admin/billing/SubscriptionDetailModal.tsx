// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Subscription Detail Modal Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import {
  X,
  User,
  CreditCard,
  Calendar,
  Clock,
  ArrowUpRight,
  Check,
  Ban,
  History,
  FileText,
  RefreshCw,
  Mail,
  Building,
  DollarSign,
} from 'lucide-react';

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

interface ActivityLog {
  id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  method: string;
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

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'payments', label: 'Payment History', icon: CreditCard },
  { id: 'activity', label: 'Activity Log', icon: History },
] as const;

type TabId = typeof TABS[number]['id'];

interface SubscriptionDetailModalProps {
  subscription: Subscription;
  onClose: () => void;
  onAction: (action: 'cancel' | 'reactivate' | 'extend', subscription: Subscription) => void;
  onChangePlan: (subscription: Subscription) => void;
  actionLoading: boolean;
}

export function SubscriptionDetailModal({
  subscription,
  onClose,
  onAction,
  onChangePlan,
  actionLoading,
}: SubscriptionDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const planBadge = PLAN_BADGES[subscription.plan] || PLAN_BADGES.explorer;
  const statusBadge = STATUS_BADGES[subscription.status] || STATUS_BADGES.active;

  useEffect(() => {
    async function fetchDetails() {
      setLoadingData(true);
      try {
        const response = await fetch(`/api/v1/admin/billing/subscriptions/${subscription.id}/details`);
        if (response.ok) {
          const data = await response.json();
          setActivityLog(data.activityLog || []);
          setPaymentHistory(data.paymentHistory || []);
        }
      } catch (error) {
        console.error('[SubscriptionDetail] Error fetching details:', error);
      } finally {
        setLoadingData(false);
      }
    }

    fetchDetails();
  }, [subscription.id]);

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateNextRenewal = () => {
    if (subscription.status !== 'active' || !subscription.startDate) return null;
    
    const start = new Date(subscription.startDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    
    if (subscription.billingCycle === 'annual') {
      const yearsDiff = Math.floor(monthsDiff / 12) + 1;
      const nextRenewal = new Date(start);
      nextRenewal.setFullYear(start.getFullYear() + yearsDiff);
      return nextRenewal;
    } else {
      const nextRenewal = new Date(start);
      nextRenewal.setMonth(start.getMonth() + monthsDiff + 1);
      return nextRenewal;
    }
  };

  const nextRenewal = calculateNextRenewal();

  const formatActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'subscription_cancel': 'Subscription Cancelled',
      'subscription_reactivate': 'Subscription Reactivated',
      'subscription_extend': 'Subscription Extended',
      'plan_changed': 'Plan Changed',
      'user_created': 'Account Created',
      'user_login': 'User Login',
    };
    return labels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{subscription.fullName}</h3>
              <p className="text-sm text-zinc-500">{subscription.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800/30 border-b border-zinc-800">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${planBadge.bg} ${planBadge.text}`}>
            {planBadge.label}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
            {statusBadge.label}
          </span>
          <span className="text-sm text-zinc-400">
            {formatCurrency(subscription.amount)}/{subscription.billingCycle === 'annual' ? 'yr' : 'mo'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-zinc-800">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-white bg-zinc-800 border-b-2 border-indigo-500 -mb-px'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-400" />
                  User Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Full Name</p>
                    <p className="text-sm text-white">{subscription.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Email</p>
                    <p className="text-sm text-white">{subscription.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">User ID</p>
                    <p className="text-sm text-zinc-400 font-mono text-xs">{subscription.userId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Current Tier</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${planBadge.bg} ${planBadge.text}`}>
                      {planBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Timeline */}
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  Subscription Timeline
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Start Date</p>
                    <p className="text-sm text-white">{formatDate(subscription.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">End Date</p>
                    <p className="text-sm text-white">{formatDate(subscription.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Last Payment</p>
                    <p className="text-sm text-white">{formatDate(subscription.lastPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Next Renewal</p>
                    <p className="text-sm text-white">
                      {nextRenewal ? formatDate(nextRenewal.toISOString()) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Billing Details */}
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-zinc-400" />
                  Billing Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Amount</p>
                    <p className="text-sm text-white">{formatCurrency(subscription.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Billing Cycle</p>
                    <p className="text-sm text-white capitalize">{subscription.billingCycle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Annual Value</p>
                    <p className="text-sm text-white">
                      {formatCurrency(subscription.billingCycle === 'annual' ? subscription.amount : subscription.amount * 12)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              {loadingData ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-zinc-800/30 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-zinc-700 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-zinc-700 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="bg-zinc-800/30 rounded-lg p-8 text-center">
                  <CreditCard className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No payment history available</p>
                  <p className="text-xs text-zinc-500 mt-1">Payment records will appear here once processed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="bg-zinc-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            payment.status === 'completed' ? 'bg-emerald-500/20' :
                            payment.status === 'pending' ? 'bg-amber-500/20' : 'bg-red-500/20'
                          }`}>
                            {payment.status === 'completed' ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : payment.status === 'pending' ? (
                              <Clock className="w-4 h-4 text-amber-400" />
                            ) : (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {formatDate(payment.date)} · {payment.method}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          payment.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {loadingData ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-zinc-800/30 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-zinc-700 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-zinc-700 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : activityLog.length === 0 ? (
                <div className="bg-zinc-800/30 rounded-lg p-8 text-center">
                  <History className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No activity recorded</p>
                  <p className="text-xs text-zinc-500 mt-1">Activity events will be logged here</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800" />
                  <div className="space-y-4">
                    {activityLog.map((activity, index) => (
                      <div key={activity.id} className="relative pl-10">
                        <div className="absolute left-2.5 w-3 h-3 bg-zinc-700 rounded-full border-2 border-zinc-900" />
                        <div className="bg-zinc-800/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-white">
                              {formatActionLabel(activity.action)}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {formatDateTime(activity.created_at)}
                            </p>
                          </div>
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-zinc-700">
                              {Object.entries(activity.details).map(([key, value]) => (
                                <p key={key} className="text-xs text-zinc-400">
                                  <span className="text-zinc-500">{key.replace(/_/g, ' ')}:</span>{' '}
                                  {typeof value === 'string' ? value : JSON.stringify(value)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-zinc-800 bg-zinc-800/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChangePlan(subscription)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              Change Plan
            </button>
            <button
              onClick={() => onAction('extend', subscription)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Extend 30 Days
            </button>
          </div>
          <div className="flex items-center gap-2">
            {subscription.status === 'active' ? (
              <button
                onClick={() => onAction('cancel', subscription)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                Cancel
              </button>
            ) : subscription.status === 'cancelled' ? (
              <button
                onClick={() => onAction('reactivate', subscription)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Reactivate
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
