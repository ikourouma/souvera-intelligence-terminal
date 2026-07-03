// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Pricing Display Management Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Edit,
  Eye,
  EyeOff,
  X,
  Save,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Loader2,
  Star,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface PricingPlan {
  plan_id: string;
  display_name: string;
  badge_text: string | null;
  badge_color: string | null;
  tagline: string | null;
  description: string | null;
  price_monthly: number;
  price_annual: number | null;
  features: string[];
  cta_text: string | null;
  cta_url: string | null;
  cta_style: 'primary' | 'outline' | 'ghost';
  is_featured: boolean;
  is_visible: boolean;
  show_price: boolean;
  display_order: number;
}

const CTA_STYLES = [
  { id: 'primary', label: 'Primary (Filled)' },
  { id: 'outline', label: 'Outline' },
  { id: 'ghost', label: 'Ghost (Text only)' },
];

const EMPTY_PLAN: Partial<PricingPlan> = {
  plan_id: '',
  display_name: '',
  badge_text: '',
  badge_color: '#2563EB',
  tagline: '',
  description: '',
  price_monthly: 0,
  price_annual: null,
  features: [],
  cta_text: 'Get Started',
  cta_url: '/access/request-access',
  cta_style: 'outline',
  is_featured: false,
  is_visible: true,
  show_price: true,
  display_order: 0,
};

