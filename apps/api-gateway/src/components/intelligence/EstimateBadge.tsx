'use client';

/** Compact IMF WEO / estimate indicator for headline macro metrics. */
export function EstimateBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/25 ${className}`}
      title="IMF WEO estimate — verify against official releases"
    >
      Estimate
    </span>
  );
}
