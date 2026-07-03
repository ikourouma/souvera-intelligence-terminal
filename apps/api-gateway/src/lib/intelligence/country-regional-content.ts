/**
 * Region-aware Risk and Opportunity content for all non-pilot markets.
 *
 * Provides Nigeria-comparable depth (multi-item risk categories, detailed
 * opportunity pillars) for every African sub-region and the Caribbean, so no
 * approved market falls back to the thin generic default content.
 *
 * Content is factually grounded at the regional-bloc level and parameterized by
 * country name. Macro items use {{FX}}, {{INFLATION}}, {{MACRO_ASOF_YEAR}}
 * tokens hydrated by the panel from structured series.
 */
import type {
  CountryRiskContent,
  RiskItem,
} from './country-risk-content';
import type {
  CountryOpportunityContent,
  RegionalAdvantage,
} from './country-opportunity-content';
import {
  getAfricanSubRegion,
  getCaribbeanSubRegion,
  type AfricanSubRegion,
} from './country-regions';

// ===========================================================================
// RISK
// ===========================================================================

interface RegionRiskProfile {
  subtitle: string;
  riskLevel: string;
  horizon: string;
  returns: string;
  blocAccess: string; // e.g. "ECOWAS and AfCFTA"
  currencyNote: string;
  powerNote: string;
  logisticsNote: string;
  narrative: (name: string) => string;
  returnsBullets: string[];
}

const AFRICA_RISK_PROFILES: Record<AfricanSubRegion, RegionRiskProfile> = {
  north: {
    subtitle: 'Mediterranean-facing economy with reform momentum and external-balance watchpoints',
    riskLevel: 'Moderate',
    horizon: '4-6 Years',
    returns: 'Attractive',
    blocAccess: 'AfCFTA, GAFTA, and EU association',
    currencyNote: 'managed exchange-rate regimes with periodic adjustment; verify reserve cover against latest releases',
    powerNote: 'relatively developed grids with growing solar capacity',
    logisticsNote: 'established Mediterranean ports and Euro-corridor connectivity',
    narrative: (n) =>
      `${n}'s risk-adjusted returns suit investors with 4-6 year horizons leveraging Euro-Mediterranean proximity, AfCFTA access, and manufacturing/agro-export corridors, while monitoring external balances and subsidy/reform trajectories.`,
    returnsBullets: ['Euro-Mediterranean and AfCFTA market access', 'Manufacturing and agro-export corridors', 'Established logistics and energy infrastructure'],
  },
  west: {
    subtitle: 'ECOWAS economy with currency cycles and infrastructure-gap watchpoints',
    riskLevel: 'Manageable',
    horizon: '4-6 Years',
    returns: 'Attractive',
    blocAccess: 'ECOWAS, AGOA, and AfCFTA',
    currencyNote: 'CFA peg stability (UEMOA members) or managed floats elsewhere; USD export revenue offsets exposure',
    powerNote: 'reliability gaps common; self-generation budgeting advised',
    logisticsNote: 'coastal ports anchor corridors; inland last-mile adds cost',
    narrative: (n) =>
      `${n}'s risk-adjusted returns are attractive for investors with 4-6 year horizons who can navigate currency and infrastructure cycles while leveraging AGOA duty-free access and ECOWAS/AfCFTA market integration.`,
    returnsBullets: ['ECOWAS 350M-consumer market access', 'AGOA duty-free U.S. export corridors', 'Commodity export USD revenue hedges'],
  },
  east: {
    subtitle: 'EAC/COMESA economy with forex-access and infrastructure watchpoints',
    riskLevel: 'Moderate',
    horizon: '4-6 Years',
    returns: 'Attractive',
    blocAccess: 'EAC, COMESA, and AfCFTA',
    currencyNote: 'managed floats with periodic forex-access constraints; verify against central bank updates',
    powerNote: 'improving access with strong renewable (geothermal, hydro) growth',
    logisticsNote: 'Mombasa and Dar es Salaam corridors serve landlocked partners',
    narrative: (n) =>
      `${n}'s risk-adjusted returns attract investors with 4-6 year horizons leveraging EAC/COMESA integration, AGOA apparel and agricultural access, and regional gateway logistics, while managing forex-access and infrastructure constraints.`,
    returnsBullets: ['EAC/COMESA single-market access', 'AGOA-eligible apparel and agricultural exports', 'Regional port-corridor gateway position'],
  },
  central: {
    subtitle: 'CEMAC resource economy with diversification and governance watchpoints',
    riskLevel: 'Elevated',
    horizon: '5-8 Years',
    returns: 'High Potential',
    blocAccess: 'CEMAC, ECCAS, and AfCFTA',
    currencyNote: 'CFA (BEAC) peg provides currency stability; resource-revenue cyclicality affects fiscal balances',
    powerNote: 'significant reliability gaps; captive generation typically required',
    logisticsNote: 'Douala and Pointe-Noire ports anchor corridors; inland logistics challenging',
    narrative: (n) =>
      `${n}'s risk-adjusted returns reward patient capital with 5-8 year horizons capturing resource and infrastructure upside under CFA currency stability, while navigating diversification needs, governance, and logistics constraints.`,
    returnsBullets: ['CFA franc-zone currency stability', 'Oil, gas, timber, and mineral export base', 'CEMAC and AfCFTA regional access'],
  },
  southern: {
    subtitle: 'SADC/COMESA economy with currency, power, and policy watchpoints',
    riskLevel: 'Moderate',
    horizon: '5-7 Years',
    returns: 'Compelling',
    blocAccess: 'SADC, COMESA, and AfCFTA',
    currencyNote: 'rand-linked stability (CMA members) or managed floats elsewhere; mineral exports provide USD hedge',
    powerNote: 'load-shedding risk in parts of the region; self-generation common',
    logisticsNote: 'Durban, Beira, and Walvis Bay corridors serve landlocked members',
    narrative: (n) =>
      `${n}'s risk-adjusted returns favor patient capital with 5-7 year horizons leveraging SADC/COMESA integration and USD-linked mineral exports, while managing currency, power-reliability, and policy-predictability risk.`,
    returnsBullets: ['SADC 360M and COMESA 560M consumer access', 'USD-linked mineral export revenue hedge', 'Regional corridor logistics to multiple ports'],
  },
};

