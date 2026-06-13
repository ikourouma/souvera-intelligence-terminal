'use client';

import Image from 'next/image';
import { REGION_COLORS, type AfricaRegion, isDisputedTerritory } from '@/lib/map-constants';

interface TooltipCountry {
  iso3: string;
  name: string;
  region?: AfricaRegion;
  flagUrl?: string;
  gdpCurrentUsd?: number;
  gdpGrowthPct?: number;
  populationTotal?: number;
  capital?: string;
  subregion?: string;
  /** UI-only USTR country page (not shown in PDFs). */
  ustrCountryPageUrl?: string;
}

interface MapTooltipProps {
  country: TooltipCountry | null;
  position: { x: number; y: number } | null;
}

function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'N/A';
  
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatPopulation(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'N/A';
  
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}

function formatGrowth(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function MapTooltip({ country, position }: MapTooltipProps) {
  if (!country || !position) return null;

  const isDisputed = isDisputedTerritory(country.iso3);
  const colors = country.region ? REGION_COLORS[country.region] : null;

  return (
    <div
      className="fixed z-[200] pointer-events-none"
      style={{ 
        left: position.x + 14, 
        top: position.y - 10, 
        maxWidth: 280 
      }}
    >
      <div className="bg-zinc-900/98 border border-zinc-700 rounded-lg shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          {/* Flag */}
          {country.flagUrl && (
            <Image 
              src={country.flagUrl} 
              alt={`${country.name} flag`}
              width={24}
              height={16}
              className="w-6 h-4 object-cover rounded-sm border border-zinc-700 shrink-0"
              unoptimized
            />
          )}
          
          {/* Region dot */}
          {colors && (
            <div 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: colors.fill }} 
            />
          )}
          
          {/* Name */}
          <span className="text-white font-bold text-sm tracking-tight flex-1 truncate">
            {country.name}
          </span>
          
          {/* Disputed badge */}
          {isDisputed && (
            <span className="text-[8px] font-bold uppercase tracking-widest text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-800/40">
              Disputed
            </span>
          )}
        </div>

        {isDisputed ? (
          <div className="px-4 py-3">
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Disputed non-self-governing territory. Souvera maintains diplomatic neutrality.
            </p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-px bg-zinc-800/50">
              <div className="bg-zinc-900/80 px-3 py-2">
                <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">GDP</div>
                <div className="text-sm font-bold text-blue-400">
                  {formatNumber(country.gdpCurrentUsd)}
                </div>
              </div>
              <div className="bg-zinc-900/80 px-3 py-2">
                <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Growth</div>
                <div className={`text-sm font-bold ${country.gdpGrowthPct !== undefined && country.gdpGrowthPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatGrowth(country.gdpGrowthPct)}
                </div>
              </div>
              <div className="bg-zinc-900/80 px-3 py-2">
                <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Population</div>
                <div className="text-sm font-bold text-zinc-300">
                  {formatPopulation(country.populationTotal)}
                </div>
              </div>
              <div className="bg-zinc-900/80 px-3 py-2">
                <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Capital</div>
                <div className="text-sm font-bold text-zinc-300 truncate">
                  {country.capital || 'N/A'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 space-y-1.5">
              {country.ustrCountryPageUrl && (
                <a
                  href={country.ustrCountryPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold block truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  USTR country page ↗
                </a>
              )}
              <div className="flex items-center justify-between">
                {colors && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: colors.fill }}
                  >
                    {colors.label}
                  </span>
                )}
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                  Click for full brief →
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
