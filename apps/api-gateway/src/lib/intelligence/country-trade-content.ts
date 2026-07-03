/**
 * Region-aware Trade tab copy — Sprint B.
 */

import { getCountryRegion, type CountryRegion } from './country-overview-content';
import { getAfricanSubRegion, getCaribbeanSubRegion } from './country-regions';
import { isApprovedCaribbeanMarket } from '../market-coverage';

export interface TradeRegionalAgreement {
  name: string;
  description: string;
  borderClass: string;
}

export interface TradeFinanceProduct {
  name: string;
  desc: string;
  provider: string;
}

export interface TradeTabCopy {
  heroSubtitle: string;
  usTradeSubtitle: string;
  regionalAgreements: TradeRegionalAgreement[];
  financeTitle: string;
  financeSubtitle: string;
  financeProducts: TradeFinanceProduct[];
  intraRegionalTitle: string;
  intraRegionalSubtitle: string;
  intraPrimaryVolumeLabel: string;
  intraSecondaryVolumeLabel: string;
  intraPartnerShareLabel: string;
  financeBullets: string[];
}

const AFRICA_TRADE: TradeTabCopy = {
  heroSubtitle: 'Bilateral flows, AGOA restoration opportunity, regional integration',
  usTradeSubtitle: 'Major bilateral trade partner',
  regionalAgreements: [
    { name: 'AGOA', description: 'U.S. preferential market access · non-petroleum exports · eligibility subject to annual Presidential review', borderClass: 'border-amber-500/20' },
    { name: 'AfCFTA', description: '54 nations · 1.3B consumers · 90% tariff elimination by 2030', borderClass: 'border-emerald-500/20' },
    { name: 'ECOWAS', description: '15 West African nations · 350M people · duty-free regional trade', borderClass: 'border-blue-500/20' },
  ],
  financeTitle: 'Trade Finance Mapping',
  financeSubtitle: 'Structured finance channels for AfCFTA and ECOWAS corridor trade',
  financeProducts: [
    { name: 'Export Credit Agency (ECA) Coverage', desc: 'Political and commercial risk insurance for cross-border trade', provider: 'Afreximbank / DFC' },
    { name: 'Letter of Credit (L/C) Facilitation', desc: 'Structured trade finance for commodity and manufacturing exports', provider: 'Partner banks' },
    { name: 'Political Risk Insurance', desc: 'Currency inconvertibility, expropriation, and breach of contract coverage', provider: 'MIGA / DFC' },
    { name: 'Supply Chain Finance', desc: 'Working capital for AfCFTA and ECOWAS corridor transactions', provider: 'Afreximbank TRADAR-style' },
  ],
  intraRegionalTitle: 'Intra-African Trade',
  intraRegionalSubtitle: 'Regional trade flows within Africa',
  intraPrimaryVolumeLabel: 'AfCFTA Trade Volume',
  intraSecondaryVolumeLabel: 'ECOWAS Trade Volume',
  intraPartnerShareLabel: 'of intra-African trade',
  financeBullets: [
    'Afreximbank TRADAR-style supply chain finance for AfCFTA corridors',
    'DFC/MIGA political risk coverage for cross-border manufacturing exports',
    'ECOWAS regional L/C facilitation via partner banks',
  ],
};

