/**
 * Shared types for country intelligence API responses and tab components.
 */

import type { EntitlementKey } from '@souvera/entitlements';

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

export interface CountryTrade {
  /** Year trade totals / partners were last refreshed */
  asOfYear?: number;
  totalTradeUsd?: number;
  exportsUsd?: number;
  importsUsd?: number;
  exportsToUs?: { year?: number; valueUsd?: number; yoyPct?: number };
  importsFromUs?: { year?: number; valueUsd?: number; yoyPct?: number };
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
    status: 'eligible' | 'suspended' | 'restoration_opportunity';
    statusNote?: string;
    currentExportsUsd?: number;
    potentialExportsUsd?: number;
    eligibleCategories?: number;
  };
  pending?: boolean;
}

export interface TimeSeriesYear {
  year: number;
  gdp_current_usd?: number;
  gdp_growth_pct?: number;
  fdi_net_inflows_usd?: number;
  inflation_cpi_pct?: number;
  fx_to_usd?: number;
  fx_parallel_usd?: number;
  debt_to_gdp_pct?: number;
}

export interface CountryTimeSeries {
  years: TimeSeriesYear[];
  forecast?: Array<{ year: number; gdp_growth_pct: number }>;
}

export interface DataFreshness {
  updatedAt: string;
  sources: Array<{ key: string; name: string }>;
}

export interface CountryIntelligenceResponse {
  country: CountryIdentity;
  metrics: CountryMetrics;
  signal: CountrySignal | null;
  momentum: CountryMomentum | null;
  newsPulse: CountryNewsPulse | null;
  sectors: CountrySector[];
  narrative: CountryNarrative;
  trade: CountryTrade | null;
  timeSeries: CountryTimeSeries | null;
  freshness: DataFreshness;
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
