// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Invoice Editor Modal Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  Receipt,
  User,
  DollarSign,
  Calendar,
  FileText,
  Search,
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

interface UserOption {
  id: string;
  email: string;
  fullName: string;
  planId: string;
}

interface InvoiceEditorModalProps {
  invoice: Invoice | null;
  isEdit: boolean;
  onClose: () => void;
  onSave: (data: Partial<Invoice>) => Promise<void>;
}

const PLANS = [
  { id: 'explorer', name: 'Explorer', price: 0 },
  { id: 'professional', name: 'Professional', price: 49 },
  { id: 'business', name: 'Business', price: 199 },
  { id: 'investor', name: 'Investor', price: 499 },
  { id: 'institutional', name: 'Institutional', price: 1999 },
];

const STATUSES = [
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function InvoiceEditorModal({ invoice, isEdit, onClose, onSave }: InvoiceEditorModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    user_id: invoice?.userId || '',
    userEmail: invoice?.userEmail || '',
    userName: invoice?.userName || '',
    plan_id: invoice?.planId || 'professional',
    amount: invoice?.amount?.toString() || '49',
    currency: invoice?.currency || 'USD',
    status: invoice?.status || 'draft',
    invoice_date: invoice?.invoiceDate || today,
    due_date: invoice?.dueDate || defaultDueDate,
    paid_date: invoice?.paidDate || '',
    payment_method: invoice?.paymentMethod || '',
    notes: invoice?.notes || '',
  });

  useEffect(() => {
    if (userSearch.length >= 2) {
      searchUsers(userSearch);
    } else {
      setUsers([]);
    }
  }, [userSearch]);

  const searchUsers = async (query: string) => {
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
            planId: u.plan_id,
          }))
        );
      }
    } catch (err) {
      console.error('[InvoiceEditor] Error searching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectUser = (user: UserOption) => {
    setFormData({
      ...formData,
      user_id: user.id,
      userEmail: user.email,
      userName: user.fullName,
    });
    setUserSearch('');
    setShowUserDropdown(false);
  };

  const handlePlanChange = (planId: string) => {
    const plan = PLANS.find((p) => p.id === planId);
    setFormData({
      ...formData,
      plan_id: planId,
      amount: plan?.price.toString() || formData.amount,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.user_id) {
      setError('Please select a user');
      return;
    }

    if (!formData.plan_id) {
      setError('Please select a plan');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 0) {
      setError('Amount must be a valid positive number');
      return;
    }

    if (new Date(formData.due_date) < new Date(formData.invoice_date)) {
      setError('Due date must be on or after invoice date');
      return;
    }

    if (formData.status === 'paid' && !formData.paid_date) {
      setError('Paid date is required when status is Paid');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        user_id: formData.user_id,
        plan_id: formData.plan_id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        status: formData.status as Invoice['status'],
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        paid_date: formData.paid_date || null,
        payment_method: formData.payment_method || null,
        notes: formData.notes || null,
      } as unknown as Partial<Invoice>);
    } catch (err) {
      console.error('[InvoiceEditor] Error saving:', err);
      setError('Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {isEdit ? 'Edit Invoice' : 'Create Invoice'}
              </h3>
              {isEdit && invoice && (
                <p className="text-xs text-zinc-500 font-mono">{invoice.invoiceNumber}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              User *
            </label>
            {formData.user_id ? (
              <div className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">{formData.userName}</p>
                  <p className="text-xs text-zinc-500">{formData.userEmail}</p>
                </div>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, user_id: '', userEmail: '', userName: '' })}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setShowUserDropdown(true);
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                {showUserDropdown && (userSearch.length >= 2 || users.length > 0) && (
                  <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {loadingUsers ? (
                      <div className="p-3 text-center text-zinc-400">
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Searching...
                      </div>
                    ) : users.length > 0 ? (
                      users.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="w-full px-4 py-2 text-left hover:bg-zinc-700 first:rounded-t-lg last:rounded-b-lg"
                        >
                          <p className="text-sm text-white">{user.fullName}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </button>
                      ))
                    ) : userSearch.length >= 2 ? (
                      <div className="p-3 text-center text-zinc-500 text-sm">
                        No users found
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Plan *</label>
            <select
              value={formData.plan_id}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} (${plan.price}/mo)
                </option>
              ))}
            </select>
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Due Date *</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Status (Edit only) */}
          {isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {STATUSES.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              {formData.status === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Paid Date *</label>
                  <input
                    type="date"
                    value={formData.paid_date}
                    onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              )}
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Payment Method</label>
            <input
              type="text"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              placeholder="e.g., Credit Card, Bank Transfer, PayPal"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this invoice..."
              rows={3}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? 'Update Invoice' : 'Create Invoice'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
