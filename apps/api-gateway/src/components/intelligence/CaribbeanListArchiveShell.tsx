'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Archive } from 'lucide-react';
import { CaribbeanMarketShell } from '@/components/intelligence/CaribbeanMarketShell';
import { CountryIntelligencePanel } from '@/components/intelligence/CountryIntelligencePanel';
import type { Country } from '@/components/intelligence/SouveraMapWorkspace';

/**
 * Frozen reference page for the v1 Caribbean list UI (archived 2026-05-20).
 * Production uses CaribbeanMapPanel via /intelligence/caribbean.
 */
export function CaribbeanListArchiveShell() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIso3, setSelectedIso3] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/countries?region=caribbean');
      const data = await res.json();
      setCountries(data.countries ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="border border-zinc-800 rounded-sm overflow-hidden bg-zinc-950">
      <div className="px-4 py-3 border-b border-amber-500/20 bg-amber-500/5 flex items-center gap-2">
        <Archive className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-xs text-amber-200/90">
          Archived v1 list UI — preserved for platform reference. Live Caribbean intelligence uses
          the geospatial map at{' '}
          <Link href="/intelligence/caribbean" className="underline hover:text-white">
            /intelligence/caribbean
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:h-[650px]">
        <div className="flex-1 lg:w-[65%] min-h-[400px] lg:h-full border-b lg:border-b-0 lg:border-r border-zinc-800">
          {loading ? (
            <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
              Loading…
            </div>
          ) : (
            <CaribbeanMarketShell
              countries={countries}
              selectedIso3={selectedIso3}
              onCountrySelect={setSelectedIso3}
            />
          )}
        </div>
        <div className="lg:w-[35%] min-h-[360px] lg:h-full">
          <CountryIntelligencePanel
            selectedIso3={selectedIso3}
            onClose={() => setSelectedIso3(null)}
            onCountrySelect={setSelectedIso3}
            defaultPanelTitle="Top Caribbean Economies"
            defaultPanelSubtitle="Select a market from the archived list"
          />
        </div>
      </div>
    </div>
  );
}
