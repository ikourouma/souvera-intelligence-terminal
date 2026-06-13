import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { RankingsTable } from '@/components/insights/RankingsTable';
import { ExpandableRankingsTable } from '@/components/insights/ExpandableRankingsTable';
import {
  fetchMarketRankings,
  RANKINGS_DISPLAY,
  type MarketRankingRow,
} from '@/lib/insights/market-rankings';
import { exploreCountryHref } from '@/lib/intelligence/routing';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess } from '@souvera/entitlements';

export const metadata: Metadata = {
  title: 'Market Rankings | Souvera',
  description:
    'Economic rankings for African and Caribbean markets. GDP rankings, growth metrics, and population scale across 74 mandate markets.',
  openGraph: {
    title: 'Market Rankings | Souvera',
    description: 'Economic rankings for African and Caribbean markets.',
    url: 'https://souvera.vercel.app/insights/rankings',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/insights/rankings',
  },
};

export const dynamic = 'force-dynamic';

function buildCountryHrefs(
  rows: MarketRankingRow[],
  access: { planRank: number; planId: string },
  isAuthenticated: boolean
): Record<string, string> {
  const hrefs: Record<string, string> = {};
  for (const row of rows) {
    hrefs[row.iso3] = exploreCountryHref({
      iso3: row.iso3,
      countryName: row.name,
      isAuthenticated,
      planRank: access.planRank,
      accessTier: access.planId,
      source: 'insights-rankings',
    });
  }
  return hrefs;
}

export default async function RankingsPage() {
  const [combinedRankings, africaRankings, caribbeanRankings] = await Promise.all([
    fetchMarketRankings({ region: 'all', limit: RANKINGS_DISPLAY.combinedTop }),
    fetchMarketRankings({ region: 'africa', limit: RANKINGS_DISPLAY.africaTotal }),
    fetchMarketRankings({ region: 'caribbean', limit: RANKINGS_DISPLAY.caribbeanTotal }),
  ]);

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = await resolveUserAccess(supabase, user?.id);
  const isAuthenticated = !!user;

  const allRows = [...combinedRankings, ...africaRankings, ...caribbeanRankings];
  const uniqueRows = Array.from(new Map(allRows.map((r) => [r.iso3, r])).values());
  const countryHrefs = buildCountryHrefs(uniqueRows, access, isAuthenticated);

  const preview = RANKINGS_DISPLAY.regionalPreview;

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
            <h1 className="text-2xl font-bold tracking-tighter">Market Rankings</h1>
            <span className="px-2 py-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest rounded-sm">
              Live macro data
            </span>
          </div>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Top {RANKINGS_DISPLAY.combinedTop} mandate markets by GDP, with regional previews (
            top {preview} each) expandable to all {RANKINGS_DISPLAY.africaTotal} African and{' '}
            {RANKINGS_DISPLAY.caribbeanTotal} Caribbean markets. Open links route by your access
            tier.
          </p>
        </header>

        {combinedRankings.length === 0 ? (
          <div className="py-16 text-center border border-zinc-800 rounded-sm bg-zinc-925">
            <p className="text-zinc-400">Rankings data is loading or unavailable.</p>
          </div>
        ) : (
          <div className="space-y-10">
            <RankingsTable
              title={`Top ${RANKINGS_DISPLAY.combinedTop} mandate markets by GDP`}
              subtitle="Combined Africa + Caribbean leaderboard"
              rows={combinedRankings}
              countryHrefs={countryHrefs}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <ExpandableRankingsTable
                title="Africa by GDP"
                subtitle="AU mandate scope"
                rows={africaRankings}
                previewCount={preview}
                expandLabel={`Show all ${RANKINGS_DISPLAY.africaTotal} African markets`}
                collapseLabel={`Show top ${preview} only`}
                compact
                countryHrefs={countryHrefs}
              />
              <ExpandableRankingsTable
                title="Caribbean by GDP"
                subtitle="Approved Caribbean scope"
                rows={caribbeanRankings}
                previewCount={preview}
                expandLabel={`Show all ${RANKINGS_DISPLAY.caribbeanTotal} territories`}
                collapseLabel={`Show top ${preview} only`}
                compact
                countryHrefs={countryHrefs}
              />
            </div>

            <p className="text-[10px] text-zinc-600 border-t border-zinc-800/50 pt-6">
              Signal column resolves profile → score model → growth-derived (~). Planned enhancements:
              sort by growth or GDP/capita, region filter tabs, investment score (Pro+), FDI/inflation
              columns, rank-change tracking, sector leader badges, CSV export.
            </p>
          </div>
        )}
      </div>

      <SouveraFooter />
    </main>
  );
}
