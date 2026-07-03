// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Trust Logos Management Client Component
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
  Shield,
  AlertCircle,
  Loader2,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface TrustLogo {
  id: string;
  name: string;
  abbreviation: string;
  logo_url: string | null;
  color: string;
  note: string | null;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
}

const EMPTY_LOGO: Partial<TrustLogo> = {
  name: '',
  abbreviation: '',
  logo_url: '',
  color: '#2563EB',
  note: '',
  website_url: '',
  is_active: true,
};

export function LogosClient() {
  const [logos, setLogos] = useState<TrustLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingLogo, setEditingLogo] = useState<Partial<TrustLogo> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/marketing/logos');
      if (response.ok) {
        const data = await response.json();
        setLogos(data.logos || []);
      }
    } catch (err) {
      console.error('[Logos] Fetch error:', err);
      setError('Failed to load logos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);

  const handleCreateNew = () => {
    setEditingLogo({ ...EMPTY_LOGO });
    setIsNew(true);
    setShowEditor(true);
    setError(null);
  };

  const handleEdit = (logo: TrustLogo) => {
    setEditingLogo({ ...logo });
    setIsNew(false);
    setShowEditor(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!editingLogo?.name || !editingLogo?.abbreviation) {
      setError('Name and abbreviation are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = isNew
        ? '/api/v1/admin/marketing/logos'
        : `/api/v1/admin/marketing/logos/${editingLogo.id}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLogo),
      });

      if (response.ok) {
        fetchLogos();
        setShowEditor(false);
        setEditingLogo(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save logo');
      }
    } catch (err) {
      console.error('[Logos] Save error:', err);
      setError('Failed to save logo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (logo: TrustLogo) => {
    if (!confirm(`Are you sure you want to delete "${logo.name}"?`)) return;

    try {
      const response = await fetch(`/api/v1/admin/marketing/logos/${logo.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchLogos();
      } else {
        setError('Failed to delete logo');
      }
    } catch (err) {
      console.error('[Logos] Delete error:', err);
      setError('Failed to delete logo');
    }
  };

  const handleToggleActive = async (logo: TrustLogo) => {
    try {
      const response = await fetch(`/api/v1/admin/marketing/logos/${logo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !logo.is_active }),
      });

      if (response.ok) {
        fetchLogos();
      }
    } catch (err) {
      console.error('[Logos] Toggle error:', err);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newLogos = [...logos];
    [newLogos[index - 1], newLogos[index]] = [newLogos[index], newLogos[index - 1]];
    await reorderLogos(newLogos);
  };

  const handleMoveDown = async (index: number) => {
    if (index === logos.length - 1) return;
    const newLogos = [...logos];
    [newLogos[index], newLogos[index + 1]] = [newLogos[index + 1], newLogos[index]];
    await reorderLogos(newLogos);
  };

  const reorderLogos = async (newLogos: TrustLogo[]) => {
    setLogos(newLogos);
    try {
      await fetch('/api/v1/admin/marketing/logos/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newLogos.map(l => l.id) }),
      });
    } catch (err) {
      console.error('[Logos] Reorder error:', err);
      fetchLogos();
    }
  };

  const updateEditingField = (field: string, value: unknown) => {
    setEditingLogo(prev => prev ? { ...prev, [field]: value } : null);
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
              Trust Logos
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {logos.length} logos · {logos.filter(l => l.is_active).length} active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogos}
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
            Add Logo
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

      {/* Logos Grid */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {logos.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Logos Yet</h3>
            <p className="text-zinc-500 mb-4">Add your first data source logo.</p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Logo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-0.5 p-0.5 bg-zinc-800">
            {logos.map((logo, index) => (
              <div
                key={logo.id}
                className={`bg-zinc-900 p-4 ${!logo.is_active ? 'opacity-50' : ''}`}
              >
                {/* Logo Badge Preview */}
                <div className="flex flex-col items-center mb-3">
                  <div
                    className="w-12 h-12 rounded flex items-center justify-center font-bold text-xs tracking-widest font-mono mb-2"
                    style={{ backgroundColor: logo.color + '15', color: logo.color, border: `1px solid ${logo.color}25` }}
                  >
                    {logo.abbreviation}
                  </div>
                  <p className="text-xs font-medium text-white text-center truncate w-full">{logo.name}</p>
                  {logo.note && (
                    <p className="text-[10px] text-zinc-500 text-center">{logo.note}</p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-1 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === logos.length - 1}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(logo)}
                    className={`p-1 ${logo.is_active ? 'text-emerald-400' : 'text-zinc-500'}`}
                  >
                    {logo.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => handleEdit(logo)}
                    className="p-1 text-zinc-500 hover:text-white"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(logo)}
                    className="p-1 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && editingLogo && (
        <LogoEditorModal
          logo={editingLogo}
          isNew={isNew}
          saving={saving}
          error={error}
          onClose={() => {
            setShowEditor(false);
            setEditingLogo(null);
            setError(null);
          }}
          onSave={handleSave}
          onChange={updateEditingField}
        />
      )}
    </div>
  );
}

interface LogoEditorModalProps {
  logo: Partial<TrustLogo>;
  isNew: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: unknown) => void;
}

function LogoEditorModal({ logo, isNew, saving, error, onClose, onSave, onChange }: LogoEditorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">
            {isNew ? 'Add Logo' : 'Edit Logo'}
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

          {/* Preview */}
          <div className="flex justify-center p-4 bg-zinc-800/30 rounded-lg">
            <div
              className="w-16 h-16 rounded flex items-center justify-center font-bold text-sm tracking-widest font-mono"
              style={{ backgroundColor: (logo.color || '#2563EB') + '15', color: logo.color || '#2563EB', border: `1px solid ${logo.color || '#2563EB'}25` }}
            >
              {logo.abbreviation || 'XX'}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Organization Name *</label>
            <input
              type="text"
              value={logo.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="e.g., World Bank"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Abbreviation */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Abbreviation * (max 5 letters)</label>
            <input
              type="text"
              value={logo.abbreviation || ''}
              onChange={(e) => onChange('abbreviation', e.target.value.toUpperCase().slice(0, 5))}
              placeholder="e.g., WB, AfDEC"
              maxLength={5}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase"
            />
            <p className="text-xs text-zinc-600 mt-1">{(logo.abbreviation || '').length}/5 characters</p>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Badge Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={logo.color || '#2563EB'}
                onChange={(e) => onChange('color', e.target.value)}
                className="w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer"
              />
              <input
                type="text"
                value={logo.color || '#2563EB'}
                onChange={(e) => onChange('color', e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Note</label>
            <input
              type="text"
              value={logo.note || ''}
              onChange={(e) => onChange('note', e.target.value)}
              placeholder="e.g., Macro · Weekly"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Website URL (optional)</label>
            <input
              type="url"
              value={logo.website_url || ''}
              onChange={(e) => onChange('website_url', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Active</p>
              <p className="text-xs text-zinc-500">Show on homepage</p>
            </div>
            <button
              onClick={() => onChange('is_active', !logo.is_active)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                logo.is_active ? 'bg-indigo-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  logo.is_active ? 'left-7' : 'left-1'
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
                Save Logo
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
      </div>
      <div className="grid grid-cols-8 gap-0.5 bg-zinc-800 rounded-xl p-0.5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
