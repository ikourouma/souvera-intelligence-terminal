'use client';

/** Badge for SDM / Product Finder cells excluded from AGOA/CBI preferences (HTS Ch. 27). */
export function PreferentialExcludedBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span
        className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/25"
        title="Crude and refined petroleum are excluded from AGOA/CBI duty-free preferences (HTS Ch. 27)"
      >
        Excluded from preferences
      </span>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-900/30 bg-amber-950/10 px-3 py-2">
      <span className="text-[11px] text-amber-400/90 leading-relaxed">
        <strong className="font-semibold text-amber-400">Excluded from AGOA/CBI preferences.</strong>{' '}
        Crude and refined petroleum (HTS Chapter 27) ship at MFN rates. Bilateral trade totals may still include petroleum volumes.
      </span>
    </div>
  );
}
