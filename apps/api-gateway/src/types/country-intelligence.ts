/**
 * Shared types for country intelligence API responses and tab components.
 */

import type { EntitlementKey } from '@souvera/entitlements';
import type { EconomyYearPoint } from '@/lib/intelligence/country-economy-content';
import type { CountrySourceMeta } from '@/lib/intelligence/country-source-meta';

export interface CountryIdentity {
  iso3: string;
  iso2?: string;
  name: string;
  flagUrl?: string;
  region?: string;
  subregion?: string;
  capital?: string;
  currencyCode?: string;
}

export interface CountryMetrics {
  gdp_current_usd?: number;
  gdp_growth_annual_pct?: number;
  population_total?: number;
  fdi_net_inflows_current_usd?: number;
  inflation_consumer_prices_annual_pct?: number;
  fx_rate_usd?: number;
  fx_rate_parallel_usd?: number;
}

export interface CountrySignal {
  level: string;
  investmentScore: number | null;
  confidenceScore: number | null;
  scan?: SignalScanSummary;
  pending?: boolean;
}

export interface CountryMomentum {
  economicMomentum: number | null;
  investorReadiness: number | null;
  bandLabel?: string | null;
  bandClause?: string | null;
  pending?: boolean;
}

export interface SignalScanSummary {
  badge: string;
  bullets: [string, string];
}

export interface NewsHeadline {
  title: string;
  url?: string;
  source?: string;
  publishedAt?: string;
}

export interface CountryNewsPulse {
  sentimentScore: number | null;
  riskIntensity: number | null;
  opportunityIntensity: number | null;
  headlineCount?: number | null;
  topHeadlines?: NewsHeadline[];
  pending?: boolean;
}

export interface SectorPlayer {
  name: string;
  role?: string;
  description?: string;
}

export interface CountrySector {
  sectorKey: string;
  sectorLabel: string;
  iconEmoji?: string;
  displayOrder?: number;
  teaser?: string;
  strengthScore?: number;
  growthScore?: number;
  attractivenessScore?: number;
  narrativeShort?: string;
  narrativeFull?: string;
  keyPlayers?: SectorPlayer[];
  agoaOpportunity?: string;
  agoaExportCurrentUsd?: number;
  agoaExportPotentialUsd?: number;
  dataSources?: string[];
  updatedAt?: string;
}

export interface CountryNarrative {
  summary?: string;
  whyNow?: string;
  opportunityThesis?: string;
  riskNarrative?: string;
}

export interface TradePartner {
  country: string;
  flag?: string;
  exportsUsd?: number;
  importsUsd?: number;
  totalUsd?: number;
  sharePct?: number;
  badge?: string;
}

export interface TradeMetricProvenance {
  sourceKey: string;
  sourceLabel: string;
  /** What the figure measures */
  metricScope: 'bilateral_all_goods' | 'category_flow_aggregate' | 'preferential';
  asOfYear?: number;
}

export interface TradeSourceReconciliation {
  message: string;
  censusExportsToUsUsd: number;
  categoryFlowTotalUsd: number;
  deltaUsd: number;
  deltaPct: number;
}

/** Parsed USTR country-page trade summary line (tertiary corroboration — not primary KPIs). */
export type UstrTradeMetricScope =
  | 'goods_and_services_total'
  | 'goods_total'
  | 'us_exports_to_country'
  | 'us_imports_from_country'
  | 'services_total';

export interface UstrTradeSummaryMetric {
  scope: UstrTradeMetricScope;
  valueUsd: number;
  year: number;
  yoyPct?: number | null;
  yoyDirection?: 'up' | 'down' | null;
}

/** Payload for Trade tab USTR perspective panel. */
export interface UstrTradeSummaryPayload {
  iso3: string;
  sourceUrl: string;
  agoaStatusText?: string | null;
  tradeAgreementText?: string | null;
  metrics: UstrTradeSummaryMetric[];
  lastReviewedAt?: string;
  dataLabel: string;
}

