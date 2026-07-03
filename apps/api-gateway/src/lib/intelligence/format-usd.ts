/**
 * Canonical USD compact formatter for trade intelligence surfaces.
 * Below $1B → Millions (never "$0B" for sub-billion values).
 */
export function formatUsdCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return 'N/A';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${Math.round(abs / 1e6)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1e3)}K`;
  return `${sign}$${Math.round(abs)}`;
}
