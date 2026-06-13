'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, ExternalLink, Sparkles, Trash2, Archive } from 'lucide-react';
import type { CuratedNewsArticle, CuratedNewsSource } from '@/types/curated-news';

interface EditorProps {
  articleId: string;
}

export function CuratedNewsEditor({ articleId }: EditorProps) {
  const router = useRouter();
  const [article, setArticle] = useState<CuratedNewsArticle | null>(null);
  const [sources, setSources] = useState<CuratedNewsSource[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/curated-news/${articleId}`);
      if (!res.ok) throw new Error('Failed to load article');
      const data = await res.json();
      setArticle(data.article);
      setSources(data.article.sources ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!article) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/curated-news/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          summary: article.summary,
          bodyMd: article.bodyMd,
          region: article.region,
          countryIso3: article.countryIso3,
          themes: article.themes,
          liveWireFeatured: article.liveWireFeatured,
          liveWireSort: article.liveWireSort,
          sources: sources.map((s) => ({
            sourceName: s.sourceName,
            sourceUrl: s.sourceUrl,
            snippet: s.snippet,
            confidence: s.confidence,
          })),
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setMessage('Saved');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/curated-news/${articleId}/publish`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Publish failed');
      setMessage('Published');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Unpublish this article? It will return to draft.')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/curated-news/${articleId}/unpublish`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Unpublish failed');
      setMessage('Unpublished');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unpublish failed');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!article) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/curated-news/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (!res.ok) throw new Error('Archive failed');
      setMessage('Archived');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Archive failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete this article?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/curated-news/${articleId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/admin/content/news');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledAt) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/curated-news/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledPublishAt: new Date(scheduledAt).toISOString() }),
      });
      if (!res.ok) throw new Error('Schedule failed');
      setMessage(`Scheduled for ${scheduledAt}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Schedule failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAiDraft = async () => {
    const validSources = sources.filter((s) => s.sourceName && s.sourceUrl);
    if (!validSources.length) {
      setError('Add at least one source with name and URL before AI draft');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/curated-news/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          sources: validSources.map((s) => ({
            sourceName: s.sourceName,
            sourceUrl: s.sourceUrl,
            snippet: s.snippet,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'AI draft failed');
      if (article) {
        setArticle({
          ...article,
          title: data.draft.title,
          summary: data.draft.summary,
          bodyMd: data.draft.bodyMd,
          themes: data.draft.themes ?? article.themes,
        });
      }
      setMessage(data.draft.aiGenerated ? 'AI draft applied — review before publishing' : 'Template draft applied');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI draft failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-zinc-500 text-sm">Loading editor...</p>;
  if (!article) return <p className="text-red-400 text-sm">{error ?? 'Not found'}</p>;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/content/news"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Back to list
      </Link>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-emerald-400">{message}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleAiDraft}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" /> AI draft from sources
        </button>
        {article.status !== 'published' && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" /> Publish
          </button>
        )}
        {article.status === 'published' && (
          <>
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={saving}
              className="px-4 py-2 text-sm text-amber-400 border border-amber-500/30 rounded-lg"
            >
              Unpublish
            </button>
            <Link
              href={`/insights/news/${article.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-400 border border-blue-500/30 rounded-lg"
            >
              View live <ExternalLink className="w-4 h-4" />
            </Link>
          </>
        )}
        {article.status !== 'archived' && (
          <button
            type="button"
            onClick={handleArchive}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 border border-zinc-700 rounded-lg"
          >
            <Archive className="w-4 h-4" /> Archive
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {article.status !== 'published' && (
        <div className="flex flex-wrap items-end gap-2 p-3 border border-zinc-800 rounded-lg bg-zinc-900/30">
          <div>
            <label className="text-[10px] uppercase text-zinc-500 block mb-1">
              Schedule publish (UTC local)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white"
            />
          </div>
          <button
            type="button"
            onClick={handleSchedule}
            disabled={saving || !scheduledAt}
            className="px-4 py-2 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg disabled:opacity-50"
          >
            Set schedule
          </button>
          <p className="text-[10px] text-zinc-600 w-full">
            Cron job for auto-publish at scheduled time — step 10. Until then, publish manually at
            scheduled time.
          </p>
        </div>
      )}

      <input
        value={article.title}
        onChange={(e) => setArticle({ ...article, title: e.target.value })}
        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-lg font-semibold text-white"
      />
      <textarea
        value={article.summary}
        maxLength={280}
        onChange={(e) => setArticle({ ...article, summary: e.target.value })}
        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white min-h-[60px]"
      />
      <textarea
        value={article.bodyMd}
        onChange={(e) => setArticle({ ...article, bodyMd: e.target.value })}
        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white min-h-[240px] font-mono"
      />

      <section className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-[10px] uppercase text-zinc-500 block mb-1">
            Regions (comma-separated)
          </label>
          <input
            value={article.region.join(', ')}
            onChange={(e) =>
              setArticle({
                ...article,
                region: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white"
            placeholder="africa, caribbean"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase text-zinc-500 block mb-1">
            Country ISO3 (comma-separated) — Related country intelligence
          </label>
          <input
            value={article.countryIso3.join(', ')}
            onChange={(e) =>
              setArticle({
                ...article,
                countryIso3: e.target.value
                  .split(',')
                  .map((s) => s.trim().toUpperCase())
                  .filter(Boolean),
              })
            }
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white font-mono"
            placeholder="NGA, GHA, JAM"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase text-zinc-500 block mb-1">Themes</label>
          <input
            value={article.themes.join(', ')}
            onChange={(e) =>
              setArticle({
                ...article,
                themes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white"
            placeholder="trade, policy"
          />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={article.liveWireFeatured ?? false}
              onChange={(e) =>
                setArticle({ ...article, liveWireFeatured: e.target.checked })
              }
              className="rounded border-zinc-600"
            />
            Live Wire hero (Deep Dive)
          </label>
          <div>
            <label className="text-[10px] uppercase text-zinc-500 block mb-1">Wire sort</label>
            <input
              type="number"
              min={0}
              value={article.liveWireSort ?? 0}
              onChange={(e) =>
                setArticle({ ...article, liveWireSort: Number(e.target.value) || 0 })
              }
              className="w-20 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase">
          Sources (validated on publish — no 404 links)
        </h2>
        {sources.map((s, i) => (
          <div key={s.id ?? i} className="grid gap-2 p-3 border border-zinc-800 rounded-lg">
            <input
              value={s.sourceName}
              onChange={(e) => {
                const next = [...sources];
                next[i] = { ...s, sourceName: e.target.value };
                setSources(next);
              }}
              className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white"
              placeholder="Source name"
            />
            <input
              value={s.sourceUrl}
              onChange={(e) => {
                const next = [...sources];
                next[i] = { ...s, sourceUrl: e.target.value };
                setSources(next);
              }}
              className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white"
              placeholder="URL"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setSources([
              ...sources,
              {
                id: `new-${Date.now()}`,
                sourceName: '',
                sourceUrl: '',
                retrievedAt: new Date().toISOString(),
                sortOrder: sources.length,
              },
            ])
          }
          className="text-xs text-blue-400 hover:underline"
        >
          + Add source
        </button>
      </section>
    </div>
  );
}