const CARIBBEAN_TRADE: TradeTabCopy = {
  heroSubtitle: 'Bilateral flows, CBI/CARICOM access, nearshore corridor',
  usTradeSubtitle: 'Primary bilateral trade partner (CBI eligible)',
  regionalAgreements: [
    { name: 'CARICOM', description: '15 member states · CSME integration · regional services market', borderClass: 'border-emerald-500/20' },
    { name: 'CBI', description: 'Caribbean Basin Initiative · preferential U.S. access · petroleum excluded (HTS Ch. 27)', borderClass: 'border-blue-500/20' },
  ],
  financeTitle: 'Trade Finance Mapping',
  financeSubtitle: 'Structured finance channels for Caribbean export and tourism corridors',
  financeProducts: [
    { name: 'Export Credit Agency (ECA) Coverage', desc: 'Political and commercial risk insurance for tourism and mining exports', provider: 'DFC / IDB Invest' },
    { name: 'Letter of Credit (L/C) Facilitation', desc: 'Structured trade finance for bauxite, agriculture, and manufacturing', provider: 'Partner banks' },
    { name: 'Political Risk Insurance', desc: 'Currency inconvertibility, expropriation, and breach of contract coverage', provider: 'MIGA / DFC' },
    { name: 'Supply Chain Finance', desc: 'Working capital for CARICOM and CBI corridor transactions', provider: 'Caribbean Development Bank' },
  ],
  intraRegionalTitle: 'Intra-Caribbean Trade',
  intraRegionalSubtitle: 'Regional trade flows within CARICOM',
  intraPrimaryVolumeLabel: 'CARICOM Trade Volume',
  intraSecondaryVolumeLabel: 'CSME Services Trade',
  intraPartnerShareLabel: 'of intra-Caribbean trade',
  financeBullets: [
    'Caribbean Development Bank trade finance for export corridors',
    'DFC coverage for tourism and mining export projects',
    'CBI-eligible export L/C facilitation via partner banks',
  ],
};

const KEN_TRADE: TradeTabCopy = {
  heroSubtitle: 'Bilateral flows, active AGOA eligibility, EAC gateway access',
  usTradeSubtitle: 'Major bilateral trade partner (AGOA eligible)',
  regionalAgreements: [
    { name: 'AGOA', description: 'Active eligibility · duty-free U.S. access for non-petroleum categories', borderClass: 'border-amber-500/20' },
    { name: 'AfCFTA', description: '54 nations · 1.3B consumers · continental tariff elimination', borderClass: 'border-emerald-500/20' },
    { name: 'EAC', description: '8 member states · 300M+ consumers · Northern Corridor trade gateway', borderClass: 'border-blue-500/20' },
  ],
  financeTitle: 'Trade Finance Mapping',
  financeSubtitle: 'Structured finance channels for AGOA, EAC, and AfCFTA corridor trade',
  financeProducts: [
    { name: 'Export Credit Agency (ECA) Coverage', desc: 'Political and commercial risk insurance for horticulture and apparel exports', provider: 'Afreximbank / DFC' },
    { name: 'Letter of Credit (L/C) Facilitation', desc: 'Structured trade finance for tea, coffee, floriculture, and EPZ manufacturing', provider: 'Partner banks / CBK' },
    { name: 'Political Risk Insurance', desc: 'Currency inconvertibility, expropriation, and breach of contract coverage', provider: 'MIGA / DFC' },
    { name: 'Supply Chain Finance', desc: 'Working capital for EAC re-export and Mombasa port corridor transactions', provider: 'Afreximbank TRADAR-style' },
  ],
  intraRegionalTitle: 'Intra-East African Trade',
  intraRegionalSubtitle: 'Regional trade flows via EAC and AfCFTA corridors',
  intraPrimaryVolumeLabel: 'AfCFTA Trade Volume',
  intraSecondaryVolumeLabel: 'EAC Trade Volume',
  intraPartnerShareLabel: 'of intra-regional trade',
  financeBullets: [
    'Afreximbank TRADAR-style supply chain finance for EAC re-export corridors',
    'DFC/MIGA political risk coverage for AGOA apparel and horticulture exports',
    'Mombasa port L/C facilitation via partner banks and trade finance desks',
  ],
};

