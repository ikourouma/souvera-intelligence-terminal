// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Hero Slides Management Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  GripVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  ExternalLink,
  Image as ImageIcon,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Loader2,
  Upload,
  Monitor,
  PlusCircle,
  Info,
} from 'lucide-react';

interface HeroSlide {
  id: string;
  badge: string | null;
  title: string;
  subtitle: string | null;
  cta_primary_label: string | null;
  cta_primary_url: string | null;
  cta_secondary_label: string | null;
  cta_secondary_url: string | null;
  cta_tertiary_label: string | null;
  cta_tertiary_url: string | null;
  stat_1_value: string | null;
  stat_1_label: string | null;
  stat_2_value: string | null;
  stat_2_label: string | null;
  stat_3_value: string | null;
  stat_3_label: string | null;
  ticker_items: string[];
  accent_color: string;
  background_image_url: string | null;
  display_order: number;
  is_active: boolean;
}

const EMPTY_SLIDE: Partial<HeroSlide> = {
  badge: '',
  title: '',
  subtitle: '',
  cta_primary_label: '',
  cta_primary_url: '',
  cta_secondary_label: '',
  cta_secondary_url: '',
  cta_tertiary_label: '',
  cta_tertiary_url: '',
  stat_1_value: '',
  stat_1_label: '',
  stat_2_value: '',
  stat_2_label: '',
  stat_3_value: '',
  stat_3_label: '',
  ticker_items: [],
  accent_color: '#2563EB',
  background_image_url: '',
  is_active: true,
};