function buildAfricaRisk(name: string, p: RegionRiskProfile): CountryRiskContent {
  const macroItems: RiskItem[] = [
    { title: 'Currency Volatility', severity: 'MODERATE', severityTone: 'amber', body: `Exchange rate at {{FX}} ({{MACRO_ASOF_YEAR}}). ${name} operates ${p.currencyNote}.`, mitigants: ['USD-denominated export revenue', 'Hedging where available'] },
    { title: 'Inflation', severity: 'MODERATE', severityTone: 'amber', body: `Inflation at {{INFLATION}} ({{MACRO_ASOF_YEAR}}); verify against central bank policy updates. Import-price pass-through and monetary policy shape the trajectory.`, mitigants: ['Monetary policy response', 'Diversified import sourcing'] },
    { title: 'External & Fiscal Balance', severity: 'LOW-MODERATE', severityTone: 'emerald', body: `Debt and external balances should be verified against IMF/World Bank sovereign updates; treat ratios as estimates until tied to structured fiscal series.`, mitigants: ['Development-partner program oversight', 'Export earnings support reserves'] },
  ];
  const politicalItems: RiskItem[] = [
    { title: 'Governance & Stability', severity: 'LOW-MODERATE', severityTone: 'emerald', body: `Assess institutional quality, electoral cycles, and policy continuity for ${name}. ${p.blocAccess} frameworks support reform accountability.`, mitigants: ['Regional bloc accountability', 'Development partner engagement'] },
    { title: 'Regulatory Predictability', severity: 'MODERATE', severityTone: 'amber', body: `Sector licensing and local-content rules can shift; secure written approvals before capital commitment in ${name}.`, mitigants: ['Local legal counsel and partners', 'Milestone-based deployment'] },
  ];
  const operationalItems: RiskItem[] = [
    { title: 'Power Reliability', severity: 'MODERATE', severityTone: 'amber', body: `${name} has ${p.powerNote}. Many operators budget for captive solar or backup generation.`, mitigants: ['Captive solar / backup capacity', 'Energy-efficiency investment'] },
    { title: 'Logistics & Infrastructure', severity: 'MODERATE', severityTone: 'amber', body: `${p.logisticsNote}. Plan around principal trade corridors and bonded-warehouse options to manage cost and lead time.`, mitigants: ['Established freight forwarders', 'Bonded warehousing and corridor planning'] },
    { title: 'Talent & Skills', severity: 'LOW-MODERATE', severityTone: 'emerald', body: `Skilled-labor availability varies by sector in ${name}; training pipelines and diaspora engagement mitigate gaps.`, mitigants: ['Workforce training programs', 'Diaspora and regional talent pools'] },
  ];

  return {
    heroSubtitle: p.subtitle,
    heroFallback: `${name}'s investment landscape requires a balanced assessment of macro, political, and operational risks. Risks are real but manageable through ${p.blocAccess} access, USD-linked export revenue, and phased capital deployment.`,
    macro: { exportId: 'inflation', exportTitle: 'Macro Risks', exportFileSlug: 'macro-risks', title: 'Macro Risks', subtitle: 'Currency, Inflation, Debt', icon: 'macro', items: macroItems },
    political: { exportId: 'political-risks-card', exportTitle: 'Political Risks', exportFileSlug: 'political-risks', title: 'Political Risks', subtitle: 'Governance, Policy Continuity', icon: 'political', items: politicalItems },
    operational: { exportId: 'operational-risks-card', exportTitle: 'Operational Risks', exportFileSlug: 'operational-risks', title: 'Operational Risks', subtitle: 'Power, Logistics, Talent', icon: 'operational', items: operationalItems },
    mitigationStrategies: [
      { icon: 'users', title: 'Local Partnerships', body: `Partner with established operators in ${name} for market entry and regulatory navigation.`, borderClass: 'border-emerald-500/10' },
      { icon: 'shield', title: 'Insurance', body: 'Political risk and credit insurance from MIGA, DFC, or African DFIs.', borderClass: 'border-blue-500/10' },
      { icon: 'dollar', title: 'Diversification', body: 'Balance domestic and export revenue streams; prioritize USD-linked corridors.', borderClass: 'border-amber-500/10' },
      { icon: 'check', title: 'Phased Deployment', body: 'Pilot before full-scale capital commitment to validate assumptions.', borderClass: 'border-cyan-500/10' },
    ],
    mitigationBullets: ['Local partners reduce friction', 'Export revenue hedges FX exposure', 'Phased deployment recommended'],
    riskAdjustedNarrative: p.narrative(name),
    riskAdjustedStats: [
      { value: p.riskLevel, label: 'Risk Level', sublabel: 'With proper mitigation', accentClass: 'text-emerald-400' },
      { value: p.horizon, label: 'Investment Horizon', sublabel: 'Patient capital rewarded', accentClass: 'text-blue-400' },
      { value: p.returns, label: 'Risk-Adjusted Returns', sublabel: 'Above emerging market avg', accentClass: 'text-emerald-400' },
    ],
    returnsBullets: p.returnsBullets,
  };
}

