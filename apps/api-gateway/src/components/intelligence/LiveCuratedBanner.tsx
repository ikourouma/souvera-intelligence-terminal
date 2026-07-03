'use client';

import { Database } from 'lucide-react';

interface LiveCuratedBannerProps {
  title?: string;
  description: string;
  sources?: string[];
  className?: string;
}

/** Informational source-attribution strip for public intelligence pages. */
export function LiveCuratedBanner({
  title = 'Live & Curated Data',
  description,
  sources = [],
  className = '',
}: LiveCuratedBannerProps) {
  return (
    <div
      className={`p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl ${className}`}
    >
      <div className="flex items-start gap-3">
        <Database className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
        <div className="text-sm flex-1">
          <p className="text-emerald-400 font-semibold mb-1">{title}</p>
          <p className="text-emerald-400/85 leading-relaxed">{description}</p>
          {sources.length > 0 && (
            <p className="mt-2 text-xs text-emerald-400/65">
              Sources: {sources.join(' · ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
