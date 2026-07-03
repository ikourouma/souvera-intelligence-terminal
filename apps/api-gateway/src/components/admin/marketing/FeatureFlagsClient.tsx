// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Feature Flags Management Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  X,
  Save,
  ToggleLeft,
  AlertCircle,
  Loader2,
  Search,
  Globe,
  Lock,
  Users,
  Layers,
  AlertTriangle,
} from 'lucide-react';

interface FeatureFlag {
  flag_key: string;
  description: string | null;
  is_enabled: boolean;
  scope: 'global' | 'admin' | 'user' | 'tier';
  tier_restriction: string[] | null;
  metadata: Record<string, unknown>;
  updated_at: string | null;
}

const EMPTY_FLAG: Partial<FeatureFlag> = {
  flag_key: '',
  description: '',
  is_enabled: false,
  scope: 'global',
  tier_restriction: null,
  metadata: {},
};

const SCOPE_OPTIONS = [
  { id: 'global', label: 'Global', icon: Globe, description: 'Available to everyone' },
  { id: 'admin', label: 'Admin Only', icon: Lock, description: 'Only for admins' },
  { id: 'user', label: 'Authenticated Users', icon: Users, description: 'Logged in users only' },
  { id: 'tier', label: 'Tier-based', icon: Layers, description: 'Specific subscription tiers' },
];

const CRITICAL_FLAGS = ['maintenance_mode', 'payment_processing', 'api_access'];

export function FeatureFlagsClient() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingFlag, setEditingFlag] = useState<Partial<FeatureFlag> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/marketing/feature-flags');
      if (response.ok) {
        const data = await response.json();
        setFlags(data.flags || []);
      }
    } catch (err) {
      console.error('[FeatureFlags] Fetch error:', err);
      setError('Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleCreateNew = () => {
    setEditingFlag({ ...EMPTY_FLAG });
    setIsNew(true);
    setShowEditor(true);
    setError(null);
  };

  const handleEdit = (flag: FeatureFlag) => {
    setEditingFlag({ ...flag });
    setIsNew(false);
    setShowEditor(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!editingFlag?.flag_key) {
      setError('Flag key is required');
      return;
    }

    if (isNew && !/^[a-z_]+$/.test(editingFlag.flag_key)) {
      setError('Flag key must be lowercase letters and underscores only');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = isNew
        ? '/api/v1/admin/marketing/feature-flags'
        : `/api/v1/admin/marketing/feature-flags/${editingFlag.flag_key}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFlag),
      });

      if (response.ok) {
        fetchFlags();
        setShowEditor(false);
        setEditingFlag(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save flag');
      }
    } catch (err) {
      console.error('[FeatureFlags] Save error:', err);
      setError('Failed to save flag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (flag: FeatureFlag) => {
    if (CRITICAL_FLAGS.includes(flag.flag_key)) {
      setError('Cannot delete critical system flag');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${flag.flag_key}"?`)) return;

    try {
      const response = await fetch(`/api/v1/admin/marketing/feature-flags/${flag.flag_key}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFlags();
      } else {
        setError('Failed to delete flag');
      }
    } catch (err) {
      console.error('[FeatureFlags] Delete error:', err);
      setError('Failed to delete flag');
    }
  };

  const handleToggle = async (flag: FeatureFlag) => {
    const isCritical = CRITICAL_FLAGS.includes(flag.flag_key);
    
    if (isCritical && flag.is_enabled) {
      if (!confirm(`Warning: "${flag.flag_key}" is a critical system flag. Are you sure you want to disable it?`)) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/v1/admin/marketing/feature-flags/${flag.flag_key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !flag.is_enabled }),
      });

      if (response.ok) {
        fetchFlags();
      }
    } catch (err) {
      console.error('[FeatureFlags] Toggle error:', err);
    }
  };

  const updateEditingField = (field: string, value: unknown) => {
    setEditingFlag(prev => prev ? { ...prev, [field]: value } : null);
  };

  const filteredFlags = flags.filter(flag =>
    flag.flag_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              Feature Flags
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {flags.length} flags · {flags.filter(f => f.is_enabled).length} enabled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFlags}
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
            Add Flag
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search flags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
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

      {/* Flags Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {filteredFlags.length === 0 ? (
          <div className="p-12 text-center">
            <ToggleLeft className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchQuery ? 'No Matching Flags' : 'No Feature Flags Yet'}
            </h3>
            <p className="text-zinc-500 mb-4">
              {searchQuery ? 'Try a different search term.' : 'Create your first feature flag to get started.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Flag
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filteredFlags.map((flag) => {
              const ScopeIcon = SCOPE_OPTIONS.find(s => s.id === flag.scope)?.icon || Globe;
              const isCritical = CRITICAL_FLAGS.includes(flag.flag_key);

              return (
                <div
                  key={flag.flag_key}
                  className="flex items-center gap-4 p-4 hover:bg-zinc-800/20 transition-colors"
                >
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(flag)}
                    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                      flag.is_enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        flag.is_enabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>

                  {/* Flag Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-medium text-white font-mono">{flag.flag_key}</code>
                      {isCritical && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate">
                      {flag.description || 'No description'}
                    </p>
                  </div>

                  {/* Scope Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-xs text-zinc-400">
                      <ScopeIcon className="w-3 h-3" />
                      {flag.scope}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(flag)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(flag)}
                      disabled={isCritical}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={isCritical ? 'Cannot delete critical flag' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && editingFlag && (
        <FlagEditorModal
          flag={editingFlag}
          isNew={isNew}
          saving={saving}
          error={error}
          onClose={() => {
            setShowEditor(false);
            setEditingFlag(null);
            setError(null);
          }}
          onSave={handleSave}
          onChange={updateEditingField}
        />
      )}
    </div>
  );
}

interface FlagEditorModalProps {
  flag: Partial<FeatureFlag>;
  isNew: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: unknown) => void;
}

function FlagEditorModal({ flag, isNew, saving, error, onClose, onSave, onChange }: FlagEditorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">
            {isNew ? 'Create Feature Flag' : 'Edit Feature Flag'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Flag Key */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Flag Key *</label>
            <input
              type="text"
              value={flag.flag_key || ''}
              onChange={(e) => onChange('flag_key', e.target.value.toLowerCase().replace(/[^a-z_]/g, ''))}
              placeholder="e.g., enable_new_feature"
              disabled={!isNew}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono disabled:opacity-50"
            />
            {isNew && (
              <p className="text-xs text-zinc-500 mt-1">Lowercase letters and underscores only</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
            <textarea
              value={flag.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="What does this flag control?"
              rows={2}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Scope</label>
            <div className="grid grid-cols-2 gap-2">
              {SCOPE_OPTIONS.map((scope) => {
                const Icon = scope.icon;
                const isSelected = flag.scope === scope.id;
                return (
                  <button
                    key={scope.id}
                    onClick={() => onChange('scope', scope.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-500'
                        : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-400'}`} />
                    <span className="text-xs text-white">{scope.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Enabled</p>
              <p className="text-xs text-zinc-500">Turn this feature on</p>
            </div>
            <button
              onClick={() => onChange('is_enabled', !flag.is_enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                flag.is_enabled ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  flag.is_enabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
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
                Save Flag
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
            <div className="h-8 bg-zinc-800 rounded w-36 mb-2" />
            <div className="h-4 bg-zinc-800 rounded w-24" />
          </div>
        </div>
      </div>
      <div className="h-11 bg-zinc-800/50 rounded-lg" />
      <div className="bg-zinc-800/50 rounded-xl">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-zinc-800">
            <div className="w-12 h-6 bg-zinc-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-zinc-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-zinc-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
