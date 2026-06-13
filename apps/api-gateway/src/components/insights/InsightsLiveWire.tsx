'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Globe } from 'lucide-react';
import type { CuratedNewsArticle } from '@/types/curated-news';

const INITIAL_VISIBLE = 5;

interface Props {
  articles: CuratedNewsArticle[];
}

function formatWireTime(publishedAt: string | null): string {
  if (!publishedAt) return '—';
  try {
    return new Date(publishedAt).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '—';
  }
}

function themeTag(themes: string[]): string {
  if (!themes.length) return 'News';
  return themes[0].replace(/_/g, ' ');
}

export function InsightsLiveWire({ articles }: Props) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const { hero, feed } = useMemo(() => {
    if (!articles.length) return { hero: null, feed: [] as CuratedNewsArticle[] };
    const featured = articles.find((a) => a.liveWireFeatured) ?? articles[0];
    const rest = articles.filter((a) => a.slug !== featured.slug);
    return { hero: featured, feed: rest };
  }, [articles]);

  const visibleFeed = feed.slice(0, visibleCount);
  const hasMore = visibleCount < feed.length;
  const allShown = feed.length > 0 && visibleCount >= feed.length;

  if (!articles.length) {
    return (
      <div className="lg:col-span-6 border-x border-zinc-800/50 px-0 lg:px-6">
        <div className="py-12 text-center border border-dashed border-zinc-800 rounded-sm">
          <p className="text-sm text-zinc-500 mb-4">No Live Wire articles published yet.</p>
          <Link
            href="/insights/news"
            className="text-xs font-bold uppercase tracking-widest text-souvera-blue hover:text-blue-400"
          >
            Browse Souvera News →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-6 border-x border-zinc-800/50 px-0 lg:px-6">
      <div className="flex flex-col gap-0 divide-y divide-zinc-800/50">
        {hero && (
          <Link
            href={`/insights/news/${hero.slug}`}
            className="py-4 first:pt-0 block hover:bg-zinc-900/20 transition-colors -mx-4 px-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-zinc-800 text-souvera-blue w-fit">
                Deep Dive
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {formatWireTime(hero.publishedAt)} GMT
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tighter mb-2 hover:text-souvera-blue transition-colors">
              {hero.title}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-3">{hero.summary}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 uppercase">
              {hero.themes[0] && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" /> {themeTag(hero.themes)}
                </span>
              )}
              {hero.region[0] && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {hero.region[0]}
                </span>
              )}
            </div>
          </Link>
        )}

        {visibleFeed.map((item) => (
          <Link
            key={item.slug}
            href={`/insights/news/${item.slug}`}
            className="py-4 hover:bg-zinc-900/20 transition-colors -mx-4 px-4 block"
          >
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-[10px] font-mono text-zinc-500 shrink-0 w-10">
                {formatWireTime(item.publishedAt)}
              </span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded-sm">
                {themeTag(item.themes)}
              </span>
            </div>
            <h3 className="text-md pl-14 font-medium text-zinc-200 hover:text-white leading-snug">
              {item.title}
            </h3>
          </Link>
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setVisibleCount(feed.length)}
          className="w-full py-3 mt-6 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-colors text-xs font-bold uppercase tracking-widest text-zinc-400"
        >
          Load More Signals
        </button>
      ) : allShown || feed.length === 0 ? (
        <div className="mt-6 p-4 border border-zinc-800 rounded-sm bg-zinc-925 text-center">
          <p className="text-xs text-zinc-500 mb-3">
            {feed.length === 0
              ? 'Featured story above — more articles on Souvera News.'
              : "You've reached the end of today's wire."}
          </p>
          <Link
            href="/insights/news"
            className="inline-block text-xs font-bold uppercase tracking-widest text-souvera-blue hover:text-blue-400"
          >
            Browse all Souvera News →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
