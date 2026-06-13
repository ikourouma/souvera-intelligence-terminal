import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { NewsReferenceList } from '@/components/insights/NewsCard';
import { fetchPublishedArticleBySlug } from '@/lib/curated-news/public';
import { exploreCountryHref, canAccessCountryTerminal } from '@/lib/intelligence/routing';
import { countryDisplayName, isFullTerminalPilot } from '@/lib/intelligence/country-names';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess } from '@souvera/entitlements';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchPublishedArticleBySlug(slug);
  if (!article) return { title: 'Article not found | Souvera News' };

  return {
    title: `${article.title} | Souvera News`,
    description: article.summary,
    alternates: {
      canonical: `https://souvera.vercel.app/insights/news/${article.slug}`,
    },
  };
}

export const dynamic = 'force-dynamic';

function renderMarkdownSimple(body: string) {
  return body.split('\n\n').map((block, i) => {
    if (block.startsWith('## ')) {
      return (
        <h2 key={i} className="text-lg font-semibold text-white mt-8 mb-3">
          {block.replace(/^##\s+/, '')}
        </h2>
      );
    }
    if (block.startsWith('_') && block.endsWith('_')) {
      return (
        <p key={i} className="text-sm text-zinc-500 italic">
          {block.replace(/^_|_$/g, '')}
        </p>
      );
    }
    return (
      <p key={i} className="text-sm text-zinc-300 leading-relaxed">
        {block}
      </p>
    );
  });
}

export default async function InsightsNewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchPublishedArticleBySlug(slug);
  if (!article) notFound();

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = await resolveUserAccess(supabase, user?.id);

  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white font-sans">
      <SouveraMegaNav />

      <article className="pt-12 px-4 md:px-8 max-w-[800px] mx-auto pb-24">
        <Link
          href="/insights/news"
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All news
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.region.map((r) => (
              <span
                key={r}
                className="px-2 py-0.5 text-[10px] uppercase bg-zinc-800 text-zinc-500 rounded-sm"
              >
                {r}
              </span>
            ))}
            {article.themes.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[10px] uppercase bg-blue-500/10 text-blue-400 rounded-sm"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">{article.title}</h1>
          {published && (
            <p className="text-xs text-zinc-500 font-mono mt-4 uppercase tracking-wider">
              {published}
            </p>
          )}
          <p className="text-base text-zinc-400 mt-4 leading-relaxed">{article.summary}</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-4 mb-10">
          {renderMarkdownSimple(article.bodyMd)}
        </div>

        {article.countryIso3.length > 0 && (
          <section className="mb-10 p-4 border border-zinc-800 rounded-sm bg-zinc-925">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-3">
              Related country intelligence
            </p>
            <div className="flex flex-wrap gap-2">
              {article.countryIso3.map((iso) => {
                const name = countryDisplayName(iso);
                const pilot = isFullTerminalPilot(iso);
                return (
                  <Link
                    key={iso}
                    href={exploreCountryHref({
                      iso3: iso,
                      countryName: name,
                      isAuthenticated: access.isAuthenticated,
                      accessTier: access.planId,
                      planRank: access.planRank,
                      source: 'curated-news',
                    })}
                    className="px-3 py-1.5 text-xs font-medium text-blue-400 border border-blue-500/30 rounded-sm hover:bg-blue-500/10"
                    title={
                      pilot
                        ? `Open ${name} intelligence terminal (Explorer+ required)`
                        : `${name} terminal — preview coverage expanding`
                    }
                  >
                    Explore {name}
                    {!pilot ? ' (preview)' : ''} →
                  </Link>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-600 mt-3">
              {canAccessCountryTerminal(access.isAuthenticated, access.planRank)
                ? 'Your plan opens the country terminal directly. Locked tabs reflect your entitlement tier.'
                : access.isAuthenticated
                  ? 'Upgrade to Explorer to open country terminals. Higher tiers unlock sector rationale and macro depth.'
                  : 'Log in with Explorer+ to open country terminals directly. Others are guided to request access.'}
            </p>
          </section>
        )}

        {article.sources && article.sources.length > 0 && (
          <NewsReferenceList sources={article.sources} />
        )}
      </article>

      <SouveraFooter />
    </main>
  );
}
