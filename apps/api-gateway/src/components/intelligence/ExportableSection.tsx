'use client';

import { useCallback, useRef, useState } from 'react';
import { Download, Globe } from 'lucide-react';
import { exportElementToPNG } from '@/lib/intelligence/export-png';

/**
 * ExportableSection — Wraps any content section with PNG export capability.
 * 
 * Used across Trade Intelligence modules to create presentation-ready exports.
 * Each section includes:
 * - Header with context (country/product, profile type, category)
 * - Souvera branding
 * - Source attribution in footer
 * - Hover-to-show PNG download button
 */

export interface ExportableSectionHeaderContext {
  /** Primary label (e.g., "South Africa", "HS 610910") */
  primaryLabel: string;
  /** Primary code (e.g., "ZAF", product code) */
  primaryCode?: string;
  /** Subtitle line (e.g., "US export demand profile · 2023") */
  subtitle: string;
  /** Category name if applicable (e.g., "ICT & Telecommunications") */
  category?: string;
  /** Icon component to show before primary label */
  icon?: React.ReactNode;
}

export interface ExportableSectionProps {
  children: React.ReactNode;
  /** Unique identifier for this section */
  id: string;
  /** Section title (used in export metadata) */
  title: string;
  /** Header context for export branding */
  headerContext: ExportableSectionHeaderContext;
  /** Source attribution text */
  sourceNotes: string;
  /** Filename for PNG export (without extension) */
  fileName: string;
  /** Whether this section is currently being exported */
  exporting?: boolean;
  /** Callback when export starts */
  onExportStart?: (id: string) => void;
  /** Callback when export completes */
  onExportEnd?: () => void;
  /** Visual highlight for this section */
  isHighlighted?: boolean;
  /** Additional class names */
  className?: string;
}

export function ExportableSection({
  children,
  id,
  title,
  headerContext,
  sourceNotes,
  fileName,
  exporting = false,
  onExportStart,
  onExportEnd,
  isHighlighted = false,
  className = '',
}: ExportableSectionProps) {
  const [hovered, setHovered] = useState(false);
  const [localExporting, setLocalExporting] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const isExporting = exporting || localExporting;

  const handleExport = useCallback(async () => {
    if (!sectionRef.current || isExporting) return;
    
    onExportStart?.(id);
    setLocalExporting(true);
    
    try {
      await exportElementToPNG({
        element: sectionRef.current,
        fileName,
        cardTitle: `${headerContext.primaryLabel} — ${headerContext.category ?? title}`,
        countryName: headerContext.primaryLabel,
        iso2: headerContext.primaryCode?.slice(0, 2),
        sourceAttribution: sourceNotes,
        dataAsOf: headerContext.subtitle.match(/\d{4}/)?.[0] ?? new Date().getFullYear().toString(),
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
      });
    } finally {
      setLocalExporting(false);
      onExportEnd?.();
    }
  }, [id, fileName, headerContext, title, sourceNotes, isExporting, onExportStart, onExportEnd]);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div 
        ref={sectionRef} 
        className={`bg-zinc-900 rounded-xl overflow-hidden ${isHighlighted ? 'ring-2 ring-blue-500/50' : ''}`}
      >
        {/* Section header for export context */}
        <div className={`px-4 py-3 border-b border-zinc-800 ${isHighlighted ? 'bg-blue-950/30' : 'bg-zinc-900'}`}>
          <div className="flex items-center justify-between">
            <div>
              {/* Primary label + code */}
              <div className="flex items-center gap-2">
                {headerContext.icon ?? <Globe className="w-3.5 h-3.5 text-blue-400" />}
                <span className="text-white font-semibold text-sm">{headerContext.primaryLabel}</span>
                {headerContext.primaryCode && (
                  <span className="font-mono text-[10px] text-zinc-500 bg-zinc-800 rounded px-1 py-0.5">
                    {headerContext.primaryCode}
                  </span>
                )}
              </div>
              {/* Subtitle */}
              <p className="text-zinc-500 text-[10px] mt-0.5">{headerContext.subtitle}</p>
              {/* Category name - prominent display */}
              {headerContext.category && (
                <p className="text-zinc-300 text-xs font-medium mt-1 border-l-2 border-blue-500 pl-2">
                  {headerContext.category}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-blue-400 font-bold text-[10px] tracking-wide">SOUVERA</p>
              <p className="text-zinc-600 text-[9px]">{title}</p>
            </div>
          </div>
        </div>

        {/* Section content */}
        <div className="p-4">
          {children}
        </div>

        {/* Section footer with sources */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/50">
          <p className="text-zinc-600 text-[9px] leading-relaxed">
            <span className="text-zinc-500 font-medium">Sources:</span> {sourceNotes}
          </p>
        </div>
      </div>

      {/* PNG download button — visible on hover */}
      <div
        data-export-exclude
        className={`absolute right-2 top-2 transition-all duration-150 z-10 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          title="Download section as PNG"
          className="flex items-center gap-1 px-2 py-1 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600 rounded text-[10px] text-zinc-300 hover:text-white transition-colors backdrop-blur-sm"
        >
          <Download className={`w-3 h-3 ${isExporting ? 'animate-pulse' : ''}`} />
          <span>{isExporting ? '…' : 'PNG'}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Simplified version for use without external state management.
 * Manages its own exporting state internally.
 */
export function ExportableSectionSimple(
  props: Omit<ExportableSectionProps, 'exporting' | 'onExportStart' | 'onExportEnd'>
) {
  return <ExportableSection {...props} />;
}