interface CaribbeanRiskProfile {
  subtitle: string;
  riskLevel: string;
  horizon: string;
  returns: string;
  currencyNote: string;
  narrative: (name: string) => string;
  returnsBullets: string[];
}

const CARIBBEAN_RISK_PROFILES: Record<string, CaribbeanRiskProfile> = {
  oecs: {
    subtitle: 'OECS tourism economy with EC dollar stability and hurricane-resilience watchpoints',
    riskLevel: 'Moderate',
    horizon: '4-6 Years',
    returns: 'Attractive',
    currencyNote: 'the East Caribbean Dollar (XCD) is pegged to the USD, removing currency risk',
    narrative: (n) =>
      `${n}'s risk-adjusted returns appeal to investors accepting hurricane seasonality in exchange for USD-peg stability, CARICOM/CBI access, and premium tourism and real-estate exposure on 4-6 year horizons.`,
    returnsBullets: ['XCD/USD peg removes currency risk', 'CBI and CARICOM preferential access', 'Premium tourism and real-estate demand'],
  },
  cariforum: {
    subtitle: 'CARIFORUM economy with import-dependence and external-balance watchpoints',
    riskLevel: 'Moderate',
    horizon: '4-6 Years',
    returns: 'Attractive',
    currencyNote: 'managed or pegged exchange-rate regimes; import dependence adds price exposure',
    narrative: (n) =>
      `${n}'s risk-adjusted returns suit investors with 4-6 year horizons leveraging CARIFORUM EPA, CBI access, and tourism/services depth, while managing import dependence and external-balance exposure.`,
    returnsBullets: ['CARIFORUM EPA and CBI market access', 'Tourism, logistics, and services depth', 'Proximity to the U.S. market'],
  },
  territory: {
    subtitle: 'U.S./UK-linked territory with USD stability and concentration watchpoints',
    riskLevel: 'Low-Moderate',
    horizon: '3-5 Years',
    returns: 'Attractive',
    currencyNote: 'USD or USD-pegged currency provides full currency stability',
    narrative: (n) =>
      `${n}'s risk-adjusted returns favor investors seeking USD-stable, low-friction exposure to tourism, financial services, and logistics, while managing economic concentration and external-demand sensitivity.`,
    returnsBullets: ['USD or USD-pegged currency stability', 'Financial services and tourism depth', 'Strong rule-of-law and U.S./UK linkage'],
  },
};

