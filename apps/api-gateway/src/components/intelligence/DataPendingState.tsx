'use client';

import { AlertCircle, Clock } from 'lucide-react';

export type DataPendingVariant = 'pending' | 'not_reported' | 'estimate';

const COPY: Record<DataPendingVariant, { title: string; icon: typeof Clock }> = {
  pending: { title: 'Data pending verification', icon: Clock },
  not_reported: { title: 'Not reported', icon: AlertCircle },
  estimate: { title: 'Estimate', icon: Clock },
};

interface DataPendingStateProps {
  variant?: DataPendingVariant;
  message?: string;
  compact?: boolean;
  className?: string;
}

/** Graceful null-state for metrics with no authoritative source value. */
export function DataPendingState({
  variant = 'pending',
  message,
  compact = false,
  className = '',
}: DataPendingStateProps) {
  const { title, icon: Icon } = COPY[variant];
  const detail =
    message ??
    (variant === 'not_reported'
      ? 'International databases do not publish this indicator for this market.'
      : variant === 'estimate'
        ? 'Sourced estimate — verify against official releases.'
        : 'Awaiting verified ingestion from an authoritative source.');

  if (compact) {
    return (
      <span className={`text-sm text-zinc-500 italic ${className}`} title={detail}>
        {title}
      </span>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-zinc-700/50 bg-zinc-900/40 p-3 ${className}`}
    >
      <Icon className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

/** Inline metric placeholder preserving card layout height. */
export function DataPendingMetric({ label, variant = 'pending' }: { label?: string; variant?: DataPendingVariant }) {
  return (
    <div className="text-center py-2">
      {label && <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>}
      <DataPendingState variant={variant} compact />
    </div>
  );
}
