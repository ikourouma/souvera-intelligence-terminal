'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  Search,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Lock,
  Info,
  X,
  Globe,
  Download,
  Sparkles,
  ChevronRight,
  FileCheck,
  Calendar,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { formatDisplayDate } from '@/lib/data/utils';
import {
  getAfCftaStatusLabel,
  getAfCftaStatusColor,
  formatAfCftaTradeValue,
  type AfCftaStatus,
} from '@/data/afcfta-full-coverage';
import { exportTradePolicyCard } from '@/lib/intelligence/trade-policy-export';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import { PolicyExportButton } from '@/components/intelligence/trade/PolicyExportButton';
import { HighlightedText } from '@/components/intelligence/HighlightedText';

export interface AfCftaInitialEntitlement {
  planId: string;
  isFullAccess: boolean;
  isAuthenticated: boolean;
}

interface TradePartner {
  iso3: string;
  name: string;
  trade_value_usd: number;
  share_pct: number;
}

interface TradeProduct {
  hs_code: string;
  description: string;
  trade_value_usd: number;
  share_pct: number;
}

interface AfCftaStatusRow {
  country_iso3: string;
  country_name: string;
  afcfta_status: string;
  afcfta_signed_date?: string;
  afcfta_ratified_date?: string;
  afcfta_deposited_date?: string;
  afcfta_trading_since?: string;
  afcfta_tariff_offers_submitted?: boolean;
  afcfta_services_offers_submitted?: boolean;
  afcfta_notes?: string;
  afcfta_source_url?: string;
  afcfta_as_of_date?: string;
  is_full_access: boolean;
  upgrade_message?: string;
  data_label?: string;
  // Trade data
  intra_africa_exports_usd?: number;
  intra_africa_imports_usd?: number;
  top_export_partners?: TradePartner[];
  top_import_partners?: TradePartner[];
  top_export_products?: TradeProduct[];
  top_import_products?: TradeProduct[];
}

interface AfCftaResponse {
  statuses: AfCftaStatusRow[];
  summary: {
    total_tracked: number;
    trading_count: number;
    deposited_count: number;
    ratified_count?: number;
    signed_count?: number;
    not_signed_count?: number;
    note: string;
  };
  entitlement: { plan_id: string; is_full_access: boolean };
}

function countryHref(iso3: string, isAuthenticated: boolean): string {
  if (!isAuthenticated) {
    return `/access/request-access?country=${iso3}`;
  }
  return `/country/${iso3}?tab=trade`;
}

// ─── Exportable AfCFTA Section Component ────────────────────────────────────────

function ExportableAfCFTASection({
  children,
  id,
  title,
  country,
  sourceNotes,
  fileName,
  souveraAnalysis,
}: {
  children: React.ReactNode;
  id: string;
  title: string;
  country: AfCftaStatusRow;
  sourceNotes: string;
  fileName: string;
  souveraAnalysis?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [exporting, setExporting] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!sectionRef.current || exporting) return;
    setExporting(true);
    try {
      await exportElementToPNG({
        element: sectionRef.current,
        fileName,
        cardTitle: `${country.country_iso3} — ${title}`,
        countryName: country.country_name,
        sourceAttribution: sourceNotes,
        dataAsOf: new Date().getFullYear().toString(),
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
      });
    } finally {
      setExporting(false);
    }
  }, [country, title, sourceNotes, fileName, exporting]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={sectionRef} className="bg-zinc-900 rounded-xl overflow-hidden">
        {/* Section header for export context */}
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded px-1.5 py-0.5">{country.country_iso3}</span>
              </div>
              <p className="text-white font-semibold text-sm leading-snug">{country.country_name}</p>
              <p className="text-zinc-500 text-[10px] mt-1">AfCFTA Status Analysis · {new Date().getFullYear()}</p>
              <p className="text-zinc-300 text-xs font-medium mt-1.5 border-l-2 border-emerald-500 pl-2">{title}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-blue-400 font-bold text-[10px] tracking-wide">SOUVERA</p>
              <p className="text-zinc-600 text-[9px]">African Trade Policy</p>
            </div>
          </div>
        </div>

        {/* Section content */}
        <div className="p-4">{children}</div>

        {/* Souvera Analysis block */}
        {souveraAnalysis && (
          <div className="px-4 pb-4">
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <p className="text-indigo-300 text-[9px] font-semibold uppercase tracking-wide">Souvera Analysis</p>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed">
                <HighlightedText text={souveraAnalysis} />
              </p>
            </div>
          </div>
        )}

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
          disabled={exporting}
          title="Download section as PNG"
          className="flex items-center gap-1 px-2 py-1 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600 rounded text-[10px] text-zinc-300 hover:text-white transition-colors backdrop-blur-sm"
        >
          <Download className={`w-3 h-3 ${exporting ? 'animate-pulse' : ''}`} />
          <span>{exporting ? '…' : 'PNG'}</span>
        </button>
      </div>
    </div>
  );
}

