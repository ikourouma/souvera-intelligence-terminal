'use client';

/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * Supply-Demand Matrix Client Component
 * Owner: Afronovation, Inc.
 * Phase 4C: Supply-Demand Matrix
 * =====================================================
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  BarChart3,
  Filter,
  Download,
  Grid3X3,
  List,
  RefreshCw,
  ChevronDown,
  Info,
  TrendingUp,
  Factory,
  Zap,
  Pickaxe,
  Wifi,
  CreditCard,
  Ship,
  Hotel,
  Wheat,
  Globe,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import { formatTradeCountryLabel, tradeCountryMatchesSearch } from '@/lib/intelligence/export-branding';
import { buildSupplyDemandMatrixSummaryAnalysis } from '@/lib/intelligence/supply-demand-card-analysis';
import { SupplyDemandCellDrawer } from '@/components/intelligence/SupplyDemandCellDrawer';
import type {
  MatrixCell,
  SupplyDemandResponse,
  SectorKey,
} from '@/lib/intelligence/supply-demand-types';

// ─── Utility Functions ────────────────────────────────────────────────────────

import { formatUsdCompact } from '@/lib/intelligence/format-usd';

const pct = (val: number) => `${val.toFixed(1)}%`;

const getOpportunityColor = (score: number): string => {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-emerald-400';
  if (score >= 50) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-400';
  return 'bg-red-400';
};

const getOpportunityBgColor = (score: number): string => {
  if (score >= 80) return 'bg-emerald-500/20';
  if (score >= 60) return 'bg-emerald-500/15';
  if (score >= 50) return 'bg-yellow-500/15';
  if (score >= 40) return 'bg-orange-500/15';
  return 'bg-red-500/15';
};

