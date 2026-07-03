'use client';

import { AlertCircle } from 'lucide-react';
import { petroleumExclusionFootnote } from '@/lib/intelligence/preferential-trade-policy';

interface PetroleumExclusionFootnoteProps {
  iso3: string;
  compact?: boolean;
  className?: string;
}

/** Visible disclaimer: petroleum excluded from AGOA/CBI preferential treatment. */
export function PetroleumExclusionFootnote({ iso3, compact = false, className = '' }: PetroleumExclusionFootnoteProps) {
  const text = petroleumExclusionFootnote(iso3);

  if (compact) {
    return (
      <p className={`text-[10px] text-zinc-500 leading-relaxed ${className}`} title={text}>
        ⛽ Petroleum excluded from preferential preferences (HTS Ch. 27)
      </p>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-amber-900/30 bg-amber-950/10 px-3 py-2 ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-amber-500/80 mt-0.5 shrink-0" />
      <p className="text-[11px] text-zinc-400 leading-relaxed">{text}</p>
    </div>
  );
}
