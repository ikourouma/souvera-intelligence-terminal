/**
 * Candidate authoritative sources by claim category (Option 2 backlog).
 */

export type CandidateSourceType = 'api' | 'portal' | 'pdf_reports' | 'paid';
export type ClaimCategory =
  | 'oil_gas_reserves'
  | 'vc_startups'
  | 'port_logistics'
  | 'electrification_power'
  | 'banking_stability'
  | 'tourism_hospitality'
  | 'general';

export interface CandidateSource {
  name: string;
  type: CandidateSourceType;
  url: string;
  apiBaseUrl?: string;
  docsUrl?: string;
  authModel: 'public' | 'api_key' | 'paid' | 'review';
  redistribution: string;
  priority: number;
}

export const CLAIM_CATEGORY_SOURCES: Record<ClaimCategory, CandidateSource[]> = {
  oil_gas_reserves: [
    {
      name: 'U.S. EIA Open Data',
      type: 'api',
      url: 'https://www.eia.gov/opendata/',
      apiBaseUrl: 'https://api.eia.gov/',
      docsUrl: 'https://www.eia.gov/opendata/',
      authModel: 'api_key',
      redistribution: 'API key required (free); series coverage varies',
      priority: 1,
    },
    {
      name: 'OPEC Annual Statistical Bulletin',
      type: 'pdf_reports',
      url: 'https://www.opec.org/opec_web/en/publications/',
      authModel: 'public',
      redistribution: 'PDF tables; no standard API',
      priority: 2,
    },
    {
      name: 'Energy Institute Statistical Review',
      type: 'portal',
      url: 'https://www.energyinst.org/statistical-review',
      authModel: 'public',
      redistribution: 'Downloadable datasets; verify license',
      priority: 3,
    },
    {
      name: 'Nigeria NUPRC (example national regulator)',
      type: 'portal',
      url: 'https://www.nuprc.gov.ng/',
      authModel: 'public',
      redistribution: 'Country-specific; fragmented APIs',
      priority: 4,
    },
  ],
  vc_startups: [
    {
      name: 'AVCA Research',
      type: 'pdf_reports',
      url: 'https://www.avca-africa.org/research/',
      authModel: 'public',
      redistribution: 'Institutional reports; some gated',
      priority: 1,
    },
    {
      name: 'Partech Africa Insights',
      type: 'pdf_reports',
      url: 'https://partechpartners.com/insights/',
      authModel: 'public',
      redistribution: 'PDF reports; cite report year',
      priority: 2,
    },
    {
      name: 'Briter Bridges Reports',
      type: 'pdf_reports',
      url: 'https://briterbridges.com/reports',
      authModel: 'public',
      redistribution: 'May have access constraints',
      priority: 3,
    },
    {
      name: 'Crunchbase Data (Paid/Review)',
      type: 'paid',
      url: 'https://data.crunchbase.com/docs',
      docsUrl: 'https://data.crunchbase.com/docs',
      authModel: 'paid',
      redistribution: 'Licensing required',
      priority: 4,
    },
    {
      name: 'PitchBook (Paid/Review)',
      type: 'paid',
      url: 'https://pitchbook.com/',
      authModel: 'paid',
      redistribution: 'Premium',
      priority: 5,
    },
    {
      name: 'CB Insights Research (Paid/Review)',
      type: 'paid',
      url: 'https://www.cbinsights.com/research/',
      authModel: 'paid',
      redistribution: 'Often paywalled',
      priority: 6,
    },
  ],
  port_logistics: [
    {
      name: 'World Bank Container Port Performance Index',
      type: 'portal',
      url: 'https://www.worldbank.org/en/topic/transport/publication/container-port-performance-index',
      authModel: 'public',
      redistribution: 'Port efficiency benchmark',
      priority: 1,
    },
    {
      name: 'World Bank Logistics Performance Index',
      type: 'portal',
      url: 'https://lpi.worldbank.org/',
      authModel: 'public',
      redistribution: 'Logistics quality index',
      priority: 2,
    },
    {
      name: 'World Bank Enterprise Surveys',
      type: 'portal',
      url: 'https://www.enterprisesurveys.org/en/data',
      authModel: 'public',
      redistribution: 'Customs clearance / outages microdata',
      priority: 3,
    },
    {
      name: 'UNCTAD Review of Maritime Transport',
      type: 'pdf_reports',
      url: 'https://unctad.org/publications-search?title=Review%20of%20Maritime%20Transport',
      authModel: 'public',
      redistribution: 'Report-based',
      priority: 4,
    },
    {
      name: 'UNCTADstat',
      type: 'portal',
      url: 'https://unctadstat.unctad.org/EN/',
      authModel: 'public',
      redistribution: 'Ingestion method under review',
      priority: 5,
    },
  ],
  electrification_power: [
    {
      name: 'World Bank Indicators API',
      type: 'api',
      url: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation',
      apiBaseUrl: 'https://api.worldbank.org/v2',
      authModel: 'public',
      redistribution: 'Electricity access and energy indicators',
      priority: 1,
    },
    {
      name: 'IRENA Data & Statistics',
      type: 'portal',
      url: 'https://www.irena.org/Data',
      authModel: 'public',
      redistribution: 'Renewables capacity datasets',
      priority: 2,
    },
    {
      name: 'Ember Energy Data',
      type: 'portal',
      url: 'https://ember-energy.org/data/',
      authModel: 'public',
      redistribution: 'Electricity transition datasets',
      priority: 3,
    },
    {
      name: 'World Bank Enterprise Surveys (power outages)',
      type: 'portal',
      url: 'https://www.enterprisesurveys.org/en/data',
      authModel: 'public',
      redistribution: 'Outage / generator usage',
      priority: 4,
    },
  ],
  banking_stability: [
    {
      name: 'IMF Data Services (FSI)',
      type: 'api',
      url: 'https://dataservices.imf.org/REST/SDMX_JSON.svc/Dataflow',
      apiBaseUrl: 'https://dataservices.imf.org/REST/SDMX_JSON.svc/',
      docsUrl: 'https://datahelp.imf.org/knowledgebase/articles/630877-data-services',
      authModel: 'public',
      redistribution: 'Financial Soundness Indicators',
      priority: 1,
    },
    {
      name: 'BIS Total Credit Statistics',
      type: 'portal',
      url: 'https://www.bis.org/statistics/totcredit.htm',
      authModel: 'public',
      redistribution: 'Credit to private sector / GDP',
      priority: 2,
    },
    {
      name: 'IMF Financial Access Survey',
      type: 'portal',
      url: 'https://data.imf.org/',
      authModel: 'public',
      redistribution: 'Inclusion metrics via IMF portal',
      priority: 3,
    },
    {
      name: 'World Bank GFDD',
      type: 'portal',
      url: 'https://www.worldbank.org/en/publication/gfdr/data/global-financial-development-database',
      authModel: 'public',
      redistribution: 'Downloadable dataset',
      priority: 4,
    },
  ],
  tourism_hospitality: [
    {
      name: 'UNWTO Tourism Statistics',
      type: 'portal',
      url: 'https://www.unwto.org/tourism-statistics',
      authModel: 'public',
      redistribution: 'Arrivals and receipts; country tables vary by year',
      priority: 1,
    },
    {
      name: 'WTTC Economic Impact Research',
      type: 'portal',
      url: 'https://wttc.org/research/economic-impact',
      authModel: 'public',
      redistribution: 'Sector GDP / employment estimates; cite methodology',
      priority: 2,
    },
    {
      name: 'World Bank WDI — international tourism receipts',
      type: 'api',
      url: 'https://data.worldbank.org/indicator/ST.INT.RCPT.CD',
      apiBaseUrl: 'https://api.worldbank.org/v2/',
      authModel: 'public',
      redistribution: 'ST.INT.* series for tourism receipts and arrivals',
      priority: 3,
    },
    {
      name: 'National tourism boards / statistical offices',
      type: 'portal',
      url: 'https://www.caribbean-tourism.com/',
      authModel: 'review',
      redistribution: 'Country-specific visitor statistics; verify license per market',
      priority: 4,
    },
  ],
  general: [
    {
      name: 'World Bank Indicators API',
      type: 'api',
      url: 'https://api.worldbank.org/v2',
      apiBaseUrl: 'https://api.worldbank.org/v2',
      authModel: 'public',
      redistribution: 'Primary macro source',
      priority: 1,
    },
  ],
};

const CLASSIFIERS: Array<{ category: ClaimCategory; pattern: RegExp }> = [
  { category: 'oil_gas_reserves', pattern: /TCF|barrels|proved reserves|oil reserves|gas reserves|OPEC|crude/i },
  {
    category: 'vc_startups',
    pattern: /VC|venture|startups?|funded|Series [A-Z]|fintech transactions/i,
  },
  { category: 'port_logistics', pattern: /port|dwell|clearance|customs|\d+\s*days|logistics/i },
  {
    category: 'electrification_power',
    pattern: /electricity|electrification|MW|GW|grid|outage|power generation/i,
  },
  {
    category: 'banking_stability',
    pattern: /NPL|capital adequacy|CAR|liquidity|banking system|FSI|credit to private/i,
  },
  {
    category: 'tourism_hospitality',
    pattern: /tourism|hospitality|arrivals|visitor economy|hotel pipeline|cruise/i,
  },
];

export function classifyClaim(text: string): ClaimCategory {
  for (const { category, pattern } of CLASSIFIERS) {
    if (pattern.test(text)) return category;
  }
  return 'general';
}

export function candidateSourcesForClaim(text: string): CandidateSource[] {
  return CLAIM_CATEGORY_SOURCES[classifyClaim(text)];
}