function buildCaribbeanRisk(name: string, p: CaribbeanRiskProfile): CountryRiskContent {
  const macroItems: RiskItem[] = [
    { title: 'Currency & FX', severity: 'LOW-MODERATE', severityTone: 'emerald', body: `For ${name}, ${p.currencyNote}. Reserve adequacy should be verified against latest central bank releases.`, mitigants: ['USD-peg or USD usage', 'Tourism FX inflows'] },
    { title: 'External Balance & Import Dependence', severity: 'MODERATE', severityTone: 'amber', body: `Import dependence for goods, fuel, and food exposes ${name} to imported inflation and shipping-cost shocks.`, mitigants: ['Diversified sourcing', 'Energy transition reduces fuel imports'] },
    { title: 'Fiscal & Debt', severity: 'MODERATE', severityTone: 'amber', body: `Tourism-concentrated revenue bases can pressure fiscal balances during demand shocks; verify debt ratios against IMF updates.`, mitigants: ['Tourism diversification', 'IFI program engagement where applicable'] },
  ];
  const politicalItems: RiskItem[] = [
    { title: 'Governance & Stability', severity: 'LOW', severityTone: 'emerald', body: `${name} benefits from stable democratic institutions and strong rule-of-law within the CARICOM framework.`, mitigants: ['Stable institutions', 'CARICOM coordination'] },
    { title: 'Regulatory & Tax Policy', severity: 'LOW-MODERATE', severityTone: 'emerald', body: `Monitor international tax-transparency and financial-services regulatory developments relevant to ${name}.`, mitigants: ['Compliance frameworks', 'Professional advisory ecosystem'] },
  ];
  const operationalItems: RiskItem[] = [
    { title: 'Hurricane & Climate Exposure', severity: 'MODERATE', severityTone: 'amber', body: `${name} faces Atlantic hurricane-season exposure; resilient construction and insurance are essential for coastal assets.`, mitigants: ['Hurricane and business-interruption insurance', 'Resilient design standards'] },
    { title: 'Energy Costs', severity: 'MODERATE', severityTone: 'amber', body: `High electricity costs from fuel imports affect operating margins; solar and LNG adoption are reducing exposure.`, mitigants: ['Solar and storage deployment', 'Energy-efficiency retrofits'] },
    { title: 'Logistics & Connectivity', severity: 'LOW-MODERATE', severityTone: 'emerald', body: `Airlift and shipping frequency shape supply chains; proximity to the U.S. supports nearshore models for ${name}.`, mitigants: ['U.S. proximity and frequent links', 'Bonded warehousing options'] },
  ];

  return {
    heroSubtitle: p.subtitle,
    heroFallback: `${name}'s investment landscape balances USD-stable, U.S.-proximate market access against hurricane exposure and import dependence. Risks are manageable through insurance, energy transition, and phased deployment.`,
    macro: { exportId: 'inflation', exportTitle: 'Macro Risks', exportFileSlug: 'macro-risks', title: 'Macro Risks', subtitle: 'FX, External Balance, Fiscal', icon: 'macro', items: macroItems },
    political: { exportId: 'political-risks-card', exportTitle: 'Political Risks', exportFileSlug: 'political-risks', title: 'Political Risks', subtitle: 'Governance, Regulation', icon: 'political', items: politicalItems },
    operational: { exportId: 'operational-risks-card', exportTitle: 'Operational Risks', exportFileSlug: 'operational-risks', title: 'Operational Risks', subtitle: 'Climate, Energy, Logistics', icon: 'operational', items: operationalItems },
    mitigationStrategies: [
      { icon: 'users', title: 'Local Partnerships', body: `Partner with resort, port, or financial-services operators in ${name} for operational expertise.`, borderClass: 'border-emerald-500/10' },
      { icon: 'shield', title: 'Insurance & Hedging', body: 'Hurricane, business-interruption, and political-risk coverage for coastal assets.', borderClass: 'border-blue-500/10' },
      { icon: 'dollar', title: 'USD Revenue', body: 'Tourism and services generate USD-aligned revenue, reducing currency mismatch.', borderClass: 'border-amber-500/10' },
      { icon: 'check', title: 'Phased Deployment', body: 'Validate occupancy and insurance assumptions before large capex.', borderClass: 'border-cyan-500/10' },
    ],
    mitigationBullets: ['USD peg simplifies investor returns', 'Insurance products mitigate climate risk', 'Phased deployment recommended'],
    riskAdjustedNarrative: p.narrative(name),
    riskAdjustedStats: [
      { value: p.riskLevel, label: 'Risk Level', sublabel: 'With proper mitigation', accentClass: 'text-amber-400' },
      { value: p.horizon, label: 'Investment Horizon', sublabel: 'Tourism/real estate', accentClass: 'text-blue-400' },
      { value: p.returns, label: 'Risk-Adjusted Returns', sublabel: 'USD-stable gateway', accentClass: 'text-emerald-400' },
    ],
    returnsBullets: p.returnsBullets,
  };
}

