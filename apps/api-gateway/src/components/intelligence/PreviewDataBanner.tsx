'use client';

import { AlertCircle } from 'lucide-react';

interface PreviewDataBannerProps {
  sources?: { key: string; name: string }[];
  freshnessAt?: string;
  className?: string;
}

export function PreviewDataBanner({ 
  sources = [], 
  freshnessAt,
  className = ''
}: PreviewDataBannerProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className={`p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div className="text-sm flex-1">
          <p className="text-amber-400 font-semibold mb-1">
            Curated Preview Data
          </p>
          <p className="text-amber-400/80 leading-relaxed">
Data shown is from curated sources and may not reflect current status.
            Additional source integrations are in development.
          </p>
          {(sources.length > 0 || freshnessAt) && (
            <div className="mt-2 text-xs text-amber-400/60">
              {sources.length > 0 && (
                <span>Sources: {sources.map(s => s.name).join(', ')}</span>
              )}
              {sources.length > 0 && freshnessAt && <span className="mx-2">•</span>}
              {freshnessAt && (
                <span>Last updated: {formatDate(freshnessAt)}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
