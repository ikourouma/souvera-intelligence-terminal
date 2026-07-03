'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Database, Info, ChevronRight } from 'lucide-react';
import { SIGNAL_COLORS, type SignalLevel } from '@/lib/intelligence-entitlements';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { resolveMarketSignal } from '@/lib/insights/signal-display';

export interface CountryHeaderBarProps {
  country: {
    iso3: string;
    name: string;
    flagUrl: string;
    region: string;
    subregion?: string;
    capital?: string;
    currencyCode?: string;
  };
  signal: {
    level: SignalLevel;
    investmentScore: number | null;
    confidenceScore: number | null;
  } | null;
  freshness: {
    updatedAt: string;
    sources: Array<{ key: string; name: string }>;
  };
  compact?: boolean;
  currentSection?: string;
  className?: string;
}

/**
 * CountryHeaderBar - Header section for Country Intelligence Panel
 * 
 * Visual Capitalist Principle: Visual Hierarchy & Flow
 * Header Bar = immediate visual anchor with signal badge
 * 
 * Two Modes:
 * 1. Full Mode (default): Complete header with all metadata
 * 2. Compact Mode: Condensed header with integrated breadcrumb (Nigeria › Economy)
 * 
 * Layout (Full):
 * [Flag] [Country Name] [Signal Badge: HIGH GROWTH ●]
 * [Region Icon] Eastern Africa • Capital: Nairobi
 * [Data Freshness: Updated May 13, 2026 ● World Bank, REST Countries]
 * 
 * Layout (Compact):
 * [Flag] [Nigeria › Economy] [Signal: HIGH ●]
 */
export function CountryHeaderBar({
  country,
  signal,
  freshness,
  compact = false,
  currentSection = 'Overview',
  className = '',
}: CountryHeaderBarProps) {
  const resolved = resolveMarketSignal({ profileSignal: signal?.level });
  const level = resolved.level as SignalLevel;
  const signalColor = SIGNAL_COLORS[level];
  const investmentScore = signal?.investmentScore;
  const confidenceScore = signal?.confidenceScore;
  const updatedDate = new Date(freshness.updatedAt);
  const formattedDate = updatedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // ==========================================
  // COMPACT MODE (Sticky Header with Integrated Breadcrumb)
  // ==========================================
  if (compact) {
    return (
      <div className={`bg-zinc-950 border-b border-zinc-800 px-6 py-2.5 flex items-center justify-between ${className}`}>
        {/* Left: Integrated Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          {/* Flag (Small) */}
          {country.flagUrl && (
            <Image 
              src={country.flagUrl} 
              width={20} 
              height={14} 
              className="rounded-sm border border-zinc-700"
              alt={`${country.name} flag`}
              unoptimized
            />
          )}
          
          {/* Country Name (Clickable) */}
          <Link 
            href={`/country/${country.iso3}`}
            className="font-bold text-white hover:text-emerald-400 transition-colors"
          >
            {country.name}
          </Link>
          
          {/* Separator */}
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          
          {/* Current Section */}
          <span className="text-zinc-400 font-medium">
            {currentSection}
          </span>
        </div>
        
        {/* Right: Signal Badge (Compact) */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${signalColor.text} uppercase tracking-wider flex items-center gap-1.5`}>
            Signal
            <HelpTooltip term="signal_strength" size="sm" position="bottom" />
          </span>
          <span className={`text-xs font-bold ${signalColor.text}`}>
            {signalColor.label}
          </span>
          <div className={`w-2 h-2 rounded-full ${signalColor.bg.replace('/10', '')} animate-pulse`} />
        </div>
      </div>
    );
  }

  // ==========================================
  // FULL MODE (Initial State)
  // ==========================================

  return (
    <div className={`bg-zinc-950 border-b border-zinc-800 p-6 ${className}`}>
      {/* Top Row: Flag + Name + Signal Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Country Flag */}
          {country.flagUrl && (
            <div className="shrink-0">
              <Image
                src={country.flagUrl}
                alt={`${country.name} flag`}
                width={48}
                height={32}
                className="w-12 h-8 object-cover rounded-sm border border-zinc-700 shadow-lg"
                unoptimized
              />
            </div>
          )}

          {/* Country Name */}
          <div>
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {country.name}
            </h1>
            <p className="text-xs text-zinc-600 uppercase tracking-wider mt-1">
              {country.iso3}
            </p>
          </div>
        </div>

        {/* Signal Badge (Visual Capitalist: Strategic Color) */}
        <div className={`flex items-center gap-3 px-4 py-2.5 ${signalColor.bg} border ${signalColor.border} rounded-sm`}>
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-bold ${signalColor.text} uppercase tracking-widest flex items-center gap-1.5`}>
              Signal
              <HelpTooltip term="signal_strength" size="sm" position="bottom" />
            </span>
            <span className={`text-lg font-black ${signalColor.text}`}>
              {signalColor.label}
            </span>
          </div>
          <div className={`w-3 h-3 rounded-full ${signalColor.bg.replace('/10', '')} animate-pulse`} />
        </div>
      </div>

      {/* Middle Row: Region + Capital */}
      <div className="flex items-center gap-4 mb-3">
        {/* Region */}
        <div className="flex items-center gap-2 text-zinc-400">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {country.subregion || country.region}
          </span>
        </div>

        {/* Capital */}
        {country.capital && (
          <>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Capital:</span>
              <span className="text-sm">{country.capital}</span>
            </div>
          </>
        )}

        {/* Currency */}
        {country.currencyCode && (
          <>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Currency:</span>
              <span className="text-sm">{country.currencyCode}</span>
            </div>
          </>
        )}
      </div>

      {/* Bottom Row: Data Freshness + Sources */}
      <div className="flex items-center gap-2 text-[10px] text-zinc-600">
        <Calendar className="w-3 h-3" />
        <span className="font-semibold">Updated {formattedDate}</span>
        <span className="text-zinc-800">•</span>
        <Database className="w-3 h-3" />
        <span>
          Source: {freshness.sources.map(s => s.name).join(', ')}
        </span>
      </div>

      {/* Signal Score Details (Hover Info) */}
      <div className="mt-3 flex items-start gap-2 text-[10px] text-zinc-600 bg-zinc-900/30 border border-zinc-800/50 rounded-sm p-2">
        <Info className="w-3 h-3 text-zinc-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-500">Signal Details:</span>{' '}
          Investment Score: {investmentScore != null ? `${investmentScore}/100` : 'Pending'} • 
          Confidence: {confidenceScore != null ? `${confidenceScore}/100` : 'Pending'} • {signalColor.description}
        </div>
      </div>
    </div>
  );
}