/** Returns regional risk content for any non-pilot market, or null if unknown. */
export function regionalRiskContent(iso3: string, countryName: string): CountryRiskContent | null {
  const sub = getAfricanSubRegion(iso3);
  if (sub) return buildAfricaRisk(countryName, AFRICA_RISK_PROFILES[sub]);
  const carib = getCaribbeanSubRegion(iso3);
  if (carib) return buildCaribbeanRisk(countryName, CARIBBEAN_RISK_PROFILES[carib]);
  return null;
}

// ===========================================================================
// OPPORTUNITY
// ===========================================================================

interface PillarSpec {
  icon: 'zap' | 'trending' | 'building';
  title: string;
  subtitle: string;
  narrative: (name: string) => string;
  bullets: Array<{ label: string; text: string }>;
  accentClass: string;
  borderHover: string;
  exportId: string;
  exportFileSlug: string;
  exportTitle: string;
  helpTerm: string;
}

interface RegionOppProfile {
  subtitle: string;
  heroFallback: (name: string) => string;
  pillars: PillarSpec[];
  regionalAdvantages: RegionalAdvantage[];
}

const P_MINING: PillarSpec = {
  icon: 'zap', title: 'Mining & Critical Minerals', subtitle: 'Resource export and beneficiation upside',
  narrative: (n) => `${n}'s mineral resources anchor export earnings, with beneficiation and downstream processing the principal value-add opportunity as global supply chains seek diversified, ESG-aligned sources.`,
  bullets: [
    { label: 'Critical minerals', text: 'Battery and renewable-supply-chain minerals attract strategic investment' },
    { label: 'Beneficiation', text: 'In-country processing captures margin beyond raw-ore export' },
    { label: 'ESG compliance', text: 'Community benefit-sharing now baseline for institutional capital' },
    { label: 'Infrastructure', text: 'Power, rail, and ports unlock new project economics' },
  ],
  accentClass: 'text-blue-400', borderHover: 'hover:border-blue-500/30',
  exportId: 'mining-pillar-card', exportFileSlug: 'mining-opportunity', exportTitle: 'Mining Opportunity', helpTerm: 'mining_minerals_opportunity',
};

const P_AGRI: PillarSpec = {
  icon: 'trending', title: 'Agriculture & Agro-Processing', subtitle: 'Value-add and specialty-export play',
  narrative: (n) => `${n}'s agriculture sector offers value-added and specialty-export upside, with cold chain, processing, and certification unlocking higher-margin corridors to regional and global markets.`,
  bullets: [
    { label: 'Specialty crops', text: 'Premium commodities command pricing power in export markets' },
    { label: 'Agro-processing', text: 'Value-add conversion is the highest-margin opportunity' },
    { label: 'Cold chain', text: 'Logistics investment extends year-round export capacity' },
    { label: 'Import substitution', text: 'Domestic processing reduces food-import dependence' },
  ],
  accentClass: 'text-emerald-400', borderHover: 'hover:border-emerald-500/30',
  exportId: 'agriculture-pillar-card', exportFileSlug: 'agriculture-opportunity', exportTitle: 'Agriculture Opportunity', helpTerm: 'agriculture_opportunity',
};

