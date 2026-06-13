/**
 * Region-aware Trade tab copy — Sprint B.
 */

import { getCountryRegion, type CountryRegion } from './country-overview-content';

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
    { name: 'AGOA', description: 'U.S. preferential market access · eligibility subject to annual Presidential review', borderClass: 'border-amber-500/20' },
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
    { name: 'CBI', description: 'Caribbean Basin Initiative · preferential U.S. market access', borderClass: 'border-blue-500/20' },
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
    { name: 'AGOA', description: 'Active eligibility · duty-free U.S. access for 6,500+ product categories', borderClass: 'border-amber-500/20' },
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

export function getTradeTabCopy(iso3: string): TradeTabCopy {
  const key = iso3.toUpperCase();
  if (key === 'KEN') return KEN_TRADE;
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
  const region = getCountryRegion(iso3);
  if (region === 'caribbean') {
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
