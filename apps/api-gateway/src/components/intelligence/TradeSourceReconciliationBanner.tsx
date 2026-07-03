'use client';

import { AlertCircle } from 'lucide-react';
import type { TradeSourceReconciliation } from '@/types/country-intelligence';
import { formatCurrency } from '@/lib/intelligence-entitlements';

interface TradeSourceReconciliationBannerProps {
  reconciliation: TradeSourceReconciliation;
}

/** Shown when Census bilateral and USITC category-flow totals diverge materially. */
export function TradeSourceReconciliationBanner({ reconciliation }: TradeSourceReconciliationBannerProps) {
  const { censusExportsToUsUsd, categoryFlowTotalUsd, deltaUsd, deltaPct, message } = reconciliation;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-blue-900/40 bg-blue-950/20 px-3 py-2.5 mb-4">
      <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-blue-300">Dual-source trade figures</p>
        <p className="text-[11px] text-zinc-400 leading-relaxed">{message}</p>
        <div className="flex flex-wrap gap-3 text-[10px] text-zinc-500">
          <span>Census bilateral: <span className="text-zinc-300">{formatCurrency(censusExportsToUsUsd)}</span></span>
          <span>Category flows: <span className="text-zinc-300">{formatCurrency(categoryFlowTotalUsd)}</span></span>
          <span>Δ {formatCurrency(deltaUsd)} ({deltaPct}%)</span>
        </div>
      </div>
    </div>
  );
}

function MetricSourceLabel({ label, scope }: { label: string; scope?: string }) {
  return (
    <p className="text-[10px] text-zinc-500 mt-1 leading-snug">
      Source: <span className="text-zinc-400">{label}</span>
      {scope ? <> · <span className="text-zinc-500">{scope}</span></> : null}
    </p>
  );
}

export function TradeMetricSourceLabel({
  sourceLabel,
  metricScope,
}: {
  sourceLabel: string;
  metricScope?: string;
}) {
  const scopeNote =
    metricScope === 'bilateral_all_goods'
      ? 'All goods (MFN)'
      : metricScope === 'category_flow_aggregate'
        ? 'Sector category sum'
        : metricScope === 'preferential'
          ? 'Non-petroleum preferential'
          : undefined;
  return <MetricSourceLabel label={sourceLabel} scope={scopeNote} />;
}
