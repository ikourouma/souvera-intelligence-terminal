// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Flash Banners Management Client Component
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
  Eye,
  EyeOff,
  X,
  Save,
  ExternalLink,
  Megaphone,
  AlertCircle,
  Loader2,
  Clock,
  Calendar,
  Info,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface FlashBanner {
  id: string;
  label: string | null;
  message: string;
  banner_type: 'info' | 'warning' | 'success' | 'promo';
  link_text: string | null;
  link_url: string | null;
  background_gradient: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  display_order: number;
}

const EMPTY_BANNER: Partial<FlashBanner> = {
  label: '',
  message: '',
  banner_type: 'info',
  link_text: '',
  link_url: '',
  background_gradient: 'linear-gradient(90deg, #1d4ed8 0%, #1e3a8a 40%, #166534 100%)',
  starts_at: null,
  ends_at: null,
  is_active: true,
};

const BANNER_TYPES = [
  { id: 'info', label: 'Info', icon: Info, color: 'blue' },
  { id: 'warning', label: 'Warning', icon: AlertTriangle, color: 'amber' },
  { id: 'success', label: 'Success', icon: CheckCircle, color: 'emerald' },
  { id: 'promo', label: 'Promo', icon: Sparkles, color: 'purple' },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  info: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/20' },
  warning: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/20' },
  success: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  promo: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/20' },
};