// ─── AfCFTA Country Drawer ─────────────────────────────────────────────────────

interface AfCFTACountryDrawerProps {
  country: AfCftaStatusRow | null;
  onClose: () => void;
  isAuthenticated: boolean;
}

function AfCFTACountryDrawer({ country, onClose, isAuthenticated }: AfCFTACountryDrawerProps) {
  if (!country) return null;

  const dateStr = new Date().toISOString().slice(0, 10);
  const statusKey = country.afcfta_status as AfCftaStatus;
  const statusColor = getAfCftaStatusColor(statusKey);
  const statusLabel = getAfCftaStatusLabel(statusKey);
  const isTrading = country.afcfta_status === 'trading';
  const isDeposited = country.afcfta_status === 'deposited';
  const hasTariffOffers = country.afcfta_tariff_offers_submitted === true;
  const hasServicesOffers = country.afcfta_services_offers_submitted === true;
  
  // Trade data
  const hasTradeData = country.intra_africa_exports_usd || country.intra_africa_imports_usd;
  const hasProductData = (country.top_export_products?.length ?? 0) > 0 || (country.top_import_products?.length ?? 0) > 0;
  const exportValue = country.intra_africa_exports_usd ? formatAfCftaTradeValue(country.intra_africa_exports_usd) : null;
  const importValue = country.intra_africa_imports_usd ? formatAfCftaTradeValue(country.intra_africa_imports_usd) : null;
  const topExportProduct = country.top_export_products?.[0];
  const topImportProduct = country.top_import_products?.[0];

  // Generate contextual Souvera analysis with trade data
  const statusAnalysis = isTrading
    ? `${country.country_name} is actively trading under AfCFTA protocols${country.afcfta_trading_since ? `, having commenced preferential trade on ${formatDisplayDate(country.afcfta_trading_since)}` : ''}. ${exportValue ? `Intra-Africa exports total ${exportValue}/yr. ` : ''}This positions ${country.country_name} at the forefront of continental integration, with access to reduced tariffs across 54 AU member states.`
    : isDeposited
    ? `${country.country_name} has deposited its instrument of ratification with the African Union${country.afcfta_deposited_date ? ` on ${formatDisplayDate(country.afcfta_deposited_date)}` : ''}, signaling commitment to continental free trade. ${hasTariffOffers ? 'With tariff offers submitted, the country is preparing for preferential trade.' : 'Submission of tariff offers is the next milestone before trading can commence.'}`
    : `${country.country_name}'s current AfCFTA status (${statusLabel}) indicates the country is progressing through ratification stages. Engagement with AfCFTA protocols will determine timeline for preferential market access across Africa's $3.4T continental economy.`;

  const negotiationsAnalysis = hasTariffOffers && hasServicesOffers
    ? `${country.country_name} has submitted both tariff and services offers to the AfCFTA Secretariat, demonstrating full engagement with negotiation protocols. Tariff schedules cover goods liberalization across 90% of tariff lines, while services offers address the 5 priority sectors: transport, communication, finance, tourism, and business services.`
    : hasTariffOffers
    ? `${country.country_name} has submitted tariff reduction offers covering goods liberalization. Services offers remain pending — completion is required for full AfCFTA implementation. The 5 priority service sectors (transport, communication, finance, tourism, business services) await negotiation commitments.`
    : `${country.country_name} has not yet submitted tariff or services offers to the AfCFTA Secretariat. Tariff schedules are required to participate in preferential goods trade, while services offers are negotiated under AfCFTA Protocol on Trade in Services.`;

  const opportunityAnalysis = isTrading
    ? `For investors and exporters, ${country.country_name}'s active AfCFTA participation means immediate preferential access to markets across Africa. ${hasTradeData ? `Current intra-Africa trade: exports ${exportValue}/yr, imports ${importValue}/yr. ` : ''}Key opportunities include: (1) regional value chain integration, (2) rules of origin advantages for manufactured goods, and (3) access to AfCFTA's planned continental payment system.`
    : `${country.country_name}'s path to full AfCFTA participation represents future opportunity for market access across the continent. As ratification progresses, early engagement with local partners positions investors to benefit from preferential tariffs when trading commences.`;

  const tradePartnersAnalysis = hasTradeData && country.top_export_partners?.length
    ? `${country.country_name}'s top intra-Africa export partners are ${country.top_export_partners.slice(0, 3).map(p => `${p.name} (${formatAfCftaTradeValue(p.trade_value_usd)}, ${p.share_pct}%)`).join(', ')}. ${country.top_import_partners?.length ? `Key import partners include ${country.top_import_partners[0].name} (${formatAfCftaTradeValue(country.top_import_partners[0].trade_value_usd)}).` : ''} ${topExportProduct ? `Leading export: ${topExportProduct.description} (${formatAfCftaTradeValue(topExportProduct.trade_value_usd)}, ${topExportProduct.share_pct}% of exports).` : ''} ${topImportProduct ? `Top import: ${topImportProduct.description} (${formatAfCftaTradeValue(topImportProduct.trade_value_usd)}, ${topImportProduct.share_pct}% of imports).` : ''}`
    : `Intra-Africa trade partner data for ${country.country_name} will be available following Comtrade integration. AfCFTA aims to increase intra-Africa trade from 15% to 50% of total African trade.`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-zinc-950 border-l border-zinc-800 z-50 overflow-y-auto">
        {/* Drawer header */}
        <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-sm text-emerald-300">{country.country_iso3}</span>
              </div>
              <h2 className="text-xl font-bold text-white">{country.country_name}</h2>
              <p className="text-zinc-500 text-xs mt-1">
                AfCFTA Implementation Profile · {new Date().getFullYear()}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-white transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer content */}
        <div className="p-5 space-y-5">
          {/* Status Overview Section — EXPORTABLE */}
          <ExportableAfCFTASection
            id="status"
            title="AfCFTA Status Overview"
            country={country}
            sourceNotes="AfCFTA Secretariat · African Union · Tralac · Souvera Analysis"
            fileName={`souvera-afcfta-${country.country_iso3.toLowerCase()}-status-${dateStr}`}
            souveraAnalysis={statusAnalysis}
          >
            <div className="space-y-4">
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Implementation Status</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
                  <FileCheck className="w-3.5 h-3.5" />
                  {statusLabel}
                </span>
              </div>

              {/* Key dates */}
              {country.afcfta_signed_date && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Agreement Signed</span>
                  <span className="text-zinc-300 text-sm">{formatDisplayDate(country.afcfta_signed_date)}</span>
                </div>
              )}
              {country.afcfta_ratified_date && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Ratified</span>
                  <span className="text-zinc-300 text-sm">{formatDisplayDate(country.afcfta_ratified_date)}</span>
                </div>
              )}
              {country.afcfta_deposited_date && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Deposited with AU</span>
                  <span className="text-emerald-400 text-sm font-medium">{formatDisplayDate(country.afcfta_deposited_date)}</span>
                </div>
              )}
              {country.afcfta_trading_since && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Trading Since</span>
                  <span className="text-emerald-400 text-sm font-medium">{formatDisplayDate(country.afcfta_trading_since)}</span>
                </div>
              )}

              {/* Notes */}
              {country.afcfta_notes && (
                <div className="pt-3 border-t border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-1">AfCFTA Notes</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{country.afcfta_notes}</p>
                </div>
              )}
            </div>
          </ExportableAfCFTASection>

          {/* Negotiations Section — EXPORTABLE */}
          <ExportableAfCFTASection
            id="negotiations"
            title="Negotiations Progress"
            country={country}
            sourceNotes="AfCFTA Secretariat · Tralac · WTO Trade Policy Review · Souvera Analysis"
            fileName={`souvera-afcfta-${country.country_iso3.toLowerCase()}-negotiations-${dateStr}`}
            souveraAnalysis={negotiationsAnalysis}
          >
            <div className="space-y-4">
              {/* Tariff offers */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400 text-sm">Tariff Offers</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  hasTariffOffers
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                }`}>
                  {hasTariffOffers ? 'Submitted' : 'Pending'}
                </span>
              </div>

              {/* Services offers */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400 text-sm">Services Offers</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  hasServicesOffers
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                }`}>
                  {hasServicesOffers ? 'Submitted' : 'Pending'}
                </span>
              </div>

              {/* AfCFTA phases info */}
              <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <p className="text-zinc-300 text-xs leading-relaxed">
                  <span className="text-white font-medium">AfCFTA Phase I</span> covers trade in goods (90% tariff liberalization over 5-10 years) and services (5 priority sectors). Phase II negotiations on investment, competition, and IP are ongoing.
                </p>
              </div>
            </div>
          </ExportableAfCFTASection>

          {/* Trade Partners Section — EXPORTABLE */}
          <ExportableAfCFTASection
            id="trade-partners"
            title="Intra-Africa Trade Partners"
            country={country}
            sourceNotes="UN Comtrade · ITC Trade Data Monitor · Souvera Analysis"
            fileName={`souvera-afcfta-${country.country_iso3.toLowerCase()}-partners-${dateStr}`}
            souveraAnalysis={tradePartnersAnalysis}
          >
            <div className="space-y-4">
              {hasTradeData ? (
                <>
                  {/* Trade volume KPIs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-center">
                      <p className="text-2xl font-bold text-emerald-400">{exportValue || 'N/A'}</p>
                      <p className="text-zinc-500 text-xs">Intra-Africa Exports</p>
                    </div>
                    <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-400">{importValue || 'N/A'}</p>
                      <p className="text-zinc-500 text-xs">Intra-Africa Imports</p>
                    </div>
                  </div>

                  {/* Top Export Partners */}
                  {country.top_export_partners && country.top_export_partners.length > 0 && (
                    <div className="pt-3 border-t border-zinc-800">
                      <p className="text-zinc-400 text-xs mb-3">Top Export Destinations</p>
                      <div className="space-y-2">
                        {country.top_export_partners.map((partner, idx) => (
                          <div key={partner.iso3} className="flex items-center justify-between p-2 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 text-xs font-mono">#{idx + 1}</span>
                              <span className="text-emerald-300 text-xs font-mono">{partner.iso3}</span>
                              <span className="text-white text-sm">{partner.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-emerald-400 text-sm font-medium">{formatAfCftaTradeValue(partner.trade_value_usd)}</p>
                              <p className="text-zinc-500 text-[10px]">{partner.share_pct}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Import Partners */}
                  {country.top_import_partners && country.top_import_partners.length > 0 && (
                    <div className="pt-3 border-t border-zinc-800">
                      <p className="text-zinc-400 text-xs mb-3">Top Import Sources</p>
                      <div className="space-y-2">
                        {country.top_import_partners.map((partner, idx) => (
                          <div key={partner.iso3} className="flex items-center justify-between p-2 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 text-xs font-mono">#{idx + 1}</span>
                              <span className="text-blue-300 text-xs font-mono">{partner.iso3}</span>
                              <span className="text-white text-sm">{partner.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-blue-400 text-sm font-medium">{formatAfCftaTradeValue(partner.trade_value_usd)}</p>
                              <p className="text-zinc-500 text-[10px]">{partner.share_pct}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Export Products */}
                  {country.top_export_products && country.top_export_products.length > 0 && (
                    <div className="pt-3 border-t border-zinc-800">
                      <p className="text-emerald-400 text-xs mb-3 font-medium">Top Export Products (Intra-Africa)</p>
                      <div className="space-y-2">
                        {country.top_export_products.map((product, idx) => (
                          <div key={product.hs_code} className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-zinc-500 text-[10px] font-mono">#{idx + 1}</span>
                                  <span className="text-violet-300 text-[10px] font-mono bg-violet-500/10 px-1 rounded">{product.hs_code}</span>
                                </div>
                                <p className="text-white text-xs">{product.description}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-emerald-400 text-sm font-semibold">{formatAfCftaTradeValue(product.trade_value_usd)}</p>
                                <p className="text-zinc-500 text-[10px]">{product.share_pct}% of exports</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Import Products */}
                  {country.top_import_products && country.top_import_products.length > 0 && (
                    <div className="pt-3 border-t border-zinc-800">
                      <p className="text-blue-400 text-xs mb-3 font-medium">Top Import Products (Intra-Africa)</p>
                      <div className="space-y-2">
                        {country.top_import_products.map((product, idx) => (
                          <div key={product.hs_code} className="p-2.5 bg-blue-950/20 border border-blue-500/20 rounded-lg">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-zinc-500 text-[10px] font-mono">#{idx + 1}</span>
                                  <span className="text-violet-300 text-[10px] font-mono bg-violet-500/10 px-1 rounded">{product.hs_code}</span>
                                </div>
                                <p className="text-white text-xs">{product.description}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-blue-400 text-sm font-semibold">{formatAfCftaTradeValue(product.trade_value_usd)}</p>
                                <p className="text-zinc-500 text-[10px]">{product.share_pct}% of imports</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg text-center">
                  <Globe className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm">Trade data pending</p>
                  <p className="text-zinc-500 text-xs mt-1">Full trade data (partners + products) coming in Phase 1 via Comtrade integration</p>
                </div>
              )}
            </div>
          </ExportableAfCFTASection>

          {/* Opportunity Section — EXPORTABLE */}
          <ExportableAfCFTASection
            id="opportunity"
            title="Market Opportunity"
            country={country}
            sourceNotes="AfCFTA Secretariat · African Development Bank · Souvera Analysis"
            fileName={`souvera-afcfta-${country.country_iso3.toLowerCase()}-opportunity-${dateStr}`}
            souveraAnalysis={opportunityAnalysis}
          >
            <div className="space-y-4">
              {/* Continental market access */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Continental Access</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
                  isTrading
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                }`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {isTrading ? 'Active' : 'Pending'}
                </span>
              </div>

              {/* Market stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white">54</p>
                  <p className="text-zinc-500 text-xs">AU Member States</p>
                </div>
                <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-400">$3.4T</p>
                  <p className="text-zinc-500 text-xs">Combined GDP</p>
                </div>
              </div>
            </div>
          </ExportableAfCFTASection>

          {/* Source link */}
          {country.afcfta_source_url && (
            <div className="pt-3 border-t border-zinc-800">
              <a
                href={country.afcfta_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View AfCFTA Official Source
              </a>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Quick Actions</p>
            <Link
              href={`/country/${country.country_iso3}?tab=trade`}
              className="flex items-center justify-between w-full p-3 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <span className="text-sm text-white">View Country Trade Profile</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>
            <Link
              href="/intelligence/trade/agoa"
              className="flex items-center justify-between w-full p-3 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <span className="text-sm text-white">View AGOA Status</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Component now protected by server-side paywall - all users have access
export function AfCFTATrackerClient() {
  const searchParams = useSearchParams();
  const highlightCountry = searchParams.get('country')?.toUpperCase() ?? '';

  const [data, setData] = useState<AfCftaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<AfCftaStatusRow | null>(null);

  // All users who reach this component are authenticated with Business+ tier
  const isAuthenticated = true;

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/trade/afcfta', { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to fetch AfCFTA data');
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AfCFTA data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return (data?.statuses ?? []).filter((row) => {
      if (statusFilter && row.afcfta_status !== statusFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        row.country_name.toLowerCase().includes(q) ||
        row.country_iso3.toLowerCase().includes(q)
      );
    });
  }, [data?.statuses, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <section className="border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
          <Link href="/intelligence/trade" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Trade Intelligence</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
              African Trade Policy
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AfCFTA Status Tracker</h1>
          <p className="text-lg text-zinc-400 max-w-3xl">
            Monitor African Continental Free Trade Area implementation across all 54 AU member states.
            Track ratification, trading status, and intra-Africa trade flows.
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        {data?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Total Countries</p>
              <p className="text-2xl font-bold text-white">{data.summary.total_tracked}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Actively Trading</p>
              <p className="text-2xl font-bold text-emerald-400">{data.summary.trading_count}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Deposited</p>
              <p className="text-2xl font-bold text-amber-400">{data.summary.deposited_count}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Ratified</p>
              <p className="text-2xl font-bold text-blue-400">{data.summary.ratified_count ?? 0}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Signed Only</p>
              <p className="text-2xl font-bold text-zinc-400">{data.summary.signed_count ?? 0}</p>
            </div>
          </div>
        )}
        
        {data?.summary?.note && (
          <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-500">{data.summary.note}</p>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm"
          >
            <option value="">All Status</option>
            <option value="trading">Trading</option>
            <option value="deposited">Deposited</option>
            <option value="ratified">Ratified</option>
            <option value="signed">Signed</option>
            <option value="not_signed">Not Signed</option>
          </select>
          <button type="button" onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">
                {filtered.length} markets · hover a card to export a single-country slide
              </p>
              <PolicyExportButton
                label="Export visible countries"
                onClick={() =>
                  exportTradePolicyCard(
                    'afcfta-country-grid',
                    'afcfta-country-status-grid',
                    'AfCFTA Country Status',
                    'African Continental FTA'
                  )
                }
              />
            </div>
            <div id="afcfta-country-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((row) => {
                const highlighted = highlightCountry === row.country_iso3;
                const statusKey = row.afcfta_status as Parameters<typeof getAfCftaStatusColor>[0];
                return (
                  <div
                    key={row.country_iso3}
                    id={`afcfta-country-${row.country_iso3}`}
                    onClick={() => setSelectedCountry(row)}
                    className={`group relative bg-zinc-900/50 border rounded-lg p-4 transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                      highlighted ? 'border-emerald-500/50 ring-1 ring-emerald-500/30' : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div>
                        <h3 className="text-white font-medium">{row.country_name}</h3>
                        <p className="text-zinc-500 text-sm">{row.country_iso3}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAfCftaStatusColor(statusKey)}`}>
                          {getAfCftaStatusLabel(statusKey)}
                        </span>
                        <PolicyExportButton
                          label="Slide"
                          className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity"
                          onClick={() =>
                            exportTradePolicyCard(
                              `afcfta-country-${row.country_iso3}`,
                              `afcfta-${row.country_iso3.toLowerCase()}-status`,
                              `${row.country_name} — AfCFTA Status`,
                              row.country_iso3
                            )
                          }
                        />
                      </div>
                    </div>

                    {row.is_full_access ? (
                      <div className="space-y-2 text-sm text-zinc-400">
                        {row.afcfta_trading_since && (
                          <div className="flex justify-between">
                            <span>Trading Since</span>
                            <span className="text-zinc-300">{formatDisplayDate(row.afcfta_trading_since)}</span>
                          </div>
                        )}
                        {row.afcfta_ratified_date && (
                          <div className="flex justify-between">
                            <span>Ratified</span>
                            <span className="text-zinc-300">{formatDisplayDate(row.afcfta_ratified_date)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Tariff Offers</span>
                          <span className={row.afcfta_tariff_offers_submitted ? 'text-emerald-400' : 'text-zinc-500'}>
                            {row.afcfta_tariff_offers_submitted ? 'Submitted' : 'Pending'}
                          </span>
                        </div>
                        {row.afcfta_notes && (
                          <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">{row.afcfta_notes}</p>
                        )}
                        {row.afcfta_source_url && (
                          <a
                            href={row.afcfta_source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-export-exclude
                            className="inline-flex items-center gap-1 text-emerald-400 text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            AfCFTA Source
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-zinc-500 text-xs mt-2" data-export-exclude>
                        <Lock className="w-3 h-3" />
                        <span>{row.upgrade_message ?? 'Upgrade to Business+ for full AfCFTA intelligence'}</span>
                      </div>
                    )}

                    <div
                      className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center"
                      data-export-exclude
                    >
                      <span className="text-xs text-zinc-500">{row.data_label ?? 'Souvera Curated Intelligence'}</span>
                      <Link href={countryHref(row.country_iso3, isAuthenticated)} className="text-xs text-cyan-400 hover:text-cyan-300">
                        Trade tab →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Country Drawer */}
      {selectedCountry && (
        <AfCFTACountryDrawer
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
}