const getTierBadge = (tier: number): { label: string; color: string } => {
  switch (tier) {
    case 1: return { label: 'Tier 1', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    case 2: return { label: 'Tier 2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    case 3: return { label: 'Tier 3', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    case 4: return { label: 'Tier 4', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
    default: return { label: 'N/A', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
  }
};

const SECTOR_ICONS: Record<SectorKey, React.ReactNode> = {
  manufacturing_textiles: <Factory className="w-4 h-4" />,
  agriculture_food: <Wheat className="w-4 h-4" />,
  energy_power: <Zap className="w-4 h-4" />,
  mining_minerals: <Pickaxe className="w-4 h-4" />,
  digital_infrastructure: <Wifi className="w-4 h-4" />,
  fintech_finance: <CreditCard className="w-4 h-4" />,
  logistics_trade: <Ship className="w-4 h-4" />,
  tourism_hospitality: <Hotel className="w-4 h-4" />,
};

const SECTORS_ORDER: SectorKey[] = [
  'manufacturing_textiles',
  'agriculture_food',
  'energy_power',
  'mining_minerals',
  'digital_infrastructure',
  'fintech_finance',
  'logistics_trade',
  'tourism_hospitality',
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Filters {
  region: 'all' | 'Africa' | 'Caribbean';
  sectors: SectorKey[];
  tiers: number[];
  agoaOnly: boolean;
  cbtpaOnly: boolean;
  excludePetroleum: boolean;
  minScore: number;
  searchQuery: string;
}

interface Props {
  onCellClick?: (cell: MatrixCell) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SupplyDemandMatrixClient({ onCellClick }: Props) {
  const [data, setData] = useState<SupplyDemandResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCell, setSelectedCell] = useState<MatrixCell | null>(null);
  const matrixRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<Filters>({
    region: 'all',
    sectors: [],
    tiers: [],
    agoaOnly: false,
    cbtpaOnly: false,
    excludePetroleum: false,
    minScore: 0,
    searchQuery: '',
  });
  const [searchSuggestions, setSearchSuggestions] = useState<{ iso3: string; name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.region !== 'all') params.set('region', filters.region);
      if (filters.sectors.length > 0) params.set('sector', filters.sectors.join(','));
      if (filters.tiers.length > 0) params.set('tier', filters.tiers.join(','));
      if (filters.agoaOnly) params.set('agoa_only', 'true');
      if (filters.cbtpaOnly) params.set('cbtpa_only', 'true');
      if (filters.excludePetroleum) params.set('exclude_petroleum', 'true');
      if (filters.minScore > 0) params.set('min_opportunity_score', filters.minScore.toString());
      
      const res = await fetch(`/api/v1/intelligence/supply-demand?${params.toString()}`);
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch data');
      }
      
      const json: SupplyDemandResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Failed to load Supply-Demand Matrix');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build matrix grid data with search filtering
  const matrixGrid = useMemo(() => {
    if (!data) return { countries: [], grid: new Map() };
    
    const countrySet = new Map<string, { iso3: string; name: string; region: string }>();
    const grid = new Map<string, MatrixCell>();
    
    for (const cell of data.matrix) {
      // Apply search filter
      if (filters.searchQuery) {
        if (!tradeCountryMatchesSearch(cell.iso3, cell.country_name, filters.searchQuery)) continue;
      }
      
      countrySet.set(cell.iso3, {
        iso3: cell.iso3,
        name: cell.country_name,
        region: cell.region,
      });
      grid.set(`${cell.iso3}_${cell.sector_key}`, cell);
    }
    
    // Sort countries by avg opportunity score
    const countries = Array.from(countrySet.values()).sort((a, b) => {
      const aAvg = data.countries.find(c => c.iso3 === a.iso3)?.avg_opportunity_score ?? 0;
      const bAvg = data.countries.find(c => c.iso3 === b.iso3)?.avg_opportunity_score ?? 0;
      return bAvg - aAvg;
    });
    
    return { countries, grid };
  }, [data, filters.searchQuery]);

  const handleCellClick = (cell: MatrixCell) => {
    setSelectedCell(cell);
    onCellClick?.(cell);
  };

  const handleExportPNG = async () => {
    if (matrixRef.current && data) {
      const topCell = [...data.matrix].sort((a, b) => b.opportunity_score - a.opportunity_score)[0];
      await exportElementToPNG({
        element: matrixRef.current,
        fileName: `souvera-supply-demand-matrix-${new Date().toISOString().slice(0, 10)}`,
        cardTitle: 'Supply-Demand Matrix',
        countryName: 'Global Markets',
        curatedAnalysis: buildSupplyDemandMatrixSummaryAnalysis(
          data.cells.length,
          data.summary.data_vintage,
          topCell
        ),
        sourceAttribution: 'World Bank · UN Comtrade · UNCTAD · US Census Bureau',
        dataAsOf: data.summary.data_vintage,
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
      });
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    
    const headers = [
      'ISO3', 'Country', 'Region', 'Sector', 'Supply Score', 'Supply Confidence',
      'Demand Score', 'Demand Confidence', 'Opportunity Score', 'Opportunity Tier',
      'Current Trade USD', 'AGOA Eligible', 'CBTPA Eligible', 'Data Quality'
    ];
    
    const rows = data.matrix.map(cell => [
      cell.iso3,
      cell.country_name,
      cell.region,
      cell.sector_label,
      cell.supply_score,
      cell.supply_confidence,
      cell.demand_score,
      cell.demand_confidence,
      cell.opportunity_score,
      cell.opportunity_tier,
      cell.current_trade_usd,
      cell.agoa_eligible ? 'Yes' : 'No',
      cell.cbtpa_eligible ? 'Yes' : 'No',
      cell.data_quality_tier,
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `souvera-supply-demand-matrix-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading Supply-Demand Matrix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-xs mb-1">Total Cells</p>
          <p className="text-2xl font-bold text-white">{data.summary.total_cells}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
          <p className="text-emerald-400/70 text-xs mb-1">Tier 1 (High)</p>
          <p className="text-2xl font-bold text-emerald-400">{data.summary.tier_distribution[1]}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-400/70 text-xs mb-1">Tier 2 (Strong)</p>
          <p className="text-2xl font-bold text-blue-400">{data.summary.tier_distribution[2]}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-xs mb-1">Avg Supply</p>
          <p className="text-2xl font-bold text-white">{data.summary.avg_supply_score}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-xs mb-1">Avg Demand</p>
          <p className="text-2xl font-bold text-white">{data.summary.avg_demand_score}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-purple-400/70 text-xs mb-1">Avg Opportunity</p>
          <p className="text-2xl font-bold text-purple-400">{data.summary.avg_opportunity_score}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'matrix' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm ${
              showFilters ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.region !== 'all' || filters.sectors.length > 0 || filters.tiers.length > 0 || filters.agoaOnly || filters.cbtpaOnly || filters.minScore > 0) && (
              <span className="w-2 h-2 bg-purple-400 rounded-full" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:border-zinc-600"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white"
          >
            <Download className="w-4 h-4" />
            PNG
          </button>
        </div>
      </div>

      {/* Search Bar - Always visible */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3">
          <Search className="w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by country name or ISO code (e.g., South Africa, ZAF, Kenya...)"
            value={filters.searchQuery}
            onChange={(e) => {
              const query = e.target.value;
              setFilters(f => ({ ...f, searchQuery: query }));
              
              // Generate suggestions from loaded data
              if (query.length >= 1 && data) {
                const uniqueCountries = new Map<string, { iso3: string; name: string }>();
                data.matrix.forEach(cell => {
                  if (!uniqueCountries.has(cell.iso3)) {
                    uniqueCountries.set(cell.iso3, { iso3: cell.iso3, name: cell.country_name });
                  }
                });
                const matches = Array.from(uniqueCountries.values()).filter(c => 
                  c.name.toLowerCase().includes(query.toLowerCase()) ||
                  c.iso3.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 8);
                setSearchSuggestions(matches);
                setShowSuggestions(matches.length > 0);
              } else {
                setShowSuggestions(false);
              }
            }}
            onFocus={() => {
              if (searchSuggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(f => ({ ...f, searchQuery: '' }))}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Autocomplete Suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
            {searchSuggestions.map((country) => (
              <button
                key={country.iso3}
                onMouseDown={() => {
                  setFilters(f => ({ ...f, searchQuery: country.name }));
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-zinc-800 flex items-center justify-between border-b border-zinc-800 last:border-0"
              >
                <span className="text-white">{country.name}</span>
                <span className="text-zinc-500 text-sm">{country.iso3}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Region Filter */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Region</label>
              <select
                value={filters.region}
                onChange={(e) => setFilters(f => ({ ...f, region: e.target.value as 'all' | 'Africa' | 'Caribbean' }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
              >
                <option value="all">All Regions</option>
                <option value="Africa">Africa (54)</option>
                <option value="Caribbean">Caribbean (20)</option>
              </select>
            </div>

            {/* Tier Filter */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Opportunity Tier</label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((tier) => {
                  const badge = getTierBadge(tier);
                  const isSelected = filters.tiers.includes(tier);
                  return (
                    <button
                      key={tier}
                      onClick={() => setFilters(f => ({
                        ...f,
                        tiers: isSelected 
                          ? f.tiers.filter(t => t !== tier)
                          : [...f.tiers, tier]
                      }))}
                      className={`px-3 py-1 rounded border text-xs ${
                        isSelected ? badge.color : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {badge.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trade Preference */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Trade Preference</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters(f => ({ ...f, agoaOnly: !f.agoaOnly, cbtpaOnly: false }))}
                  className={`px-3 py-1.5 rounded border text-xs ${
                    filters.agoaOnly 
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}
                >
                  AGOA Only
                </button>
                <button
                  onClick={() => setFilters(f => ({ ...f, cbtpaOnly: !f.cbtpaOnly, agoaOnly: false }))}
                  className={`px-3 py-1.5 rounded border text-xs ${
                    filters.cbtpaOnly 
                      ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' 
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}
                >
                  CBTPA Only
                </button>
              </div>
              <button
                onClick={() => setFilters(f => ({ ...f, excludePetroleum: !f.excludePetroleum }))}
                className={`mt-2 px-3 py-1.5 rounded border text-xs ${
                  filters.excludePetroleum
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
                title="Hide Energy & Power cells (HTS Ch. 27) excluded from AGOA/CBI preferences"
              >
                Hide petroleum (HTS Ch. 27)
              </button>
              {data?.attribution.petroleum_excluded_cells != null && data.attribution.petroleum_excluded_cells > 0 && (
                <p className="text-[10px] text-zinc-500 mt-1.5 leading-snug">
                  {data.attribution.petroleum_excluded_cells} Energy &amp; Power cells flagged as excluded from preferential treatment.
                </p>
              )}
            </div>

            {/* Min Score */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Min Opportunity Score</label>
              <input
                type="range"
                min="0"
                max="80"
                step="10"
                value={filters.minScore}
                onChange={(e) => setFilters(f => ({ ...f, minScore: parseInt(e.target.value) }))}
                className="w-full"
              />
              <p className="text-xs text-zinc-500 mt-1">{filters.minScore > 0 ? `≥ ${filters.minScore}` : 'No minimum'}</p>
            </div>
          </div>

          {/* Sector Filter */}
          <div className="mt-4">
            <label className="block text-sm text-zinc-400 mb-2">Sectors</label>
            <div className="flex flex-wrap gap-2">
              {SECTORS_ORDER.map((key) => {
                const isSelected = filters.sectors.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => setFilters(f => ({
                      ...f,
                      sectors: isSelected
                        ? f.sectors.filter(s => s !== key)
                        : [...f.sectors, key]
                    }))}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {SECTOR_ICONS[key]}
                    <span>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).split(' ').slice(0, 2).join(' ')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.region !== 'all' || filters.sectors.length > 0 || filters.tiers.length > 0 || filters.agoaOnly || filters.cbtpaOnly || filters.excludePetroleum || filters.minScore > 0) && (
            <button
              onClick={() => setFilters({ region: 'all', sectors: [], tiers: [], agoaOnly: false, cbtpaOnly: false, excludePetroleum: false, minScore: 0, searchQuery: filters.searchQuery })}
              className="mt-4 text-sm text-purple-400 hover:text-purple-300"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Matrix View */}
      {viewMode === 'matrix' && (
        <div ref={matrixRef} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-zinc-900 z-10 text-left p-2 border-b border-zinc-700 text-zinc-400 font-medium min-w-[120px]">
                  Country
                </th>
                {SECTORS_ORDER.map((sector) => {
                  const sectorData = data.sectors.find(s => s.sector_key === sector);
                  return (
                    <th key={sector} className="p-2 border-b border-zinc-700 text-zinc-400 font-medium min-w-[90px]">
                      <div className="flex flex-col items-center gap-1">
                        {SECTOR_ICONS[sector]}
                        <span className="text-[10px] leading-tight text-center">
                          {sector.split('_')[0].slice(0, 6)}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {matrixGrid.countries.map((country) => (
                <tr key={country.iso3} className="hover:bg-zinc-800/30">
                  <td className="sticky left-0 bg-zinc-900/95 z-10 p-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{country.iso3}</span>
                      <span className="text-zinc-500 truncate max-w-[80px]" title={country.name}>
                        {country.name.length > 10 ? country.name.slice(0, 10) + '...' : country.name}
                      </span>
                      {country.region === 'Africa' && (
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" title="Africa" />
                      )}
                      {country.region === 'Caribbean' && (
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" title="Caribbean" />
                      )}
                    </div>
                  </td>
                  {SECTORS_ORDER.map((sector) => {
                    const cell = matrixGrid.grid.get(`${country.iso3}_${sector}`);
                    if (!cell) {
                      return (
                        <td key={sector} className="p-1 border-b border-zinc-800 text-center">
                          <div className="w-full h-10 bg-zinc-800/30 rounded flex items-center justify-center text-zinc-600">
                            —
                          </div>
                        </td>
                      );
                    }
                    
                    const tierBadge = getTierBadge(cell.opportunity_tier);
                    
                    return (
                      <td key={sector} className="p-1 border-b border-zinc-800">
                        <button
                          onClick={() => handleCellClick(cell)}
                          className={`w-full h-10 rounded flex flex-col items-center justify-center gap-0.5 transition-all hover:ring-2 hover:ring-purple-500/50 ${getOpportunityBgColor(cell.opportunity_score)} ${cell.preferential_excluded ? 'ring-1 ring-amber-500/40' : ''}`}
                          title={`${formatTradeCountryLabel(cell.iso3, cell.country_name)} - ${cell.sector_label}: ${cell.opportunity_score}/100${cell.preferential_excluded ? ' · Excluded from AGOA/CBI preferences (HTS Ch. 27)' : ''}`}
                        >
                          <span className="text-white font-bold text-sm">{Math.round(cell.opportunity_score)}</span>
                          <span className={`text-[8px] px-1 rounded ${tierBadge.color}`}>
                            T{cell.opportunity_tier}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <span className="text-zinc-500">Opportunity Score:</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" /> <span className="text-zinc-400">80+</span>
                <span className="w-3 h-3 rounded bg-emerald-400" /> <span className="text-zinc-400">60-79</span>
                <span className="w-3 h-3 rounded bg-yellow-500" /> <span className="text-zinc-400">50-59</span>
                <span className="w-3 h-3 rounded bg-orange-400" /> <span className="text-zinc-400">40-49</span>
                <span className="w-3 h-3 rounded bg-red-400" /> <span className="text-zinc-400">&lt;40</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-zinc-500">Africa</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                <span className="text-zinc-500">Caribbean</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="text-left p-4 text-zinc-400 font-medium">Country</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">Sector</th>
                  <th className="text-center p-4 text-zinc-400 font-medium">Supply</th>
                  <th className="text-center p-4 text-zinc-400 font-medium">Demand</th>
                  <th className="text-center p-4 text-zinc-400 font-medium">Opportunity</th>
                  <th className="text-center p-4 text-zinc-400 font-medium">Tier</th>
                  <th className="text-right p-4 text-zinc-400 font-medium">Trade</th>
                  <th className="text-center p-4 text-zinc-400 font-medium">Preferences</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {data.matrix.slice(0, 50).map((cell) => {
                  const tierBadge = getTierBadge(cell.opportunity_tier);
                  return (
                    <tr
                      key={cell.id}
                      onClick={() => handleCellClick(cell)}
                      className="border-t border-zinc-800 hover:bg-zinc-800/30 cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cell.region === 'Africa' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                          <span className="font-medium text-white">{formatTradeCountryLabel(cell.iso3, cell.country_name)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-zinc-300">
                          {SECTOR_ICONS[cell.sector_key as SectorKey]}
                          <span className="truncate max-w-[150px]">{cell.sector_label}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-white font-medium">{Math.round(cell.supply_score)}</span>
                          <span className={`text-[10px] ${cell.supply_confidence === 'A' ? 'text-emerald-400' : cell.supply_confidence === 'B' ? 'text-yellow-400' : 'text-zinc-500'}`}>
                            {cell.supply_confidence}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-white font-medium">{Math.round(cell.demand_score)}</span>
                          <span className={`text-[10px] ${cell.demand_confidence === 'A' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {cell.demand_confidence}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${getOpportunityBgColor(cell.opportunity_score)}`}>
                          <span className="text-white font-bold">{Math.round(cell.opportunity_score)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs border ${tierBadge.color}`}>
                          {tierBadge.label}
                        </span>
                      </td>
                      <td className="p-4 text-right text-zinc-300">
                        {formatUsdCompact(cell.current_trade_usd)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {cell.agoa_eligible && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[10px] text-emerald-400">
                              AGOA
                            </span>
                          )}
                          {cell.cbtpa_eligible && (
                            <span className="px-1.5 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-[10px] text-cyan-400">
                              CBTPA
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {data.matrix.length > 50 && (
            <div className="p-4 text-center text-zinc-500 text-sm border-t border-zinc-800">
              Showing top 50 of {data.matrix.length} results. Use filters to narrow down.
            </div>
          )}
        </div>
      )}

      {/* Top Opportunities */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Top 10 Opportunities
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {data.summary.top_opportunities.slice(0, 10).map((cell, idx) => {
            const tierBadge = getTierBadge(cell.opportunity_tier);
            return (
              <button
                key={cell.id}
                onClick={() => handleCellClick(cell)}
                className="flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-purple-500/30 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getOpportunityBgColor(cell.opportunity_score)}`}>
                  <span className="text-white font-bold">{Math.round(cell.opportunity_score)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{formatTradeCountryLabel(cell.iso3, cell.country_name)}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] border ${tierBadge.color}`}>
                      {tierBadge.label}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm truncate">{cell.sector_label}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                    <span>Supply: {Math.round(cell.supply_score)}</span>
                    <span>Demand: {Math.round(cell.demand_score)}</span>
                    <span>Trade: {formatUsdCompact(cell.current_trade_usd)}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Attribution */}
      <div className="text-center text-xs text-zinc-500 py-4">
        <p className="mb-1">{data.attribution.note}</p>
        <p>Data: {data.attribution.sources.slice(0, 4).join(' · ')}</p>
      </div>

      {/* Cell Detail Drawer */}
      {selectedCell && (
        <SupplyDemandCellDrawer
          cell={selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
}

export default SupplyDemandMatrixClient;