const DEFAULT_TRADE: TradeTabCopy = {
  heroSubtitle: 'Bilateral trade flows and market access intelligence',
  usTradeSubtitle: 'Major bilateral trade partner',
  regionalAgreements: [
    { name: 'WTO', description: 'Most-favoured-nation trade framework', borderClass: 'border-zinc-500/20' },
  ],
  financeTitle: 'Trade Finance Mapping',
  financeSubtitle: 'Export finance and trade facilitation channels',
  financeProducts: [
    { name: 'Export Credit Agency (ECA) Coverage', desc: 'Political and commercial risk insurance for cross-border trade', provider: 'DFC / MIGA' },
    { name: 'Letter of Credit (L/C) Facilitation', desc: 'Structured trade finance for commodity and manufacturing exports', provider: 'Partner banks' },
    { name: 'Political Risk Insurance', desc: 'Currency inconvertibility, expropriation, and breach of contract coverage', provider: 'MIGA / DFC' },
    { name: 'Supply Chain Finance', desc: 'Working capital for regional corridor transactions', provider: 'Development finance institutions' },
  ],
  intraRegionalTitle: 'Regional Trade',
  intraRegionalSubtitle: 'Regional trade integration',
  intraPrimaryVolumeLabel: 'Primary Regional Volume',
  intraSecondaryVolumeLabel: 'Secondary Regional Volume',
  intraPartnerShareLabel: 'of regional trade',
  financeBullets: [
    'Export credit agency coverage via DFC/MIGA',
    'Structured trade finance through partner banks',
    'Supply chain finance for regional corridors',
  ],
};

const SOUTHERN_AFRICA_TRADE: TradeTabCopy = {
  heroSubtitle: 'SADC and COMESA corridors, AfCFTA integration, AGOA market access',
  usTradeSubtitle: 'Bilateral trade partner with regional corridor access',
  regionalAgreements: [
    { name: 'SADC', description: 'Southern African Development Community · 16 nations · 360M+ consumers · Free Trade Area', borderClass: 'border-blue-500/20' },
    { name: 'COMESA', description: 'Common Market for Eastern and Southern Africa · 21 nations · 560M+ consumers', borderClass: 'border-emerald-500/20' },
    { name: 'AfCFTA', description: '54 nations · 1.3B consumers · 90% tariff elimination by 2030', borderClass: 'border-amber-500/20' },
    { name: 'AGOA', description: 'U.S. preferential market access · non-petroleum exports · eligibility subject to annual Presidential review', borderClass: 'border-cyan-500/20' },
  ],
  financeTitle: 'Trade Finance Mapping',
  financeSubtitle: 'Structured finance channels for SADC, COMESA, and AfCFTA corridor trade',
  financeProducts: [
    { name: 'Export Credit Agency (ECA) Coverage', desc: 'Political and commercial risk insurance for mining and agricultural exports', provider: 'Afreximbank / DFC' },
    { name: 'Letter of Credit (L/C) Facilitation', desc: 'Structured trade finance for minerals, tobacco, and processed goods', provider: 'Partner banks' },
    { name: 'Political Risk Insurance', desc: 'Currency inconvertibility, expropriation, and breach of contract coverage', provider: 'MIGA / DFC' },
    { name: 'Supply Chain Finance', desc: 'Working capital for SADC corridor and Beira/Durban port transactions', provider: 'Afreximbank / TDB' },
  ],
  intraRegionalTitle: 'Intra-African Trade',
  intraRegionalSubtitle: 'Regional trade flows via SADC and COMESA corridors',
  intraPrimaryVolumeLabel: 'AfCFTA Trade Volume',
  intraSecondaryVolumeLabel: 'SADC Trade Volume',
  intraPartnerShareLabel: 'of intra-African trade',
  financeBullets: [
    'Trade & Development Bank (TDB) and Afreximbank supply chain finance for SADC corridors',
    'DFC/MIGA political risk coverage for mining and agro-processing exports',
    'Beira and Durban corridor L/C facilitation via partner banks',
  ],
};

