/**
 * Regional macro frames for executive Economy Overview narratives.
 * Sourced from IMF April 2026 SSA REO, World Bank Africa Economic Update,
 * and CDB Caribbean Review 2025–2026 (qualitative context only).
 */

import { getAfricanSubRegion, getCaribbeanSubRegion } from '@/lib/intelligence/country-regions';
import { isApprovedCaribbeanMarket } from '@/lib/market-coverage';

export interface RegionalMacroFrame {
  regionLabel: string;
  outlookSummary: string;
  structuralDrivers: string;
  policyPriority: string;
  investorLevers: string;
}

const SSA_FRAME: RegionalMacroFrame = {
  regionLabel: 'Sub-Saharan Africa',
  outlookSummary:
    'SSA entered 2026 on stabilization gains after ~4.5% growth in 2025, with regional expansion moderating toward ~4.1–4.3% in 2026 amid energy and fertilizer pass-through, tighter financial conditions, and heterogeneous performance between oil exporters and import-dependent economies.',
  structuralDrivers:
    'AfCFTA integration, commodity export cycles, and mobile-money/fintech scale remain core growth channels; fragile and low-income oil importers face thinner fiscal buffers.',
  policyPriority:
    'IMF/WB policy priority: anchor inflation expectations, protect vulnerable households with targeted support, and advance structural reforms on energy, governance, and trade facilitation.',
  investorLevers:
    'Size exposure against FX convertibility, fiscal space, AfCFTA corridor positioning, and sector alignment with U.S./EU import demand signals in the Supply-Demand Matrix.',
};

const AFRICA_SUBREGION_FRAMES: Record<string, RegionalMacroFrame> = {
  north: {
    ...SSA_FRAME,
    regionLabel: 'Northern Africa',
    structuralDrivers:
      'Energy exports, Suez/trans-Mediterranean trade corridors, tourism, and remittance-linked consumption anchor the macro cycle; Egypt and Morocco scale drives regional aggregates.',
  },
  west: {
    ...SSA_FRAME,
    regionLabel: 'Western Africa',
    structuralDrivers:
      'ECOWAS integration, cocoa and gold export cycles, fintech scale (Nigeria, Ghana), and port investment (Abidjan, Lagos, Tema) define competitive positioning.',
  },
  east: {
    ...SSA_FRAME,
    regionLabel: 'Eastern Africa',
    structuralDrivers:
      'EAC corridor logistics, horticulture and coffee exports, EPZ manufacturing, and renewable IPP investment support the region\'s above-average non-resource growth profile.',
  },
  central: {
    ...SSA_FRAME,
    regionLabel: 'Central Africa',
    structuralDrivers:
      'Hydrocarbon and mining rents (CEMAC), Congo Basin logistics constraints, and AfCFTA access to Atlantic and Indian Ocean corridors shape diversification paths.',
  },
  southern: {
    ...SSA_FRAME,
    regionLabel: 'Southern Africa',
    structuralDrivers:
      'SADC value chains, platinum and battery-minerals exposure, automotive assembly (South Africa), and agricultural export diversification (Zimbabwe, Zambia) drive the cycle.',
  },
};

const CARIBBEAN_FRAME: RegionalMacroFrame = {
  regionLabel: 'Caribbean Basin',
  outlookSummary:
    'Caribbean growth is dual-track: hydrocarbon producers (Guyana, Trinidad, emerging Suriname) lift regional averages, while tourism-dependent economies face moderating arrivals, high import costs, and climate vulnerability — ex-Guyana growth estimated ~1.1–2.9% in 2026.',
  structuralDrivers:
    'Tourism recovery (~35M arrivals regionally), remittances (~$22.5B), financial services, and nearshore BPO/digital services in Kingston and Santo Domingo anchor services economies.',
  policyPriority:
    'CDB/IMF focus: debt sustainability, climate resilience investment, energy transition, and tourism/airlift diversification away from single-source markets.',
  investorLevers:
    'Prioritize FX stability, tourism/airlift data, CBI/CARICOM market access, and hurricane/climate risk in underwriting; hydrocarbon markets require separate fiscal and depletion-risk framing.',
};

const CARIBBEAN_SUB_FRAMES: Record<string, Partial<RegionalMacroFrame>> = {
  oecs: {
    structuralDrivers:
      'OECS economies (XCD peg) combine tourism, citizenship-by-investment flows, and agricultural exports — hurricane exposure is a primary operational risk.',
  },
  cariforum: {
    structuralDrivers:
      'CARIFORUM members blend tourism, agriculture, and growing nearshore services; U.S. visitor demand and remittance flows are primary cyclical drivers.',
  },
  territory: {
    structuralDrivers:
      'Territory economies depend on U.S. federal transfers, tourism, and financial services — policy and market access follow non-sovereign frameworks.',
  },
};

/** Country-specific structural differentiators (Tier A / named markets). */
export const COUNTRY_STRUCTURAL_DRIVERS: Record<string, string> = {
  NGA: 'technology and fintech scale, oil production recovery, and post-2023 FX unification',
  JAM: 'tourism rebound, remittance inflows ($3.5B+ annually), and Kingston nearshore services',
  KEN: 'Mombasa–Nairobi logistics gateway, horticulture exports, and mobile-money/fintech leadership',
  GHA: 'gold mining, cocoa exports, and Accra fintech scale under BoG tightening',
  ZAF: 'mining, automotive manufacturing, and renewable IPP investment amid energy transition',
  ETH: 'EPZ manufacturing, coffee exports, and post-conflict reconstruction investment',
  SEN: 'phosphate mining, fisheries, and Sangomar energy production under CFA stability',
  CIV: 'cocoa processing, gold mining, and Abidjan port investment — West Africa\'s fastest-growing major economy',
  TZA: 'gold mining, EPZ apparel, and Dar es Salaam port upgrades',
  ZWE: 'platinum and lithium mining, tobacco exports, and regional trade repositioning under ZiG/USD framework',
  GUY: 'offshore oil production and sovereign wealth accumulation — Caribbean growth outlier',
  TTO: 'hydrocarbon and petrochemical exports with mature production profile',
  BRB: 'tourism-led services and international business/financial services hub',
};

export function getRegionalMacroFrame(iso3: string): RegionalMacroFrame {
  const key = iso3.toUpperCase();
  if (isApprovedCaribbeanMarket(key)) {
    const sub = getCaribbeanSubRegion(key);
    const subFrame = CARIBBEAN_SUB_FRAMES[sub] ?? {};
    return { ...CARIBBEAN_FRAME, ...subFrame };
  }
  const subRegion = getAfricanSubRegion(key);
  if (subRegion && AFRICA_SUBREGION_FRAMES[subRegion]) {
    return AFRICA_SUBREGION_FRAMES[subRegion];
  }
  return SSA_FRAME;
}

export function getCountryStructuralDriver(iso3: string): string | null {
  return COUNTRY_STRUCTURAL_DRIVERS[iso3.toUpperCase()] ?? null;
}