export function BannersClient() {
  const [banners, setBanners] = useState<FlashBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<FlashBanner> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/marketing/banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(data.banners || []);
      }
    } catch (err) {
      console.error('[Banners] Fetch error:', err);
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleCreateNew = () => {
    setEditingBanner({ ...EMPTY_BANNER });
    setIsNew(true);
    setShowEditor(true);
    setError(null);
  };

  const handleEdit = (banner: FlashBanner) => {
    setEditingBanner({ ...banner });
    setIsNew(false);
    setShowEditor(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!editingBanner?.message) {
      setError('Message is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = isNew
        ? '/api/v1/admin/marketing/banners'
        : `/api/v1/admin/marketing/banners/${editingBanner.id}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner),
      });

      if (response.ok) {
        fetchBanners();
        setShowEditor(false);
        setEditingBanner(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save banner');
      }
    } catch (err) {
      console.error('[Banners] Save error:', err);
      setError('Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (banner: FlashBanner) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/v1/admin/marketing/banners/${banner.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBanners();
      } else {
        setError('Failed to delete banner');
      }
    } catch (err) {
      console.error('[Banners] Delete error:', err);
      setError('Failed to delete banner');
    }
  };

  const handleToggleActive = async (banner: FlashBanner) => {
    try {
      const response = await fetch(`/api/v1/admin/marketing/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !banner.is_active }),
      });

      if (response.ok) {
        fetchBanners();
      }
    } catch (err) {
      console.error('[Banners] Toggle error:', err);
    }
  };

  const updateEditingField = (field: string, value: unknown) => {
    setEditingBanner(prev => prev ? { ...prev, [field]: value } : null);
  };

  const getBannerStatus = (banner: FlashBanner) => {
    if (!banner.is_active) return 'inactive';
    
    const now = new Date();
    if (banner.starts_at && new Date(banner.starts_at) > now) return 'scheduled';
    if (banner.ends_at && new Date(banner.ends_at) < now) return 'expired';
    
    return 'active';
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
              Flash Banners
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {banners.length} banners · {banners.filter(b => getBannerStatus(b) === 'active').length} active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBanners}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <a
            href="/"
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
            Add Banner
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

      {/* Banners List */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {banners.length === 0 ? (
          <div className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Banners Yet</h3>
            <p className="text-zinc-500 mb-4">Create your first flash banner to get started.</p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Banner
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {banners.map((banner) => {
              const status = getBannerStatus(banner);
              const typeColors = TYPE_COLORS[banner.banner_type] || TYPE_COLORS.info;
              const TypeIcon = BANNER_TYPES.find(t => t.id === banner.banner_type)?.icon || Info;

              return (
                <div
                  key={banner.id}
                  className={`flex items-center gap-4 p-4 ${status === 'inactive' || status === 'expired' ? 'opacity-50' : ''}`}
                >
                  {/* Type Icon */}
                  <div className={`w-10 h-10 rounded-lg ${typeColors.bg} border ${typeColors.border} flex items-center justify-center shrink-0`}>
                    <TypeIcon className={`w-5 h-5 ${typeColors.text}`} />
                  </div>

                  {/* Banner Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {banner.label && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-700 text-zinc-300">
                          {banner.label}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                        status === 'expired' ? 'bg-zinc-500/20 text-zinc-400' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-white truncate">
                      {banner.message}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                      {banner.starts_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Start: {formatDateTime(banner.starts_at)}
                        </span>
                      )}
                      {banner.ends_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          End: {formatDateTime(banner.ends_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`p-2 rounded-lg transition-colors ${
                        banner.is_active
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-zinc-500 hover:bg-zinc-700/50'
                      }`}
                      title={banner.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {banner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
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
      {showEditor && editingBanner && (
        <BannerEditorModal
          banner={editingBanner}
          isNew={isNew}
          saving={saving}
          error={error}
          onClose={() => {
            setShowEditor(false);
            setEditingBanner(null);
            setError(null);
          }}
          onSave={handleSave}
          onChange={updateEditingField}
        />
      )}
    </div>
  );
}

interface BannerEditorModalProps {
  banner: Partial<FlashBanner>;
  isNew: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: unknown) => void;
}

function BannerEditorModal({ banner, isNew, saving, error, onClose, onSave, onChange }: BannerEditorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">
            {isNew ? 'Create Banner' : 'Edit Banner'}
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

          {/* Banner Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Banner Type</label>
            <div className="grid grid-cols-4 gap-2">
              {BANNER_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = banner.banner_type === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => onChange('banner_type', type.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-500'
                        : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${TYPE_COLORS[type.id].text}`} />
                    <span className="text-xs text-white">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Label (optional)</label>
            <input
              type="text"
              value={banner.label || ''}
              onChange={(e) => onChange('label', e.target.value)}
              placeholder="e.g., Now Live"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Message *</label>
            <textarea
              value={banner.message || ''}
              onChange={(e) => onChange('message', e.target.value)}
              placeholder="Enter banner message"
              rows={2}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>

          {/* Link */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Link Text</label>
              <input
                type="text"
                value={banner.link_text || ''}
                onChange={(e) => onChange('link_text', e.target.value)}
                placeholder="e.g., Learn More"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Link URL</label>
              <input
                type="text"
                value={banner.link_url || ''}
                onChange={(e) => onChange('link_url', e.target.value)}
                placeholder="/page"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-zinc-800/30 rounded-lg p-4 space-y-4">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400" />
              Schedule (Optional)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={banner.starts_at ? banner.starts_at.slice(0, 16) : ''}
                  onChange={(e) => onChange('starts_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={banner.ends_at ? banner.ends_at.slice(0, 16) : ''}
                  onChange={(e) => onChange('ends_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
            <p className="text-xs text-zinc-500">Leave empty for no time restriction</p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Active</p>
              <p className="text-xs text-zinc-500">Show this banner on the homepage</p>
            </div>
            <button
              onClick={() => onChange('is_active', !banner.is_active)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                banner.is_active ? 'bg-indigo-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  banner.is_active ? 'left-7' : 'left-1'
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
                Save Banner
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
            <div className="h-8 bg-zinc-800 rounded w-32 mb-2" />
            <div className="h-4 bg-zinc-800 rounded w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-zinc-800 rounded w-24" />
          <div className="h-10 bg-zinc-800 rounded w-24" />
        </div>
      </div>
      <div className="bg-zinc-800/50 rounded-xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-zinc-800">
            <div className="w-10 h-10 bg-zinc-700 rounded-lg" />
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