const P_INFRA: PillarSpec = {
  icon: 'building', title: 'Infrastructure & Energy', subtitle: 'Power, logistics, and connectivity pipeline',
  narrative: (n) => `${n}'s infrastructure pipeline spans power generation, transport corridors, and digital connectivity, with PPP and IPP frameworks enabling private participation in foundational assets.`,
  bullets: [
    { label: 'Renewable power', text: 'Solar, wind, and hydro IPPs address reliability and access gaps' },
    { label: 'Logistics', text: 'Port, corridor, and warehousing upgrades cut trade costs' },
    { label: 'Digital', text: 'Fiber, data centers, and mobile broadband expand the digital economy' },
    { label: 'PPP frameworks', text: 'Structured concessions enable private infrastructure capital' },
  ],
  accentClass: 'text-amber-400', borderHover: 'hover:border-amber-500/30',
  exportId: 'infrastructure-pillar-card', exportFileSlug: 'infrastructure-opportunity', exportTitle: 'Infrastructure Opportunity', helpTerm: 'infrastructure_opportunity',
};

const P_TOURISM: PillarSpec = {
  icon: 'zap', title: 'Tourism & Hospitality', subtitle: 'Premium and eco-tourism upside',
  narrative: (n) => `${n}'s tourism sector anchors foreign exchange and employment, with luxury, eco, and heritage segments commanding premium rates and supporting real-estate and hospitality investment.`,
  bullets: [
    { label: 'Luxury & eco', text: 'Premium segments command 30-60% rate premiums' },
    { label: 'Real estate', text: 'Resort and residential development with investment incentives' },
    { label: 'Airlift', text: 'Capacity expansion drives arrivals growth' },
    { label: 'Services', text: 'Hospitality, marina, and experience operations scale with demand' },
  ],
  accentClass: 'text-blue-400', borderHover: 'hover:border-blue-500/30',
  exportId: 'tourism-pillar-card', exportFileSlug: 'tourism-opportunity', exportTitle: 'Tourism Opportunity', helpTerm: 'tourism_opportunity',
};

const P_SERVICES: PillarSpec = {
  icon: 'building', title: 'Financial & Digital Services', subtitle: 'IFS, fintech, and nearshore services',
  narrative: (n) => `${n}'s services sector offers international financial services, fintech, and nearshore digital opportunities, supported by submarine-cable connectivity and proximity to the U.S. market.`,
  bullets: [
    { label: 'IFS', text: 'International financial services and fund administration depth' },
    { label: 'Fintech', text: 'Digital payments and CBDC innovation across the region' },
    { label: 'Nearshore', text: 'Low-latency U.S. links support IT-enabled services' },
    { label: 'Data centers', text: 'Connectivity supports hosting and cloud infrastructure' },
  ],
  accentClass: 'text-emerald-400', borderHover: 'hover:border-emerald-500/30',
  exportId: 'services-pillar-card', exportFileSlug: 'services-opportunity', exportTitle: 'Services Opportunity', helpTerm: 'services_opportunity',
};

const ADV_AFCFTA: RegionalAdvantage = { icon: 'globe', value: '1.3B', label: 'AfCFTA Access', sublabel: 'Continental duty-free trade', accentClass: 'text-blue-300' };
const ADV_AGOA: RegionalAdvantage = { icon: 'shield', value: 'AGOA', label: 'U.S. Market Access', sublabel: 'Preferential access (eligibility varies)', accentClass: 'text-emerald-300' };

