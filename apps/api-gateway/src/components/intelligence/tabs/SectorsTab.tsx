'use client';

import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef } from 'react';
import type { EntitlementKey } from '@souvera/entitlements';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { sanitizeHtml } from '@/lib/intelligence/markdown';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import { countryExportContext } from '@/lib/intelligence/export-branding';
import { getSectorTradeCopy } from '@/lib/intelligence/country-sectors-content';
import { PetroleumExclusionFootnote } from '@/components/intelligence/PetroleumExclusionFootnote';
import { isPetroleumOrEnergySector, petroleumSectorNote } from '@/lib/intelligence/preferential-trade-policy';

interface SectorData {
  sectorKey: string;
  sectorLabel: string;
  iconEmoji: string;
  displayOrder: number;
  teaser: string;
  strengthScore?: number;
  growthScore?: number;
  attractivenessScore?: number;
  narrativeShort?: string;
  narrativeFull?: string;
  keyPlayers?: Array<{
    name: string;
    sector: string;
    description: string;
    metric: string;
  }>;
  agoaOpportunity?: string;
  agoaExportCurrentUsd?: number;
  agoaExportPotentialUsd?: number;
  dataSources?: string[];
  updatedAt?: string;
}

interface SectorsTabProps {
  data: {
    sectors?: SectorData[];
    country?: {
      name: string;
      iso3: string;
    };
  };
  userEntitlements: EntitlementKey[];
}

/**
 * SectorsTab - Bloomberg-Grade Sectoral Intelligence
 * 
 * Features:
 * - Vertical list of sectors (NOT sub-tabs)
 * - Each sector: Icon, Teaser, Scores, Narrative, Key Players, AGOA Opportunity
 * - Entitlement gating: Explorer (teaser), Professional+ (scores + narrative), Business+ (AGOA)
 * - Progressive disclosure for full narrative
 * - Help tooltips for sector scores
 * - Export individual sector cards as PNG (Professional+)
 * 
 * Narrative Framework: Option 2 (Opportunity + Capacity)
 * - Confident, evidence-based, no "if" statements
 * - Quantified opportunities with supporting data
 * - Win-win framing (U.S. + host country preferential trade)
 */