const EAST_AFRICA_TRADE: TradeTabCopy = {
  heroSubtitle: 'EAC and COMESA gateways, AfCFTA integration, AGOA market access',
  usTradeSubtitle: 'Bilateral trade partner with regional gateway access',
  regionalAgreements: [
    { name: 'EAC', description: 'East African Community · 8 member states · 300M+ consumers · Northern Corridor gateway', borderClass: 'border-blue-500/20' },
    { name: 'COMESA', description: 'Common Market for Eastern and Southern Africa · 21 nations · 560M+ consumers', borderClass: 'border-emerald-500/20' },
    { name: 'AfCFTA', description: '54 nations · 1.3B consumers · 90% tariff elimination by 2030', borderClass: 'border-amber-500/20' },
    { name: 'AGOA', description: 'U.S. preferential market access · non-petroleum exports · eligibility subject to annual Presidential review', borderClass: 'border-cyan-500/20' },
  ],
  financeTitle: 'Trade Finance Mapping',
  financeSubtitle: 'Structured finance channels for EAC, COMESA, and AfCFTA corridor trade',
  financeProducts: [
    { name: 'Export Credit Agency (ECA) Coverage', desc: 'Political and commercial risk insurance for coffee, tea, and apparel exports', provider: 'Afreximbank / DFC' },
    { name: 'Letter of Credit (L/C) Facilitation', desc: 'Structured trade finance for agriculture, EPZ manufacturing, and minerals', provider: 'Partner banks' },
    { name: 'Political Risk Insurance', desc: 'Currency inconvertibility, expropriation, and breach of contract coverage', provider: 'MIGA / DFC' },
    { name: 'Supply Chain Finance', desc: 'Working capital for EAC re-export and Mombasa/Dar es Salaam corridor transactions', provider: 'Afreximbank / TDB' },
  ],
  intraRegionalTitle: 'Intra-East African Trade',
  intraRegionalSubtitle: 'Regional trade flows via EAC and COMESA corridors',
  intraPrimaryVolumeLabel: 'AfCFTA Trade Volume',
  intraSecondaryVolumeLabel: 'EAC Trade Volume',
  intraPartnerShareLabel: 'of intra-regional trade',
  financeBullets: [
    'Afreximbank and TDB supply chain finance for EAC re-export corridors',
    'DFC/MIGA political risk coverage for AGOA apparel and agricultural exports',
    'Mombasa and Dar es Salaam port L/C facilitation via partner banks',
  ],
};

const CENTRAL_AFRICA_TRADE: TradeTabCopy = {
  heroSubtitle: 'CEMAC integration, AfCFTA access, resource-export corridors',
  usTradeSubtitle: 'Bilateral trade partner with resource-export focus',
  regionalAgreements: [
    { name: 'CEMAC', description: 'Economic and Monetary Community of Central Africa · 6 nations · CFA franc zone', borderClass: 'border-blue-500/20' },
    { name: 'ECCAS', description: 'Economic Community of Central African States · 11 nations · regional integration', borderClass: 'border-emerald-500/20' },
    { name: 'AfCFTA', description: '54 nations · 1.3B consumers · 90% tariff elimination by 2030', borderClass: 'border-amber-500/20' },
    { name: 'AGOA', description: 'U.S. preferential market access · non-petroleum exports · eligibility subject to annual Presidential review', borderClass: 'border-cyan-500/20' },
  ],
  financeTitle: 'Trade Finance Mapping',
  financeSubtitle: 'Structured finance channels for CEMAC and AfCFTA corridor trade',
  financeProducts: [
    { name: 'Export Credit Agency (ECA) Coverage', desc: 'Political and commercial risk insurance for oil, gas, timber, and mineral exports', provider: 'Afreximbank / DFC' },
    { name: 'Letter of Credit (L/C) Facilitation', desc: 'Structured trade finance for commodity and resource exports', provider: 'Partner banks / BEAC' },
    { name: 'Political Risk Insurance', desc: 'Currency inconvertibility, expropriation, and breach of contract coverage', provider: 'MIGA / DFC' },
    { name: 'Supply Chain Finance', desc: 'Working capital for CEMAC corridor and Douala/Pointe-Noire port transactions', provider: 'Afreximbank / BDEAC' },
  ],
  intraRegionalTitle: 'Intra-African Trade',
  intraRegionalSubtitle: 'Regional trade flows via CEMAC and ECCAS corridors',
  intraPrimaryVolumeLabel: 'AfCFTA Trade Volume',
  intraSecondaryVolumeLabel: 'CEMAC Trade Volume',
  intraPartnerShareLabel: 'of intra-African trade',
  financeBullets: [
    'Afreximbank and BDEAC supply chain finance for CEMAC corridors',
    'DFC/MIGA political risk coverage for resource and infrastructure exports',
    'Douala and Pointe-Noire corridor L/C facilitation via partner banks',
  ],
};

