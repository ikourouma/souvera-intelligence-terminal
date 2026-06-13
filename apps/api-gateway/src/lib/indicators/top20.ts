/**
 * Souvera Top 20 institutional indicators — World Bank WDI (Option 1).
 * @see https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
 */

export type Top20PeriodType = 'annual';

export interface Top20IndicatorDef {
  indicatorKey: string;
  worldBankCode: string;
  label: string;
  unit: string;
  domain: string;
  periodType: Top20PeriodType;
  description: string;
}

export const WORLD_BANK_API_BASE = 'https://api.worldbank.org/v2';
export const WORLD_BANK_DOCS_URL =
  'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation';

/** Canonical Top 20 — code-defined, versioned with ingestion. */
export const TOP20_INDICATORS: Top20IndicatorDef[] = [
  {
    indicatorKey: 'gdp_current_usd',
    worldBankCode: 'NY.GDP.MKTP.CD',
    label: 'GDP (current US$)',
    unit: 'USD',
    domain: 'macro',
    periodType: 'annual',
    description: 'Gross domestic product in current US dollars',
  },
  {
    indicatorKey: 'gdp_growth_pct',
    worldBankCode: 'NY.GDP.MKTP.KD.ZG',
    label: 'GDP growth (annual %)',
    unit: 'percent',
    domain: 'macro',
    periodType: 'annual',
    description: 'Annual GDP growth percentage',
  },
  {
    indicatorKey: 'gdp_per_capita_usd',
    worldBankCode: 'NY.GDP.PCAP.CD',
    label: 'GDP per capita (current US$)',
    unit: 'USD',
    domain: 'macro',
    periodType: 'annual',
    description: 'GDP per capita in current US dollars',
  },
  {
    indicatorKey: 'population_total',
    worldBankCode: 'SP.POP.TOTL',
    label: 'Population, total',
    unit: 'people',
    domain: 'demographics',
    periodType: 'annual',
    description: 'Total population',
  },
  {
    indicatorKey: 'inflation_cpi_pct',
    worldBankCode: 'FP.CPI.TOTL.ZG',
    label: 'Inflation, consumer prices (annual %)',
    unit: 'percent',
    domain: 'macro',
    periodType: 'annual',
    description: 'Consumer price inflation annual percentage',
  },
  {
    indicatorKey: 'fdi_net_inflows_usd',
    worldBankCode: 'BX.KLT.DINV.CD.WD',
    label: 'FDI net inflows (BoP, current US$)',
    unit: 'USD',
    domain: 'investment',
    periodType: 'annual',
    description: 'Foreign direct investment net inflows',
  },
  {
    indicatorKey: 'current_account_pct_gdp',
    worldBankCode: 'BN.CAB.XOKA.GD.ZS',
    label: 'Current account balance (% of GDP)',
    unit: 'percent',
    domain: 'external',
    periodType: 'annual',
    description: 'Current account balance as percent of GDP',
  },
  {
    indicatorKey: 'reserves_total_usd',
    worldBankCode: 'FI.RES.TOTL.CD',
    label: 'Total reserves (includes gold, current US$)',
    unit: 'USD',
    domain: 'external',
    periodType: 'annual',
    description: 'Total reserves including gold',
  },
  {
    indicatorKey: 'reserves_months_imports',
    worldBankCode: 'FI.RES.XGLD.MO',
    label: 'Reserves in months of imports',
    unit: 'months',
    domain: 'external',
    periodType: 'annual',
    description: 'Total reserves in months of imports',
  },
  {
    indicatorKey: 'official_exchange_rate',
    worldBankCode: 'PA.NUS.FCRF',
    label: 'Official exchange rate (LCU per US$, period avg)',
    unit: 'rate',
    domain: 'fx',
    periodType: 'annual',
    description: 'Official average exchange rate local currency per USD',
  },
  {
    indicatorKey: 'remittances_received_usd',
    worldBankCode: 'BX.TRF.PWKR.CD.DT',
    label: 'Personal remittances, received (current US$)',
    unit: 'USD',
    domain: 'external',
    periodType: 'annual',
    description: 'Personal remittances received',
  },
  {
    indicatorKey: 'exports_goods_services_usd',
    worldBankCode: 'NE.EXP.GNFS.CD',
    label: 'Exports of goods and services (current US$)',
    unit: 'USD',
    domain: 'trade',
    periodType: 'annual',
    description: 'Exports of goods and services',
  },
  {
    indicatorKey: 'imports_goods_services_usd',
    worldBankCode: 'NE.IMP.GNFS.CD',
    label: 'Imports of goods and services (current US$)',
    unit: 'USD',
    domain: 'trade',
    periodType: 'annual',
    description: 'Imports of goods and services',
  },
  {
    indicatorKey: 'trade_pct_gdp',
    worldBankCode: 'NE.TRD.GNFS.ZS',
    label: 'Trade (% of GDP)',
    unit: 'percent',
    domain: 'trade',
    periodType: 'annual',
    description: 'Trade as percentage of GDP',
  },
  {
    indicatorKey: 'unemployment_pct',
    worldBankCode: 'SL.UEM.TOTL.ZS',
    label: 'Unemployment (% of labor force)',
    unit: 'percent',
    domain: 'labor',
    periodType: 'annual',
    description: 'Unemployment rate',
  },
  {
    indicatorKey: 'internet_users_pct',
    worldBankCode: 'IT.NET.USER.ZS',
    label: 'Internet users (% of population)',
    unit: 'percent',
    domain: 'digital',
    periodType: 'annual',
    description: 'Individuals using the Internet',
  },
  {
    indicatorKey: 'life_expectancy_years',
    worldBankCode: 'SP.DYN.LE00.IN',
    label: 'Life expectancy at birth (years)',
    unit: 'years',
    domain: 'demographics',
    periodType: 'annual',
    description: 'Life expectancy at birth',
  },
  {
    indicatorKey: 'urban_population_pct',
    worldBankCode: 'SP.URB.TOTL.IN.ZS',
    label: 'Urban population (% of total)',
    unit: 'percent',
    domain: 'demographics',
    periodType: 'annual',
    description: 'Urban population share',
  },
  {
    indicatorKey: 'electricity_access_pct',
    worldBankCode: 'EG.ELC.ACCS.ZS',
    label: 'Access to electricity (% of population)',
    unit: 'percent',
    domain: 'infrastructure',
    periodType: 'annual',
    description: 'Population with access to electricity',
  },
  {
    indicatorKey: 'co2_emissions_per_capita',
    worldBankCode: 'EN.ATM.CO2E.PC',
    label: 'CO2 emissions (metric tons per capita)',
    unit: 'metric_tons',
    domain: 'environment',
    periodType: 'annual',
    description: 'CO2 emissions per capita',
  },
];

