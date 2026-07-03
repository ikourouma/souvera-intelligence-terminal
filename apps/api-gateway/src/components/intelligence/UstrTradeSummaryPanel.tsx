'use client';

import { useState } from 'react';
import { ChevronDown, ExternalLink, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/intelligence-entitlements';
import type { UstrTradeSummaryMetric, UstrTradeSummaryPayload } from '@/types/country-intelligence';

const SCOPE_LABELS: Record<UstrTradeSummaryMetric['scope'], string> = {
  goods_and_services_total: 'Goods + services (total)',
  goods_total: 'Goods (total)',
  us_exports_to_country: 'U.S. exports to country',
  us_imports_from_country: 'U.S. imports from country (≈ exports to U.S.)',
  services_total: 'Services (total)',
};

function formatYoY(metric: UstrTradeSummaryMetric): string | null {
  if (metric.yoyPct == null || !metric.yoyDirection) return null;
  return `${metric.yoyDirection === 'up' ? '+' : '−'}${metric.yoyPct}% YoY`;
}

interface UstrTradeSummaryPanelProps {
  summary: UstrTradeSummaryPayload;
  className?: string;
}

/** Tertiary USTR country-page trade summary — corroboration only, not primary KPIs. */
export function UstrTradeSummaryPanel({ summary, className = '' }: UstrTradeSummaryPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-lg border border-zinc-700/60 bg-zinc-900/40 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          <Info className="w-3.5 h-3.5 text-zinc-500" />
          USTR official trade summary
          <span className="text-[10px] font-normal text-zinc-500">(tertiary corroboration)</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-zinc-800/80">
          <p className="text-[10px] text-zinc-500 leading-relaxed pt-2">
            {summary.dataLabel}. USTR may mix goods/services vintages on the same page — compare directionally only.
          </p>

          {summary.agoaStatusText && (
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              <span className="text-zinc-500 font-medium">AGOA status: </span>
              {summary.agoaStatusText}
            </p>
          )}

          <ul className="space-y-1.5">
            {summary.metrics.map((m) => (
              <li key={`${m.scope}-${m.year}`} className="flex flex-wrap items-baseline gap-x-2 text-[11px]">
                <span className="text-zinc-500">{SCOPE_LABELS[m.scope]} ({m.year}):</span>
                <span className="text-zinc-200 font-medium">{formatCurrency(m.valueUsd)}</span>
                {formatYoY(m) && <span className="text-zinc-500">{formatYoY(m)}</span>}
              </li>
            ))}
          </ul>

          <a
            href={summary.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300"
          >
            View on USTR
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