const NORTH_AFRICA_TRADE: TradeTabCopy = {
  heroSubtitle: 'AfCFTA integration, EU association, Mediterranean trade corridors',
  usTradeSubtitle: 'Bilateral trade partner with Euro-Mediterranean access',
  regionalAgreements: [
    { name: 'AfCFTA', description: '54 nations · 1.3B consumers · 90% tariff elimination by 2030', borderClass: 'border-amber-500/20' },
    { name: 'GAFTA', description: 'Greater Arab Free Trade Area · 18 Arab states · duty-free regional trade', borderClass: 'border-emerald-500/20' },
    { name: 'EU Association', description: 'Euro-Mediterranean association agreements · preferential EU market access', borderClass: 'border-blue-500/20' },
    { name: 'COMESA', description: 'Common Market for Eastern and Southern Africa (Egypt, Libya, Sudan)', borderClass: 'border-cyan-500/20' },
  ],
  financeTitle: 'Trade Finance Mapping',
  financeSubtitle: 'Structured finance channels for AfCFTA and Euro-Mediterranean corridor trade',
  financeProducts: [
    { name: 'Export Credit Agency (ECA) Coverage', desc: 'Political and commercial risk insurance for manufacturing and agricultural exports', provider: 'Afreximbank / DFC' },
    { name: 'Letter of Credit (L/C) Facilitation', desc: 'Structured trade finance for textiles, chemicals, and processed goods', provider: 'Partner banks' },
    { name: 'Political Risk Insurance', desc: 'Currency inconvertibility, expropriation, and breach of contract coverage', provider: 'MIGA / DFC' },
    { name: 'Supply Chain Finance', desc: 'Working capital for Mediterranean and AfCFTA corridor transactions', provider: 'Afreximbank / EBRD' },
  ],
  intraRegionalTitle: 'Intra-African Trade',
  intraRegionalSubtitle: 'Regional trade flows via AfCFTA and GAFTA corridors',
  intraPrimaryVolumeLabel: 'AfCFTA Trade Volume',
  intraSecondaryVolumeLabel: 'GAFTA Trade Volume',
  intraPartnerShareLabel: 'of intra-African trade',
  financeBullets: [
    'Afreximbank and EBRD supply chain finance for Mediterranean corridors',
    'DFC/MIGA political risk coverage for manufacturing and agricultural exports',
    'Euro-Mediterranean L/C facilitation via partner banks',
  ],
};

const CARIBBEAN_TERRITORY_TRADE: TradeTabCopy = {
  heroSubtitle: 'U.S./UK-linked territory with nearshore market access and financial-services depth',
  usTradeSubtitle: 'Direct U.S. market linkage',
  regionalAgreements: [
    { name: 'CARICOM (Assoc.)', description: 'Associate/observer links to the 15-state Caribbean single market', borderClass: 'border-emerald-500/20' },
    { name: 'U.S. Nearshore', description: 'Direct U.S. market proximity · low-latency services and logistics linkage', borderClass: 'border-blue-500/20' },
    { name: 'OECS / EC$', description: 'Eastern Caribbean monetary and economic coordination (where applicable)', borderClass: 'border-amber-500/20' },
  ],
  financeTitle: 'Trade Finance Mapping',
  financeSubtitle: 'Structured finance channels for territory services and logistics corridors',
  financeProducts: [
    { name: 'Export Credit Agency (ECA) Coverage', desc: 'Political and commercial risk insurance for services and logistics', provider: 'DFC / UKEF' },
    { name: 'Letter of Credit (L/C) Facilitation', desc: 'Structured trade finance for re-export and services', provider: 'Partner banks' },
    { name: 'Political Risk Insurance', desc: 'Currency inconvertibility and breach-of-contract coverage', provider: 'MIGA / DFC' },
    { name: 'Supply Chain Finance', desc: 'Working capital for nearshore and re-export transactions', provider: 'Caribbean Development Bank' },
  ],
  intraRegionalTitle: 'Regional Trade',
  intraRegionalSubtitle: 'Caribbean regional trade integration',
  intraPrimaryVolumeLabel: 'Regional Trade Volume',
  intraSecondaryVolumeLabel: 'Services Trade',
  intraPartnerShareLabel: 'of regional trade',
  financeBullets: [
    'Caribbean Development Bank trade finance for export corridors',
    'DFC/UKEF coverage for services and logistics projects',
    'Nearshore U.S. services L/C facilitation via partner banks',
  ],
};

