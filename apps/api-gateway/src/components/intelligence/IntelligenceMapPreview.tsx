'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AfricaMapPanel } from './AfricaMapPanel';
import { DATA_STATUS_LABELS } from '@/lib/map-constants';

interface PreviewCountry {
  iso3: string;
  name: string;
  flagUrl?: string;
  gdpCurrentUsd?: number;
  gdpGrowthPct?: number;
  populationTotal?: number;
  capital?: string;
  subregion?: string;
  region?: string;
}

export function IntelligenceMapPreview() {
  const router = useRouter();
  const [countries, setCountries] = useState<PreviewCountry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/v1/countries?region=africa')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.countries) {
          setCountries(data.countries);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCountrySelect = (iso3: string) => {
    router.push(`/intelligence/map?country=${iso3}`);
  };

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-sm">
      <div className="aspect-video bg-zinc-950 rounded-sm overflow-hidden relative min-h-[240px]">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[240px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : countries.length > 0 ? (
          <div className="h-full min-h-[240px]">
            <AfricaMapPanel
              countries={countries}
              selectedIso3="NGA"
              onCountrySelect={handleCountrySelect}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[240px] text-sm text-zinc-500">
            Map preview unavailable — open full map
          </div>
        )}
        {!loading && countries.length > 0 && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent px-4 py-3 pointer-events-none">
            <p className="text-[10px] text-zinc-400">
              Click any country · Nigeria highlighted · Opens full intelligence map
            </p>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span>{DATA_STATUS_LABELS.previewData}</span>
        <span>{DATA_STATUS_LABELS.pilotNote}</span>
      </div>
    </div>
  );
}
