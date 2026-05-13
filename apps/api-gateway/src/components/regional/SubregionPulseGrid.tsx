'use client';

import { useState, useEffect } from 'react';
import { MapPin, TrendingUp } from 'lucide-react';

interface SubregionData {
  name: string;
  countryCount: number;
  combinedGDP: string;
  avgGrowth: string | null;
  leadSignal: string;
  topCountries: string[];
}

interface SubregionPulseGridProps {
  title?: string;
  description?: string;
  onRegionClick?: (regionName: string) => void;
}

const AFRICA_SUBREGIONS = [
  { key: 'West Africa', label: 'West Africa', color: 'emerald' },
  { key: 'East Africa', label: 'East Africa', color: 'blue' },
  { key: 'North Africa', label: 'North Africa', color: 'amber' },
  { key: 'Central Africa', label: 'Central Africa', color: 'purple' },
  { key: 'Southern Africa', label: 'Southern Africa', color: 'cyan' },
];

export function SubregionPulseGrid({
  title = 'Regional Pulse',
  description,
  onRegionClick,
}: SubregionPulseGridProps) {
  const [subregions, setSubregions] = useState<SubregionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubregions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/countries?region=africa');
        
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }

        const data = await response.json();
        
        if (!data.countries) {
          setSubregions([]);
          return;
        }

        // Group by subregion
        const grouped = data.countries.reduce((acc: any, country: any) => {
          const subregion = country.subregion || 'Other';
          if (!acc[subregion]) {
            acc[subregion] = [];
          }
          acc[subregion].push(country);
          return acc;
        }, {});

        // Calculate metrics for each subregion
        const subregionData: SubregionData[] = Object.keys(grouped).map((subregion) => {
          const countries = grouped[subregion];
          const totalGDP = countries.reduce((sum: number, c: any) => sum + (c.gdpCurrentUsd || 0), 0);
          const growthRates = countries.map((c: any) => c.gdpGrowthPct).filter((g: any) => g !== null);
          const avgGrowth = growthRates.length > 0
            ? (growthRates.reduce((sum: number, g: number) => sum + g, 0) / growthRates.length).toFixed(1)
            : null;

          // Determine lead signal (most common)
          const signalCounts: any = {};
          countries.forEach((c: any) => {
            const signal = c.signalLevel || 'stable';
            signalCounts[signal] = (signalCounts[signal] || 0) + 1;
          });
          const leadSignal = Object.keys(signalCounts).sort((a, b) => signalCounts[b] - signalCounts[a])[0] || 'stable';

          // Top 3 countries by GDP
          const topCountries = countries
            .sort((a: any, b: any) => (b.gdpCurrentUsd || 0) - (a.gdpCurrentUsd || 0))
            .slice(0, 3)
            .map((c: any) => c.name);

          return {
            name: subregion,
            countryCount: countries.length,
            combinedGDP: formatGDP(totalGDP),
            avgGrowth,
            leadSignal,
            topCountries,
          };
        });

        setSubregions(subregionData);
      } catch (err) {
        console.error('Error fetching subregion data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubregions();
  }, []);

  const formatGDP = (gdp: number): string => {
    if (gdp === 0) return 'N/A';
    if (gdp >= 1e12) return `$${(gdp / 1e12).toFixed(1)}T`;
    if (gdp >= 1e9) return `$${(gdp / 1e9).toFixed(0)}B`;
    return `$${(gdp / 1e6).toFixed(0)}M`;
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'high_growth':
        return 'text-emerald-500';
      case 'emerging':
        return 'text-blue-500';
      case 'stable':
        return 'text-zinc-500';
      default:
        return 'text-zinc-600';
    }
  };

  const getSignalLabel = (signal: string) => {
    switch (signal) {
      case 'high_growth':
        return 'High Growth';
      case 'emerging':
        return 'Emerging';
      case 'stable':
        return 'Stable';
      default:
        return 'N/A';
    }
  };

  return (
    <section className="py-16 border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Subregions
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {title}
          </h2>
          {description && (
            <p className="text-lg text-zinc-400 max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {loading && (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {subregions.map((subregion) => {
              const signalColor = getSignalColor(subregion.leadSignal);
              const signalLabel = getSignalLabel(subregion.leadSignal);

              return (
                <button
                  key={subregion.name}
                  onClick={() => onRegionClick && onRegionClick(subregion.name)}
                  className="group p-6 bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-900 rounded-sm text-left transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <MapPin className="w-6 h-6 text-blue-500" />
                    <div
                      className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm ${signalColor} bg-current/10`}
                    >
                      {signalLabel}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3">
                    {subregion.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Countries</span>
                      <span className="text-white font-semibold">{subregion.countryCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">GDP</span>
                      <span className="text-white font-semibold">{subregion.combinedGDP}</span>
                    </div>
                    {subregion.avgGrowth && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Avg Growth</span>
                        <span className="text-emerald-400 font-semibold">{subregion.avgGrowth}%</span>
                      </div>
                    )}
                  </div>

                  {subregion.topCountries.length > 0 && (
                    <div className="pt-4 border-t border-zinc-800">
                      <div className="text-xs text-zinc-600 mb-2">Top Markets</div>
                      <div className="flex flex-wrap gap-1">
                        {subregion.topCountries.slice(0, 2).map((country) => (
                          <span
                            key={country}
                            className="text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded-sm"
                          >
                            {country.length > 10 ? country.substring(0, 10) + '...' : country}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
