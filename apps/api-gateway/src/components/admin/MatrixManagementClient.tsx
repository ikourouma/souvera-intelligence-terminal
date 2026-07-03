// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Access Control Matrix Management
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import { 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  History,
  AlertCircle,
  CheckCircle,
  Grid3X3,
  Shield,
  Info,
} from 'lucide-react';

interface EntitlementConfig {
  key: string;
  label: string;
  category: string;
  type: 'boolean' | 'number' | 'unlimited';
  description?: string;
}

interface MatrixCell {
  value: boolean | number | 'unlimited';
  changed?: boolean;
}

type MatrixData = Record<string, Record<string, MatrixCell>>;

const PERSONAS = [
  { id: 'public', label: 'Public', color: 'zinc' },
  { id: 'explorer', label: 'Explorer', color: 'blue' },
  { id: 'professional', label: 'Professional', color: 'emerald' },
  { id: 'business', label: 'Business', color: 'amber' },
  { id: 'investor', label: 'Investor', color: 'purple' },
  { id: 'institutional', label: 'Institutional', color: 'indigo' },
];

const ENTITLEMENTS: EntitlementConfig[] = [
  { key: 'country_identity', label: 'Country Identity', category: 'Core Access', type: 'boolean', description: 'Basic country information' },
  { key: 'headline_macro', label: 'Headline Macro', category: 'Core Access', type: 'boolean', description: 'Key macroeconomic indicators' },
  { key: 'full_macro', label: 'Full Macro Data', category: 'Core Access', type: 'boolean', description: 'Complete macroeconomic dataset' },
  { key: 'sector_teasers', label: 'Sector Teasers', category: 'Core Access', type: 'boolean', description: 'Sector overview snapshots' },
  { key: 'sector_rationale', label: 'Sector Rationale', category: 'Core Access', type: 'boolean', description: 'Detailed sector analysis' },
  { key: 'trade_data', label: 'Trade Data', category: 'Intelligence', type: 'boolean', description: 'Trade intelligence modules' },
  { key: 'risk_analysis', label: 'Risk Analysis', category: 'Intelligence', type: 'boolean', description: 'Country risk assessments' },
  { key: 'investment_thesis', label: 'Investment Thesis', category: 'Intelligence', type: 'boolean', description: 'Investment recommendations' },
  { key: 'forecast_metrics', label: 'Forecast Metrics', category: 'Intelligence', type: 'boolean', description: 'Projections and forecasts' },
  { key: 'supply_demand_matrix', label: 'Supply-Demand Matrix', category: 'Intelligence', type: 'boolean', description: '74×8 opportunity matrix' },
  { key: 'reports_preview', label: 'Report Preview', category: 'Reports', type: 'boolean', description: 'Preview reports before generating' },
  { key: 'report_quota', label: 'Report Quota', category: 'Reports', type: 'number', description: 'Monthly report generation limit' },
  { key: 'export_access', label: 'Export Access', category: 'Exports', type: 'boolean', description: 'Download PNG/CSV exports' },
  { key: 'api_access', label: 'API Access', category: 'Exports', type: 'boolean', description: 'Programmatic API access' },
];

