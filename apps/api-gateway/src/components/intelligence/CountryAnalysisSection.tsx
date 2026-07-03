'use client';

import { Download } from 'lucide-react';
import { exportCardToPNG } from '@/lib/intelligence/export-png';
import { countryExportContext } from '@/lib/intelligence/export-branding';
import { formatNarrativeText } from '@/lib/intelligence/highlight-metrics';
import { parseCountryAnalysis } from '@/lib/intelligence/parse-country-analysis';
import type { CountryIdentity } from '@/types/country-intelligence';

interface CountryAnalysisSectionProps {
  narrative: string;
  country: CountryIdentity;
  updatedAt: string;
  canExport: boolean;
}

export function CountryAnalysisSection({
  narrative,
  country,
  updatedAt,
  canExport,
}: CountryAnalysisSectionProps) {
  const parsed = parseCountryAnalysis(narrative);
  const iso3 = country.iso3?.toLowerCase() ?? 'country';
  const exportCtx = countryExportContext(country);

  const handleExport = () =>
    exportCardToPNG({
      elementId: 'souvera-country-analysis',
      fileName: `${iso3}-country-analysis`,
      cardTitle: 'Souvera Country Analysis',
      ...exportCtx,
    });

  return (
    <div
      id="souvera-country-analysis"
      className="exportable-card group relative bg-blue-950/10 border border-blue-900/30 rounded-xl p-4"
    >
      {/* Hover-activated PNG download button */}
      {canExport && (
        <button
          type="button"
          onClick={handleExport}
          className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          title="Download Souvera Country Analysis as PNG"
          aria-label="Download Souvera Country Analysis as PNG"
          data-export-exclude
        >
          <Download className="w-4 h-4 text-zinc-300" />
        </button>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
          Souvera Country Analysis
        </h3>
      </div>

      {parsed.lead && (
        <p
          className="text-sm text-zinc-400 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: formatNarrativeText(parsed.lead) }}
        />
      )}

      {parsed.pillars.length > 0 && (
        <ul className="space-y-4">
          {parsed.pillars.map((pillar) => (
            <li key={pillar.title} className="flex items-start gap-2">
              <span className="text-lg shrink-0 mt-0.5" aria-hidden>
                {pillar.emoji}
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white mb-1">{pillar.title}</h4>
                <p
                  className="text-sm text-zinc-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatNarrativeText(pillar.body) }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {parsed.pillars.length === 0 && !parsed.lead && (
        <div
          className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: formatNarrativeText(narrative) }}
        />
      )}

      {parsed.callout && (
        <div className="mt-4 p-3 bg-blue-900/10 border border-blue-800/30 rounded-lg">
          <p className="text-xs text-blue-300 leading-relaxed">
            <span className="font-bold text-blue-200">{parsed.callout.title}:</span>{' '}
            <span dangerouslySetInnerHTML={{ __html: formatNarrativeText(parsed.callout.body) }} />
          </p>
        </div>
      )}

      <p className="text-xs text-zinc-600 mt-3" data-export-exclude>
        Source: Souvera Intelligence · Updated: {updatedAt}
      </p>
    </div>
  );
}
