'use client';

/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * Supply-Demand Matrix Admin Client
 * Owner: Afronovation, Inc.
 * Phase 4C: Supply-Demand Matrix
 * =====================================================
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Database,
  RefreshCw,
  Download,
  Upload,
  Save,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Check,
  X,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

interface MatrixCell {
  id: string;
  iso3: string;
  country_name: string;
  region: string;
  sector_key: string;
  sector_label: string;
  supply_score: number;
  supply_confidence: string;
  demand_score: number;
  demand_confidence: string;
  opportunity_score: number;
  opportunity_tier: number;
  data_quality_tier: string;
  source_notes: string;
  data_year: number;
}

interface AdminResponse {
  cells: MatrixCell[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  summary: {
    total_cells: number;
    quality_distribution: { A: number; B: number; C: number };
    tier_distribution: { 1: number; 2: number; 3: number; 4: number };
  };
}

const SECTORS = [
  { key: 'manufacturing_textiles', label: 'Manufacturing & Textiles' },
  { key: 'agriculture_food', label: 'Agriculture & Food Processing' },
  { key: 'energy_power', label: 'Energy & Power' },
  { key: 'mining_minerals', label: 'Mining & Critical Minerals' },
  { key: 'digital_infrastructure', label: 'Digital Infrastructure' },
  { key: 'fintech_finance', label: 'Fintech & Digital Finance' },
  { key: 'logistics_trade', label: 'Logistics & Trade' },
  { key: 'tourism_hospitality', label: 'Tourism & Hospitality' },
];

export function SupplyDemandAdminClient() {
  const [data, setData] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<MatrixCell>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    region: '',
    sector: '',
    iso3: '',
    quality_tier: '',
  });
  const [page, setPage] = useState(0);
  const limit = 50;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      params.set('offset', (page * limit).toString());
      if (filters.region) params.set('region', filters.region);
      if (filters.sector) params.set('sector', filters.sector);
      if (filters.iso3) params.set('iso3', filters.iso3);
      if (filters.quality_tier) params.set('quality_tier', filters.quality_tier);

      const res = await fetch(`/api/v1/admin/supply-demand?${params.toString()}`);
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch data');
      }

      const json: AdminResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (cell: MatrixCell) => {
    setEditingCell(cell.id);
    setEditValues({
      supply_score: cell.supply_score,
      supply_confidence: cell.supply_confidence,
      demand_score: cell.demand_score,
      demand_confidence: cell.demand_confidence,
      opportunity_score: cell.opportunity_score,
      data_quality_tier: cell.data_quality_tier,
      source_notes: cell.source_notes,
    });
  };

  const handleSave = async () => {
    if (!editingCell) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/supply-demand', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCell, ...editValues }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save');
      }

      setSuccessMessage('Cell updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      setEditingCell(null);
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (!data?.cells) return;

    const headers = [
      'ISO3', 'Country', 'Region', 'Sector', 'Supply Score', 'Supply Conf',
      'Demand Score', 'Demand Conf', 'Opportunity Score', 'Tier', 'Quality', 'Year'
    ];

    const rows = data.cells.map(cell => [
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
      cell.data_quality_tier,
      cell.data_year,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supply-demand-matrix-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-emerald-500/20 text-emerald-400';
      case 2: return 'bg-blue-500/20 text-blue-400';
      case 3: return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  const getQualityColor = (tier: string) => {
    switch (tier) {
      case 'A': return 'bg-emerald-500/20 text-emerald-400';
      case 'B': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <Database className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Supply-Demand Matrix Admin</h1>
            <p className="text-zinc-400 text-sm">Manage 74-market × 8-sector opportunity data</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
          <Check className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <p className="text-zinc-500 text-xs mb-1">Total Cells</p>
            <p className="text-xl font-bold text-white">{data.summary.total_cells}</p>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-emerald-400/70 text-xs mb-1">Tier A Quality</p>
            <p className="text-xl font-bold text-emerald-400">{data.summary.quality_distribution.A}</p>
          </div>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400/70 text-xs mb-1">Tier B Quality</p>
            <p className="text-xl font-bold text-yellow-400">{data.summary.quality_distribution.B}</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <p className="text-zinc-500 text-xs mb-1">Tier C Quality</p>
            <p className="text-xl font-bold text-zinc-400">{data.summary.quality_distribution.C}</p>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-emerald-400/70 text-xs mb-1">Opp Tier 1</p>
            <p className="text-xl font-bold text-emerald-400">{data.summary.tier_distribution[1]}</p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400/70 text-xs mb-1">Opp Tier 2</p>
            <p className="text-xl font-bold text-blue-400">{data.summary.tier_distribution[2]}</p>
          </div>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400/70 text-xs mb-1">Opp Tier 3</p>
            <p className="text-xl font-bold text-yellow-400">{data.summary.tier_distribution[3]}</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <p className="text-zinc-500 text-xs mb-1">Opp Tier 4</p>
            <p className="text-xl font-bold text-zinc-400">{data.summary.tier_distribution[4]}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-400">Filters</span>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Region</label>
            <select
              value={filters.region}
              onChange={(e) => { setFilters(f => ({ ...f, region: e.target.value })); setPage(0); }}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
            >
              <option value="">All Regions</option>
              <option value="Africa">Africa</option>
              <option value="Caribbean">Caribbean</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Sector</label>
            <select
              value={filters.sector}
              onChange={(e) => { setFilters(f => ({ ...f, sector: e.target.value })); setPage(0); }}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
            >
              <option value="">All Sectors</option>
              {SECTORS.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Country (ISO3)</label>
            <input
              type="text"
              value={filters.iso3}
              onChange={(e) => { setFilters(f => ({ ...f, iso3: e.target.value })); setPage(0); }}
              placeholder="e.g. KEN, NGA, JAM"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Data Quality</label>
            <select
              value={filters.quality_tier}
              onChange={(e) => { setFilters(f => ({ ...f, quality_tier: e.target.value })); setPage(0); }}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
            >
              <option value="">All Quality Tiers</option>
              <option value="A">Tier A (Curated)</option>
              <option value="B">Tier B (Medium)</option>
              <option value="C">Tier C (Estimated)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900">
              <tr>
                <th className="text-left p-3 text-zinc-400 font-medium">Country</th>
                <th className="text-left p-3 text-zinc-400 font-medium">Sector</th>
                <th className="text-center p-3 text-zinc-400 font-medium">Supply</th>
                <th className="text-center p-3 text-zinc-400 font-medium">Demand</th>
                <th className="text-center p-3 text-zinc-400 font-medium">Opportunity</th>
                <th className="text-center p-3 text-zinc-400 font-medium">Tier</th>
                <th className="text-center p-3 text-zinc-400 font-medium">Quality</th>
                <th className="text-right p-3 text-zinc-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : data?.cells.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    No data found
                  </td>
                </tr>
              ) : (
                data?.cells.map((cell) => (
                  <tr key={cell.id} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cell.region === 'Africa' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                        <span className="font-medium text-white">{cell.country_name}</span>
                        <span className="text-zinc-500 text-xs">{cell.iso3}</span>
                      </div>
                    </td>
                    <td className="p-3 text-zinc-300 max-w-[150px] truncate">{cell.sector_label}</td>
                    <td className="p-3 text-center">
                      {editingCell === cell.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editValues.supply_score ?? 0}
                          onChange={(e) => setEditValues(v => ({ ...v, supply_score: parseFloat(e.target.value) }))}
                          className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-white text-center text-sm"
                        />
                      ) : (
                        <span className="text-white">{Math.round(cell.supply_score)}</span>
                      )}
                      <span className={`ml-1 text-xs ${cell.supply_confidence === 'A' ? 'text-emerald-400' : cell.supply_confidence === 'B' ? 'text-yellow-400' : 'text-zinc-500'}`}>
                        {cell.supply_confidence}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {editingCell === cell.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editValues.demand_score ?? 0}
                          onChange={(e) => setEditValues(v => ({ ...v, demand_score: parseFloat(e.target.value) }))}
                          className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-white text-center text-sm"
                        />
                      ) : (
                        <span className="text-white">{Math.round(cell.demand_score)}</span>
                      )}
                      <span className={`ml-1 text-xs ${cell.demand_confidence === 'A' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {cell.demand_confidence}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {editingCell === cell.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editValues.opportunity_score ?? 0}
                          onChange={(e) => setEditValues(v => ({ ...v, opportunity_score: parseFloat(e.target.value) }))}
                          className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-white text-center text-sm"
                        />
                      ) : (
                        <span className="text-white font-bold">{Math.round(cell.opportunity_score)}</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${getTierColor(cell.opportunity_tier)}`}>
                        T{cell.opportunity_tier}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {editingCell === cell.id ? (
                        <select
                          value={editValues.data_quality_tier ?? 'C'}
                          onChange={(e) => setEditValues(v => ({ ...v, data_quality_tier: e.target.value }))}
                          className="px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-white text-sm"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs ${getQualityColor(cell.data_quality_tier)}`}>
                          {cell.data_quality_tier}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editingCell === cell.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white"
                          >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setEditingCell(null)}
                            className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(cell)}
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Showing {data.pagination.offset + 1} - {Math.min(data.pagination.offset + data.cells.length, data.pagination.total)} of {data.pagination.total} cells
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-zinc-400">
                Page {page + 1} of {Math.ceil(data.pagination.total / limit)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!data.pagination.has_more}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg">
        <h3 className="text-sm font-medium text-white mb-2">Admin Notes</h3>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>• Click the edit icon to manually override scores for any cell</li>
          <li>• Opportunity tier is auto-calculated based on score (80+: T1, 60-79: T2, 40-59: T3, &lt;40: T4)</li>
          <li>• Data quality: A = Curated (primary sources), B = Medium (2-3 sources), C = Estimated</li>
          <li>• To regenerate all data, run: <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-purple-400">npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts ingest-supply-demand-matrix</code></li>
        </ul>
      </div>
    </div>
  );
}

export default SupplyDemandAdminClient;