export const TOP20_INDICATOR_KEYS = TOP20_INDICATORS.map((i) => i.indicatorKey);

export function top20ByKey(key: string): Top20IndicatorDef | undefined {
  return TOP20_INDICATORS.find((i) => i.indicatorKey === key);
}

export function worldBankIndicatorPageUrl(worldBankCode: string): string {
  return `https://data.worldbank.org/indicator/${worldBankCode}`;
}

export function worldBankCountryIndicatorApiUrl(
  iso2: string,
  worldBankCode: string,
  dateRange = '2018:2025'
): string {
  return `${WORLD_BANK_API_BASE}/country/${iso2}/indicator/${worldBankCode}?format=json&per_page=20000&date=${dateRange}`;
}

export function worldBankAllCountriesIndicatorApiUrl(
  worldBankCode: string,
  dateRange = '2018:2025',
  page = 1,
  perPage = 300
): string {
  return `${WORLD_BANK_API_BASE}/country/all/indicator/${worldBankCode}?format=json&per_page=${perPage}&date=${dateRange}&page=${page}`;
}

/** Keys used for external-sector coverage in reports. */
export const EXTERNAL_SECTOR_KEYS = [
  'current_account_pct_gdp',
  'reserves_total_usd',
  'reserves_months_imports',
  'remittances_received_usd',
] as const;

/** Keys used for fiscal/debt coverage (IMF WEO SDMX). */
export const FISCAL_COVERAGE_KEYS = ['debt_to_gdp_pct', 'fiscal_balance_pct_gdp'] as const;

export const GOVERNANCE_COVERAGE_KEYS = ['wgi_governance_estimate'] as const;

export const FX_REGIME_COVERAGE_KEYS = ['fx_regime_category'] as const;