export interface CountryTrade {
  /** Year trade totals / partners were last refreshed */
  asOfYear?: number;
  /** Whether hero totals are global trade or U.S.-bilateral (Census) only */
  tradeScope?: 'global' | 'bilateral_us';
  /** Provenance note from trade snapshot (e.g. U.S. Census Bureau) */
  dataSource?: string;
  totalTradeUsd?: number;
  exportsUsd?: number;
  importsUsd?: number;
  exportsToUs?: {
    year?: number;
    valueUsd?: number;
    yoyPct?: number;
    source?: TradeMetricProvenance;
  };
  importsFromUs?: {
    year?: number;
    valueUsd?: number;
    yoyPct?: number;
    source?: TradeMetricProvenance;
  };
  topPartners?: TradePartner[];
  exportComposition?: Array<{ sector: string; sharePct: number; valueUsd?: number }>;
  importComposition?: Array<{ sector: string; sharePct: number; valueUsd?: number }>;
  intraAfrican?: {
    afcftaTradeUsd?: number;
    ecowasTradeUsd?: number;
    topAfricanPartners?: TradePartner[];
  };
  /** Region-agnostic intra-regional trade (Sprint D — Caribbean/Africa) */
  intraRegional?: {
    primaryVolumeUsd?: number;
    secondaryVolumeUsd?: number;
    topPartners?: TradePartner[];
  };
  agoa?: {
    status: 'eligible' | 'suspended' | 'restoration_opportunity' | 'not_applicable' | 'ineligible';
    statusNote?: string;
    /** Total bilateral exports to US (MFN, all products). */
    totalExportsToUsUsd?: number;
    /** Current AGOA-preferential exports (0 when suspended). */
    currentExportsUsd?: number;
    /** Modeled potential if AGOA restored. */
    potentialExportsUsd?: number;
    restorationPotentialUsd?: number;
    eligibleCategories?: number;
    dataSource?: string;
    dataVintage?: number;
    metricsSource?: TradeMetricProvenance;
    /** Multi-year AGOA-preferential export series for trend narrative. */
    trend?: Array<{ year: number; agoaPreferentialUsd: number }>;
  };
  /** When Census bilateral and USITC category-flow totals diverge materially. */
  sourceReconciliation?: TradeSourceReconciliation;
  pending?: boolean;
}

export type TimeSeriesYear = EconomyYearPoint;

export interface CountryTimeSeries {
  years: EconomyYearPoint[];
  forecast?: Array<{ year: number; gdp_growth_pct: number }>;
}

export interface DataFreshness {
  updatedAt: string;
  sources: Array<{ key: string; name: string }>;
}

/** UI-only official links (USTR country page, etc.) — not rendered in PDFs. */
export interface OfficialReferenceLink {
  refType: string;
  label: string;
  url: string;
  sourceKey: string;
  lastReviewedAt: string;
}

export interface MarketAccessFrameworkDto {
  id: string;
  label: string;
  emoji?: string;
  description: string;
  status: string;
  statusLabel?: string;
}

export interface AgoaPolicyUiSnapshot {
  statusLabel: string;
  evidenceBacked: boolean;
  apparelEligible: boolean;
  notes: string;
  agoaStatus: 'eligible' | 'suspended' | 'graduated' | 'ineligible' | 'not_applicable' | 'under_review';
  /** Year country became AGOA-eligible (from Evidence Vault). */
  eligibleSinceYear?: number;
  /** Year AGOA benefits were suspended (from Evidence Vault). */
  suspensionSinceYear?: number;
}

/** Headline metrics flagged is_estimate=true in souvera_country_observations */
export type MetricEstimateFlags = Partial<Record<keyof CountryMetrics, boolean>>;

export interface CountryIntelligenceResponse {
  country: CountryIdentity;
  metrics: CountryMetrics;
  /** Per-metric estimate flags for IMF WEO / curated estimate rows */
  metricEstimates?: MetricEstimateFlags;
  signal: CountrySignal | null;
  momentum: CountryMomentum | null;
  newsPulse: CountryNewsPulse | null;
  sectors: CountrySector[];
  narrative: CountryNarrative;
  trade: CountryTrade | null;
  timeSeries: CountryTimeSeries | null;
  freshness: DataFreshness;
  /** Evidence Vault–backed frameworks (Phase 0B). */
  marketAccess?: MarketAccessFrameworkDto[];
  agoaPolicy?: AgoaPolicyUiSnapshot;
  /** Top 20 metric source attribution (Phase 0C). */
  sourceMeta?: CountrySourceMeta;
  officialReferences?: OfficialReferenceLink[];
  /** Tertiary USTR country-page trade summary (corroboration only). */
  ustrTradeSummary?: UstrTradeSummaryPayload;
  meta: {
    accessTier: string;
    authenticated: boolean;
  };
}

export interface IntelligenceTabProps {
  data: CountryIntelligenceResponse;
  userEntitlements: EntitlementKey[];
  onNavigateTab?: (tabId: string, section?: string) => void;
}
