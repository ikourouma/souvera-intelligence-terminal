'use client';

import { useEffect, useMemo, useState } from 'react';

interface CoverageStats {
  african_markets: number;
  caribbean_markets: number;
  total_markets: number;
  shared_categories: number;
  spotlight_pairs: number;
  protocol_pillars: number;
  data_vintage: number;
}

interface SpotlightPreview {
  label: string;
  direction: string;
  categories: string[];
}

interface FlowRow {
  origin_name: string;
  dest_name: string;
  category_label: string;
  opportunity_score: number;
  is_spotlight: boolean;
}

interface Props {
  coverage: CoverageStats;
  spotlights: SpotlightPreview[];
}

function useCountUp(target: number, duration = 1400, active = true): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (target <= 0) {
      setValue(0);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, active]);

  return value;
}

function StatCell({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  const display = useCountUp(value);
  return (
    <div className="px-3 py-2.5 text-center border-r border-violet-500/15 last:border-r-0">
      <div className="text-[9px] font-mono uppercase tracking-widest text-violet-400/70 mb-0.5">{label}</div>
      <div className="text-[15px] font-bold font-mono text-white tabular-nums">
        {display.toLocaleString()}
        {suffix}
      </div>
    </div>
  );
}

export function AfCETACorridorStatsPanel({ coverage, spotlights }: Props) {
  const [rows, setRows] = useState<FlowRow[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch('/api/v1/trade/afceta/flows?spotlight=true')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.rows?.length) {
          setRows(
            json.rows.slice(0, 8).map((r: FlowRow) => ({
              origin_name: r.origin_name,
              dest_name: r.dest_name,
              category_label: r.category_label,
              opportunity_score: r.opportunity_score,
              is_spotlight: r.is_spotlight,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const tableRows = useMemo(() => {
    if (rows.length > 0) return rows;
    return spotlights.slice(0, 6).map((s) => ({
      origin_name: s.label.split('→')[0]?.trim() ?? s.label,
      dest_name: s.label.split('→')[1]?.trim() ?? '',
      category_label: s.categories.map((c) => c.replace(/_/g, ' ')).join(', '),
      opportunity_score: 0,
      is_spotlight: true,
    }));
  }, [rows, spotlights]);

  useEffect(() => {
    if (tableRows.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % tableRows.length);
    }, 3200);
    return () => clearInterval(id);
  }, [tableRows.length]);

  const visible = tableRows.slice(activeIndex, activeIndex + 4).concat(
    tableRows.slice(0, Math.max(0, activeIndex + 4 - tableRows.length)),
  ).slice(0, 4);

  return (
    <div className="relative rounded-xl overflow-hidden border border-fuchsia-500/30 bg-[#121821]/90 shadow-[0_0_40px_rgba(192,38,211,0.12)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-500/20 bg-[#0B0F14]/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-fuchsia-400" />
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-fuchsia-300">
            Corridor Opportunity Index
          </span>
        </div>
        <span className="text-[9px] font-mono text-zinc-500">{coverage.data_vintage} vintage</span>
      </div>

      <div className="grid grid-cols-4 border-b border-violet-500/15 bg-violet-600/5">
        <StatCell label="Markets" value={coverage.total_markets} />
        <StatCell label="Categories" value={coverage.shared_categories} />
        <StatCell label="Spotlights" value={coverage.spotlight_pairs} />
        <StatCell label="Pillars" value={coverage.protocol_pillars} />
      </div>

      <div className="px-4 py-2 border-b border-violet-500/15 flex text-[9px] font-mono uppercase tracking-wider text-violet-400/60">
        <span className="flex-[2]">Corridor</span>
        <span className="flex-[2]">Category</span>
        <span className="w-14 text-right">Index</span>
      </div>

      <div className="divide-y divide-violet-500/10 min-h-[168px]">
        {visible.map((row, i) => (
          <div
            key={`${row.origin_name}-${row.dest_name}-${i}`}
            className="flex items-center px-4 py-3 text-sm transition-all duration-500"
            style={{
              opacity: i === 0 ? 1 : 0.55 - i * 0.08,
              background: i === 0 ? 'rgba(192,38,211,0.06)' : 'transparent',
            }}
          >
            <div className="flex-[2] min-w-0 pr-2">
              <div className="text-white text-[12px] font-medium truncate">
                {row.origin_name}
                <span className="text-fuchsia-400 mx-1">→</span>
                {row.dest_name}
              </div>
            </div>
            <div className="flex-[2] min-w-0 pr-2">
              <div className="text-zinc-400 text-[11px] capitalize truncate">{row.category_label}</div>
            </div>
            <div className="w-14 text-right font-mono text-[12px] tabular-nums">
              {row.opportunity_score > 0 ? (
                <span className="text-teal-300">{row.opportunity_score.toFixed(1)}</span>
              ) : (
                <span className="text-zinc-600">—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-violet-500/15 bg-violet-600/5 flex justify-between text-[9px] font-mono text-zinc-500">
        <span>{coverage.african_markets} Africa · {coverage.caribbean_markets} Caribbean</span>
        <span className="text-fuchsia-400/80">AfCFTA · CBTPA · Demand signals</span>
      </div>
    </div>
  );
}