const AFRICA_OPP_PROFILES: Record<AfricanSubRegion, RegionOppProfile> = {
  north: {
    subtitle: 'Euro-Mediterranean manufacturing and agro-export gateway at a reform inflection point',
    heroFallback: (n) => `${n} offers Euro-Mediterranean proximity and AfCFTA access across manufacturing, agribusiness, energy, and tourism, with established infrastructure supporting export-led growth.`,
    pillars: [P_INFRA, P_AGRI, P_TOURISM],
    regionalAdvantages: [
      { icon: 'globe', value: 'EU', label: 'Euro-Med Access', sublabel: 'Association-agreement market access', accentClass: 'text-blue-300' },
      ADV_AFCFTA,
      { icon: 'globe', value: 'GAFTA', label: 'Arab FTA', sublabel: '18 Arab states duty-free', accentClass: 'text-blue-300' },
      { icon: 'users', label: 'Workforce', value: 'Skilled', sublabel: 'Manufacturing and services base', accentClass: 'text-emerald-300' },
    ],
  },
  west: {
    subtitle: 'ECOWAS resource and agribusiness economy at a value-add inflection point',
    heroFallback: (n) => `${n} offers opportunities across mining, agriculture value-add, and infrastructure, with ECOWAS market integration and AGOA duty-free U.S. access supporting export-led growth.`,
    pillars: [P_MINING, P_AGRI, P_INFRA],
    regionalAdvantages: [
      { icon: 'globe', value: '350M', label: 'ECOWAS Access', sublabel: 'West African market integration', accentClass: 'text-blue-300' },
      ADV_AGOA,
      ADV_AFCFTA,
      { icon: 'users', value: 'Coastal', label: 'Port Gateways', sublabel: 'Atlantic corridor logistics', accentClass: 'text-emerald-300' },
    ],
  },
  east: {
    subtitle: 'EAC/COMESA gateway economy at an agribusiness and manufacturing inflection point',
    heroFallback: (n) => `${n} offers opportunities across agriculture, EPZ manufacturing, energy, and logistics, with EAC/COMESA integration and AGOA access anchoring regional gateway positioning.`,
    pillars: [P_AGRI, P_INFRA, P_MINING],
    regionalAdvantages: [
      { icon: 'globe', value: '300M+', label: 'EAC Access', sublabel: 'East African single market', accentClass: 'text-blue-300' },
      { icon: 'globe', value: '560M', label: 'COMESA Access', sublabel: 'Eastern & Southern market', accentClass: 'text-blue-300' },
      ADV_AGOA,
      ADV_AFCFTA,
    ],
  },
  central: {
    subtitle: 'CEMAC resource economy at a diversification inflection point',
    heroFallback: (n) => `${n} offers resource-led opportunities across energy, mining, timber, and infrastructure, with CFA currency stability and CEMAC/AfCFTA market access supporting diversification.`,
    pillars: [P_MINING, P_INFRA, P_AGRI],
    regionalAdvantages: [
      { icon: 'globe', value: 'CEMAC', label: 'CFA Zone', sublabel: 'Central African monetary union', accentClass: 'text-blue-300' },
      ADV_AFCFTA,
      ADV_AGOA,
      { icon: 'users', value: 'Resources', label: 'Export Base', sublabel: 'Oil, gas, timber, minerals', accentClass: 'text-emerald-300' },
    ],
  },
  southern: {
    subtitle: 'SADC/COMESA mineral economy at a beneficiation and regional-integration inflection point',
    heroFallback: (n) => `${n} offers opportunities across mining and critical minerals, agriculture, and infrastructure, with SADC/COMESA integration and USD-linked mineral exports anchoring the investment thesis.`,
    pillars: [P_MINING, P_AGRI, P_INFRA],
    regionalAdvantages: [
      { icon: 'globe', value: 'SADC', label: 'Regional Access', sublabel: 'Southern African market 360M', accentClass: 'text-blue-300' },
      { icon: 'globe', value: 'COMESA', label: 'Market Access', sublabel: 'Eastern & Southern 560M', accentClass: 'text-blue-300' },
      ADV_AFCFTA,
      ADV_AGOA,
    ],
  },
};

interface CaribbeanOppProfile {
  subtitle: string;
  heroFallback: (name: string) => string;
  pillars: PillarSpec[];
  regionalAdvantages: RegionalAdvantage[];
}

const ADV_CBI: RegionalAdvantage = { icon: 'shield', value: 'CBI', label: 'U.S. Market Access', sublabel: 'Caribbean Basin Initiative preferences', accentClass: 'text-emerald-300' };
const ADV_CARICOM: RegionalAdvantage = { icon: 'globe', value: 'CARICOM', label: 'Regional Access', sublabel: '15-state single market & economy', accentClass: 'text-blue-300' };