export function HeroSlidesClient() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/marketing/hero-slides');
      if (response.ok) {
        const data = await response.json();
        setSlides(data.slides || []);
      }
    } catch (err) {
      console.error('[HeroSlides] Fetch error:', err);
      setError('Failed to load slides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleCreateNew = () => {
    setEditingSlide({ ...EMPTY_SLIDE });
    setIsNew(true);
    setShowEditor(true);
    setError(null);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide({ ...slide });
    setIsNew(false);
    setShowEditor(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!editingSlide?.title) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = isNew
        ? '/api/v1/admin/marketing/hero-slides'
        : `/api/v1/admin/marketing/hero-slides/${editingSlide.id}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSlide),
      });

      if (response.ok) {
        fetchSlides();
        setShowEditor(false);
        setEditingSlide(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save slide');
      }
    } catch (err) {
      console.error('[HeroSlides] Save error:', err);
      setError('Failed to save slide');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slide: HeroSlide) => {
    if (!confirm(`Are you sure you want to delete "${slide.title}"?`)) return;

    try {
      const response = await fetch(`/api/v1/admin/marketing/hero-slides/${slide.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSlides();
      } else {
        setError('Failed to delete slide');
      }
    } catch (err) {
      console.error('[HeroSlides] Delete error:', err);
      setError('Failed to delete slide');
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const response = await fetch(`/api/v1/admin/marketing/hero-slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !slide.is_active }),
      });

      if (response.ok) {
        fetchSlides();
      }
    } catch (err) {
      console.error('[HeroSlides] Toggle error:', err);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
    
    await reorderSlides(newSlides);
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    
    await reorderSlides(newSlides);
  };

  const reorderSlides = async (newSlides: HeroSlide[]) => {
    setSlides(newSlides);
    try {
      await fetch('/api/v1/admin/marketing/hero-slides/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newSlides.map(s => s.id) }),
      });
    } catch (err) {
      console.error('[HeroSlides] Reorder error:', err);
      fetchSlides();
    }
  };

  const updateEditingField = (field: string, value: unknown) => {
    setEditingSlide(prev => prev ? { ...prev, [field]: value } : null);
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
              Hero Slides
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {slides.length} slides · {slides.filter(s => s.is_active).length} active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSlides}
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
            Add Slide
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

      {/* Slides List */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {slides.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Slides Yet</h3>
            <p className="text-zinc-500 mb-4">Create your first hero slide to get started.</p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Slide
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`flex items-center gap-4 p-4 ${!slide.is_active ? 'opacity-50' : ''}`}
              >
                {/* Reorder Controls */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <GripVertical className="w-4 h-4 text-zinc-600 mx-auto" />
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === slides.length - 1}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Color Preview */}
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: slide.accent_color + '20' }}
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: slide.accent_color }}
                  />
                </div>

                {/* Slide Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {slide.badge && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-700 text-zinc-300">
                        {slide.badge}
                      </span>
                    )}
                    <span className="text-xs text-zinc-500">#{index + 1}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">
                    {slide.title.replace(/\n/g, ' ')}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate mt-1">
                    {slide.subtitle || 'No subtitle'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className={`p-2 rounded-lg transition-colors ${
                      slide.is_active
                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                        : 'text-zinc-500 hover:bg-zinc-700/50'
                    }`}
                    title={slide.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {slide.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(slide)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && editingSlide && (
        <SlideEditorModal
          slide={editingSlide}
          isNew={isNew}
          saving={saving}
          error={error}
          onClose={() => {
            setShowEditor(false);
            setEditingSlide(null);
            setError(null);
          }}
          onSave={handleSave}
          onChange={updateEditingField}
        />
      )}
    </div>
  );
}

interface SlideEditorModalProps {
  slide: Partial<HeroSlide>;
  isNew: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: unknown) => void;
}

function SlideEditorModal({ slide, isNew, saving, error, onClose, onSave, onChange }: SlideEditorModalProps) {
  const [showTertiaryCTA, setShowTertiaryCTA] = useState(Boolean(slide.cta_tertiary_label || slide.cta_tertiary_url));
  const [showStat3, setShowStat3] = useState(Boolean(slide.stat_3_value || slide.stat_3_label));
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'hero-slides');

      const response = await fetch('/api/v1/admin/marketing/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onChange('background_image_url', data.url);
      } else {
        const data = await response.json();
        setUploadError(data.error || 'Upload failed');
      }
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange('background_image_url', '');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h3 className="text-lg font-semibold text-white">
              {isNew ? 'Create Slide' : 'Edit Slide'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors"
              >
                <Monitor className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Background Image Upload */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Background Image
              </label>
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                <p className="text-xs text-zinc-500">
                  Recommended size: <span className="text-zinc-400 font-medium">1920×1080px</span> (16:9 ratio). 
                  Max file size: 5MB. Formats: JPEG, PNG, WebP.
                </p>
              </div>
              
              {slide.background_image_url ? (
                <div className="relative rounded-lg overflow-hidden border border-zinc-700">
                  <img
                    src={slide.background_image_url}
                    alt="Background preview"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="absolute bottom-2 left-2 text-xs text-white/70 truncate max-w-[80%]">
                    {slide.background_image_url}
                  </p>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  uploading ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
                }`}>
                  <div className="flex flex-col items-center justify-center py-4">
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                        <p className="text-sm text-indigo-400">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                        <p className="text-sm text-zinc-400">Click to upload background image</p>
                        <p className="text-xs text-zinc-600">or paste a URL below</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}

              {uploadError && (
                <p className="mt-2 text-xs text-red-400">{uploadError}</p>
              )}

              <input
                type="text"
                value={slide.background_image_url || ''}
                onChange={(e) => onChange('background_image_url', e.target.value)}
                placeholder="Or enter image URL directly"
                className="w-full mt-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Badge</label>
              <input
                type="text"
                value={slide.badge || ''}
                onChange={(e) => onChange('badge', e.target.value)}
                placeholder="e.g., Intelligence Platform"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Title *</label>
              <textarea
                value={slide.title || ''}
                onChange={(e) => onChange('title', e.target.value)}
                placeholder="Enter title (use \n for line breaks)"
                rows={3}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Subtitle</label>
              <textarea
                value={slide.subtitle || ''}
                onChange={(e) => onChange('subtitle', e.target.value)}
                placeholder="Enter subtitle"
                rows={2}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>

            {/* CTAs Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-400">Call-to-Action Buttons</label>
              </div>

              {/* Primary & Secondary CTAs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Primary CTA Label</label>
                  <input
                    type="text"
                    value={slide.cta_primary_label || ''}
                    onChange={(e) => onChange('cta_primary_label', e.target.value)}
                    placeholder="e.g., Explore Platform"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Primary CTA URL</label>
                  <input
                    type="text"
                    value={slide.cta_primary_url || ''}
                    onChange={(e) => onChange('cta_primary_url', e.target.value)}
                    placeholder="/platform"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Secondary CTA Label</label>
                  <input
                    type="text"
                    value={slide.cta_secondary_label || ''}
                    onChange={(e) => onChange('cta_secondary_label', e.target.value)}
                    placeholder="e.g., Request Access"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Secondary CTA URL</label>
                  <input
                    type="text"
                    value={slide.cta_secondary_url || ''}
                    onChange={(e) => onChange('cta_secondary_url', e.target.value)}
                    placeholder="/access/request-access"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              {/* Tertiary CTA - Expandable */}
              {!showTertiaryCTA ? (
                <button
                  onClick={() => setShowTertiaryCTA(true)}
                  className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Tertiary CTA
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                  <div className="col-span-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-indigo-400">Tertiary CTA (Optional)</label>
                    <button
                      onClick={() => {
                        setShowTertiaryCTA(false);
                        onChange('cta_tertiary_label', '');
                        onChange('cta_tertiary_url', '');
                      }}
                      className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Tertiary CTA Label</label>
                    <input
                      type="text"
                      value={slide.cta_tertiary_label || ''}
                      onChange={(e) => onChange('cta_tertiary_label', e.target.value)}
                      placeholder="e.g., Learn More"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Tertiary CTA URL</label>
                    <input
                      type="text"
                      value={slide.cta_tertiary_url || ''}
                      onChange={(e) => onChange('cta_tertiary_url', e.target.value)}
                      placeholder="/about"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stats Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-400">Statistics</label>
              </div>

              {/* Stat 1 & 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Stat 1 Value</label>
                    <input
                      type="text"
                      value={slide.stat_1_value || ''}
                      onChange={(e) => onChange('stat_1_value', e.target.value)}
                      placeholder="e.g., 50+"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Stat 1 Label</label>
                    <input
                      type="text"
                      value={slide.stat_1_label || ''}
                      onChange={(e) => onChange('stat_1_label', e.target.value)}
                      placeholder="e.g., Markets Covered"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Stat 2 Value</label>
                    <input
                      type="text"
                      value={slide.stat_2_value || ''}
                      onChange={(e) => onChange('stat_2_value', e.target.value)}
                      placeholder="e.g., 6"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Stat 2 Label</label>
                    <input
                      type="text"
                      value={slide.stat_2_label || ''}
                      onChange={(e) => onChange('stat_2_label', e.target.value)}
                      placeholder="e.g., Key Sectors"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Stat 3 - Expandable */}
              {!showStat3 ? (
                <button
                  onClick={() => setShowStat3(true)}
                  className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Third Statistic
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                  <div className="col-span-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-indigo-400">Stat 3 (Optional)</label>
                    <button
                      onClick={() => {
                        setShowStat3(false);
                        onChange('stat_3_value', '');
                        onChange('stat_3_label', '');
                      }}
                      className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Stat 3 Value</label>
                    <input
                      type="text"
                      value={slide.stat_3_value || ''}
                      onChange={(e) => onChange('stat_3_value', e.target.value)}
                      placeholder="e.g., 1M+"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Stat 3 Label</label>
                    <input
                      type="text"
                      value={slide.stat_3_label || ''}
                      onChange={(e) => onChange('stat_3_label', e.target.value)}
                      placeholder="e.g., Data Points"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={slide.accent_color || '#2563EB'}
                  onChange={(e) => onChange('accent_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={slide.accent_color || '#2563EB'}
                  onChange={(e) => onChange('accent_color', e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Ticker Items */}
            <TickerItemsEditor
              items={slide.ticker_items || []}
              onAdd={(item) => onChange('ticker_items', [...(slide.ticker_items || []), item])}
              onRemove={(index) => {
                const newItems = [...(slide.ticker_items || [])];
                newItems.splice(index, 1);
                onChange('ticker_items', newItems);
              }}
            />

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Active</p>
                <p className="text-xs text-zinc-500">Show this slide on the homepage</p>
              </div>
              <button
                onClick={() => onChange('is_active', !slide.is_active)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  slide.is_active ? 'bg-indigo-600' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    slide.is_active ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 p-4 border-t border-zinc-800">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <Monitor className="w-4 h-4" />
              Preview Slide
            </button>
            <div className="flex items-center gap-3">
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
                    Save Slide
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <SlidePreviewModal slide={slide} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}

interface SlidePreviewModalProps {
  slide: Partial<HeroSlide>;
  onClose: () => void;
}

function SlidePreviewModal({ slide, onClose }: SlidePreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Close Preview
        </button>
        
        {/* Preview Container */}
        <div 
          className="relative rounded-xl overflow-hidden border border-zinc-700"
          style={{ 
            aspectRatio: '16/9',
            background: slide.background_image_url 
              ? `url(${slide.background_image_url}) center/cover`
              : `linear-gradient(135deg, ${slide.accent_color || '#2563EB'}22 0%, #09090b 50%, ${slide.accent_color || '#2563EB'}11 100%)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          
          <div className="relative h-full flex flex-col justify-center p-8 md:p-12 max-w-2xl">
            {/* Badge */}
            {slide.badge && (
              <span 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white/90 mb-4 w-fit"
                style={{ backgroundColor: `${slide.accent_color || '#2563EB'}40` }}
              >
                {slide.badge}
              </span>
            )}
            
            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {slide.title?.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < (slide.title?.split('\n').length || 1) - 1 && <br />}
                </span>
              )) || 'Your Title Here'}
            </h1>
            
            {/* Subtitle */}
            {slide.subtitle && (
              <p className="text-sm md:text-base text-zinc-400 mb-6 max-w-xl">
                {slide.subtitle}
              </p>
            )}
            
            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-6">
              {slide.cta_primary_label && (
                <span 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: slide.accent_color || '#2563EB' }}
                >
                  {slide.cta_primary_label}
                </span>
              )}
              {slide.cta_secondary_label && (
                <span className="px-4 py-2 rounded-lg text-sm font-medium text-white border border-zinc-600">
                  {slide.cta_secondary_label}
                </span>
              )}
              {slide.cta_tertiary_label && (
                <span className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white">
                  {slide.cta_tertiary_label}
                </span>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex gap-6">
              {slide.stat_1_value && (
                <div>
                  <p className="text-2xl font-bold text-white">{slide.stat_1_value}</p>
                  <p className="text-xs text-zinc-500">{slide.stat_1_label}</p>
                </div>
              )}
              {slide.stat_2_value && (
                <div>
                  <p className="text-2xl font-bold text-white">{slide.stat_2_value}</p>
                  <p className="text-xs text-zinc-500">{slide.stat_2_label}</p>
                </div>
              )}
              {slide.stat_3_value && (
                <div>
                  <p className="text-2xl font-bold text-white">{slide.stat_3_value}</p>
                  <p className="text-xs text-zinc-500">{slide.stat_3_label}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              slide.is_active 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-zinc-700/50 text-zinc-400'
            }`}>
              {slide.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Ticker Preview */}
          {(slide.ticker_items?.length || 0) > 0 && (
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <div className="flex items-center gap-4 text-xs text-zinc-500 overflow-hidden">
                {slide.ticker_items?.map((item, i) => (
                  <span key={i} className="shrink-0">{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">
          Preview is approximate. Actual appearance may vary based on screen size and browser.
        </p>
      </div>
    </div>
  );
}

// Common country codes for Africa and Caribbean
const COMMON_COUNTRY_CODES = [
  { code: 'ZAF', name: 'South Africa' },
  { code: 'NGA', name: 'Nigeria' },
  { code: 'KEN', name: 'Kenya' },
  { code: 'EGY', name: 'Egypt' },
  { code: 'GHA', name: 'Ghana' },
  { code: 'ETH', name: 'Ethiopia' },
  { code: 'TZA', name: 'Tanzania' },
  { code: 'RWA', name: 'Rwanda' },
  { code: 'MAR', name: 'Morocco' },
  { code: 'CIV', name: "Côte d'Ivoire" },
  { code: 'SEN', name: 'Senegal' },
  { code: 'AGO', name: 'Angola' },
  { code: 'MOZ', name: 'Mozambique' },
  { code: 'CMR', name: 'Cameroon' },
  { code: 'UGA', name: 'Uganda' },
  { code: 'GIN', name: 'Guinea' },
  { code: 'ZMB', name: 'Zambia' },
  { code: 'BWA', name: 'Botswana' },
  { code: 'MUS', name: 'Mauritius' },
  { code: 'NAM', name: 'Namibia' },
  { code: 'JAM', name: 'Jamaica' },
  { code: 'TTO', name: 'Trinidad & Tobago' },
  { code: 'BRB', name: 'Barbados' },
  { code: 'BHS', name: 'Bahamas' },
  { code: 'DOM', name: 'Dominican Republic' },
  { code: 'HTI', name: 'Haiti' },
  { code: 'GUY', name: 'Guyana' },
  { code: 'SUR', name: 'Suriname' },
];

interface TickerItemsEditorProps {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
}

function TickerItemsEditor({ items, onAdd, onRemove }: TickerItemsEditorProps) {
  const [mode, setMode] = useState<'builder' | 'manual'>('builder');
  const [countryCode, setCountryCode] = useState('');
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [percentage, setPercentage] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCountries = COMMON_COUNTRY_CODES.filter(
    (c) =>
      c.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleAddFromBuilder = () => {
    if (!countryCode || !percentage) return;
    const arrow = direction === 'up' ? '▲' : '▼';
    const item = `${countryCode} ${arrow} ${percentage}%`;
    onAdd(item);
    setCountryCode('');
    setPercentage('');
    setCountrySearch('');
  };

  const handleAddManual = () => {
    if (!manualInput.trim()) return;
    onAdd(manualInput.trim());
    setManualInput('');
  };

  const selectCountry = (code: string) => {
    setCountryCode(code);
    setCountrySearch('');
    setShowDropdown(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-400">Ticker Items</label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('builder')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              mode === 'builder'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Builder
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              mode === 'manual'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Manual
          </button>
        </div>
      </div>

      {/* Help text */}
      <p className="text-xs text-zinc-500">
        Ticker items display market movement indicators. Format: <span className="text-zinc-400 font-mono">CODE ▲/▼ X.X%</span>
      </p>

      {mode === 'builder' ? (
        <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {/* Country Code */}
            <div className="relative">
              <label className="block text-xs text-zinc-500 mb-1">Country</label>
              <input
                type="text"
                value={countrySearch || countryCode}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  setCountryCode('');
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search..."
                className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
              {showDropdown && (countrySearch || !countryCode) && (
                <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded shadow-lg">
                  {filteredCountries.slice(0, 8).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => selectCountry(c.code)}
                      className="w-full px-2 py-1.5 text-left text-xs hover:bg-zinc-700 flex justify-between"
                    >
                      <span className="text-white">{c.name}</span>
                      <span className="text-zinc-500 font-mono">{c.code}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-zinc-500">No matches</div>
                  )}
                </div>
              )}
            </div>

            {/* Direction */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Direction</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setDirection('up')}
                  className={`flex-1 px-2 py-1.5 text-sm rounded transition-colors ${
                    direction === 'up'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  ▲ Up
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('down')}
                  className={`flex-1 px-2 py-1.5 text-sm rounded transition-colors ${
                    direction === 'down'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  ▼ Down
                </button>
              </div>
            </div>

            {/* Percentage */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Percent</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="1.5"
                  className="flex-1 w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
                <span className="flex items-center text-zinc-500 text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Preview and Add */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-700/50">
            <div className="text-sm">
              {countryCode && percentage ? (
                <span className="px-2 py-1 bg-zinc-700 rounded text-white font-mono">
                  {countryCode} {direction === 'up' ? '▲' : '▼'} {percentage}%
                </span>
              ) : (
                <span className="text-zinc-500 italic">Preview will appear here</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddFromBuilder}
              disabled={!countryCode || !percentage}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Item
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddManual())}
            placeholder="e.g., ZAF ▲ 1.2% or custom text"
            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            type="button"
            onClick={handleAddManual}
            className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      )}

      {/* Current Items */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-zinc-500 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
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
            <div className="w-8 h-20 bg-zinc-700 rounded" />
            <div className="w-16 h-16 bg-zinc-700 rounded-lg" />
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
