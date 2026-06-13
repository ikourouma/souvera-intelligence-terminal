'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Filter,
  RefreshCw,
  Search,
  Shirt,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  X,
  ChevronDown,
  ChevronRight,
  Building2,
  MapPin,
  FileText,
  Globe,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Download,
  Package,
} from 'lucide-react';
import {
  type ProductEnrichment,
  type DiaPotentialProduct,
  getProductEnrichment,
  getDiaPotentialProduct,
} from '@/lib/trade/agoa-priority-products';
import { HighlightedText } from '@/components/intelligence/HighlightedText';
import { exportElementToPNG } from '@/lib/intelligence/export-png';

// ─── Types matching the API response ─────────────────────────────────────────

interface ProductRow {
  code: string;
  classification: string;
  chapter: number | null;
  description: string;
  sector_key: string;
  sector_label: string;
  strategic_type: 'africa_export' | 'us_reciprocal';
  is_apparel_provision: boolean;
  is_agoa_specific: boolean;
  is_cbtpa_specific: boolean;
  us_export_states: string[];
  rules_of_origin_summary: string | null;
  agoa_preference_rate_pct: number | null;
  mfn_rate_pct: number | null;
  mfn_rate_display: string | null;
  export_to_us_usd: number | null;
  us_import_demand_usd: number | null;
  net_position_usd: number | null;
  opportunity_score: number | null;
  top_trade_countries: Array<{ iso3: string; name: string; annualVolumeUSD: number; role: string; context: string }>;
  cliff_risk_note: string | null;
  data_status: string;
}

interface CountryContext {
  iso3: string;
  name: string;
  agoa_status: string;
  agoa_apparel_eligible?: boolean;
}

interface ProductsResponse {
  products: ProductRow[];
  country: CountryContext | null;
  grouped_by_sector: Record<string, ProductRow[]>;
  summary: {
    total_products: number;
    africa_export_count: number;
    us_reciprocal_count: number;
    apparel_count: number;
    note: string;
  };
  attribution: { source_name: string; data_label: string };
}

type SmartFilter = 'all' | 'africa_export' | 'us_reciprocal' | 'apparel_provision';

