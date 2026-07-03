// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Plans Management Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Edit,
  Plus,
  X,
  Save,
  CreditCard,
  AlertCircle,
  Loader2,
  Building2,
  Users,
  Globe,
  Shield,
  ChevronUp,
  ChevronDown,
  Check,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  rank: number;
  description: string | null;
  is_public: boolean;
  is_enterprise: boolean;
  created_at: string;
  entitlement_count?: number;
  subscription_count?: number;
}

interface Entitlement {
  key: string;
  label: string;
  description: string | null;
}

export function PlansClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanEntitlements, setSelectedPlanEntitlements] = useState<string[]>([]);
  const [showEntitlements, setShowEntitlements] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/matrix/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
        setEntitlements(data.entitlements || []);
      }
    } catch (err) {
      console.error('[Plans] Fetch error:', err);
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreateNew = () => {
    setEditingPlan({
      id: '',
      name: '',
      rank: Math.max(...plans.map(p => p.rank), 0) + 10,
      description: '',
      is_public: false,
      is_enterprise: false,
    });
    setSelectedPlanEntitlements([]);
    setIsNew(true);
    setShowEditor(true);
    setError(null);
  };

  const handleEdit = async (plan: Plan) => {
    setEditingPlan({ ...plan });
    setIsNew(false);
    setShowEditor(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/admin/matrix/plans/${plan.id}/entitlements`);
      if (response.ok) {
        const data = await response.json();
        setSelectedPlanEntitlements(data.entitlements?.map((e: { key: string }) => e.key) || []);
      }
    } catch (err) {
      console.error('[Plans] Fetch entitlements error:', err);
    }
  };

  const handleSave = async () => {
    if (!editingPlan?.id || !editingPlan?.name) {
      setError('Plan ID and Name are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = isNew
        ? '/api/v1/admin/matrix/plans'
        : `/api/v1/admin/matrix/plans/${editingPlan.id}`;

      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingPlan,
          entitlements: selectedPlanEntitlements,
        }),
      });

      if (response.ok) {
        fetchPlans();
        setShowEditor(false);
        setEditingPlan(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save plan');
      }
    } catch (err) {
      console.error('[Plans] Save error:', err);
      setError('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const toggleEntitlement = (key: string) => {
    setSelectedPlanEntitlements(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const updateEditingField = (field: string, value: unknown) => {
    setEditingPlan(prev => prev ? { ...prev, [field]: value } : null);
  };

  const getPlanTypeIcon = (plan: Plan) => {
    if (plan.is_public) return <Globe className="w-4 h-4 text-emerald-400" />;
    if (plan.is_enterprise) return <Building2 className="w-4 h-4 text-purple-400" />;
    return <Users className="w-4 h-4 text-indigo-400" />;
  };

  const getPlanTypeBadge = (plan: Plan) => {
    if (plan.is_public) return { label: 'Public', color: 'emerald' };
    if (plan.is_enterprise) return { label: 'Enterprise', color: 'purple' };
    return { label: 'Standard', color: 'indigo' };
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/matrix"
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Plans Management
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {plans.length} plans configured
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPlans}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Plan
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Plans List */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {plans.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Plans Yet</h3>
            <p className="text-zinc-500 mb-4">Create your first subscription plan.</p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Plan
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Entitlements</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {plans.sort((a, b) => a.rank - b.rank).map((plan) => {
                const badge = getPlanTypeBadge(plan);
                return (
                  <tr key={plan.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {getPlanTypeIcon(plan)}
                        <div>
                          <p className="text-sm font-medium text-white">{plan.name}</p>
                          <p className="text-xs text-zinc-500 font-mono">{plan.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-zinc-400 font-mono">{plan.rank}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-${badge.color}-500/10 text-${badge.color}-400`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setShowEntitlements(showEntitlements === plan.id ? null : plan.id)}
                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {plan.entitlement_count || 0} entitlements
                        {showEntitlements === plan.id ? (
                          <ChevronUp className="inline w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="inline w-4 h-4 ml-1" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-400">Plan Hierarchy</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Plans are ordered by rank. Higher rank plans inherit access from lower rank plans.
              The rank determines the order in which plans are displayed and which features users can access.
            </p>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && editingPlan && (
        <PlanEditorModal
          plan={editingPlan}
          entitlements={entitlements}
          selectedEntitlements={selectedPlanEntitlements}
          isNew={isNew}
          saving={saving}
          error={error}
          onClose={() => {
            setShowEditor(false);
            setEditingPlan(null);
            setError(null);
          }}
          onSave={handleSave}
          onChange={updateEditingField}
          onToggleEntitlement={toggleEntitlement}
        />
      )}
    </div>
  );
}

interface PlanEditorModalProps {
  plan: Partial<Plan>;
  entitlements: Entitlement[];
  selectedEntitlements: string[];
  isNew: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: unknown) => void;
  onToggleEntitlement: (key: string) => void;
}