export function SectorsTab({ data, userEntitlements }: SectorsTabProps) {
  // Accordion state - only one sector expanded at a time
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  
  // Narrative expansion state (for "Read Full Analysis")
  const [expandedNarratives, setExpandedNarratives] = useState<Set<string>>(new Set());
  
  const hasScoreAccess = userEntitlements.includes('full_macro') || userEntitlements.includes('admin_access');
  const hasRationaleAccess = userEntitlements.includes('sector_rationale') || userEntitlements.includes('admin_access');
  const hasAgoaAccess = userEntitlements.includes('trade_data') || userEntitlements.includes('admin_access');
  const canExport = userEntitlements.includes('full_macro') || userEntitlements.includes('admin_access');
  const countryName = data.country?.name ?? 'Country';
  const iso3 = data.country?.iso3?.toLowerCase() ?? 'country';
  const exportCtx = countryExportContext(data.country);
  const tradeCopy = getSectorTradeCopy(data.country?.iso3 ?? '');
  
  // Ref for key sectors panel export
  const keySectorsPanelRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPanel = async () => {
    if (!keySectorsPanelRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      await exportElementToPNG({
        element: keySectorsPanelRef.current,
        fileName: `souvera-${iso3}-key-sectors-${date}.png`,
        cardTitle: 'Key Sectors',
        countryName: data.country?.name,
        iso2: data.country?.iso3?.substring(0, 2),
        sourceAttribution: 'SOUVERA Intelligence',
      });
    } catch (err) {
      console.error('Failed to export Key Sectors panel:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = (elementId: string, fileName: string, cardTitle: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    exportElementToPNG({
      element,
      fileName: `souvera-${fileName}-${new Date().toISOString().split('T')[0]}.png`,
      cardTitle,
      ...exportCtx,
    });
  };

  // Toggle sector accordion (collapse/expand)
  const toggleSector = (sectorKey: string) => {
    setExpandedSector((prev) => (prev === sectorKey ? null : sectorKey));
  };

  // Toggle narrative expansion within a sector
  const toggleNarrative = (sectorKey: string) => {
    setExpandedNarratives((prev) => {
      const next = new Set(prev);
      if (next.has(sectorKey)) {
        next.delete(sectorKey);
      } else {
        next.add(sectorKey);
      }
      return next;
    });
  };

  const formatCurrency = (value?: number) => {
    if (value == null) return 'N/A';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500', opacity: 'opacity-100' };
    if (score >= 60) return { text: 'text-blue-400', bg: 'bg-blue-500', opacity: 'opacity-90' };
    if (score >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500', opacity: 'opacity-75' };
    return { text: 'text-red-400', bg: 'bg-red-500', opacity: 'opacity-60' };
  };

  if (!data.sectors || data.sectors.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Key Sectors</h2>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-zinc-400 mb-2">Sector intelligence is being prepared</p>
          <p className="text-xs text-zinc-600">
            Comprehensive sector analysis for {data.country?.name || 'this country'} will be available soon
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Key Sectors</h2>
        <span className="text-xs text-zinc-500">
          {data.sectors.length} sectors analyzed
        </span>
      </div>

      <div ref={keySectorsPanelRef} id="key-sectors-panel" className="exportable-card group relative">
        {/* Hover-activated PNG download button */}
        {canExport && (
          <button
            onClick={handleExportPanel}
            disabled={isExporting}
            className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            data-export-exclude
            title="Download Key Sectors as PNG"
            aria-label="Download Key Sectors as PNG"
          >
            <Download className={`w-4 h-4 text-zinc-300 ${isExporting ? 'animate-pulse' : ''}`} />
          </button>
        )}
        
      {/* Sector comparison matrix */}
      {hasScoreAccess && (
        <div id="sector-comparison-card" className="exportable-card group relative overflow-x-auto bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          {/* Hover-activated PNG download button */}
          {canExport && (
            <button
              type="button"
              onClick={() => handleExport('sector-comparison-card', `${iso3}-sector-comparison`, 'Sector Comparison')}
              data-export-exclude
              className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              title="Download Sector Comparison as PNG"
              aria-label="Download Sector Comparison as PNG"
            >
              <Download className="w-4 h-4 text-zinc-300" />
            </button>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Sector Comparison</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left">
                <th className="pb-2">Sector</th>
                <th className="pb-2">Strength</th>
                <th className="pb-2">Growth</th>
                <th className="pb-2">Attractiveness</th>
              </tr>
            </thead>
            <tbody>
              {data.sectors.map((s) => (
                <tr key={s.sectorKey} className="border-t border-zinc-800">
                  <td className="py-2 text-white">{s.iconEmoji} {s.sectorLabel}</td>
                  <td className="py-2 text-emerald-400">{s.strengthScore ?? '—'}</td>
                  <td className="py-2 text-blue-400">{s.growthScore ?? '—'}</td>
                  <td className="py-2 text-cyan-400">{s.attractivenessScore ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sector Cards */}
      <div className={`space-y-4 ${hasScoreAccess ? 'mt-8' : ''}`}>
        {data.sectors.map((sector) => {
          const isExpanded = expandedSector === sector.sectorKey;
          const isNarrativeExpanded = expandedNarratives.has(sector.sectorKey);
          
          return (
            <div
              key={sector.sectorKey}
              id={`sector-${sector.sectorKey}`}
              className={`bg-zinc-900/50 border rounded-xl scroll-mt-24 transition-all duration-300 ${
                isExpanded ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Clickable Header */}
              <div className="flex items-start justify-between p-6">
                {/* Clickable Accordion Trigger */}
                <button
                  onClick={() => toggleSector(sector.sectorKey)}
                  className="flex-1 flex items-center gap-3 text-left group"
                >
                  <span className="text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110">
                    {sector.iconEmoji}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors">
                        {sector.sectorLabel}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-blue-400' : 'group-hover:text-zinc-300'
                        }`}
                      />
                    </div>
                    {/* Teaser (Always Visible) */}
                    <p className="text-sm text-zinc-400 leading-relaxed mt-2">
                      {sector.teaser}
                    </p>
                  </div>
                </button>
              </div>

              {/* Expandable Content */}
              {isExpanded && (
                <div id={`sector-${sector.sectorKey}-card`} className="exportable-card group relative px-6 pb-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                  {/* Hover-activated PNG download button */}
                  {canExport && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(`sector-${sector.sectorKey}-card`, `${iso3}-${sector.sectorKey}-sector`, sector.sectorLabel);
                      }}
                      data-export-exclude
                      className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                      title={`Download ${sector.sectorLabel} as PNG`}
                      aria-label={`Download ${sector.sectorLabel} as PNG`}
                    >
                      <Download className="w-4 h-4 text-zinc-300" />
                    </button>
                  )}

                {/* Sector Scores (Professional+ Access) */}
                {hasScoreAccess && (
                <div className="mb-6 p-3 sm:p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                    Sector Scores
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Strength Score */}
                    {sector.strengthScore !== undefined && (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <span className="text-sm">💪</span>
                            <span className="whitespace-nowrap">Strength</span>
                            <HelpTooltip term="sector_strength_score" size="sm" position="top" />
                          </span>
                          <span className={`text-sm font-bold ${getScoreColor(sector.strengthScore).text}`}>
                            {sector.strengthScore}/100
                          </span>
                        </div>
                        <div className="w-full h-2 sm:h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreColor(sector.strengthScore).bg} ${getScoreColor(sector.strengthScore).opacity} transition-all duration-500`}
                            style={{ width: `${sector.strengthScore}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Growth Score */}
                    {sector.growthScore !== undefined && (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <span className="text-sm">📈</span>
                            <span className="whitespace-nowrap">Growth</span>
                            <HelpTooltip term="sector_growth_score" size="sm" position="top" />
                          </span>
                          <span className={`text-sm font-bold ${getScoreColor(sector.growthScore).text}`}>
                            {sector.growthScore}/100
                          </span>
                        </div>
                        <div className="w-full h-2 sm:h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreColor(sector.growthScore).bg} ${getScoreColor(sector.growthScore).opacity} transition-all duration-500`}
                            style={{ width: `${sector.growthScore}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Attractiveness Score */}
                    {sector.attractivenessScore !== undefined && (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <span className="text-sm">⭐</span>
                            <span className="whitespace-nowrap">Attractiveness</span>
                            <HelpTooltip term="sector_attractiveness_score" size="sm" position="top" />
                          </span>
                          <span className={`text-sm font-bold ${getScoreColor(sector.attractivenessScore).text}`}>
                            {sector.attractivenessScore}/100
                          </span>
                        </div>
                        <div className="w-full h-2 sm:h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreColor(sector.attractivenessScore).bg} ${getScoreColor(sector.attractivenessScore).opacity} transition-all duration-500`}
                            style={{ width: `${sector.attractivenessScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                )}

                {/* Souvera Narrative (Professional+ Access) */}
                {hasRationaleAccess && sector.narrativeShort && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    📊 Souvera Narrative
                  </h4>
                  <div className="text-sm text-zinc-300 leading-relaxed space-y-3">
                    {sector.narrativeShort.split('\n\n').map((paragraph, idx) => (
                      <p 
                        key={idx}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(paragraph) }}
                      />
                    ))}
                  </div>

                  {/* Progressive Disclosure */}
                  {sector.narrativeFull && sector.narrativeFull !== sector.narrativeShort && (
                    <div className="mt-3">
                      {isNarrativeExpanded && (
                        <div className="text-sm text-zinc-300 leading-relaxed space-y-3 mt-3 pt-3 border-t border-zinc-800">
                          {sector.narrativeFull.split('\n\n').map((paragraph, idx) => (
                            <p 
                              key={idx}
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(paragraph) }}
                            />
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => toggleNarrative(sector.sectorKey)}
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                      >
                        {isNarrativeExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Read Full Analysis
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                )}

                {!hasRationaleAccess && (
                <div className="mb-6 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-center">
                  <p className="text-xs text-blue-400 mb-1">
                    <span className="font-bold">Unlock Full Sector Analysis</span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    Access comprehensive sector narratives with Professional or higher subscription
                  </p>
                </div>
                )}

                {/* Key Players (Public Access) - Horizontal Cards */}
                {sector.keyPlayers && sector.keyPlayers.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                      🏢 Key Players
                    </h4>
                    {/* Responsive Grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {sector.keyPlayers.map((player, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg hover:border-zinc-700 transition-colors"
                        >
                          {/* Company Name */}
                          <div className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                            <span className="text-blue-400">💼</span>
                            <span className="truncate">{player.name}</span>
                          </div>
                          
                          {/* Sector Tag */}
                          <div className="text-xs text-zinc-500 mb-2">
                            {player.sector}
                          </div>
                          
                          {/* Description (2 lines max) */}
                          <p className="text-xs text-zinc-400 mb-2 line-clamp-2 min-h-[32px]">
                            {player.description}
                          </p>
                          
                          {/* Metric */}
                          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                            <span>📊</span>
                            <span className="truncate">{player.metric}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferential trade opportunity (Business+ Access) */}
                {hasAgoaAccess && sector.agoaOpportunity && (
                  <div className="p-3 sm:p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-lg">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      {tradeCopy.sectionEmoji} {tradeCopy.sectionTitle}
                    </h4>
                    
                    {/* Narrative with HTML highlighting */}
                    <div className="text-sm text-zinc-300 leading-relaxed space-y-3">
                      {sector.agoaOpportunity.split('\n\n').map((paragraph, idx) => (
                        <p 
                          key={idx}
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(paragraph) }}
                        />
                      ))}
                    </div>

                    {/* Export Metrics - Enhanced with Growth Indicators */}
                    {(sector.agoaExportCurrentUsd != null || sector.agoaExportPotentialUsd != null) && (
                      <div className="mt-4 pt-3 border-t border-emerald-900/30">
                        <h5 className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider mb-3">
                          Export Metrics
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {sector.agoaExportCurrentUsd != null && (
                            <div className="p-3 bg-zinc-950/50 rounded-lg border border-emerald-900/20">
                              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
                                {tradeCopy.currentExportLabel}
                              </div>
                              <div className="text-base sm:text-lg font-bold text-white">
                                {formatCurrency(sector.agoaExportCurrentUsd)}/year
                              </div>
                            </div>
                          )}
                          {sector.agoaExportPotentialUsd != null && (
                            <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/30">
                              <div className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <span>{tradeCopy.potentialLabel}</span>
                                {sector.agoaExportCurrentUsd != null && sector.agoaExportCurrentUsd > 0 && (
                                  <span className="text-[9px] text-emerald-500 font-bold">
                                    ↑ {Math.round((sector.agoaExportPotentialUsd / sector.agoaExportCurrentUsd) * 10) / 10}x
                                  </span>
                                )}
                              </div>
                              <div className="text-base sm:text-lg font-bold text-emerald-400">
                                {formatCurrency(sector.agoaExportPotentialUsd)}/year
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {isPetroleumOrEnergySector(sector.sectorKey, sector.sectorLabel) && (
                      <>
                        <p className="text-xs text-amber-400/90 mt-3 leading-relaxed">
                          {petroleumSectorNote(data.country?.iso3 ?? '')}
                        </p>
                        <PetroleumExclusionFootnote iso3={data.country?.iso3 ?? ''} compact className="mt-3" />
                      </>
                    )}
                  </div>
                )}

                {!hasAgoaAccess && sector.agoaOpportunity && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-center">
                  <p className="text-xs text-emerald-400 mb-1">
                    <span className="font-bold">{tradeCopy.lockedTitle}</span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    {tradeCopy.lockedBody}
                  </p>
                </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-600">
                <div className="break-words">
                  {sector.dataSources && sector.dataSources.length > 0 && (
                    <span>Sources: {sector.dataSources.join(', ')}</span>
                  )}
                </div>
                <div className="whitespace-nowrap">
                  {sector.updatedAt && (
                    <span>Updated: {new Date(sector.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  )}
                </div>
                </div>
              </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
