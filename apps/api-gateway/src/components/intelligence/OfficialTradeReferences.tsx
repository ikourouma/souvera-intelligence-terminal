'use client';

import { ExternalLink } from 'lucide-react';
import type { OfficialReferenceLink } from '@/types/country-intelligence';

interface OfficialTradeReferencesProps {
  references: OfficialReferenceLink[];
  compact?: boolean;
  className?: string;
}

/**
 * UI-only official trade reference links (USTR country pages, etc.).
 * Never embed raw URLs in PDF output.
 */
export function OfficialTradeReferences({
  references,
  compact = false,
  className = '',
}: OfficialTradeReferencesProps) {
  if (!references.length) return null;

  return (
    <div
      className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 ${className}`}
    >
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <ExternalLink className="w-3 h-3" />
        Official trade references
      </h3>
      <ul className={`space-y-2 ${compact ? 'text-[11px]' : 'text-xs'}`}>
        {references.map((ref) => (
          <li key={ref.url}>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              {ref.label}
              <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
            </a>
            {!compact && (
              <p className="text-[10px] text-zinc-600 mt-0.5">
                Source: {ref.sourceKey.replace(/_/g, ' ')}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