const AGOA_EXPIRY = new Date('2026-12-31T23:59:59Z');
function daysUntilExpiry(): number {
  return Math.max(0, Math.ceil((AGOA_EXPIRY.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

const SECTOR_LABELS: Record<string, string> = {
  manufacturing: 'Manufacturing & Textiles',
  agriculture: 'Agriculture & Food Processing',
  'critical-minerals': 'Mining & Critical Minerals',
  energy: 'Energy & Power',
  technology: 'Technology & Software',
  logistics: 'Logistics & Trade',
  'tourism-hospitality': 'Tourism & Hospitality',
  fintech: 'Fintech & Digital Finance',
};

const SECTOR_ORDER = ['manufacturing', 'agriculture', 'critical-minerals', 'energy', 'technology', 'logistics', 'tourism-hospitality', 'fintech'];

const SMART_FILTER_META: Record<SmartFilter, { label: string; description: string; icon: React.ElementType; activeClass: string }> = {
  all: { label: 'All products', description: 'All priority products across all sectors', icon: Filter, activeClass: 'border-zinc-500 text-zinc-100 bg-zinc-800' },
  africa_export: { label: 'AGOA export potential', description: 'Africa supply surplus → duty-free US access', icon: TrendingUp, activeClass: 'border-emerald-500/60 text-emerald-200 bg-emerald-900/25' },
  us_reciprocal: { label: 'US reciprocal opportunity', description: 'Africa deficit + US supply → reauthorization justification', icon: TrendingDown, activeClass: 'border-blue-500/60 text-blue-200 bg-blue-900/25' },
  apparel_provision: { label: 'Apparel provisions', description: 'AGOA third-country fabric rule — HS 50–63', icon: Shirt, activeClass: 'border-violet-500/60 text-violet-200 bg-violet-900/25' },
};

function usdM(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1e9).toFixed(1)}B`;
  return `$${(v / 1e6).toFixed(0)}M`;
}

// ─── Exportable Product Section ───────────────────────────────────────────────

function ExportableProductSection({
  children,
  id,
  title,
  product,
  sourceNotes,
  fileName,
  souveraAnalysis,
}: {
  children: React.ReactNode;
  id: string;
  title: string;
  product: ProductRow;
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
        cardTitle: `${product.code} — ${title}`,
        countryName: product.description,
        sourceAttribution: sourceNotes,
        dataAsOf: new Date().getFullYear().toString(),
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
      });
    } finally {
      setExporting(false);
    }
  }, [product, title, sourceNotes, fileName, exporting]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={sectionRef} className="bg-zinc-900 rounded-xl overflow-hidden">
        {/* Section header for export context — improved layout for full product name */}
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* HS Code + Product Name on separate lines for readability */}
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="font-mono text-xs text-violet-300 bg-violet-500/10 border border-violet-500/30 rounded px-1.5 py-0.5">{product.code}</span>
              </div>
              <p className="text-white font-semibold text-sm leading-snug">{product.description}</p>
              <p className="text-zinc-500 text-[10px] mt-1">AGOA Product Analysis · {new Date().getFullYear()}</p>
              <p className="text-zinc-300 text-xs font-medium mt-1.5 border-l-2 border-violet-500 pl-2">{title}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-blue-400 font-bold text-[10px] tracking-wide">SOUVERA</p>
              <p className="text-zinc-600 text-[9px] max-w-[100px]">{product.sector_label}</p>
            </div>
          </div>
        </div>

        {/* Section content */}
        <div className="p-4">{children}</div>

        {/* Souvera Analysis block — if provided */}
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

// ─── Product Detail Drawer ────────────────────────────────────────────────────

function ProductDetailDrawer({
  product,
  country,
  onClose,
}: {
  product: ProductRow;
  country: CountryContext | null;
  onClose: () => void;
}) {
  const enrichment: ProductEnrichment | null = getProductEnrichment(product.code);
  const diaProduct: DiaPotentialProduct | null = getDiaPotentialProduct(product.code);
  const isExport = product.strategic_type === 'africa_export';
  const dateStr = new Date().toISOString().slice(0, 10);

  // Use top_trade_countries from API response first; fall back to local enrichment
  const topCountries = product.top_trade_countries?.length
    ? product.top_trade_countries
    : (enrichment?.topTradeCountries ?? []);

  const topExporter = topCountries[0] ?? null;
  const totalVolume = topCountries.reduce((s: number, c: { annualVolumeUSD: number }) => s + c.annualVolumeUSD, 0);
  const cliffRisk = product.cliff_risk_note ?? enrichment?.cliffRiskNote ?? null;
  const usExportTotal = enrichment?.usExportVolumeToAfricaUSD ?? product.us_import_demand_usd ?? null;

  // Build strategic narrative for highlighting
  const strategicNarrative = isExport
    ? `African producers export this product duty-free to the US under AGOA at 0% versus the standard MFN tariff rate${product.mfn_rate_display ? ` of ${product.mfn_rate_display}` : ''}. This margin is the foundation of Africa's price competitiveness in the US market and directly supports manufacturing employment in beneficiary countries.`
    : `African and Caribbean markets run a structural import deficit in this category — the US has significant export capacity here. Every dollar of US exports to AGOA-beneficiary countries represents American manufacturing and service jobs that depend on African market access. This is the "two-way street" argument at the heart of the reauthorization case before Congress.`;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-zinc-950 border-l border-zinc-700 z-50 overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-start justify-between gap-3 z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-violet-300 bg-violet-500/10 border border-violet-500/30 rounded px-2 py-0.5">{product.code}</span>
              <span className={`text-xs rounded px-2 py-0.5 border font-medium ${isExport ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' : 'text-blue-300 bg-blue-500/10 border-blue-500/30'}`}>
                {isExport ? 'Africa → US export' : 'US → Africa export'}
              </span>
              {product.is_apparel_provision && (
                <span className="text-xs text-violet-300 bg-violet-500/10 border border-violet-500/30 rounded px-2 py-0.5">apparel</span>
              )}
            </div>
            <p className="text-white font-semibold text-base leading-snug">{product.description}</p>
            <p className="text-zinc-400 text-sm mt-1">{product.sector_label}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Strategic argument — EXPORTABLE */}
          <ExportableProductSection
            id="strategic"
            title="Strategic Argument"
            product={product}
            sourceNotes="USTR AGOA Eligibility · ITC Trade Data Monitor · BEA · Souvera Analysis"
            fileName={`souvera-${product.code}-strategic-${dateStr}`}
            souveraAnalysis={isExport
              ? `This product represents a core AGOA export opportunity where African producers have demonstrated competitive advantage. ${topExporter ? `${topExporter.name} leads exports at ${usdM(topExporter.annualVolumeUSD)}/yr. ` : ''}The 0% duty-free access under AGOA${product.mfn_rate_display ? ` vs ${product.mfn_rate_display} MFN rate` : ''} is the decisive factor enabling African price competitiveness in the US market.`
              : `This product demonstrates the "two-way street" in US-Africa trade — American exporters depend on African market access. ${usExportTotal ? `US exports total ${usdM(usExportTotal)}/yr to AGOA-beneficiary markets. ` : ''}${product.us_export_states.length > 0 ? `Congressional stakeholders in ${product.us_export_states.slice(0, 3).join(', ')} have direct economic interest in AGOA reauthorization.` : 'AGOA reauthorization protects US manufacturing jobs tied to African demand.'}`
            }
          >
            <div className={`p-4 rounded-lg border ${isExport ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
              <p className={`font-semibold mb-2 text-sm ${isExport ? 'text-emerald-300' : 'text-blue-300'}`}>
                {isExport ? 'AGOA Export Potential — Africa supplies the US' : 'US Reciprocal Opportunity — the US supplies Africa'}
              </p>
              {isExport ? (
                <div className="space-y-2.5">
                  {topExporter && (
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-sm">
                      <span className="text-emerald-200 font-semibold">{topExporter.name}</span>
                      <span className="text-zinc-400">leads with</span>
                      <span className="text-emerald-300 font-bold">{usdM(topExporter.annualVolumeUSD)}/yr</span>
                      <span className="text-zinc-400">in AGOA-preferential exports.</span>
                      {topCountries.length > 1 && (
                        <>
                          <span className="text-zinc-400">Top-{topCountries.length} combined:</span>
                          <span className="text-emerald-300 font-bold">{usdM(totalVolume)}/yr</span>
                          <span className="text-zinc-400">in trade that expires if AGOA is not renewed.</span>
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    <HighlightedText text={strategicNarrative} />
                    {product.is_apparel_provision && (
                      <span className="block mt-2 text-violet-300">
                        The AGOA apparel provision and third-country fabric rule apply — garments can be assembled from fabric sourced outside the beneficiary country, dramatically expanding production capacity.
                      </span>
                    )}
                  </p>
                  {!topExporter && (
                    <p className="text-zinc-500 text-xs italic">Live trade volume data pending Comtrade ingest — country-level dollar figures will appear here once the data pipeline is live.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(usExportTotal || topExporter) && (
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-sm">
                      {usExportTotal ? (
                        <>
                          <span className="text-zinc-400">US exports to AGOA-beneficiary markets:</span>
                          <span className="text-blue-300 font-bold">{usdM(usExportTotal)}/yr</span>
                          <span className="text-zinc-400">— American jobs that depend on African market access.</span>
                        </>
                      ) : topExporter ? (
                        <>
                          <span className="text-blue-200 font-semibold">{topExporter.name}</span>
                          <span className="text-zinc-400">is the largest importer —</span>
                          <span className="text-blue-300 font-bold">{usdM(topExporter.annualVolumeUSD)}/yr</span>
                          <span className="text-zinc-400">in US exports. {topCountries.length > 1 && `Top-${topCountries.length} combined: ${usdM(totalVolume)}/yr.`}</span>
                        </>
                      ) : null}
                    </div>
                  )}
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    <HighlightedText text={strategicNarrative} />
                  </p>
                  {product.us_export_states.length > 0 && (
                    <p className="text-blue-300 text-sm">
                      Key US export states with congressional stake: <span className="font-semibold">{product.us_export_states.join(', ')}</span>
                    </p>
                  )}
                  {!usExportTotal && !topExporter && (
                    <p className="text-zinc-500 text-xs italic">Live trade volume data pending Comtrade ingest — US export dollar figures will appear here once the data pipeline is live.</p>
                  )}
                </div>
              )}
            </div>
          </ExportableProductSection>

          {/* Top trading countries with data — EXPORTABLE */}
          {topCountries && topCountries.length > 0 && (
            <ExportableProductSection
              id="trade-flow"
              title={isExport ? 'Top African Exporters' : 'Top African Importers'}
              product={product}
              sourceNotes="ITC Trade Data Monitor · UN Comtrade · BEA International Trade · Souvera Analysis"
              fileName={`souvera-${product.code}-tradeflow-${dateStr}`}
              souveraAnalysis={isExport
                ? `Combined AGOA exports of ${usdM(totalVolume)}/yr across ${topCountries.length} African supplier${topCountries.length > 1 ? 's' : ''} represent trade that would face MFN tariffs if AGOA expires. ${topExporter ? `${topExporter.name}'s ${usdM(topExporter.annualVolumeUSD)}/yr export position is directly contingent on AGOA preference continuation.` : ''} This trade flow supports manufacturing jobs in both African supplier countries and US downstream industries.`
                : `US exporters serve ${topCountries.length} African market${topCountries.length > 1 ? 's' : ''} with combined trade of ${usdM(totalVolume)}/yr. These trade relationships are built on the bilateral trust established through AGOA. Post-AGOA trade agreements must preserve market access to protect US export positions against Chinese and European competitors.`
              }
            >
              <div className="space-y-2">
                {usExportTotal && !isExport && (
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                    <span className="text-xs text-zinc-400">Total US exports to Africa</span>
                    <span className="text-blue-300 font-bold">{usdM(usExportTotal)}/yr</span>
                  </div>
                )}
                {topCountries.map((c) => (
                  <div key={c.iso3} className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-lg">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-500 w-8">{c.iso3}</span>
                        <span className="text-white font-medium text-sm">{c.name}</span>
                      </div>
                      <span className={`text-sm font-semibold ${isExport ? 'text-emerald-300' : 'text-blue-300'}`}>
                        {usdM(c.annualVolumeUSD)}<span className="text-zinc-500 text-xs font-normal">/yr</span>
                      </span>
                    </div>
                    <p className="text-zinc-300 text-xs leading-relaxed">{c.context}</p>
                  </div>
                ))}
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Combined {isExport ? 'exports' : 'imports'}</span>
                  <span className={`font-bold ${isExport ? 'text-emerald-300' : 'text-blue-300'}`}>{usdM(totalVolume)}/yr</span>
                </div>
              </div>
            </ExportableProductSection>
          )}

          {/* Cliff risk — EXPORTABLE */}
          {cliffRisk && (
            <ExportableProductSection
              id="cliff-risk"
              title="AGOA Cliff Risk"
              product={product}
              sourceNotes="USTR AGOA Review · Congressional Research Service · Souvera Analysis"
              fileName={`souvera-${product.code}-cliffrisk-${dateStr}`}
              souveraAnalysis={`Without AGOA reauthorization by December 31, 2026, this product faces immediate tariff exposure. ${totalVolume > 0 ? `The ${usdM(totalVolume)}/yr in current trade would become uncompetitive against suppliers from countries with FTA access. ` : ''}African exporters cannot absorb MFN tariff costs — production will shift to competitors in Asia or other preference-eligible regions. US importers who have built African supply chains face sourcing disruption.`}
            >
              <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm mb-2">Expiration: December 31, 2026</p>
                    <p className="text-red-100 text-sm leading-relaxed">
                      <HighlightedText text={cliffRisk} />
                    </p>
                  </div>
                </div>
              </div>
            </ExportableProductSection>
          )}

          {/* AGOA / CBTPA framework — EXPORTABLE */}
          <ExportableProductSection
            id="framework"
            title="Framework Coverage"
            product={product}
            sourceNotes="USTR AGOA Eligibility List · USTR CBTPA Eligibility · Federal Register"
            fileName={`souvera-${product.code}-framework-${dateStr}`}
            souveraAnalysis={
              product.is_agoa_specific && product.is_cbtpa_specific
                ? `This product enjoys dual eligibility under both AGOA (Africa) and CBTPA (Caribbean), maximizing supplier diversification options for US importers. ${product.mfn_rate_display ? `The ${product.mfn_rate_display} MFN tariff makes preference access decisive for competitiveness.` : ''} Maintaining both frameworks strengthens US supply chain resilience.`
                : product.is_agoa_specific
                ? `AGOA eligibility covers 54 sub-Saharan African countries. ${product.mfn_rate_display ? `Without AGOA's 0% rate, suppliers would face ${product.mfn_rate_display} MFN tariffs — making African production uncompetitive against Asian alternatives.` : 'AGOA preference is the key enabler of African competitiveness in the US market.'}`
                : product.is_cbtpa_specific
                ? `CBTPA coverage enables Caribbean Basin suppliers to compete duty-free in the US market. This framework supports regional economic stability and nearshoring opportunities for US companies.`
                : `Framework eligibility determines which African and Caribbean suppliers can compete in the US market. Products without preference coverage face MFN tariff barriers.`
            }
          >
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border text-sm ${product.is_agoa_specific ? 'border-blue-500/30 bg-blue-500/5' : 'border-zinc-700 bg-zinc-800/30'}`}>
                <p className={`font-semibold mb-1 text-xs ${product.is_agoa_specific ? 'text-blue-300' : 'text-zinc-600'}`}>AGOA — Africa</p>
                <p className={`text-xs leading-snug ${product.is_agoa_specific ? 'text-zinc-300' : 'text-zinc-600'}`}>{product.is_agoa_specific ? '54 sub-Saharan African countries eligible' : 'Not covered under AGOA'}</p>
              </div>
              <div className={`p-3 rounded-lg border text-sm ${product.is_cbtpa_specific ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-700 bg-zinc-800/30'}`}>
                <p className={`font-semibold mb-1 text-xs ${product.is_cbtpa_specific ? 'text-emerald-300' : 'text-zinc-600'}`}>CBTPA — Caribbean</p>
                <p className={`text-xs leading-snug ${product.is_cbtpa_specific ? 'text-zinc-300' : 'text-zinc-600'}`}>{product.is_cbtpa_specific ? '20 Caribbean Basin markets covered' : 'Not covered under CBTPA'}</p>
              </div>
            </div>
            {(product.mfn_rate_display || product.agoa_preference_rate_pct === 0) && (
              <div className="mt-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">AGOA Preference Rate</span>
                  <span className="text-emerald-300 font-bold">0%</span>
                </div>
                {product.mfn_rate_display && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-zinc-400">vs MFN Rate</span>
                    <span className="text-red-400">{product.mfn_rate_display}</span>
                  </div>
                )}
              </div>
            )}
          </ExportableProductSection>

          {/* AfCFTA intra-Africa angle */}
          {product.is_agoa_specific && (
            <section>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">AfCFTA — intra-Africa trade angle</h3>
              <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      Countries that build export capacity for the US market under AGOA simultaneously develop the production quality and logistics infrastructure to serve regional African buyers under AfCFTA preferential schedules — a multiplier effect that justifies investment in AGOA-aligned manufacturing.
                    </p>
                    <Link href="/intelligence/trade/afcfta" className="mt-2 inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs transition-colors">
                      View AfCFTA Status Tracker <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Country context */}
          {country && (
            <section>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Country context — {country.name}</h3>
              <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">AGOA status</span>
                  <span className="text-white font-medium">{country.agoa_status.replace(/_/g, ' ')}</span>
                </div>
                {country.agoa_apparel_eligible != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Apparel provision</span>
                    <span className={country.agoa_apparel_eligible ? 'text-emerald-300 font-medium' : 'text-zinc-500'}>{country.agoa_apparel_eligible ? 'Eligible' : 'Not eligible'}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Trade flow data</span>
                  <span className="text-zinc-500 text-xs">Pending Comtrade ingest</span>
                </div>
              </div>
            </section>
          )}

          {/* Rules of origin */}
          {product.rules_of_origin_summary && (
            <section>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Rules of origin</h3>
              <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg flex items-start gap-2">
                <FileText className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                <p className="text-zinc-300 text-sm leading-relaxed">{product.rules_of_origin_summary}</p>
              </div>
            </section>
          )}

          {/* US export states — congressional mapping */}
          {product.us_export_states?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">US export states — congressional briefing</h3>
              <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {product.us_export_states.map((state) => (
                        <span key={state} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/25 rounded text-blue-300 text-xs font-medium">{state}</span>
                      ))}
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Senators and representatives from these states have direct economic interest in AGOA renewal — African markets are active buyers of exports from their districts.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Dia analysis — EXPORTABLE */}
          <ExportableProductSection
            id="dia-analysis"
            title="Souvera Dia Analysis"
            product={product}
            sourceNotes="Souvera Dia AI · ITC TDM · UN Comtrade · USTR AGOA Review"
            fileName={`souvera-${product.code}-dia-analysis-${dateStr}`}
          >
            {diaProduct ? (
              <div className="p-4 bg-indigo-950/35 border border-indigo-500/30 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wide">
                      High-value AGOA expansion candidate
                    </p>
                  </div>
                  {diaProduct.potentialAnnualVolumeUSD && (
                    <span className="shrink-0 text-indigo-200 font-bold text-sm">
                      {usdM(diaProduct.potentialAnnualVolumeUSD)}/yr potential
                    </span>
                  )}
                </div>
                <p className="text-zinc-200 text-sm leading-relaxed">
                  <HighlightedText text={diaProduct.diaAnalysis} />
                </p>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <p className="text-indigo-200 text-xs leading-relaxed">
                    <span className="font-semibold text-indigo-100">Strategic rationale —</span>{' '}
                    <HighlightedText text={diaProduct.strategicRationale} />
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>SDM scoring will incorporate this product once Phase 2 launches</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wide">Analysis pending</p>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Trade flow values (export volume, US import demand, net position) will be calculated once Comtrade and US Census Bureau trade data is ingested. Dia will generate a full reauthorization narrative — mapping this product to country supply capacity, AGOA utilization rate, and cliff-risk dollar exposure.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>SDM scoring integration in Phase 2 — country × sector × product</span>
                </div>
              </div>
            )}
          </ExportableProductSection>

          {/* Action links */}
          <section className="flex flex-col gap-2 pt-1 border-t border-zinc-800">
            <Link href="/intelligence/trade/supply-demand" className="flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Supply-Demand Matrix
              </span>
              <span className="text-zinc-400 text-xs">Macro sector context →</span>
            </Link>
            <Link href="/intelligence/trade/agoa" className="flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                AGOA Eligibility Tracker
              </span>
              <span className="text-zinc-400 text-xs">Country eligibility →</span>
            </Link>
            <Link href="/intelligence/trade/afcfta" className="flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                AfCFTA Status Tracker
              </span>
              <span className="text-zinc-400 text-xs">Continental FTA angle →</span>
            </Link>
          </section>

        </div>
      </div>
    </>
  );
}

// ─── Dia Potential Product Card ───────────────────────────────────────────────

function DiaPotentialCard({ product }: { product: DiaPotentialProduct }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-indigo-500/25 bg-indigo-950/20 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-indigo-950/30 transition-colors"
      >
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-white text-sm font-medium">{product.description}</span>
          <span className="ml-2 text-xs text-indigo-400">Dia potential</span>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />}
      </button>
      {expanded && (
        <div className="px-5 pb-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Dia analysis</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{product.diaAnalysis}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Strategic rationale</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{product.strategicRationale}</p>
          </div>
          {product.potentialAnnualVolumeUSD && (
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span className="text-zinc-400">Potential annual trade volume:</span>
              <span className="text-white font-semibold">{usdM(product.potentialAnnualVolumeUSD)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AGOProductFinderClient() {
  const searchParams = useSearchParams();
  const initialCountry = searchParams.get('country')?.toUpperCase() ?? '';
  const isCatalogFull = searchParams.get('catalog') === 'full';

  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState(initialCountry);
  const [sectorFilter, setSectorFilter] = useState('');
  const [smartFilter, setSmartFilter] = useState<SmartFilter>('all');
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (countryFilter) params.set('iso3', countryFilter);
    if (sectorFilter) params.set('sector', sectorFilter);
    if (smartFilter !== 'all') {
      if (smartFilter === 'apparel_provision') params.set('apparel_only', 'true');
      else params.set('strategic_type', smartFilter);
    }
    if (searchQuery) params.set('q', searchQuery);
    if (isCatalogFull) params.set('catalog', 'full');
    try {
      const res = await fetch(`/api/v1/trade/agoa/products?${params}`, { credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Failed to load product catalog');
      }
      setData(await res.json() as ProductsResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [countryFilter, sectorFilter, smartFilter, searchQuery, isCatalogFull]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const daysRemaining = daysUntilExpiry();

  const groupedBySector = useMemo(() => {
    if (!data) return {};
    if (data.grouped_by_sector && Object.keys(data.grouped_by_sector).length > 0) return data.grouped_by_sector;
    return (data.products ?? []).reduce<Record<string, ProductRow[]>>((acc, p) => {
      if (!acc[p.sector_key]) acc[p.sector_key] = [];
      acc[p.sector_key].push(p);
      return acc;
    }, {});
  }, [data]);

  const orderedSectors = SECTOR_ORDER.filter((s) => groupedBySector[s]?.length > 0);

  function toggleSector(key: string) {
    setExpandedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {selectedProduct && (
        <ProductDetailDrawer
          product={selectedProduct}
          country={data?.country ?? null}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Header */}
      <section className="border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
          <Link href="/intelligence/trade" className="inline-flex items-center gap-2 text-zinc-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Trade Intelligence</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-lg">
              <ArrowLeftRight className="w-6 h-6 text-violet-400" />
            </div>
            <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-medium text-violet-300">
              Reauthorization Evidence Tool
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AGOA Product Finder</h1>
          <p className="text-zinc-300 max-w-3xl text-base leading-relaxed">
            Priority products organized by sector — evidence for the AGOA two-way street argument.
            Each row answers: <span className="text-white font-medium">does Africa supply the US, or does the US supply Africa?</span>
          </p>
          <p className="mt-3 text-sm text-zinc-400">
            ~150 priority products across 8 sectors · Click any row for strategic details, trade data, country importers, and cliff-risk analysis
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 space-y-6">

        {/* Cliff countdown */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-white font-semibold">AGOA expires in <span className="text-amber-400">{daysRemaining} days</span> — December 31, 2026</p>
            <p className="text-zinc-300 text-sm mt-1 leading-relaxed">
              Manufacturing &amp; textiles apparel provisions and third-country fabric rules expire unless Congress reauthorizes. This tool provides the product-level dollar evidence — exporters, importers, volumes, tariff exposure — needed for USTR, Dept. of State, and US Chamber briefings.
            </p>
          </div>
        </div>

        {/* Smart filter chips */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Filter by strategic argument</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.keys(SMART_FILTER_META) as SmartFilter[]).map((key) => {
              const meta = SMART_FILTER_META[key];
              const Icon = meta.icon;
              const active = smartFilter === key;
              return (
                <button key={key} type="button" onClick={() => setSmartFilter(key)}
                  className={`text-left p-3 rounded-lg border transition-all ${active ? meta.activeClass : 'border-zinc-800 hover:border-zinc-600 text-zinc-300'}`}>
                  <div className="flex items-center gap-2 mb-1 text-sm font-semibold">
                    <Icon className="w-4 h-4" />
                    {meta.label}
                  </div>
                  <p className="text-xs text-zinc-400 leading-tight">{meta.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="text" placeholder="Search product, HS code…"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
          </div>
          <input type="text" placeholder="ISO3 (e.g. NGA)" value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value.toUpperCase().slice(0, 3))}
            className="w-36 px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm uppercase placeholder:normal-case placeholder:text-zinc-500" />
          <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm">
            <option value="">All sectors</option>
            {SECTOR_ORDER.map((s) => <option key={s} value={s}>{SECTOR_LABELS[s] ?? s}</option>)}
          </select>
          <button type="button" onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Country context */}
        {data?.country && (
          <div className="p-4 bg-zinc-900/60 border border-zinc-700 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-white font-semibold">{data.country.name} <span className="text-zinc-400 font-normal">({data.country.iso3})</span></p>
              <p className="text-zinc-300 text-sm mt-0.5">
                AGOA: <span className="text-white">{data.country.agoa_status.replace(/_/g, ' ')}</span>
                {data.country.agoa_apparel_eligible != null && (
                  <> · Apparel: <span className={data.country.agoa_apparel_eligible ? 'text-emerald-300' : 'text-zinc-500'}>{data.country.agoa_apparel_eligible ? 'Eligible' : 'Not eligible'}</span></>
                )}
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <Link href={`/intelligence/trade/agoa?country=${data.country.iso3}`} className="text-blue-400 hover:text-blue-300 transition-colors">AGOA status →</Link>
              <Link href="/intelligence/trade/supply-demand" className="text-purple-400 hover:text-purple-300 transition-colors">SDM →</Link>
            </div>
          </div>
        )}

        {/* Summary chips */}
        {data?.summary && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-300">{data.summary.total_products} products</span>
            <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-300">{data.summary.africa_export_count} AGOA export</span>
            <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/25 rounded-full text-blue-300">{data.summary.us_reciprocal_count} US reciprocal</span>
            <span className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/25 rounded-full text-violet-300">{data.summary.apparel_count} apparel provisions</span>
            <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-400">Click any row for details</span>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {data?.summary?.note && (
          <p className="text-sm text-zinc-400 p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg">{data.summary.note}</p>
        )}

        {/* Sector accordion */}
        {loading && !data ? (
          <div className="py-16 text-center text-zinc-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />
            Loading products…
          </div>
        ) : orderedSectors.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">No products match these filters.</div>
        ) : (
          <div className="space-y-3">
            {orderedSectors.map((sectorKey) => {
              const products = groupedBySector[sectorKey];
              const isExpanded = expandedSectors.has(sectorKey);
              const exportCount = products.filter((p) => p.strategic_type === 'africa_export').length;
              const reciprocalCount = products.filter((p) => p.strategic_type === 'us_reciprocal').length;
              const apparelCount = products.filter((p) => p.is_apparel_provision).length;

              return (
                <div key={sectorKey} className="border border-zinc-700 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => toggleSector(sectorKey)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900/70 hover:bg-zinc-800/80 text-left transition-colors">
                    <div className="flex items-center gap-3 flex-wrap">
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />}
                      <span className="font-semibold text-white">{SECTOR_LABELS[sectorKey] ?? sectorKey}</span>
                      <div className="flex gap-2 flex-wrap">
                        {exportCount > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">{exportCount} AGOA export</span>}
                        {reciprocalCount > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 border border-blue-500/25 text-blue-300">{reciprocalCount} US reciprocal</span>}
                        {apparelCount > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/10 border border-violet-500/25 text-violet-300">{apparelCount} apparel</span>}
                      </div>
                    </div>
                    <span className="text-zinc-400 text-xs shrink-0 ml-2">{products.length} products</span>
                  </button>

                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                            <thead>
                          <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-zinc-400 text-xs">
                            <th className="px-4 py-2.5 font-semibold">Code</th>
                            <th className="px-4 py-2.5 font-semibold">Description</th>
                            <th className="px-4 py-2.5 font-semibold">Strategy</th>
                            <th className="px-4 py-2.5 font-semibold" title="AGOA duty-free vs MFN (without AGOA)">AGOA pref. / MFN</th>
                            <th className="px-4 py-2.5 font-semibold" title="Trade volume from curated enrichment data">Trade volume</th>
                            <th className="px-4 py-2.5 font-semibold">Top market</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((row) => (
                            <tr key={row.code}
                              onClick={() => setSelectedProduct(row)}
                              className="border-b border-zinc-800/60 hover:bg-zinc-800/60 cursor-pointer transition-colors"
                              title="Click for strategic details, trade data, and cliff-risk analysis">
                              <td className="px-4 py-3 font-mono text-violet-300 text-xs whitespace-nowrap">{row.code}</td>
                              <td className="px-4 py-3 text-zinc-200 max-w-xs">
                                <span className="hover:text-white transition-colors leading-snug">{row.description}</span>
                                {row.is_apparel_provision && (
                                  <span className="ml-2 text-[10px] text-violet-300 border border-violet-500/30 rounded px-1">apparel</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {row.strategic_type === 'africa_export'
                                  ? <span className="flex items-center gap-1 text-xs text-emerald-300 font-medium"><TrendingUp className="w-3 h-3" /> Africa → US</span>
                                  : <span className="flex items-center gap-1 text-xs text-blue-300 font-medium"><TrendingDown className="w-3 h-3" /> US → Africa</span>}
                              </td>
                              <td className="px-4 py-3 text-xs whitespace-nowrap">
                                {row.agoa_preference_rate_pct === 0 ? (
                                  <span className="flex flex-col gap-0.5">
                                    <span className="text-emerald-300 font-semibold">0% {row.is_agoa_specific ? '(AGOA)' : row.is_cbtpa_specific ? '(CBTPA)' : ''}</span>
                                    {(row.mfn_rate_pct ?? 0) > 0 ? (
                                      <span className="text-red-400/80 text-[10px]">vs {row.mfn_rate_display} MFN</span>
                                    ) : row.mfn_rate_display ? (
                                      <span className="text-zinc-600 text-[10px]">{row.mfn_rate_display} MFN</span>
                                    ) : null}
                                  </span>
                                ) : (<span className="text-zinc-600">N/A</span>)}
                              </td>
                              <td className="px-4 py-3 text-xs whitespace-nowrap">
                                {(() => {
                                  const vol = row.strategic_type === 'africa_export' ? row.export_to_us_usd : row.us_import_demand_usd;
                                  const top = row.top_trade_countries?.[0];
                                  return vol != null ? (
                                    <span className={`font-semibold ${row.strategic_type === 'africa_export' ? 'text-emerald-300' : 'text-blue-300'}`}>
                                      {usdM(vol)}<span className="text-zinc-500 font-normal text-[10px]">/yr</span>
                                    </span>
                                  ) : <span className="text-zinc-600 text-[10px]">pending ingest</span>;
                                })()}
                              </td>
                              <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
                                {row.top_trade_countries?.[0] ? (
                                  <span className="flex flex-col gap-0.5">
                                    <span className="text-zinc-200">{row.top_trade_countries[0].name}</span>
                                    <span className="text-zinc-500 text-[10px]">{usdM(row.top_trade_countries[0].annualVolumeUSD)}/yr</span>
                                  </span>
                                ) : <span className="text-zinc-700">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Dia potential products section */}
        <div className="pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Souvera Dia — potential AGOA additions</h2>
          </div>
          <p className="text-zinc-300 text-sm mb-4 leading-relaxed">
            Products not currently covered under AGOA that Dia has identified as high-value candidates for the reauthorization negotiation — where adding preference would significantly strengthen US-Africa trade ties and US supply chain security.
          </p>
          <div className="space-y-2">
            {[
              { code: '850760', description: 'Lithium-ion battery packs — EV and energy storage value-added manufacturing', sectorKey: 'critical-minerals', hsChapter: 85, diaAnalysis: 'DRC and Zambia hold 70%+ of global cobalt reserves critical for lithium-ion batteries. Current AGOA schedules preference raw cobalt and copper but not assembled battery packs — creating a perverse incentive to export raw minerals rather than value-added battery cells. African battery manufacturing capacity is emerging (Northvolt and CATL scouting DRC sites).', strategicRationale: 'Adding battery pack preference to AGOA reauthorization would anchor a US-Africa EV supply chain counter to China\'s dominant refining position — directly aligned with IRA domestic content requirements if African manufacturers qualify as FTA-equivalent partners.', potentialAnnualVolumeUSD: 500_000_000 },
              { code: '300210', description: 'Biopharmaceutical antisera and blood fractions — African health manufacturing', sectorKey: 'agriculture', hsChapter: 30, diaAnalysis: 'South Africa and Kenya received mRNA technology transfer post-COVID (Moderna, BioNTech). Both countries are building export-grade biopharmaceutical capacity. AGOA does not explicitly preference pharmaceutical exports, creating an investment gap.', strategicRationale: 'Biopharmaceutical preference under AGOA would create a US-Africa health security supply chain, reducing the single-source dependency on Asian vaccine manufacturing exposed by the COVID-19 pandemic.', potentialAnnualVolumeUSD: 120_000_000 },
              { code: '854012', description: 'Manufactured thin-film solar modules — African clean energy equipment exports', sectorKey: 'energy', hsChapter: 85, diaAnalysis: 'Morocco, Egypt, and South Africa are developing solar module manufacturing that could qualify for AGOA preference. US clean energy companies (First Solar, Enphase) are exploring African assembly partnerships to diversify supply chains away from China.', strategicRationale: 'Including manufactured clean energy equipment in AGOA preference would support IRA clean energy goals while creating African manufacturing jobs — a dual win for US and African development objectives.', potentialAnnualVolumeUSD: 200_000_000 },
            ].map((p) => (
              <DiaPotentialCard key={p.code} product={p} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap gap-4 pt-2 text-sm border-t border-zinc-800">
          <Link href="/intelligence/trade/supply-demand" className="text-purple-400 hover:text-purple-300 transition-colors">Supply-Demand Matrix →</Link>
          <Link href="/intelligence/trade/agoa" className="text-blue-400 hover:text-blue-300 transition-colors">AGOA Eligibility Tracker →</Link>
          <a href="https://agoa.info/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> AGOA.info
          </a>
        </div>
      </section>
    </div>
  );
}


