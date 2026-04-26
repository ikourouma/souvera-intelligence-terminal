// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Shared TypeScript Types
// Owner: Afronovation, Inc.
// ===========================================

// -------------------------------------------
// Ingestion Types
// -------------------------------------------

export type IngestionResult<T = unknown> = {
  sourceKey: string;
  jobId: string;
  success: boolean;
  recordsProcessed: number;
  recordsFailed: number;
  fetchedAt: string;
  data?: T[];
  error?: string;
};

export type SouveraObservation = {
  countryIso3: string;
  indicatorKey: string;
  periodDate: string;
  periodType: 'daily' | 'monthly' | 'quarterly' | 'annual';
  valueNumeric?: number;
  valueText?: string;
  sourceKey: string;
  sourceSeriesKey?: string;
  isForecast: boolean;
  isEstimate: boolean;
  qualityScore: number;
  fetchedAt: string;
  publishedAt?: string;
};

// -------------------------------------------
// Country Types
// -------------------------------------------

export type SouveraCountry = {
  id: string;
  iso2: string;
  iso3: string;
  name: string;
  region: string;
  subregion?: string;
  capital?: string;
  currencyCode?: string;
  currencyName?: string;
  flagSvgUrl?: string;
  flagPngUrl?: string;
  lat?: number;
  lng?: number;
  isAfricanCountry: boolean;
  isActive: boolean;
};

// -------------------------------------------
// API Response Types
// -------------------------------------------

export type SouveraApiMeta = {
  product: 'souvera';
  owner: 'Afronovation, Inc.';
  accessTier: string;
  generatedAt: string;
  freshness?: {
    macro?: string;
    forecast?: string;
    fx?: string;
    news?: string;
    trade?: string;
  };
  sources: Array<{
    key: string;
    name: string;
    asOf?: string;
  }>;
};

export type CountryLiteMetrics = {
  gdpCurrentUsd?: number;
  gdpGrowthPct?: number;
  populationTotal?: number;
};

export type CountryLiteSignal = {
  level?: 'high_growth' | 'emerging' | 'stable' | 'watchlist' | 'risk_elevated';
  investmentScore?: number;
  confidenceScore?: number;
};

export type CountryLiteResponse = {
  country: {
    iso2: string;
    iso3: string;
    name: string;
    region: string;
    subregion?: string;
    capital?: string;
    currencyCode?: string;
    flagUrl?: string;
  };
  metrics: CountryLiteMetrics;
  signal: CountryLiteSignal;
  sectors: Array<{
    label: string;
    teaser?: string;
  }>;
  teaser: {
    afdecTeaser?: string;
  };
  freshness: {
    updatedAt?: string;
  };
};

export type CountriesLiteResponse = {
  countries: Array<{
    iso2: string;
    iso3: string;
    name: string;
    region: string;
    subregion?: string;
    capital?: string;
    flagUrl?: string;
    gdpCurrentUsd?: number;
    gdpGrowthPct?: number;
    populationTotal?: number;
    signalLevel?: string;
    investmentScore?: number;
  }>;
  meta: SouveraApiMeta;
};

// -------------------------------------------
// Signal Types
// -------------------------------------------

export type SignalLevel =
  | 'high_growth'
  | 'emerging'
  | 'stable'
  | 'watchlist'
  | 'risk_elevated';

// -------------------------------------------
// Database row helpers
// -------------------------------------------

export type IngestionJobRow = {
  id: string;
  source_id: string;
  job_type: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'partial';
  records_processed: number;
  records_failed: number;
  started_at?: string;
  finished_at?: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
};

export type SourceHealthRow = {
  source_id: string;
  last_success_at?: string;
  last_failure_at?: string;
  failure_count: number;
  latency_ms?: number;
  status: 'healthy' | 'degraded' | 'down';
};