const DEFAULT_MATRIX: MatrixData = {
  public: {
    country_identity: { value: true },
    headline_macro: { value: false },
    full_macro: { value: false },
    sector_teasers: { value: false },
    sector_rationale: { value: false },
    trade_data: { value: false },
    risk_analysis: { value: false },
    investment_thesis: { value: false },
    forecast_metrics: { value: false },
    supply_demand_matrix: { value: false },
    reports_preview: { value: false },
    report_quota: { value: 0 },
    export_access: { value: false },
    api_access: { value: false },
  },
  explorer: {
    country_identity: { value: true },
    headline_macro: { value: true },
    full_macro: { value: false },
    sector_teasers: { value: true },
    sector_rationale: { value: false },
    trade_data: { value: false },
    risk_analysis: { value: false },
    investment_thesis: { value: false },
    forecast_metrics: { value: false },
    supply_demand_matrix: { value: false },
    reports_preview: { value: true },
    report_quota: { value: 1 },
    export_access: { value: false },
    api_access: { value: false },
  },
  professional: {
    country_identity: { value: true },
    headline_macro: { value: true },
    full_macro: { value: true },
    sector_teasers: { value: true },
    sector_rationale: { value: true },
    trade_data: { value: false },
    risk_analysis: { value: false },
    investment_thesis: { value: false },
    forecast_metrics: { value: false },
    supply_demand_matrix: { value: false },
    reports_preview: { value: true },
    report_quota: { value: 5 },
    export_access: { value: false },
    api_access: { value: false },
  },
  business: {
    country_identity: { value: true },
    headline_macro: { value: true },
    full_macro: { value: true },
    sector_teasers: { value: true },
    sector_rationale: { value: true },
    trade_data: { value: true },
    risk_analysis: { value: true },
    investment_thesis: { value: false },
    forecast_metrics: { value: false },
    supply_demand_matrix: { value: false },
    reports_preview: { value: true },
    report_quota: { value: 20 },
    export_access: { value: false },
    api_access: { value: false },
  },
  investor: {
    country_identity: { value: true },
    headline_macro: { value: true },
    full_macro: { value: true },
    sector_teasers: { value: true },
    sector_rationale: { value: true },
    trade_data: { value: true },
    risk_analysis: { value: true },
    investment_thesis: { value: true },
    forecast_metrics: { value: true },
    supply_demand_matrix: { value: true },
    reports_preview: { value: true },
    report_quota: { value: 50 },
    export_access: { value: false },
    api_access: { value: false },
  },
  institutional: {
    country_identity: { value: true },
    headline_macro: { value: true },
    full_macro: { value: true },
    sector_teasers: { value: true },
    sector_rationale: { value: true },
    trade_data: { value: true },
    risk_analysis: { value: true },
    investment_thesis: { value: true },
    forecast_metrics: { value: true },
    supply_demand_matrix: { value: true },
    reports_preview: { value: true },
    report_quota: { value: 'unlimited' },
    export_access: { value: true },
    api_access: { value: true },
  },
};

