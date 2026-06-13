import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { NewsCard } from '@/components/insights/NewsCard';
import { fetchBriefingArticles } from '@/lib/curated-news/public';

export const metadata: Metadata = {
  title: 'Strategic Briefings | Souvera',
  description:
    'Expert-led strategic briefings on African and Caribbean markets. Policy analysis, sector deep-dives, and market intelligence.',
  openGraph: {
    title: 'Strategic Briefings | Souvera',
    description: 'Expert-led strategic briefings on African and Caribbean markets.',
    url: 'https://souvera.vercel.app/insights/briefings',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/insights/briefings',
  },
};

export const dynamic = 'force-dynamic';

export default async function BriefingsPage() {
  const articles = await fetchBriefingArticles({ limit: 24 });

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white font-sans">
      <SouveraMegaNav />

      <div className="pt-12 px-4 md:px-8 max-w-[1200px] mx-auto pb-24">
        <Link
          href="/insights"
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Insights
        </Link>

        <header className="border-b border-zinc-800 pb-6 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tighter">Strategic Briefings</h1>
            <span className="px-2 py-1 text-[10px] font-mono bg-souvera-blue/20 text-souvera-blue border border-souvera-blue/30 uppercase tracking-widest rounded-sm">
              Curated · Source-attributed
            </span>
          </div>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Policy, trade, sector, and macro briefings drawn from Souvera&apos;s curated news
            library — each article includes referenced institutional sources.
          </p>
        </header>

        {articles.length === 0 ? (
          <div className="py-16 text-center border border-zinc-800 rounded-sm bg-zinc-925">
            <p className="text-zinc-400">No briefings published yet.</p>
            <p className="text-xs text-zinc-600 mt-2">
              Content is prepared in admin before public launch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

      <SouveraFooter />
    </main>
  );
}
