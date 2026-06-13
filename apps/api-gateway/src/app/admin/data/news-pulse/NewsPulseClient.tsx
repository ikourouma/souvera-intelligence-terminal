'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, ExternalLink, Newspaper, RefreshCw } from 'lucide-react';

interface NewsHeadline {
  title: string;
  url?: string;
  source?: string;
  publishedAt?: string;
}

interface NewsPulseItem {
  id: number;
  iso3: string;
  countryName: string;
  signalDate: string;
  headlineCount: number;
  sentimentScore: number;
  riskIntensity: number;
  opportunityIntensity: number;
  topHeadlines: NewsHeadline[];
  status: string;
}

export function NewsPulseClient() {
  const [items, setItems] = useState<NewsPulseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'draft' | 'published'>('draft');
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/news-pulse?status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to load news pulse queue');
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handlePublish = async (id: number) => {
    setPublishingId(id);
    try {
      const res = await fetch('/api/v1/admin/news-pulse', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'published' }),
      });
      if (!res.ok) throw new Error('Publish failed');
      await fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-amber-400" />
            News Pulse Review
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Pilot: Nigeria (NGA) + Jamaica (JAM). Review GDELT ingest drafts, then publish to show in the country terminal.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchItems}
          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/40 text-sm text-zinc-400 space-y-2">
        <p className="text-white font-medium">How this works</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-zinc-500">
          <li>
            <strong className="text-zinc-400">Data source:</strong> GDELT web news API (automated) or{' '}
            <code className="text-zinc-400">seed-news-pulse-pilot.ts</code> (manual fallback).
          </li>
          <li>
            <strong className="text-zinc-400">No create button:</strong> run ingest → items land in{' '}
            <em>Draft Queue</em> → you publish here. Not the same as{' '}
            <a href="/admin/content/news" className="text-blue-400 hover:underline">
              Curated News
            </a>{' '}
            (platform editorial at /insights/news).
          </li>
          <li>
            <strong className="text-zinc-400">Commands:</strong>{' '}
            <code className="text-zinc-400">npx tsx scripts/ingest-news-pulse.ts --draft</code>
            {' · '}
            <code className="text-zinc-400">npx tsx scripts/seed-news-pulse-pilot.ts</code>
          </li>
        </ul>
      </div>

      <div className="flex gap-2">
        {(['draft', 'published'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              statusFilter === s
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'text-zinc-400 border-zinc-700 hover:border-zinc-600'
            }`}
          >
            {s === 'draft' ? 'Draft Queue' : 'Published'}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <div className="p-8 text-center border border-zinc-800 rounded-lg bg-zinc-900/50">
          <p className="text-zinc-400">No {statusFilter} signals.</p>
          <p className="text-xs text-zinc-600 mt-2">
            Run <code className="text-zinc-400">npx tsx scripts/ingest-news-pulse.ts</code> to ingest from GDELT.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-white font-semibold">{item.countryName}</span>
                  <span className="text-zinc-500 text-sm ml-2">({item.iso3})</span>
                  <span className="text-zinc-600 text-xs ml-2">{item.signalDate}</span>
                </div>
                {statusFilter === 'draft' && (
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
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-zinc-600 block">Headlines</span>
                  <span className="text-white font-medium">{item.headlineCount}</span>
                </div>
                <div>
                  <span className="text-zinc-600 block">Sentiment</span>
                  <span className="text-white font-medium">{item.sentimentScore?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-zinc-600 block">Risk</span>
                  <span className="text-red-400 font-medium">{item.riskIntensity}/100</span>
                </div>
                <div>
                  <span className="text-zinc-600 block">Opportunity</span>
                  <span className="text-emerald-400 font-medium">{item.opportunityIntensity}/100</span>
                </div>
              </div>

              {item.topHeadlines?.length > 0 && (
                <ul className="space-y-1.5 pt-2 border-t border-zinc-800">
                  {item.topHeadlines.slice(0, 5).map((h, i) => (
                    <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                      <span className="text-zinc-600 shrink-0">{i + 1}.</span>
                      {h.url && h.url !== '#' ? (
                        <a
                          href={h.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-300 hover:text-amber-400 flex items-center gap-1"
                        >
                          {h.title}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-zinc-300">{h.title}</span>
                      )}
                      {h.source && (
                        <span className="text-zinc-600 shrink-0">— {h.source}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