const CARIBBEAN_OPP_PROFILES: Record<string, CaribbeanOppProfile> = {
  oecs: {
    subtitle: 'OECS tourism and real-estate economy with EC dollar stability',
    heroFallback: (n) => `${n} offers premium tourism, real-estate, and services opportunities with USD-pegged currency stability and CBI/CARICOM preferential market access.`,
    pillars: [P_TOURISM, P_SERVICES, P_INFRA],
    regionalAdvantages: [
      { icon: 'globe', value: 'XCD', label: 'Currency Peg', sublabel: 'USD peg removes FX risk', accentClass: 'text-emerald-300' },
      ADV_CBI,
      ADV_CARICOM,
      { icon: 'users', value: 'CIP', label: 'Investment Programs', sublabel: 'Citizenship-by-investment inflows', accentClass: 'text-blue-300' },
    ],
  },
  cariforum: {
    subtitle: 'CARIFORUM economy with tourism, logistics, and services depth',
    heroFallback: (n) => `${n} offers tourism, logistics, agribusiness, and services opportunities with CARIFORUM EPA and CBI access and proximity to the U.S. market.`,
    pillars: [P_TOURISM, P_INFRA, P_SERVICES],
    regionalAdvantages: [
      ADV_CARICOM,
      ADV_CBI,
      { icon: 'globe', value: 'EPA', label: 'EU Access', sublabel: 'CARIFORUM Economic Partnership', accentClass: 'text-blue-300' },
      { icon: 'users', value: 'USA', label: 'Proximity', sublabel: 'Nearshore U.S. market linkage', accentClass: 'text-emerald-300' },
    ],
  },
  territory: {
    subtitle: 'U.S./UK-linked territory with financial services and tourism depth',
    heroFallback: (n) => `${n} offers financial services, tourism, and logistics opportunities with USD-stable currency, strong rule-of-law, and direct U.S./UK market linkage.`,
    pillars: [P_SERVICES, P_TOURISM, P_INFRA],
    regionalAdvantages: [
      { icon: 'globe', value: 'USD', label: 'Currency', sublabel: 'USD or USD-pegged stability', accentClass: 'text-emerald-300' },
      { icon: 'shield', value: 'Law', label: 'Rule of Law', sublabel: 'U.S./UK legal frameworks', accentClass: 'text-blue-300' },
      { icon: 'users', value: 'IFS', label: 'Financial Services', sublabel: 'Funds and captive insurance', accentClass: 'text-emerald-300' },
      { icon: 'globe', value: 'USA', label: 'Proximity', sublabel: 'Direct U.S. market linkage', accentClass: 'text-blue-300' },
    ],
  },
};

function buildOpportunity(
  name: string,
  subtitle: string,
  heroFallback: string,
  pillars: PillarSpec[],
  regionalAdvantages: RegionalAdvantage[]
): CountryOpportunityContent {
  return {
    heroSubtitle: subtitle,
    heroFallback,
    pillars: pillars.map((p) => ({
      exportId: p.exportId,
      exportFileSlug: p.exportFileSlug,
      exportTitle: p.exportTitle,
      icon: p.icon,
      title: p.title,
      subtitle: p.subtitle,
      narrative: p.narrative(name),
      bullets: p.bullets,
      borderHover: p.borderHover,
      accentClass: p.accentClass,
      helpTerm: p.helpTerm,
    })),
    entryPoints: [
      { icon: 'building', title: 'Joint Ventures', body: `Partner with established local operators in ${name} for market entry and regulatory navigation` },
      { icon: 'trending', title: 'Private Equity', body: 'Growth-stage companies with regional expansion potential across priority sectors' },
      { icon: 'zap', title: 'Greenfield', body: 'New operations with incentive support and preferential market access where eligible' },
      { icon: 'dollar', title: 'Structured Finance', body: 'Project and trade finance via DFIs (DFC, MIGA, regional development banks)' },
    ],
    regionalAdvantages,
  };
}

/** Returns regional opportunity content for any non-pilot market, or null if unknown. */
export function regionalOpportunityContent(
  iso3: string,
  countryName: string
): CountryOpportunityContent | null {
  const sub = getAfricanSubRegion(iso3);
  if (sub) {
    const p = AFRICA_OPP_PROFILES[sub];
    return buildOpportunity(countryName, p.subtitle, p.heroFallback(countryName), p.pillars, p.regionalAdvantages);
  }
  const carib = getCaribbeanSubRegion(iso3);
  if (carib) {
    const p = CARIBBEAN_OPP_PROFILES[carib];
    return buildOpportunity(countryName, p.subtitle, p.heroFallback(countryName), p.pillars, p.regionalAdvantages);
  }
  return null;
}
