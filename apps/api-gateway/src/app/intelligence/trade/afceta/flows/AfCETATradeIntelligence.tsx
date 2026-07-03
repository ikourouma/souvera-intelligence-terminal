'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  Beaker,
  Flame,
  Filter,
  Info,
  RefreshCw,
  Star,
  TrendingUp,
  Database,
} from 'lucide-react';
import { flagUrlFromIso3, formatTradeCountryLabel } from '@/lib/intelligence/export-branding';
import { AFCETA_PILLARS } from '@/lib/intelligence/afceta-pillar-map';
import { AFCETA_FORUM } from '@/lib/intelligence/afceta-framework-content';
import { AFCETA_SHARED_CATEGORIES } from '@/lib/intelligence/afceta-types';
import { AFCETA_EXPORT_PRODUCTS_CARD_EXPLANATION } from '@/lib/intelligence/afceta-export-product-tiers';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '@/lib/market-coverage';
import { countryDisplayName } from '@/lib/intelligence/country-names';
import AfCETACorridorDrawer, {
  CATEGORY_COLORS,
  formatCorridorUsd,
  type AfcetaCorridorRow,
  type AfcetaDirection,
} from '@/components/intelligence/AfCETACorridorDrawer';
import { LiveCuratedBanner } from '@/components/intelligence/LiveCuratedBanner';

type ViewMode = 'platform' | 'lab';

interface FlowResponse {
  rows: AfcetaCorridorRow[];
  summary: {
    record_count: number;
    corridor_pairs: number;
    spotlight_count: number;
    data_vintage: string;
    origin?: string;
    dest?: string;
  };
  attribution: { sources: string[]; note: string };
  evaluation_mode?: 'platform' | 'custom';
}

interface Filters {
  origin: string;
  dest: string;
  categories: string[];
  pillar: string;
  tiers: string[];
  minScore: number;
  spotlightOnly: boolean;
  searchQuery: string;
}

const DEFAULT_FILTERS: Filters = {
  origin: '',
  dest: '',
  categories: [],
  pillar: '',
  tiers: [],
  minScore: 0,
  spotlightOnly: false,
  searchQuery: '',
};

const CATEGORY_KEYS = Object.keys(AFCETA_SHARED_CATEGORIES);

