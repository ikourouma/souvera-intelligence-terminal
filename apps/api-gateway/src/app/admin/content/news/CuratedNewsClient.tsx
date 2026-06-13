'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  ExternalLink,
  Newspaper,
  Plus,
  RefreshCw,
  Archive,
} from 'lucide-react';
import type { CuratedNewsArticle, CuratedNewsIngestItem } from '@/types/curated-news';

type StatusFilter = 'draft' | 'in_review' | 'published' | 'archived';

const REGIONS = ['africa', 'caribbean', 'global'];
const THEMES = ['trade', 'policy', 'fx', 'fdi', 'energy', 'sector'];

export function CuratedNewsClient() {
  const [items, setItems] = useState<CuratedNewsArticle[]>([]);
  const [ingestItems, setIngestItems] = useState<CuratedNewsIngestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('draft');
  const [showCreate, setShowCreate] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    summary: '',
    bodyMd: '',
    region: ['africa'] as string[],
    countryIso3: '',
    themes: ['trade'] as string[],
    sourceName: '',
    sourceUrl: '',
    sourceSnippet: '',
  });

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/curated-news?status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to load articles');
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchIngest = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/curated-news/ingest?status=pending');
      if (!res.ok) return;
      const data = await res.json();
      setIngestItems(data.items ?? []);
    } catch {
      // ingest queue optional until migration runs
    }
  }, []);

  useEffect(() => {
    fetchArticles();
    fetchIngest();
  }, [fetchArticles, fetchIngest]);

  const handlePublish = async (id: string) => {
    setPublishingId(id);
    try {
      const res = await fetch(`/api/v1/admin/curated-news/${id}/publish`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Publish failed');
      }
      await fetchArticles();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setPublishingId(null);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/curated-news/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (!res.ok) throw new Error('Archive failed');
      await fetchArticles();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Archive failed');
    }
  };

  const handlePromoteIngest = async (ingestId: string) => {
    setPromotingId(ingestId);
    try {
      const res = await fetch('/api/v1/admin/curated-news/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingestId }),
      });
      if (!res.ok) throw new Error('Promote failed');
      await fetchIngest();
      setStatusFilter('draft');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Promote failed');
    } finally {
      setPromotingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/curated-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          bodyMd: form.bodyMd,
          region: form.region,
          countryIso3: form.countryIso3
            ? form.countryIso3.split(',').map((c) => c.trim().toUpperCase())
            : [],
          themes: form.themes,
          sources: [
            {
              sourceName: form.sourceName,
              sourceUrl: form.sourceUrl,
              snippet: form.sourceSnippet || undefined,
            },
          ],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Create failed');
      }
      setShowCreate(false);
      setForm({
        title: '',
        summary: '',
        bodyMd: '',
        region: ['africa'],
        countryIso3: '',
        themes: ['trade'],
        sourceName: '',
        sourceUrl: '',
        sourceSnippet: '',
      });
      setStatusFilter('draft');
      await fetchArticles();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-blue-400" />
            Curated News
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Editorial feed for <code className="text-zinc-300">/insights/news</code>. Publish only
            with source references.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              fetchArticles();
              fetchIngest();
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            New Article
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 space-y-4"
        >
          <h2 className="text-sm font-semibold text-white">Create draft</h2>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white"
          />
          <textarea
            required
            placeholder="Summary (≤280 chars)"
            maxLength={280}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white min-h-[60px]"
          />
          <textarea
            placeholder="Body (markdown)"
            value={form.bodyMd}
            onChange={(e) => setForm({ ...form, bodyMd: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white min-h-[120px]"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Country ISO3 tags (comma-separated, e.g. NGA,JAM)"
              value={form.countryIso3}
              onChange={(e) => setForm({ ...form, countryIso3: e.target.value })}
              className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white"
            />
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <label key={r} className="flex items-center gap-1 text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={form.region.includes(r)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        region: e.target.checked
                          ? [...form.region, r]
                          : form.region.filter((x) => x !== r),
                      })
                    }
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <label key={t} className="flex items-center gap-1 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={form.themes.includes(t)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      themes: e.target.checked
                        ? [...form.themes, t]
                        : form.themes.filter((x) => x !== t),
                    })
                  }
                />
                {t}
              </label>
            ))}
          </div>
          <div className="border-t border-zinc-800 pt-3 space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Source reference (required)</p>
            <input
              required
              placeholder="Source name (e.g. Reuters)"
              value={form.sourceName}
              onChange={(e) => setForm({ ...form, sourceName: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white"
            />
            <input
              required
              type="url"
              placeholder="Source URL"
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white"
            />
            <input
              placeholder="Snippet / quote (optional)"
              value={form.sourceSnippet}
              onChange={(e) => setForm({ ...form, sourceSnippet: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-sm text-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
          >
            Save draft
          </button>
        </form>
      )}

      {ingestItems.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Ingest queue ({ingestItems.length} pending)
          </h2>
          {ingestItems.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/30 flex justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{item.rawTitle}</p>
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1"
                >
                  Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <button
                type="button"
                disabled={promotingId === item.id}
                onClick={() => handlePromoteIngest(item.id)}
                className="shrink-0 px-3 py-1.5 text-xs text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 disabled:opacity-50"
              >
                {promotingId === item.id ? 'Promoting...' : '→ Draft'}
              </button>
            </div>
          ))}
        </section>
      )}

      <div className="flex gap-2 flex-wrap">
        {(['draft', 'in_review', 'published', 'archived'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              statusFilter === s
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'text-zinc-400 border-zinc-700 hover:border-zinc-600'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <div className="p-8 text-center border border-zinc-800 rounded-lg bg-zinc-900/50">
          <p className="text-zinc-400">No {statusFilter} articles.</p>
          <p className="text-xs text-zinc-600 mt-2">
            Run{' '}
            <code className="text-zinc-400">npx tsx scripts/seed-curated-news-pilot.ts</code> after
            migration.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 space-y-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/admin/content/news/${item.id}`}
                    className="text-white font-semibold hover:text-blue-400"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-zinc-500 mt-1">
                    /insights/news/{item.slug} · {item.sourceCount ?? 0} sources
                  </p>
                </div>
                <div className="flex gap-2">
                  {item.status === 'draft' && (
                    <button
                      type="button"
                      disabled={publishingId === item.id}
                      onClick={() => handlePublish(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {publishingId === item.id ? 'Publishing...' : 'Publish'}
                    </button>
                  )}
                  {item.status === 'published' && (
                    <Link
                      href={`/insights/news/${item.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-400 border border-blue-500/30 rounded-lg"
                    >
                      View live <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  {item.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => handleArchive(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-400 border border-zinc-700 rounded-lg hover:bg-zinc-800"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Archive
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-zinc-400 line-clamp-2">{item.summary}</p>
              <div className="flex flex-wrap gap-2 text-[10px]">
                {item.region.map((r) => (
                  <span key={r} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                    {r}
                  </span>
                ))}
                {item.countryIso3.map((c) => (
                  <span key={c} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                    {c}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