const AFRICAN_SUBREGION_TRADE: Record<string, TradeTabCopy> = {
  north: NORTH_AFRICA_TRADE,
  west: AFRICA_TRADE, // ECOWAS template
  east: EAST_AFRICA_TRADE,
  central: CENTRAL_AFRICA_TRADE,
  southern: SOUTHERN_AFRICA_TRADE,
};

export function getTradeTabCopy(iso3: string): TradeTabCopy {
  const key = iso3.toUpperCase();
  if (key === 'KEN') return KEN_TRADE;

  const subRegion = getAfricanSubRegion(key);
  if (subRegion) return AFRICAN_SUBREGION_TRADE[subRegion];

  if (isApprovedCaribbeanMarket(key)) {
    return getCaribbeanSubRegion(key) === 'territory' ? CARIBBEAN_TERRITORY_TRADE : CARIBBEAN_TRADE;
  }

  const region = getCountryRegion(iso3);
  if (region === 'caribbean') return CARIBBEAN_TRADE;
  if (region === 'africa') return AFRICA_TRADE;
  return DEFAULT_TRADE;
}

/** Normalize intra-African (NGA) or intraRegional (JAM) trade blocks. */
export function getIntraRegionalTrade(trade: {
  intraRegional?: { primaryVolumeUsd?: number; secondaryVolumeUsd?: number; topPartners?: Array<{ country: string; flag?: string; totalUsd?: number; sharePct?: number }> };
  intraAfrican?: { afcftaTradeUsd?: number; ecowasTradeUsd?: number; topAfricanPartners?: Array<{ country: string; flag?: string; totalUsd?: number; sharePct?: number }> };
}) {
  if (trade.intraRegional) {
    return {
      primaryVolumeUsd: trade.intraRegional.primaryVolumeUsd,
      secondaryVolumeUsd: trade.intraRegional.secondaryVolumeUsd,
      topPartners: trade.intraRegional.topPartners ?? [],
    };
  }
  if (trade.intraAfrican) {
    return {
      primaryVolumeUsd: trade.intraAfrican.afcftaTradeUsd,
      secondaryVolumeUsd: trade.intraAfrican.ecowasTradeUsd,
      topPartners: trade.intraAfrican.topAfricanPartners ?? [],
    };
  }
  return null;
}

export function getAgoaHeroLabel(iso3: string, status?: string): string {
  if (isApprovedCaribbeanMarket(iso3)) {
    return status === 'eligible' ? 'CBI preferential access active' : 'CBI market access';
  }
  if (status === 'restoration_opportunity') return 'AGOA restoration opportunity';
  if (status === 'eligible') return 'AGOA eligible';
  return 'U.S. trade relationship';
}

/** Per-country GDP growth forecast when time series exists (Sprint A). */
export const COUNTRY_FORECASTS: Record<string, Array<{ year: number; gdp_growth_pct: number }>> = {
  NGA: [
    { year: 2026, gdp_growth_pct: 5.8 },
    { year: 2027, gdp_growth_pct: 5.5 },
  ],
  JAM: [
    { year: 2026, gdp_growth_pct: 3.0 },
    { year: 2027, gdp_growth_pct: 2.9 },
  ],
  KEN: [
    { yeAar: 2026, gdp_growth_pct: 5.2 },
    { year: 2027, gdp_growth_pct: 5.0 },
  ],
};
