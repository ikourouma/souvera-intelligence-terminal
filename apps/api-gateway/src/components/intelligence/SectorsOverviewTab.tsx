'use client';

import { Database, Globe } from 'lucide-react';
import { SECTOR_DEFINITIONS } from '@/lib/intelligence/supply-demand-types';
import { SectorOverviewCard } from './SectorOverviewCard';

interface SectorsOverviewTabProps {
  region: 'africa' | 'caribbean' | 'all';
  onSectorClick?: (sectorKey: string) => void;
}

/**
 * SectorsOverviewTab - Showcase of 8 core sectors
 * 
 * Displays all sectors with narratives, key insights, and coverage stats.
 * Part of the intelligence map workspace as a new tab/view.
 */
export function SectorsOverviewTab({
  region,
  onSectorClick,
}: SectorsOverviewTabProps) {
  // Regional coverage stats
  const africaMarkets = 54;
  const caribbeanMarkets = 20;
  const totalMarkets = africaMarkets + caribbeanMarkets;

  const regionLabel = region === 'africa' 
    ? 'African' 
    : region === 'caribbean' 
    ? 'Caribbean' 
    : 'Africa + Caribbean';

  const marketCount = region === 'africa' 
    ? africaMarkets 
    : region === 'caribbean' 
    ? caribbeanMarkets 
    : totalMarkets;

  // Calculate cells analyzed (markets × sectors)
  const cellsAnalyzed = marketCount * 8;

  // Static top markets per sector (MVP - consistent data)
  // TODO: Replace with dynamic data from API in Phase 2
  const topMarketsBySector: Record<string, { africa: Array<{iso3: string; name: string; score?: number}>; caribbean: Array<{iso3: string; name: string; score?: number}> }> = {
    manufacturing_textiles: {
      africa: [
        { iso3: 'ETH', name: 'Ethiopia', score: 92 },
        { iso3: 'KEN', name: 'Kenya', score: 85 },
        { iso3: 'ZAF', name: 'South Africa', score: 78 },
      ],
      caribbean: [
        { iso3: 'DOM', name: 'Dominican Republic', score: 88 },
        { iso3: 'HTI', name: 'Haiti', score: 82 },
        { iso3: 'JAM', name: 'Jamaica', score: 76 },
      ],
    },
    agriculture_food: {
      africa: [
        { iso3: 'KEN', name: 'Kenya', score: 88 },
        { iso3: 'GHA', name: 'Ghana', score: 84 },
        { iso3: 'CIV', name: 'Côte d\'Ivoire', score: 80 },
      ],
      caribbean: [
        { iso3: 'JAM', name: 'Jamaica', score: 86 },
        { iso3: 'TTO', name: 'Trinidad & Tobago', score: 82 },
        { iso3: 'DOM', name: 'Dominican Republic', score: 78 },
      ],
    },
    energy_power: {
      africa: [
        { iso3: 'EGY', name: 'Egypt', score: 90 },
        { iso3: 'NGA', name: 'Nigeria', score: 88 },
        { iso3: 'ZAF', name: 'South Africa', score: 86 },
      ],
      caribbean: [
        { iso3: 'TTO', name: 'Trinidad & Tobago', score: 89 },
        { iso3: 'JAM', name: 'Jamaica', score: 80 },
        { iso3: 'BRB', name: 'Barbados', score: 75 },
      ],
    },
    mining_minerals: {
      africa: [
        { iso3: 'COD', name: 'DR Congo', score: 95 },
        { iso3: 'ZWE', name: 'Zimbabwe', score: 88 },
        { iso3: 'GHA', name: 'Ghana', score: 82 },
      ],
      caribbean: [
        { iso3: 'JAM', name: 'Jamaica', score: 85 },
        { iso3: 'TTO', name: 'Trinidad & Tobago', score: 78 },
        { iso3: 'DOM', name: 'Dominican Republic', score: 72 },
      ],
    },
    digital_infrastructure: {
      africa: [
        { iso3: 'NGA', name: 'Nigeria', score: 87 },
        { iso3: 'KEN', name: 'Kenya', score: 85 },
        { iso3: 'ZAF', name: 'South Africa', score: 83 },
      ],
      caribbean: [
        { iso3: 'JAM', name: 'Jamaica', score: 88 },
        { iso3: 'TTO', name: 'Trinidad & Tobago', score: 84 },
        { iso3: 'BRB', name: 'Barbados', score: 80 },
      ],
    },
    fintech_finance: {
      africa: [
        { iso3: 'KEN', name: 'Kenya', score: 93 },
        { iso3: 'NGA', name: 'Nigeria', score: 89 },
        { iso3: 'ZAF', name: 'South Africa', score: 82 },
      ],
      caribbean: [
        { iso3: 'JAM', name: 'Jamaica', score: 90 },
        { iso3: 'TTO', name: 'Trinidad & Tobago', score: 85 },
        { iso3: 'BRB', name: 'Barbados', score: 81 },
      ],
    },
    logistics_trade: {
      africa: [
        { iso3: 'KEN', name: 'Kenya', score: 88 },
        { iso3: 'NGA', name: 'Nigeria', score: 84 },
        { iso3: 'ZAF', name: 'South Africa', score: 82 },
      ],
      caribbean: [
        { iso3: 'JAM', name: 'Jamaica', score: 92 },
        { iso3: 'PAN', name: 'Panama', score: 90 },
        { iso3: 'DOM', name: 'Dominican Republic', score: 83 },
      ],
    },
    tourism_hospitality: {
      africa: [
        { iso3: 'EGY', name: 'Egypt', score: 91 },
        { iso3: 'KEN', name: 'Kenya', score: 85 },
        { iso3: 'ZAF', name: 'South Africa', score: 82 },
      ],
      caribbean: [
        { iso3: 'JAM', name: 'Jamaica', score: 94 },
        { iso3: 'BRB', name: 'Barbados', score: 90 },
        { iso3: 'BHS', name: 'Bahamas', score: 88 },
      ],
    },
  };

  // Filter top markets by region
  const filterMarketsByRegion = (markets: typeof topMarketsBySector[string]) => {
    if (region === 'all') {
      // Combine both regions for 'all' view
      return [...markets.africa, ...markets.caribbean].slice(0, 3);
    }
    
    return region === 'africa' ? markets.africa : markets.caribbean;
  };

  // Convert SECTOR_DEFINITIONS to array
  const sectors = Object.values(SECTOR_DEFINITIONS);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Banner */}
      <div className="border-b border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-black text-white">
              Explore 8 Core Sectors
            </h1>
          </div>
          <p className="text-lg text-zinc-400 max-w-3xl">
            Investment opportunities across {regionLabel} markets
          </p>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="border-b border-zinc-800 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-500" />
              <span className="text-zinc-400">
                <span className="font-bold text-white">{marketCount}</span> {regionLabel} markets
              </span>
            </div>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-400">
              <span className="font-bold text-white">8</span> core sectors
            </span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-400">
              <span className="font-bold text-white">{cellsAnalyzed}</span> sector-market cells analyzed
            </span>
          </div>
        </div>
      </div>

      {/* Sectors Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {sectors.map((sector) => (
            <div key={sector.key} className="flex">
              <SectorOverviewCard
                sector={sector}
                stats={{
                  marketsCovered: marketCount,
                  topMarkets: filterMarketsByRegion(topMarketsBySector[sector.key] || []),
                }}
                region={region}
                onExploreClick={onSectorClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
