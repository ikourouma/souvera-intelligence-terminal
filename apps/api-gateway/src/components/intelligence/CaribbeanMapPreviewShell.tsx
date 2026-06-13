'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { CaribbeanMapPanel } from './CaribbeanMapPanel';
import {
  CaribbeanCoverageAudit,
  buildCaribbeanCoverageStatus,
} from './CaribbeanCoverageAudit';
import { countryDisplayName, isFullTerminalPilot } from '@/lib/intelligence/country-names';
import {
  exploreCountryHref,
  planRankFromTier,
} from '@/lib/intelligence/routing';
import type { Country } from './SouveraMapWorkspace';

export function CaribbeanMapPreviewShell() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIso3, setSelectedIso3] = useState<string | null>(null);
  const [access, setAccess] = useState({ authenticated: false, planRank: 0, planId: 'public' });
  const [polygonIso3, setPolygonIso3] = useState<string[]>([]);
  const [markerIso3, setMarkerIso3] = useState<string[]>([]);

  const loadCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/countries?region=caribbean');
      if (!res.ok) throw new Error('Failed to load Caribbean markets');
      const data = await res.json();
      setCountries(data.countries ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCountries();
    fetch('/api/v1/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((me) => {
        setAccess({
          authenticated: me.authenticated === true,
          planRank: me.access?.rank ?? planRankFromTier(me.access?.planId),
          planId: me.access?.planId ?? 'public',
        });
      })
      .catch(() => {});
  }, [loadCountries]);

  const handleCoverageChange = useCallback(
    (polygons: string[], markers: string[]) => {
      setPolygonIso3(polygons);
      setMarkerIso3(markers);
    },
    []
  );

  const coverage = useMemo(() => {
    const apiSet = new Set(countries.map((c) => c.iso3));
    return buildCaribbeanCoverageStatus(
      apiSet,
      new Set(polygonIso3),
      new Set(markerIso3)
    );
  }, [countries, polygonIso3, markerIso3]);

  const selected = countries.find((c) => c.iso3 === selectedIso3);

  return (
    <div className="border border-zinc-800 rounded-sm overflow-hidden bg-zinc-950">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[560px]">
        <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-zinc-800 min-h-[480px] lg:min-h-[620px]">
          {error ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center min-h-[480px]">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <p className="text-sm text-zinc-400">{error}</p>
              <button
                onClick={loadCountries}
                className="text-xs font-bold uppercase tracking-widest text-teal-400 hover:text-teal-300"
              >
                Retry
              </button>
            </div>
          ) : (
            <CaribbeanMapPanel
              countries={countries}
              selectedIso3={selectedIso3}
              onCountrySelect={setSelectedIso3}
              loading={loading}
              onCoverageChange={handleCoverageChange}
            />
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col min-h-[200px]">
          <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-500 mb-1">
              Preview panel
            </p>
            <p className="text-xs text-zinc-500">
              Five sub-zones by color · coverage audit lists all 20 mandate territories.
            </p>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {loading && (
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading markets…
              </div>
            )}

            {!loading && !selected && (
              <div className="flex-1 flex items-center justify-center text-center px-4 min-h-[120px]">
                <p className="text-sm text-zinc-600">
                  Select a territory on the map or in the coverage list below.
                </p>
              </div>
            )}

            {selected && (
              <>
                <div>
                  <p className="text-[10px] font-mono text-zinc-600 mb-1">{selected.iso3}</p>
                  <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                  {selected.capital && (
                    <p className="text-xs text-zinc-500 mt-1">Capital · {selected.capital}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-3">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-1">GDP</p>
                    <p className="text-sm font-bold text-teal-400">
                      {selected.gdpCurrentUsd != null
                        ? `$${(selected.gdpCurrentUsd / 1e9).toFixed(1)}B`
                        : 'Pending'}
                    </p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-3">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-1">Growth</p>
                    <p className="text-sm font-bold text-white">
                      {selected.gdpGrowthPct != null
                        ? `${selected.gdpGrowthPct > 0 ? '+' : ''}${selected.gdpGrowthPct.toFixed(1)}%`
                        : 'Pending'}
                    </p>
                  </div>
                </div>

                {isFullTerminalPilot(selected.iso3) && (
                  <span className="inline-flex w-fit px-2 py-1 text-[9px] uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-sm">
                    Full terminal pilot
                  </span>
                )}

                <Link
                  href={exploreCountryHref({
                    iso3: selected.iso3,
                    countryName: countryDisplayName(selected.iso3),
                    isAuthenticated: access.authenticated,
                    planRank: access.planRank,
                    accessTier: access.planId,
                    source: 'caribbean-map-preview',
                  })}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
                >
                  Open country profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {!loading && !error && (
        <CaribbeanCoverageAudit
          coverage={coverage}
          selectedIso3={selectedIso3}
          onSelect={setSelectedIso3}
        />
      )}
    </div>
  );
}
