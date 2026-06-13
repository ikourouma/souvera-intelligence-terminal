import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { CuratedNewsArticle } from '@/types/curated-news';

interface NewsCardProps {
  article: CuratedNewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <article className="group border border-zinc-800 bg-zinc-925 rounded-sm p-4 hover:border-zinc-700 transition-colors">
      <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
        {date && <span>{date}</span>}
        {(article.sourceCount ?? 0) > 0 && (
          <>
            <span className="text-zinc-700">·</span>
            <span>{article.sourceCount} sources</span>
          </>
        )}
      </div>
      <Link href={`/insights/news/${article.slug}`} className="block">
        <h2 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors leading-snug">
          {article.title}
        </h2>
        <p className="text-sm text-zinc-400 mt-2 line-clamp-3">{article.summary}</p>
      </Link>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {article.region.map((r) => (
          <span key={r} className="px-2 py-0.5 text-[10px] uppercase bg-zinc-800 text-zinc-500 rounded-sm">
            {r}
          </span>
        ))}
        {article.themes.slice(0, 3).map((t) => (
          <span key={t} className="px-2 py-0.5 text-[10px] uppercase bg-blue-500/10 text-blue-400 rounded-sm">
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}

interface NewsReferenceListProps {
  sources: NonNullable<CuratedNewsArticle['sources']>;
}

export function NewsReferenceList({ sources }: NewsReferenceListProps) {
  if (!sources.length) return null;

  return (
    <section className="border border-zinc-800 rounded-sm overflow-hidden">
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        References ({sources.length})
      </div>
      <ol className="divide-y divide-zinc-800/80">
        {sources.map((source, i) => (
          <li key={source.id} className="px-4 py-3 text-sm">
            <span className="text-zinc-600 font-mono text-xs mr-2">[{i + 1}]</span>
            <a
              href={source.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 hover:text-blue-400 inline-flex items-center gap-1"
            >
              {source.sourceName}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            {source.snippet && (
              <p className="text-xs text-zinc-500 mt-1 pl-6 border-l border-zinc-800 ml-1">
                {source.snippet}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
