// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Create Subscription Modal Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  User,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';

interface UserOption {
  id: string;
  email: string;
  fullName: string;
  currentPlan: string;
}

const PLANS = [
  { id: 'explorer', name: 'Explorer', price: 0 },
  { id: 'professional', name: 'Professional', price: 49 },
  { id: 'business', name: 'Business', price: 199 },
  { id: 'investor', name: 'Investor', price: 499 },
  { id: 'institutional', name: 'Institutional', price: 1999 },
];

const PLAN_BADGES: Record<string, { bg: string; text: string }> = {
  explorer: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  professional: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  business: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  investor: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  institutional: { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
};

interface CreateSubscriptionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSubscriptionModal({ onClose, onSuccess }: CreateSubscriptionModalProps) {
  const [step, setStep] = useState<'user' | 'plan' | 'review'>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }

    setLoadingUsers(true);
    try {
      const response = await fetch(`/api/v1/admin/users?search=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setUsers(
          (data.users || []).map((u: { id: string; email: string; full_name: string; plan_id: string }) => ({
            id: u.id,
            email: u.email,
            fullName: u.full_name || 'Unknown',
            currentPlan: u.plan_id || 'explorer',
          }))
        );
      }
    } catch (err) {
      console.error('[CreateSubscription] Search error:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, searchUsers]);

  const calculateEndDate = () => {
    const start = new Date(startDate);
    if (billingCycle === 'annual') {
      start.setFullYear(start.getFullYear() + duration);
    } else {
      start.setMonth(start.getMonth() + duration);
    }
    return start.toISOString().split('T')[0];
  };

  const calculateAmount = () => {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    if (!plan) return 0;
    return billingCycle === 'annual' ? plan.price * 12 * 0.8 : plan.price; // 20% discount for annual
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/admin/billing/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          plan: selectedPlan,
          billingCycle,
          startDate,
          endDate: calculateEndDate(),
          amount: calculateAmount(),
          notes,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create subscription');
      }
    } catch (err) {
      console.error('[CreateSubscription] Submit error:', err);
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Create Subscription</h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              {step === 'user' && 'Step 1: Select User'}
              {step === 'plan' && 'Step 2: Configure Plan'}
              {step === 'review' && 'Step 3: Review & Confirm'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/20 border-b border-zinc-800">
          {['user', 'plan', 'review'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === s
                    ? 'bg-indigo-600 text-white'
                    : ['plan', 'review'].indexOf(step) > i
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-700 text-zinc-400'
                }`}
              >
                {['plan', 'review'].indexOf(step) > i ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${['plan', 'review'].indexOf(step) > i ? 'bg-emerald-500' : 'bg-zinc-700'}`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Select User */}
          {step === 'user' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Search for User</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              {loadingUsers && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                </div>
              )}

              {!loadingUsers && searchQuery.length >= 2 && users.length === 0 && (
                <div className="text-center py-8 text-zinc-500">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              )}

              {users.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Results</p>
                  {users.map((user) => {
                    const badge = PLAN_BADGES[user.currentPlan] || PLAN_BADGES.explorer;
                    return (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          selectedUser?.id === user.id
                            ? 'bg-indigo-600/20 border-indigo-500'
                            : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="w-9 h-9 bg-zinc-700 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">{user.fullName}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {user.currentPlan.charAt(0).toUpperCase() + user.currentPlan.slice(1)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedUser && (
                <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <p className="text-xs text-indigo-400 mb-1">Selected User</p>
                  <p className="text-sm font-medium text-white">{selectedUser.fullName}</p>
                  <p className="text-xs text-zinc-400">{selectedUser.email}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configure Plan */}
          {step === 'plan' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">Select Plan</label>
                <div className="space-y-2">
                  {PLANS.map((plan) => {
                    const badge = PLAN_BADGES[plan.id];
                    return (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          selectedPlan === plan.id
                            ? 'bg-indigo-600/20 border-indigo-500'
                            : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${badge.bg.replace('/20', '')}`} />
                          <span className="text-sm font-medium text-white">{plan.name}</span>
                        </div>
                        <span className="text-sm text-zinc-400">${plan.price}/mo</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">Billing Cycle</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      billingCycle === 'monthly'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <p className="text-sm font-medium">Monthly</p>
                    <p className="text-xs text-zinc-500 mt-1">Billed every month</p>
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      billingCycle === 'annual'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <p className="text-sm font-medium">Annual</p>
                    <p className="text-xs text-emerald-400 mt-1">Save 20%</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Duration ({billingCycle === 'annual' ? 'Years' : 'Months'})
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {[1, 2, 3, 6, 12].map((d) => (
                      <option key={d} value={d}>
                        {d} {billingCycle === 'annual' ? (d === 1 ? 'year' : 'years') : (d === 1 ? 'month' : 'months')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any internal notes about this subscription..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && selectedUser && selectedPlanData && (
            <div className="space-y-4">
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-400" />
                  User
                </h4>
                <p className="text-sm text-white">{selectedUser.fullName}</p>
                <p className="text-xs text-zinc-500">{selectedUser.email}</p>
              </div>

              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-zinc-400" />
                  Plan Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Plan</p>
                    <p className="text-sm text-white">{selectedPlanData.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Billing Cycle</p>
                    <p className="text-sm text-white capitalize">{billingCycle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Start Date</p>
                    <p className="text-sm text-white">{startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">End Date</p>
                    <p className="text-sm text-white">{calculateEndDate()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-zinc-400" />
                  Pricing
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">
                      ${selectedPlanData.price}/mo × {duration} {billingCycle === 'annual' ? 'year(s)' : 'month(s)'}
                    </p>
                    {billingCycle === 'annual' && (
                      <p className="text-xs text-emerald-400">20% annual discount applied</p>
                    )}
                  </div>
                  <p className="text-xl font-bold text-white">
                    ${calculateAmount().toFixed(2)}
                  </p>
                </div>
              </div>

              {notes && (
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Notes</h4>
                  <p className="text-sm text-zinc-400">{notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-zinc-800">
          {step !== 'user' ? (
            <button
              onClick={() => setStep(step === 'review' ? 'plan' : 'user')}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}

          {step === 'user' && (
            <button
              onClick={() => setStep('plan')}
              disabled={!selectedUser}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          )}

          {step === 'plan' && (
            <button
              onClick={() => setStep('review')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              Review
            </button>
          )}

          {step === 'review' && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Subscription
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
