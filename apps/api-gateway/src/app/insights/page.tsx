import type { Metadata } from 'next';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Clock, AlertTriangle, Globe } from 'lucide-react';
import { InsightsLiveWire } from '@/components/insights/InsightsLiveWire';
import { fetchLiveWireArticles } from '@/lib/curated-news/public';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Insights | Souvera',
  description: 'Strategic insights and market intelligence for African and Caribbean markets. Research briefings, market rankings, and economic analysis.',
  openGraph: {
    title: 'Insights | Souvera',
    description: 'Strategic insights and market intelligence for African and Caribbean markets.',
    url: 'https://souvera.vercel.app/insights',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/insights',
  },
};

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const liveWireArticles = await fetchLiveWireArticles({ limit: 12 });

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white font-sans">
      <SouveraMegaNav />
      
      <div className="pt-12 px-4 md:px-8 max-w-[1600px] mx-auto pb-24">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tighter">Souvera Live Wire</h1>
            <span className="px-2 py-1 text-[10px] font-mono bg-souvera-blue/20 text-souvera-blue border border-souvera-blue/30 uppercase tracking-widest rounded-sm">
              Source-Attributed Feed
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
            <Clock className="w-4 h-4" />
            <span className="uppercase">Lat: 38ms</span>
            <span className="w-px h-3 bg-zinc-800 mx-2" />
            <span className="uppercase text-emerald-500">System Nominal</span>
          </div>
        </div>

        {/* 3-Column Bloomberg Style Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Col 1: Macro Alerts & Markets (narrow left) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="border border-zinc-800 bg-zinc-925 rounded-sm overflow-hidden flex flex-col">
              <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Macro Alerts
              </div>
              <div className="p-3 flex flex-col gap-3">
                {liveWireArticles.slice(0, 3).map((article) => (
                  <Link
                    key={article.slug}
                    href={`/insights/news/${article.slug}`}
                    className="flex gap-3 pb-3 border-b border-zinc-800/50 last:border-0 last:pb-0 hover:opacity-90"
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-blue-400" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium leading-snug line-clamp-2">
                        {article.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {article.themes[0] ?? 'News'}
                      </span>
                    </div>
                  </Link>
                ))}
                {liveWireArticles.length === 0 && (
                  <p className="text-xs text-zinc-600">No alerts published.</p>
                )}
              </div>
            </div>

            <div className="border border-zinc-800 bg-zinc-925 rounded-sm overflow-hidden flex flex-col">
              <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Index Watchlist
              </div>
              <div className="p-0">
                {[
                  { sym: 'JSE Top 40', val: '74,210.50', chg: '+1.2%', dir: 'up' },
                  { sym: 'NGX All-Share', val: '104,321.10', chg: '-0.4%', dir: 'down' },
                  { sym: 'EGX 30', val: '28,140.00', chg: '+0.8%', dir: 'up' },
                  { sym: 'NSE All-Share', val: '142.15', chg: '+0.2%', dir: 'up' }
                ].map((idx, i) => (
                  <div key={i} className="flex justify-between items-center px-3 py-2 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50 transition-colors">
                    <span className="text-xs font-bold text-zinc-300">{idx.sym}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-mono">{idx.val}</span>
                       <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                         idx.dir === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                       }`}>{idx.chg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <InsightsLiveWire articles={liveWireArticles} />

          {/* Col 3: Research & Intelligence (right) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-sm">
               <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-zinc-400 flex items-center gap-2">
                 <Globe className="w-4 h-4 text-souvera-blue" />
                 Geospatial Modules
               </h3>
               <div className="flex flex-col gap-3">
                 <a href="/insights/news" className="group flex flex-col gap-1 p-3 bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 transition-colors">
                    <span className="text-sm font-bold group-hover:text-amber-400 transition-colors">Souvera News</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Curated editorial · Source-attributed</span>
                 </a>
                 <a href="/intelligence/africa" className="group flex flex-col gap-1 p-3 bg-zinc-950 border border-zinc-800 hover:border-souvera-blue/50 transition-colors">
                    <span className="text-sm font-bold group-hover:text-souvera-blue transition-colors">Africa Intelligence</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Country Profiles & Analysis</span>
                 </a>
                 <a href="/intelligence/caribbean" className="group flex flex-col gap-1 p-3 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-colors">
                    <span className="text-sm font-bold group-hover:text-emerald-400 transition-colors">Caribbean Intelligence</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Regional Analysis & Data</span>
                 </a>
               </div>
            </div>

            <div className="bg-zinc-925 border border-zinc-800 p-4 rounded-sm flex flex-col gap-2">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sponsored</span>
               <h4 className="text-sm font-medium">Download the Q3 Macro Report</h4>
               <p className="text-xs text-zinc-400 leading-relaxed mb-2">Comprehensive sentiment analysis covering 54 AU nations.</p>
               <button className="text-[10px] bg-white text-black font-bold uppercase tracking-widest py-2 rounded-sm hover:bg-zinc-200 transition-colors">
                 Access Report
               </button>
            </div>
          </div>
          
        </div>
      </div>
      
      <SouveraFooter />
    </main>
  );
}
