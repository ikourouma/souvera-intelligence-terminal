// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Feature Flags Management Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Flag,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
  X,
  AlertCircle,
  Loader2,
  Globe,
  Shield,
  Clock,
} from 'lucide-react';

interface FeatureFlag {
  id: string;
  flag_key: string;
  description: string | null;
  is_enabled: boolean;
  scope: 'global' | 'tier' | 'user';
  tier_restriction: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

const SCOPE_ICONS = {
  global: Globe,
  tier: Shield,
  user: Shield,
};

const SCOPE_COLORS = {
  global: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  tier: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  user: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export function FeatureFlagsClient() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingFlag, setTogglingFlag] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/marketing/feature-flags');
      if (response.ok) {
        const data = await response.json();
        setFlags(data.flags || []);
      } else {
        setError('Failed to fetch feature flags');
      }
    } catch (err) {
      console.error('[FeatureFlags] Error:', err);
      setError('Failed to fetch feature flags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleToggle = async (flag: FeatureFlag) => {
    setTogglingFlag(flag.flag_key);
    try {
      const response = await fetch(`/api/v1/admin/marketing/feature-flags/${flag.flag_key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !flag.is_enabled }),
      });

      if (response.ok) {
        setFlags(prev => prev.map(f =>
          f.flag_key === flag.flag_key ? { ...f, is_enabled: !f.is_enabled } : f
        ));
      } else {
        setError('Failed to toggle flag');
      }
    } catch (err) {
      console.error('[FeatureFlags] Toggle error:', err);
      setError('Failed to toggle flag');
    } finally {
      setTogglingFlag(null);
    }
  };

  const filteredFlags = flags.filter(flag =>
    flag.flag_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: flags.length,
    enabled: flags.filter(f => f.is_enabled).length,
    disabled: flags.filter(f => !f.is_enabled).length,
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-800 rounded w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />)}
        </div>
        <div className="h-96 bg-zinc-800/50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Feature Flags
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Control platform features and experimental functionality
          </p>
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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Flag
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2">
              <Flag className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-zinc-500">Total Flags</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
              <ToggleRight className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.enabled}</p>
              <p className="text-xs text-zinc-500">Enabled</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-700/50 border border-zinc-600/50 rounded-lg p-2">
              <ToggleLeft className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.disabled}</p>
              <p className="text-xs text-zinc-500">Disabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search flags by key or description..."
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
        />
      </div>

      {/* Flags List */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-zinc-800">
          {filteredFlags.length === 0 ? (
            <div className="p-12 text-center">
              <Flag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No feature flags found</p>
              <p className="text-xs text-zinc-500 mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Create your first feature flag'}
              </p>
            </div>
          ) : (
            filteredFlags.map((flag) => {
              const ScopeIcon = SCOPE_ICONS[flag.scope] || Globe;
              const scopeColor = SCOPE_COLORS[flag.scope] || SCOPE_COLORS.global;

              return (
                <div
                  key={flag.flag_key}
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggle(flag)}
                      disabled={togglingFlag === flag.flag_key}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        flag.is_enabled
                          ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : 'bg-zinc-700 border border-zinc-600'
                      }`}
                    >
                      {togglingFlag === flag.flag_key ? (
                        <Loader2 className="w-4 h-4 absolute top-1 left-1 animate-spin text-zinc-400" />
                      ) : (
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                            flag.is_enabled
                              ? 'left-7 bg-emerald-400'
                              : 'left-1 bg-zinc-400'
                          }`}
                        />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-white">{flag.flag_key}</code>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${scopeColor}`}>
                          <ScopeIcon className="w-3 h-3" />
                          {flag.scope}
                        </span>
                        {flag.tier_restriction && (
                          <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {flag.tier_restriction}+
                          </span>
                        )}
                      </div>
                      {flag.description && (
                        <p className="text-sm text-zinc-500 mt-1 truncate">{flag.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(flag.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Flag Modal */}
      {showAddModal && (
        <AddFlagModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchFlags();
          }}
        />
      )}
    </div>
  );
}

interface AddFlagModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddFlagModal({ onClose, onSuccess }: AddFlagModalProps) {
  const [flagKey, setFlagKey] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<'global' | 'tier' | 'user'>('global');
  const [tierRestriction, setTierRestriction] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/admin/marketing/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flag_key: flagKey.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          description: description || null,
          is_enabled: isEnabled,
          scope,
          tier_restriction: scope === 'tier' ? tierRestriction : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create flag');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2">
              <Flag className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Add Feature Flag</h2>
              <p className="text-xs text-zinc-500">Create a new feature flag</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Flag Key <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={flagKey}
              onChange={(e) => setFlagKey(e.target.value)}
              required
              placeholder="e.g., enable_new_dashboard"
              className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white font-mono placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50"
            />
            <p className="mt-1 text-xs text-zinc-500">Lowercase with underscores</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What does this flag control?"
              className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as 'global' | 'tier' | 'user')}
              className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
            >
              <option value="global">Global (all users)</option>
              <option value="tier">Tier (by plan level)</option>
              <option value="user">User (specific users)</option>
            </select>
          </div>

          {scope === 'tier' && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Minimum Tier</label>
              <select
                value={tierRestriction}
                onChange={(e) => setTierRestriction(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="">Select tier...</option>
                <option value="explorer">Explorer</option>
                <option value="professional">Professional</option>
                <option value="business">Business</option>
                <option value="investor">Investor</option>
                <option value="institutional">Institutional</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Enable on creation</p>
              <p className="text-xs text-zinc-500">Flag will be active immediately</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isEnabled
                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : 'bg-zinc-700 border border-zinc-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                  isEnabled ? 'left-7 bg-emerald-400' : 'left-1 bg-zinc-400'
                }`}
              />
            </button>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !flagKey}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Flag
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