export function MatrixManagementClient() {
  const [matrix, setMatrix] = useState<MatrixData>(DEFAULT_MATRIX);
  const [originalMatrix, setOriginalMatrix] = useState<MatrixData>(DEFAULT_MATRIX);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMatrix = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/admin/matrix');
      if (response.ok) {
        const data = await response.json();
        if (data.matrix) {
          setMatrix(data.matrix);
          setOriginalMatrix(data.matrix);
        }
      }
    } catch (error) {
      console.error('[MatrixManagement] Error fetching matrix:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  useEffect(() => {
    const changed = JSON.stringify(matrix) !== JSON.stringify(originalMatrix);
    setHasChanges(changed);
  }, [matrix, originalMatrix]);

  const updateCell = (persona: string, entitlement: string, value: boolean | number | 'unlimited') => {
    setMatrix(prev => ({
      ...prev,
      [persona]: {
        ...prev[persona],
        [entitlement]: { value, changed: true },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch('/api/v1/admin/matrix', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matrix }),
      });

      if (response.ok) {
        setOriginalMatrix(matrix);
        setMatrix(prev => {
          const cleaned: MatrixData = {};
          for (const persona of Object.keys(prev)) {
            cleaned[persona] = {};
            for (const ent of Object.keys(prev[persona])) {
              cleaned[persona][ent] = { value: prev[persona][ent].value };
            }
          }
          return cleaned;
        });
        setSaveMessage({ type: 'success', text: 'Matrix saved successfully' });
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save matrix' });
      }
    } catch (error) {
      console.error('[MatrixManagement] Save error:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save matrix' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setMatrix(JSON.parse(JSON.stringify(originalMatrix)));
  };

  const handleExport = () => {
    const json = JSON.stringify(matrix, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-matrix-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const categories = [...new Set(ENTITLEMENTS.map(e => e.category))];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-800 rounded w-64" />
        <div className="h-[600px] bg-zinc-800/50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Grid3X3 className="w-7 h-7 text-purple-400" />
            Access Control Matrix
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage feature access for each user persona
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {saveMessage && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          saveMessage.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {saveMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm">{saveMessage.text}</span>
        </div>
      )}

      {hasChanges && (
        <div className="flex items-center gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">You have unsaved changes</span>
        </div>
      )}

      {/* Matrix Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-4 sticky left-0 bg-zinc-900/95 backdrop-blur-sm min-w-[200px]">
                  Feature
                </th>
                {PERSONAS.map((persona) => (
                  <th key={persona.id} className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-4 min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <Shield className={`w-4 h-4 text-${persona.color}-400`} />
                      <span>{persona.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <Fragment key={category}>
                  <tr className="bg-zinc-800/30">
                    <td colSpan={PERSONAS.length + 1} className="px-4 py-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{category}</span>
                    </td>
                  </tr>
                  {ENTITLEMENTS.filter(e => e.category === category).map((entitlement) => (
                    <tr key={entitlement.key} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3 sticky left-0 bg-zinc-900/95 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{entitlement.label}</span>
                          {entitlement.description && (
                            <div className="group relative">
                              <Info className="w-3.5 h-3.5 text-zinc-600 cursor-help" />
                              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                {entitlement.description}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      {PERSONAS.map((persona) => {
                        const cell = matrix[persona.id]?.[entitlement.key] || { value: false };
                        const isChanged = cell.changed;

                        return (
                          <td key={persona.id} className={`px-4 py-3 text-center ${isChanged ? 'bg-amber-500/5' : ''}`}>
                            {entitlement.type === 'boolean' ? (
                              <button
                                onClick={() => updateCell(persona.id, entitlement.key, !cell.value)}
                                className={`w-10 h-6 rounded-full transition-all relative ${
                                  cell.value 
                                    ? 'bg-emerald-500' 
                                    : 'bg-zinc-700'
                                }`}
                              >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                                  cell.value ? 'left-5' : 'left-1'
                                }`} />
                              </button>
                            ) : entitlement.type === 'number' || entitlement.type === 'unlimited' ? (
                              <div className="flex items-center justify-center gap-1">
                                {cell.value === 'unlimited' ? (
                                  <span className="text-sm text-indigo-400 font-medium">∞</span>
                                ) : (
                                  <input
                                    type="number"
                                    min="0"
                                    value={cell.value as number}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      updateCell(persona.id, entitlement.key, val);
                                    }}
                                    className="w-16 px-2 py-1 text-center text-sm bg-zinc-800/50 border border-zinc-700/50 rounded text-white focus:outline-none focus:border-indigo-500/50"
                                  />
                                )}
                                {persona.id === 'institutional' && entitlement.key === 'report_quota' && (
                                  <button
                                    onClick={() => updateCell(persona.id, entitlement.key, cell.value === 'unlimited' ? 100 : 'unlimited')}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 ml-1"
                                  >
                                    {cell.value === 'unlimited' ? '(set limit)' : '(unlimited)'}
                                  </button>
                                )}
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
            <span className="absolute top-1 left-5 w-4 h-4 rounded-full bg-white" />
          </div>
          <span className="text-xs text-zinc-400">Enabled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-6 bg-zinc-700 rounded-full relative">
            <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
          </div>
          <span className="text-xs text-zinc-400">Disabled</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-indigo-400 font-medium">∞</span>
          <span className="text-xs text-zinc-400">Unlimited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500/20 rounded" />
          <span className="text-xs text-zinc-400">Modified</span>
        </div>
      </div>
    </div>
  );
}