function sortedCountryOptions(iso3List: readonly string[]) {
  return [...iso3List]
    .map((iso) => ({ iso, name: countryDisplayName(iso) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function AfCETATradeIntelligence() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('platform');
  const [direction, setDirection] = useState<AfcetaDirection>('africa_to_caribbean');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [data, setData] = useState<FlowResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AfcetaCorridorRow | null>(null);

  // Corridor Lab state
  const [labOrigin, setLabOrigin] = useState('');
  const [labDest, setLabDest] = useState('');
  const [labCategories, setLabCategories] = useState<string[]>(CATEGORY_KEYS);
  const [labLoading, setLabLoading] = useState(false);
  const [labData, setLabData] = useState<FlowResponse | null>(null);
  const [labError, setLabError] = useState<string | null>(null);

  const originOptions = useMemo(
    () =>
      sortedCountryOptions(
        direction === 'africa_to_caribbean' ? APPROVED_AFRICA_ISO3 : APPROVED_CARIBBEAN_ISO3,
      ),
    [direction],
  );

  const destOptions = useMemo(
    () =>
      sortedCountryOptions(
        direction === 'africa_to_caribbean' ? APPROVED_CARIBBEAN_ISO3 : APPROVED_AFRICA_ISO3,
      ),
    [direction],
  );

  const hasActiveFilters =
    filters.origin !== '' ||
    filters.dest !== '' ||
    filters.categories.length > 0 ||
    filters.pillar !== '' ||
    filters.tiers.length > 0 ||
    filters.minScore > 0 ||
    filters.spotlightOnly;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({ direction });
      if (filters.spotlightOnly) params.set('spotlight', 'true');
      if (filters.categories.length === 1) params.set('group', filters.categories[0]);
      else if (filters.categories.length > 1) params.set('group', filters.categories.join(','));
      if (filters.origin) params.set('origin', filters.origin);
      if (filters.dest) params.set('dest', filters.dest);
      if (filters.pillar) params.set('pillar', filters.pillar);
      if (filters.tiers.length) params.set('tier', filters.tiers.join(','));
      if (filters.minScore > 0) params.set('min_score', filters.minScore.toString());

      const res = await fetch(`/api/v1/trade/afceta/flows?${params}`);
      const json = await res.json();
      if (!res.ok || !Array.isArray(json.rows) || !json.summary) {
        setData(null);
        setFetchError(
          json.details ?? json.error ?? 'Corridor data is not available yet. Apply the AfCETA migration and run the seed script.',
        );
        return;
      }
      setData(json as FlowResponse);
    } catch (e) {
      console.error(e);
      setData(null);
      setFetchError('Unable to load corridor data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [direction, filters]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (viewMode === 'platform') fetchData();
  }, [fetchData, viewMode]);

  const filteredRows = useMemo(() => {
    if (!data?.rows) return [];
    if (!filters.searchQuery.trim()) return data.rows;
    const q = filters.searchQuery.toLowerCase();
    return data.rows.filter(
      (r) =>
        r.origin_name.toLowerCase().includes(q) ||
        r.dest_name.toLowerCase().includes(q) ||
        r.origin_iso3.toLowerCase().includes(q) ||
        r.dest_iso3.toLowerCase().includes(q) ||
        r.category_label.toLowerCase().includes(q),
    );
  }, [data, filters.searchQuery]);

  const displayRows = viewMode === 'platform' ? filteredRows : (labData?.rows ?? []);

  const platformLoading =
    viewMode === 'platform' &&
    (!mounted || loading || (data === null && fetchError === null));
  const isBusy = viewMode === 'platform' ? platformLoading : labLoading;

  const handleDirectionChange = (d: AfcetaDirection) => {
    setDirection(d);
    setFilters((f) => ({ ...f, origin: '', dest: '' }));
    setLabOrigin('');
    setLabDest('');
  };

  const evaluateCorridor = async () => {
    if (!labOrigin || !labDest) {
      setLabError('Select both origin and destination countries.');
      return;
    }
    setLabLoading(true);
    setLabError(null);
    try {
      const params = new URLSearchParams({
        direction,
        origin: labOrigin,
        dest: labDest,
        groups: labCategories.join(','),
      });
      const res = await fetch(`/api/v1/trade/afceta/evaluate?${params}`);
      const json = await res.json();
      if (!res.ok || !Array.isArray(json.rows)) {
        setLabData(null);
        setLabError(json.details ?? json.error ?? 'Evaluation failed.');
        return;
      }
      setLabData(json as FlowResponse);
    } catch (e) {
      console.error(e);
      setLabData(null);
      setLabError('Unable to evaluate corridor. Please try again.');
    } finally {
      setLabLoading(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const toggleTier = (tier: string) => {
    setFilters((f) => ({
      ...f,
      tiers: f.tiers.includes(tier) ? f.tiers.filter((t) => t !== tier) : [...f.tiers, tier],
    }));
  };

  const toggleLabCategory = (cat: string) => {
    setLabCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="-mt-20 pt-20 border-b border-violet-500/20 bg-gradient-to-b from-violet-950/90 via-zinc-950 to-zinc-950">
        <div className="bg-gradient-to-r from-violet-600/10 via-fuchsia-600/5 to-teal-600/10">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
            <Link
              href="/intelligence/trade/afceta"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-300 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              AfCETA Framework
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-400/40 text-violet-300">
                <Flame className="w-3 h-3" />
                Forum 2026
              </span>
              <span className="text-xs text-zinc-500">{AFCETA_FORUM.host}</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Corridor Opportunity Index</h1>
            <p className="text-zinc-400 max-w-2xl">
              Derived Africa ↔ Caribbean trade corridors — supply capacity matched to import demand across shared product categories.
            </p>

            {/* How Corridors Are Matched */}
            <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-zinc-300 mb-3">
                    <span className="font-medium text-white">How Corridors Are Matched:</span> This index identifies{' '}
                    <strong className="text-emerald-400">export opportunities</strong> from origin capacity matched to{' '}
                    <strong className="text-blue-400">destination import demand</strong> across Africa and Caribbean markets.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mb-3">
                    <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded">
                      <p className="text-xs font-medium text-emerald-400 mb-1">Capacity Score</p>
                      <p className="text-xs text-zinc-400">
                        Origin export profile — AfCFTA flows (Africa) or CBTPA flows (Caribbean), by shared product category.
                      </p>
                    </div>
                    <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                      <p className="text-xs font-medium text-blue-400 mb-1">Demand Score</p>
                      <p className="text-xs text-zinc-400">
                        Destination import signals — summed demand groups mapped to each corridor category.
                      </p>
                    </div>
                    <div className="p-2 bg-violet-500/5 border border-violet-500/20 rounded">
                      <p className="text-xs font-medium text-violet-400 mb-1">Opportunity Index</p>
                      <p className="text-xs text-zinc-400">
                        Harmonic fit × log-scale magnitude — not UN Comtrade bilateral customs totals.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Tier A — Forum-curated spotlights
                    </span>
                    <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      Tier C — Platform index (top 5×5 per category)
                    </span>
                    <span className="px-2 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      Tier B — Corridor Lab live evaluations
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Corridor Lab note */}
            <div className="mt-4 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <ArrowRightLeft className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-300">
                  <span className="font-medium text-white">Corridor Lab:</span> Default{' '}
                  <strong className="text-violet-400">Platform Index</strong> shows pre-computed high-signal pairs. Switch to{' '}
                  <strong className="text-cyan-400">Corridor Lab</strong> to pick any approved origin + destination and evaluate
                  the same formula live — useful for pairs outside the 5×5 grid (e.g. Ethiopia → St Kitts) without overwriting platform data.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-300">
                  <span className="font-medium text-white">Top Export Products (in corridor drawer):</span>{' '}
                  {AFCETA_EXPORT_PRODUCTS_CARD_EXPLANATION}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-6 space-y-4">
        <LiveCuratedBanner
          description={
            (viewMode === 'platform' ? data : labData)?.attribution?.note ??
            'Corridor opportunity scores combine AfCFTA export profiles, CBTPA bilateral flows, and import demand signals across shared product categories. Figures are source-attributed and updated on a governed refresh schedule.'
          }
          sources={
            (viewMode === 'platform' ? data : labData)?.attribution?.sources ?? [
              'AfCFTA Trade Flows',
              'CBTPA Flows',
              'Import Demand Signals',
            ]
          }
        />

        {/* Mode + direction controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
            <button
              onClick={() => setViewMode('platform')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'platform' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              Platform Index
            </button>
            <button
              onClick={() => setViewMode('lab')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'lab' ? 'bg-teal-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Beaker className="w-4 h-4" />
              Corridor Lab
            </button>
          </div>

          <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
            <button
              onClick={() => handleDirectionChange('africa_to_caribbean')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                direction === 'africa_to_caribbean'
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Africa → Caribbean
            </button>
            <button
              onClick={() => handleDirectionChange('caribbean_to_africa')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                direction === 'caribbean_to_africa'
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Caribbean → Africa
            </button>
          </div>

          {viewMode === 'platform' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm ${
                showFilters
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-purple-400 rounded-full" />}
            </button>
          )}

          {viewMode === 'platform' && (
            <button
              onClick={fetchData}
              disabled={mounted && isBusy}
              className="ml-auto p-2 text-zinc-400 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${mounted && isBusy ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Search bar */}
        {viewMode === 'platform' && (
          <div className="relative">
            <input
              type="search"
              placeholder="Search by country name or ISO code (e.g., Ghana, GHA, Jamaica...)"
              value={filters.searchQuery}
              onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-300 placeholder:text-zinc-600"
            />
          </div>
        )}

        {/* Filters panel */}
        {viewMode === 'platform' && showFilters && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Origin Country</label>
                <select
                  value={filters.origin}
                  onChange={(e) => setFilters((f) => ({ ...f, origin: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                >
                  <option value="">All origins</option>
                  {originOptions.map(({ iso, name }) => (
                    <option key={iso} value={iso}>
                      {name} ({iso})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Destination Country</label>
                <select
                  value={filters.dest}
                  onChange={(e) => setFilters((f) => ({ ...f, dest: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                >
                  <option value="">All destinations</option>
                  {destOptions.map(({ iso, name }) => (
                    <option key={iso} value={iso}>
                      {name} ({iso})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Protocol Pillar</label>
                <select
                  value={filters.pillar}
                  onChange={(e) => setFilters((f) => ({ ...f, pillar: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                >
                  <option value="">All pillars</option>
                  {Object.entries(AFCETA_PILLARS).map(([key, p]) => (
                    <option key={key} value={key}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Data Tier</label>
                <div className="flex flex-wrap gap-2">
                  {(['A', 'B', 'C'] as const).map((tier) => {
                    const isSelected = filters.tiers.includes(tier);
                    const colors =
                      tier === 'A'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : tier === 'B'
                          ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                          : 'bg-zinc-700 border-zinc-600 text-zinc-300';
                    return (
                      <button
                        key={tier}
                        onClick={() => toggleTier(tier)}
                        className={`px-3 py-1 rounded border text-xs ${
                          isSelected ? colors : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        Tier {tier}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">Min Opportunity Score</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={filters.minScore}
                  onChange={(e) => setFilters((f) => ({ ...f, minScore: parseInt(e.target.value) }))}
                  className="w-full accent-violet-500"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  {filters.minScore > 0 ? `≥ ${filters.minScore}` : 'No minimum'}
                </p>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Spotlights</label>
                <button
                  onClick={() => setFilters((f) => ({ ...f, spotlightOnly: !f.spotlightOnly }))}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    filters.spotlightOnly
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'border-zinc-700 text-zinc-400 hover:border-violet-500/40'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Spotlights only
                </button>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm text-zinc-400 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_KEYS.map((cat) => {
                  const isSelected = filters.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                        isSelected
                          ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {AFCETA_SHARED_CATEGORIES[cat]}
                    </button>
                  );
                })}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => setFilters({ ...DEFAULT_FILTERS, searchQuery: filters.searchQuery })}
                className="mt-4 text-sm text-violet-400 hover:text-violet-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Corridor Lab form */}
        {viewMode === 'lab' && (
          <div className="bg-zinc-900/50 border border-teal-500/20 rounded-lg p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Origin</label>
                <select
                  value={labOrigin}
                  onChange={(e) => setLabOrigin(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                >
                  <option value="">Select origin...</option>
                  {originOptions.map(({ iso, name }) => (
                    <option key={iso} value={iso}>
                      {name} ({iso})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Destination</label>
                <select
                  value={labDest}
                  onChange={(e) => setLabDest(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                >
                  <option value="">Select destination...</option>
                  {destOptions.map(({ iso, name }) => (
                    <option key={iso} value={iso}>
                      {name} ({iso})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={evaluateCorridor}
                  disabled={labLoading || !labOrigin || !labDest || labCategories.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium disabled:opacity-50"
                >
                  {labLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Beaker className="w-4 h-4" />}
                  Evaluate corridor
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Categories to evaluate</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_KEYS.map((cat) => {
                  const isSelected = labCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleLabCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                        isSelected
                          ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {AFCETA_SHARED_CATEGORIES[cat]}
                    </button>
                  );
                })}
              </div>
            </div>
            {labError && (
              <p className="text-sm text-amber-300">{labError}</p>
            )}
          </div>
        )}

        {/* Summary strip */}
        {(viewMode === 'platform' ? data?.summary : labData?.summary) && (
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-zinc-500">Corridors</span>{' '}
              <span className="text-white font-semibold ml-1">
                {(viewMode === 'platform' ? data : labData)!.summary.record_count}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Pairs</span>{' '}
              <span className="text-white font-semibold ml-1">
                {(viewMode === 'platform' ? data : labData)!.summary.corridor_pairs}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Spotlights</span>{' '}
              <span className="text-amber-400 font-semibold ml-1">
                {(viewMode === 'platform' ? data : labData)!.summary.spotlight_count}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Vintage</span>{' '}
              <span className="text-white font-semibold ml-1">
                {(viewMode === 'platform' ? data : labData)!.summary.data_vintage}
              </span>
            </div>
          </div>
        )}

        {fetchError && viewMode === 'platform' && !loading && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm text-amber-200">
            {fetchError}
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900/80 text-zinc-500 text-left">
                <th className="px-4 py-3 font-medium">Corridor</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Pillar</th>
                <th className="px-4 py-3 font-medium text-right">Capacity</th>
                <th className="px-4 py-3 font-medium text-right">Demand</th>
                <th className="px-4 py-3 font-medium text-right">Score</th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {isBusy ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    {viewMode === 'lab' ? 'Evaluating corridor...' : 'Loading corridors...'}
                  </td>
                </tr>
              ) : displayRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    {viewMode === 'lab'
                      ? 'Select origin and destination, then evaluate.'
                      : fetchError
                        ? 'Corridor signals are not loaded.'
                        : 'No corridors match filters.'}
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => {
                  const pillar = AFCETA_PILLARS[row.pillar_key as keyof typeof AFCETA_PILLARS];
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelected(row)}
                      className="border-t border-zinc-800/80 hover:bg-violet-500/5 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {row.is_spotlight && <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          {row.evaluation_mode === 'custom' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              Live
                            </span>
                          )}
                          <img src={flagUrlFromIso3(row.origin_iso3)} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
                          <span className="text-white font-medium">
                            {formatTradeCountryLabel(row.origin_iso3, row.origin_name)}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
                          <img src={flagUrlFromIso3(row.dest_iso3)} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
                          <span className="text-white font-medium">
                            {formatTradeCountryLabel(row.dest_iso3, row.dest_name)}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${CATEGORY_COLORS[row.category_group] ?? 'text-zinc-300'}`}>
                        {row.category_label}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{pillar?.title ?? row.pillar_key}</td>
                      <td className="px-4 py-3 text-right text-zinc-300">{formatCorridorUsd(row.origin_capacity_usd)}</td>
                      <td className="px-4 py-3 text-right text-zinc-300">{formatCorridorUsd(row.dest_demand_usd)}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-bold ${row.opportunity_score >= 50 ? 'text-violet-400' : 'text-zinc-400'}`}
                        >
                          {row.opportunity_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <TrendingUp className="w-4 h-4 text-zinc-600" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {selected && (
        <AfCETACorridorDrawer
          row={{
            ...selected,
            evaluation_mode: selected.evaluation_mode ?? (viewMode === 'lab' ? 'custom' : 'platform'),
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
