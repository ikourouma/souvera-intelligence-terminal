'use client';

import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import type { CardAnalysisInput } from '@/lib/intelligence/generate-card-analysis';

interface ExportConfig {
  fileName: string;
  cardTitle: string;
  countryName?: string;
  iso2?: string;
  flagUrl?: string;
  sourceAttribution?: string;
  dataAsOf?: string;
  disclaimer?: string;
  aiAnalysisConfig?: CardAnalysisInput;
}

interface ExportableCardProps {
  children: React.ReactNode;
  exportConfig: ExportConfig;
  className?: string;
  /** If true, disables export functionality */
  disableExport?: boolean;
  /** Optional label shown beside the download icon (e.g. "PNG") */
  buttonLabel?: string;
}

/**
 * ExportableCard - Universal wrapper for PNG export on hover
 * 
 * Wraps any card component and adds hover-activated PNG export functionality.
 * The download button appears in the top-right corner on hover.
 * 
 * Usage:
 * ```tsx
 * <ExportableCard
 *   exportConfig={{
 *     fileName: 'nigeria-gdp-2026-06-16.png',
 *     cardTitle: 'GDP Overview',
 *     countryName: 'Nigeria',
 *     iso2: 'NG',
 *     sourceAttribution: 'World Bank · SOUVERA Intelligence',
 *   }}
 * >
 *   <div>Your card content here</div>
 * </ExportableCard>
 * ```
 */
export function ExportableCard({
  children,
  exportConfig,
  className = '',
  disableExport = false,
  buttonLabel,
}: ExportableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!cardRef.current || isExporting) return;

    setIsExporting(true);
    try {
      await exportElementToPNG({
        element: cardRef.current,
        ...exportConfig,
      });
    } catch (err) {
      console.error('Failed to export card:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`exportable-card group relative h-full ${className}`}
    >
      {children}
      
      {!disableExport && (
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="export-btn absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          data-export-exclude
          title="Download as PNG"
          aria-label="Download card as PNG"
        >
          {buttonLabel && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-300">
              {buttonLabel}
            </span>
          )}
          <Download className={`w-3.5 h-3.5 text-zinc-300 ${isExporting ? 'animate-pulse' : ''}`} />
        </button>
      )}
    </div>
  );
}
