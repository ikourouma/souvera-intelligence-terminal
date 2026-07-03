'use client';

import React, { useState, useEffect } from 'react';

const FALLBACK_SOURCES = [
  { id: 'wb', name: 'World Bank', abbr: 'WB', color: '#2563EB', note: 'Macro · Weekly' },
  { id: 'imf', name: 'Intl Monetary Fund', abbr: 'IMF', color: '#16A34A', note: 'Forecasts · Monthly' },
  { id: 'comtrade', name: 'UN Comtrade', abbr: 'UNC', color: '#7C3AED', note: 'Trade · Monthly' },
  { id: 'afdb', name: 'African Dev Bank', abbr: 'AfDB', color: '#F59E0B', note: 'Africa · Monthly' },
  { id: 'gdelt', name: 'GDELT Project', abbr: 'GDL', color: '#DC2626', note: 'Signals · Hourly' },
  { id: 'oecd', name: 'OECD / DB Nomics', abbr: 'OEC', color: '#0891B2', note: 'Macro · Monthly' },
  { id: 'unctad', name: 'UNCTAD', abbr: 'UNC', color: '#EA580C', note: 'FDI · Quarterly' },
  { id: 'iea', name: 'Intl Energy Agency', abbr: 'IEA', color: '#4F46E5', note: 'Energy · Monthly' },
];

const FALLBACK_KPIS = [
  { value: '74', label: 'Sovereign Markets' },
  { value: '8+', label: 'Data Sources' },
  { value: '<45ms', label: 'Avg Latency' },
  { value: 'Hourly', label: 'Signal Refresh' },
  { value: '2026', label: 'IMF Projections' },
];

type Source = typeof FALLBACK_SOURCES[0];
type KPI = typeof FALLBACK_KPIS[0];

function transformCMSLogo(cmsLogo: Record<string, unknown>): Source {
  const name = (cmsLogo.name as string) || '';
  const abbr = (cmsLogo.abbreviation as string) || '';
  return {
    id: (cmsLogo.id as string) || `${abbr}-${name}`.toLowerCase().replace(/\s+/g, '-'),
    name,
    abbr,
    color: (cmsLogo.color as string) || '#2563EB',
    note: (cmsLogo.note as string) || '',
  };
}

/** Drop duplicate CMS rows (e.g. re-seeded trust logos) — keep first by display order. */
function dedupeSources(items: Source[]): Source[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.id || `${item.abbr}|${item.name}|${item.note}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function TrustStrip() {
  const [sources, setSources] = useState<Source[]>(FALLBACK_SOURCES);
  const [kpis, setKpis] = useState<KPI[]>(FALLBACK_KPIS);

  useEffect(() => {
    async function fetchLogos() {
      try {
        const response = await fetch('/api/v1/marketing/trust-logos');
        if (response.ok) {
          const data = await response.json();
          if (data.logos && data.logos.length > 0) {
            setSources(dedupeSources(data.logos.map(transformCMSLogo)));
          }
          if (data.kpis && data.kpis.length > 0) {
            setKpis(data.kpis);
          }
        }
      } catch (err) {
        console.error('[TrustStrip] Failed to fetch CMS logos:', err);
      }
    }
    fetchLogos();
  }, []);

  return (
    <section className="py-20" style={{ background: '#121821', borderTop: '1px solid #1F2A37' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <div className="section-label mb-3">Data Infrastructure</div>
          <h2 className="text-2xl font-bold tracking-tight mb-3" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#F9FAFB' }}>
            Powered by Institutional-Grade Sources
          </h2>
          <p className="text-[13px] max-w-xl mx-auto" style={{ color: '#6B7280' }}>
            Souvera normalizes data from 8+ globally recognized providers into a single validated intelligence layer.
          </p>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-12">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="text-center py-4 px-3 rounded-sm" style={{ background: '#161D26', border: '1px solid #1F2A37' }}>
              <div className="data-value text-xl mb-1">{kpi.value}</div>
              <div className="section-label">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Source badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {sources.map((s) => (
            <div key={s.id} className="flex flex-col items-center justify-center p-4 rounded-sm transition-all duration-300 group" style={{ background: '#0B0F14', border: '1px solid #1F2A37' }} title={s.name}>
              <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-2 font-bold text-[11px] tracking-widest font-mono" style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25` }}>
                {s.abbr}
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-center leading-tight mb-0.5" style={{ color: '#9CA3AF' }}>
                {s.name}
              </span>
              <span className="text-[8px] font-mono" style={{ color: '#4B5563' }}>{s.note}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] font-mono mt-8" style={{ color: '#374151' }}>
          All data is normalized, validated, and stored in Souvera's sovereign intelligence infrastructure before presentation.
        </p>
      </div>
    </section>
  );
}