function PlanEditorModal({
  plan,
  entitlements,
  selectedEntitlements,
  isNew,
  saving,
  error,
  onClose,
  onSave,
  onChange,
  onToggleEntitlement,
}: PlanEditorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">
            {isNew ? 'Create Plan' : 'Edit Plan'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Plan ID */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Plan ID *</label>
              <input
                type="text"
                value={plan.id || ''}
                onChange={(e) => onChange('id', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                placeholder="e.g., professional"
                disabled={!isNew}
                className={`w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${!isNew ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <p className="text-xs text-zinc-600 mt-1">Lowercase letters, numbers, underscores only</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Display Name *</label>
              <input
                type="text"
                value={plan.name || ''}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="e.g., Professional"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Rank */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Rank</label>
            <input
              type="number"
              value={plan.rank || 0}
              onChange={(e) => onChange('rank', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <p className="text-xs text-zinc-600 mt-1">Higher rank = more access. Standard increments: 10, 20, 30...</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
            <textarea
              value={plan.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Brief description of what this plan includes"
              rows={2}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Public Plan</p>
                <p className="text-xs text-zinc-500">Available without login</p>
              </div>
              <button
                onClick={() => onChange('is_public', !plan.is_public)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  plan.is_public ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    plan.is_public ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Enterprise Plan</p>
                <p className="text-xs text-zinc-500">For institutional clients</p>
              </div>
              <button
                onClick={() => onChange('is_enterprise', !plan.is_enterprise)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  plan.is_enterprise ? 'bg-purple-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    plan.is_enterprise ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Entitlements */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Entitlements ({selectedEntitlements.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto bg-zinc-800/30 rounded-lg border border-zinc-700/50 p-2">
              {entitlements.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No entitlements available</p>
              ) : (
                <div className="space-y-1">
                  {entitlements.map((ent) => (
                    <button
                      key={ent.key}
                      onClick={() => onToggleEntitlement(ent.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedEntitlements.includes(ent.key)
                          ? 'bg-indigo-500/20 border border-indigo-500/30'
                          : 'hover:bg-zinc-700/50 border border-transparent'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        selectedEntitlements.includes(ent.key)
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-zinc-600'
                      }`}>
                        {selectedEntitlements.includes(ent.key) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{ent.label}</p>
                        <p className="text-xs text-zinc-500 font-mono">{ent.key}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
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
                Save Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-800 rounded-lg" />
          <div>
            <div className="h-8 bg-zinc-800 rounded w-48 mb-2" />
            <div className="h-4 bg-zinc-800 rounded w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-zinc-800 rounded w-24" />
          <div className="h-10 bg-zinc-800 rounded w-28" />
        </div>
      </div>
      <div className="bg-zinc-800/50 rounded-xl">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-zinc-800">
            <div className="w-8 h-8 bg-zinc-700 rounded" />
            <div className="flex-1">
              <div className="h-4 bg-zinc-700 rounded w-32 mb-2" />
              <div className="h-3 bg-zinc-700 rounded w-20" />
            </div>
            <div className="h-8 bg-zinc-700 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