export function PricingClient() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<PricingPlan> | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/marketing/pricing');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error('[Pricing] Fetch error:', err);
      setError('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan({ ...plan });
    setIsCreateMode(false);
    setShowEditor(true);
    setError(null);
  };

  const handleCreateNew = () => {
    setEditingPlan({ ...EMPTY_PLAN });
    setIsCreateMode(true);
    setShowEditor(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!editingPlan?.plan_id) {
      setError('Plan ID is required');
      return;
    }

    if (!editingPlan?.display_name) {
      setError('Display name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let response;
      
      if (isCreateMode) {
        response = await fetch('/api/v1/admin/marketing/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingPlan),
        });
      } else {
        response = await fetch(`/api/v1/admin/marketing/pricing/${editingPlan.plan_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingPlan),
        });
      }

      if (response.ok) {
        fetchPlans();
        setShowEditor(false);
        setEditingPlan(null);
        setIsCreateMode(false);
      } else {
        const data = await response.json();
        setError(data.error || `Failed to ${isCreateMode ? 'create' : 'save'} plan`);
      }
    } catch (err) {
      console.error('[Pricing] Save error:', err);
      setError(`Failed to ${isCreateMode ? 'create' : 'save'} plan`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisible = async (plan: PricingPlan) => {
    try {
      const response = await fetch(`/api/v1/admin/marketing/pricing/${plan.plan_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !plan.is_visible }),
      });

      if (response.ok) {
        fetchPlans();
      }
    } catch (err) {
      console.error('[Pricing] Toggle error:', err);
    }
  };

  const handleToggleFeatured = async (plan: PricingPlan) => {
    try {
      const response = await fetch(`/api/v1/admin/marketing/pricing/${plan.plan_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !plan.is_featured }),
      });

      if (response.ok) {
        fetchPlans();
      }
    } catch (err) {
      console.error('[Pricing] Featured toggle error:', err);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newPlans = [...plans];
    [newPlans[index - 1], newPlans[index]] = [newPlans[index], newPlans[index - 1]];
    await reorderPlans(newPlans);
  };

  const handleMoveDown = async (index: number) => {
    if (index === plans.length - 1) return;
    const newPlans = [...plans];
    [newPlans[index], newPlans[index + 1]] = [newPlans[index + 1], newPlans[index]];
    await reorderPlans(newPlans);
  };

  const reorderPlans = async (newPlans: PricingPlan[]) => {
    setPlans(newPlans);
    try {
      await fetch('/api/v1/admin/marketing/pricing/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newPlans.map(p => p.plan_id) }),
      });
    } catch (err) {
      console.error('[Pricing] Reorder error:', err);
      fetchPlans();
    }
  };

  const updateEditingField = (field: string, value: unknown) => {
    setEditingPlan(prev => prev ? { ...prev, [field]: value } : null);
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
            href="/admin/marketing"
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Pricing Display
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {plans.length} plans · {plans.filter(p => p.is_visible).length} visible
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
          <a
            href="/access"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </a>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Pricing Table
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, index) => (
          <div
            key={plan.plan_id}
            className={`bg-zinc-900/50 border rounded-xl overflow-hidden ${
              plan.is_featured ? 'border-indigo-500' : 'border-zinc-800'
            } ${!plan.is_visible ? 'opacity-50' : ''}`}
          >
            {/* Reorder Controls */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/30 border-b border-zinc-800">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <GripVertical className="w-4 h-4 text-zinc-600" />
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === plans.length - 1}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-zinc-500">#{index + 1}</span>
            </div>

            <div className="p-4">
              {/* Badge */}
              {plan.badge_text && (
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-2"
                  style={{ backgroundColor: (plan.badge_color || '#2563EB') + '20', color: plan.badge_color || '#2563EB' }}
                >
                  {plan.badge_text}
                </span>
              )}

              {/* Name & Price */}
              <h3 className="text-lg font-semibold text-white">{plan.display_name}</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">${plan.price_monthly}</span>
                <span className="text-sm text-zinc-500">/mo</span>
              </div>

              {/* Description */}
              {plan.description && (
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{plan.description}</p>
              )}

              {/* Features Preview */}
              <div className="mt-4 space-y-1">
                {(plan.features || []).slice(0, 3).map((feature, i) => (
                  <p key={i} className="text-xs text-zinc-400 truncate">• {feature}</p>
                ))}
                {(plan.features || []).length > 3 && (
                  <p className="text-xs text-zinc-500">+{plan.features.length - 3} more</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => handleToggleFeatured(plan)}
                  className={`p-2 rounded-lg transition-colors ${
                    plan.is_featured
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-zinc-500 hover:bg-zinc-700/50'
                  }`}
                  title={plan.is_featured ? 'Remove Featured' : 'Make Featured'}
                >
                  <Star className={`w-4 h-4 ${plan.is_featured ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => handleToggleVisible(plan)}
                  className={`p-2 rounded-lg transition-colors ${
                    plan.is_visible
                      ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-zinc-500 hover:bg-zinc-700/50'
                  }`}
                  title={plan.is_visible ? 'Hide' : 'Show'}
                >
                  {plan.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {showEditor && editingPlan && (
        <PricingEditorModal
          plan={editingPlan}
          saving={saving}
          error={error}
          isCreateMode={isCreateMode}
          onClose={() => {
            setShowEditor(false);
            setEditingPlan(null);
            setIsCreateMode(false);
            setError(null);
          }}
          onSave={handleSave}
          onChange={updateEditingField}
        />
      )}
    </div>
  );
}

interface PricingEditorModalProps {
  plan: Partial<PricingPlan>;
  saving: boolean;
  error: string | null;
  isCreateMode: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: unknown) => void;
}

function PricingEditorModal({ plan, saving, error, isCreateMode, onClose, onSave, onChange }: PricingEditorModalProps) {
  const [featureInput, setFeatureInput] = useState('');

  const addFeature = () => {
    if (featureInput.trim()) {
      onChange('features', [...(plan.features || []), featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(plan.features || [])];
    newFeatures.splice(index, 1);
    onChange('features', newFeatures);
  };

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    const newFeatures = [...(plan.features || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFeatures.length) return;
    [newFeatures[index], newFeatures[targetIndex]] = [newFeatures[targetIndex], newFeatures[index]];
    onChange('features', newFeatures);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">
            {isCreateMode ? 'Create New Pricing Plan' : `Edit ${plan.display_name}`}
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

          {/* Plan ID - only editable in create mode */}
          {isCreateMode && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Plan ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={plan.plan_id || ''}
                onChange={(e) => onChange('plan_id', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_'))}
                placeholder="e.g., trial_30_day, investor_pro"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
              />
              <p className="mt-1 text-xs text-zinc-500">Unique identifier, lowercase with underscores</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Display Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={plan.display_name || ''}
                onChange={(e) => onChange('display_name', e.target.value)}
                placeholder="e.g., 30-Day Trial"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Badge Text</label>
              <input
                type="text"
                value={plan.badge_text || ''}
                onChange={(e) => onChange('badge_text', e.target.value)}
                placeholder="e.g., Most Popular"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Badge Color */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Badge Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={plan.badge_color || '#2563EB'}
                onChange={(e) => onChange('badge_color', e.target.value)}
                className="w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer"
              />
              <input
                type="text"
                value={plan.badge_color || '#2563EB'}
                onChange={(e) => onChange('badge_color', e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
            <textarea
              value={plan.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Monthly Price ($)</label>
              <input
                type="number"
                value={plan.price_monthly || 0}
                onChange={(e) => onChange('price_monthly', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Annual Price ($)</label>
              <input
                type="number"
                value={plan.price_annual || ''}
                onChange={(e) => onChange('price_annual', parseFloat(e.target.value) || null)}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                placeholder="Add a feature"
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                onClick={addFeature}
                className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(plan.features || []).map((feature, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded-lg">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveFeature(i, 'up')}
                      disabled={i === 0}
                      className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-30"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveFeature(i, 'down')}
                      disabled={i === (plan.features?.length || 0) - 1}
                      className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-30"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="flex-1 text-sm text-white">{feature}</span>
                  <button
                    onClick={() => removeFeature(i)}
                    className="p-1 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">CTA Text</label>
              <input
                type="text"
                value={plan.cta_text || ''}
                onChange={(e) => onChange('cta_text', e.target.value)}
                placeholder="Get Started"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">CTA URL</label>
              <input
                type="text"
                value={plan.cta_url || ''}
                onChange={(e) => onChange('cta_url', e.target.value)}
                placeholder="/access"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">CTA Style</label>
              <select
                value={plan.cta_style || 'outline'}
                onChange={(e) => onChange('cta_style', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {CTA_STYLES.map((style) => (
                  <option key={style.id} value={style.id}>{style.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-1 flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Featured</p>
                  <p className="text-xs text-zinc-500">Highlight this plan</p>
                </div>
                <button
                  onClick={() => onChange('is_featured', !plan.is_featured)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    plan.is_featured ? 'bg-amber-500' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      plan.is_featured ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Visible</p>
                  <p className="text-xs text-zinc-500">Show plan on website</p>
                </div>
                <button
                  onClick={() => onChange('is_visible', !plan.is_visible)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    plan.is_visible ? 'bg-indigo-600' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      plan.is_visible ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Show Price</p>
                <p className="text-xs text-zinc-500">Display price on the pricing card (independent of visibility)</p>
              </div>
              <button
                onClick={() => onChange('show_price', plan.show_price !== false)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  plan.show_price !== false ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    plan.show_price !== false ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
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
                {isCreateMode ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              <>
                {isCreateMode ? <Plus className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isCreateMode ? 'Create Plan' : 'Save Plan'}
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
            <div className="h-8 bg-zinc-800 rounded w-40 mb-2" />
            <div className="h-4 bg-zinc-800 rounded w-24" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-zinc-800/50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
