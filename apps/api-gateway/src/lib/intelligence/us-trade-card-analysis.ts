/**
 * Curated executive Souvera analysis for US Trade Relationship card exports.
 * Used as deterministic fallback when AI is unavailable; also feeds AI prompts.
 */

import { formatCurrency } from '@/lib/intelligence-entitlements';
import type { AgoaPolicyUiSnapshot, CountryTrade, UstrTradeSummaryPayload } from '@/types/country-intelligence';
import { getCountryRegion } from '@/lib/intelligence/country-overview-content';
import { buildAgoaUtilizationNarrative } from '@/lib/intelligence/agoa-export-profile';
import { petroleumExclusionFootnote } from '@/lib/intelligence/preferential-trade-policy';

/** USTR Africa hub — policy context citation only (not a primary numeric source). */
export const USTR_AFRICA_HUB_URL = 'https://ustr.gov/countries-regions/africa';

const USTR_AFRICA_POLICY_CONTEXT =
  'USTR\'s Office of African Affairs coordinates U.S. trade policy across sub-Saharan Africa under AGOA and AfCFTA engagement — see the official USTR Africa hub for program context (policy framing only; Souvera headline figures remain Census/USITC).';

function fmt(value?: number | null): string {
  if (value == null) return 'N/A';
  return formatCurrency(value);
}

export interface UsTradeAnalysisInput {
  countryName: string;
  iso3: string;
  trade: CountryTrade;
  agoaPolicy?: AgoaPolicyUiSnapshot;
  ustrTradeSummary?: UstrTradeSummaryPayload;
}

/** Three-paragraph executive analysis for PNG export and API fallback. */
export function buildUsTradeCardAnalysis({
  countryName,
  iso3,
  trade,
  agoaPolicy,
  ustrTradeSummary,
}: UsTradeAnalysisInput): string {
  const key = iso3.toUpperCase();
  const agoa = trade.agoa;
  const exportsToUs = trade.exportsToUs?.valueUsd;
  const importsFromUs = trade.importsFromUs?.valueUsd;
  let exportYoy = trade.exportsToUs?.yoyPct;
  const importYoy = trade.importsFromUs?.yoyPct;
  if (exportYoy == null && ustrTradeSummary?.metrics?.length) {
    const ustrExp = ustrTradeSummary.metrics
      .filter((m) => m.scope === 'us_imports_from_country')
      .sort((a, b) => b.year - a.year)[0];
    if (ustrExp?.yoyPct != null && ustrExp.yoyDirection) {
      exportYoy = ustrExp.yoyDirection === 'down' ? -Math.abs(ustrExp.yoyPct) : ustrExp.yoyPct;
    }
  }
  const year = trade.exportsToUs?.year ?? trade.asOfYear ?? new Date().getFullYear();
  const isCaribbean = getCountryRegion(key) === 'caribbean';
  const isRestoration = agoa?.status === 'restoration_opportunity';
  const preferentialLabel = isCaribbean ? 'CBI/CARICOM' : 'AGOA';

  const bilateralTotal =
    exportsToUs != null && importsFromUs != null ? exportsToUs + importsFromUs : null;

  const p1 = [
    `The United States ranks among ${countryName}'s most strategically important bilateral partners, with ${fmt(exportsToUs)} in exports and ${fmt(importsFromUs)} in imports recorded for ${year}.`,
    exportYoy != null
      ? `Export flows ${exportYoy >= 0 ? 'expanded' : 'contracted'} ${Math.abs(exportYoy)}% year-over-year, signalling ${exportYoy >= 0 ? 'sustained demand for ' + countryName + '-origin goods in U.S. supply chains' : 'near-term headwinds in U.S. offtake'}.`
      : '',
    importYoy != null
      ? `U.S. supply into ${countryName} ${importYoy >= 0 ? 'grew' : 'eased'} ${Math.abs(importYoy)}% YoY, reflecting capital goods, energy inputs, and consumer durables that anchor domestic production capacity.`
      : '',
    bilateralTotal != null
      ? `Combined two-way trade of ${fmt(bilateralTotal)} positions the corridor as a core channel for both export revenue diversification and import substitution planning.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Substantive policy nuances are surfaced from the Evidence Vault note so the narrative
  // (not the card body) carries country-specific context such as textile/apparel eligibility,
  // apparel suspensions, reinstatements, or the grounds for an AGOA termination.
  const notesLc = (agoaPolicy?.notes ?? '').toLowerCase();
  const eligibilityNuance = !isCaribbean
    ? notesLc.includes('textile and apparel') || notesLc.includes('textile/apparel') || notesLc.includes('apparel benefits eligible')
      ? ` ${countryName} additionally qualifies for AGOA's textile and apparel provisions — the highest-value preference category for many sub-Saharan exporters.`
      : notesLc.includes('apparel benefits suspended') || (notesLc.includes('apparel') && notesLc.includes('suspend'))
        ? ` Note that ${countryName}'s AGOA apparel benefits remain suspended; preferences continue to apply across its other qualifying categories.`
        : notesLc.includes('reinstated')
          ? ` ${countryName} was reinstated as an AGOA beneficiary after meeting USTR's eligibility benchmarks.`
          : ''
    : notesLc.includes('textile') || notesLc.includes('apparel')
      ? ` ${countryName} may qualify for CBI textile and apparel provisions where CBTPA rules-of-origin are met.`
      : '';
  const ineligibilityNuance = !isCaribbean
    ? notesLc.includes('coup') || notesLc.includes('unconstitutional change of government')
      ? ` ${countryName}'s removal followed an unconstitutional change of government — one of the conditions that triggers AGOA termination.`
      : notesLc.includes('human-rights') || notesLc.includes('human rights')
        ? ` ${countryName}'s designation was withdrawn over concerns about internationally recognised human rights.`
        : notesLc.includes('graduated')
          ? ` ${countryName} no longer qualifies as a developing beneficiary, having graduated from GSP/AGOA developing-country status.`
          : ''
    : '';

  let p2: string;
  if (!agoa || agoa.status === 'not_applicable') {
    p2 = `${countryName} operates outside ${preferentialLabel} geographic scope; U.S. market access runs through MFN tariff schedules and any bilateral trade frameworks in force. Exporters should model landed cost against FTA-equipped competitors in Asia and Latin America, and monitor USTR Trade Policy Agenda updates for sector-specific watchpoints. SOUVERA tracks policy registry changes and tariff line exposure to flag contract-renewal risk ahead of procurement cycles.`;
  } else if (agoa.status === 'ineligible') {
    p2 = `${countryName} is not a current AGOA beneficiary.${ineligibilityNuance} Although it sits within AGOA's sub-Saharan geographic scope, its goods enter the United States under standard MFN tariff rates rather than the program's duty-free preferences — bilateral exports to the U.S. of ${fmt(exportsToUs)} therefore carry no AGOA treatment today (a reflection of eligibility status, not absence of trade). Enacted in 2000 and authorised through 2025, AGOA is reviewed annually by USTR against statutory criteria spanning the rule of law, political pluralism, internationally recognised worker rights, and human-rights protections; re-designation requires demonstrable progress on the specific benchmarks USTR sets for each country. SOUVERA tracks Evidence Vault policy status and tariff-line exposure so operators can price landed cost under MFN today and quantify the duty-free upside if eligibility is restored.`;
  } else if (isRestoration) {
    const upside = agoa.restorationPotentialUsd ?? agoa.potentialExportsUsd;
    p2 = `${preferentialLabel} benefits are currently suspended for ${countryName}${agoaPolicy?.suspensionSinceYear ? ` (since ${agoaPolicy.suspensionSinceYear})` : ''}. Exporters today ship under MFN tariff rates — total bilateral exports to the U.S. are ${fmt(agoa.totalExportsToUsUsd ?? exportsToUs)}, while current ${preferentialLabel} preferential volume is $0 under suspension (this reflects policy status, not absence of trade). SOUVERA's Restoration Upside of ${fmt(upside)} combines the eligible export base (non-petroleum categories) plus estimated tariff savings if eligibility is reinstated — it is not a fraction of today's MFN total, but the value unlocked by duty-free access on qualifying lines.`;
  } else if (isCaribbean) {
    const closingLine = `${countryName}'s current CBI preferential exports stand at ${fmt(agoa.currentExportsUsd)}, against a modeled export potential of ${fmt(agoa.potentialExportsUsd)} — a gap that reflects under-utilisation of preferences in agriculture, processed foods, apparel, and light manufacturing rather than market absence. Crude petroleum remains excluded from CBI preferences; SOUVERA's non-oil export lens is the actionable frame for diversification and rules-of-origin compliance planning.`;
    p2 = `${countryName} holds preferential U.S. market access under the Caribbean Basin Initiative (CBI) and, where applicable, the Caribbean Basin Trade Partnership Act (CBTPA) and CARICOM-linked frameworks — securing duty-free or reduced-duty entry for qualifying goods shipped from the region.${eligibilityNuance} CBI has been the centrepiece of U.S.–Caribbean trade engagement alongside nearshore services corridors. Bilateral exports to the U.S. of ${fmt(exportsToUs ?? agoa.totalExportsToUsUsd)} anchor the corridor; ${closingLine}`;
  } else {
    const utilizationNarrative = buildAgoaUtilizationNarrative({
      iso3: key,
      countryName,
      currentExportsUsd: agoa.currentExportsUsd,
      totalExportsToUsUsd: agoa.totalExportsToUsUsd,
      trend: agoa.trend,
    });
    const closingLine = utilizationNarrative
      ? utilizationNarrative
      : `${countryName}'s current AGOA preferential exports stand at ${fmt(agoa.currentExportsUsd)}, against a modeled export potential of ${fmt(agoa.potentialExportsUsd ?? agoa.restorationPotentialUsd)} — a gap that reflects under-utilisation of preferences in agriculture, processed foods, apparel, and light manufacturing rather than market absence. Crude petroleum remains excluded from AGOA preferences; SOUVERA's non-oil export lens is the actionable frame for diversification and AGOA compliance planning.`;
    p2 = `${countryName} is a designated AGOA beneficiary on USTR's sub-Saharan Africa list, securing duty-free U.S. entry for almost all qualifying products — roughly 1,800 AGOA-specific tariff lines layered on the ~5,000-line GSP schedule (~6,500 duty-free lines in total).${eligibilityNuance} Enacted in 2000 and authorised through 2025, AGOA has been the centrepiece of U.S.–Africa trade engagement: it is designed to expand and diversify African exports while rewarding continued progress on the rule of law, political pluralism, and worker rights. ${closingLine}`;
  }

  const reauthFramework = isCaribbean ? 'CBI/CBTPA' : 'AGOA';
  const statusLabel = agoaPolicy?.statusLabel ?? (isRestoration ? 'Suspended' : isCaribbean ? 'CBI eligible' : 'Eligible');
  const p3 = [
    `For institutional investors and export operators, the near-term policy watchpoint is ${reauthFramework} reauthorisation and USTR program reviews — ${statusLabel} status today directly affects long-term offtake contracts and working-capital pricing on trade finance.`,
    agoa?.statusNote ? agoa.statusNote : '',
    !isCaribbean ? USTR_AFRICA_POLICY_CONTEXT : '',
    `SOUVERA recommends anchoring corridor strategy on three levers: (1) rules-of-origin compliance for preferential lines, (2) logistics and L/C structures that preserve margin under tariff uncertainty, and (3) sector selection aligned with U.S. import demand signals in the Supply-Demand Matrix.`,
    `Data vintage: ${agoa?.dataSource ?? 'UN Comtrade / USITC'}${agoa?.dataVintage ? ` · ${agoa.dataVintage}` : ''}. ${petroleumExclusionFootnote(iso3)}`,
  ]
    .filter(Boolean)
    .join(' ');

  return [p1, p2, p3].join('\n\n');
}

export interface TradeCardAnalysisInput {
  cardType: string;
  countryName: string;
  iso3: string;
  data: Record<string, string | number | null | undefined>;
}

/** Curated multi-paragraph fallbacks for other Trade tab export cards. */
export function buildTradeTabCardAnalysis(input: TradeCardAnalysisInput): string {
  const { cardType, countryName, iso3, data } = input;
  const d = (key: string) => (data[key] != null ? String(data[key]) : 'N/A');
  const isCaribbean = getCountryRegion(iso3.toUpperCase()) === 'caribbean';
  const prefLabel = isCaribbean ? 'CBI/CARICOM' : 'AGOA/AfCFTA';

  switch (cardType) {
    case 'intra_regional': {
      const p1 = `${countryName}'s intra-regional trade profile shows ${d('Primary Volume')} in primary corridor volume${data['Secondary Volume'] ? ` and ${d('Secondary Volume')} in secondary regional flows` : ''}. These flows underpin re-export models, regional value chains, and AfCFTA/CARICOM duty-free routing that reduce landed cost versus third-country imports.`;
      const p2 = `Top regional partner concentration — ${d('Top Partner')} — indicates where logistics investments, bonded warehouse capacity, and cross-border payment rails deliver the highest marginal return. SOUVERA monitors corridor friction (customs dwell time, rules of origin, infrastructure scores) as leading indicators of whether regional share gains are sustainable or cyclical.`;
      const p3 = `Export operators should align inventory and working-capital cycles with regional partner demand seasonality, and stress-test AfCFTA/ECOWAS/CARICOM certificate-of-origin requirements before scaling multi-country distribution.`;
      return [p1, p2, p3].join('\n\n');
    }
    case 'trade_partners': {
      const p1 = `${countryName}'s trade partner matrix is led by ${d('Partner 1')}, ${d('Partner 2')}, and ${d('Partner 3')}, reflecting a mix of commodity offtake, capital-goods supply, and regional re-export corridors. Partner concentration creates both scale advantages (bulk shipping, familiar L/C structures) and single-market dependency risk when commodity prices or policy regimes shift.`;
      const p2 = `The U.S. corridor typically combines energy or agriculture exports with machinery and transport-equipment imports — a pattern that links ${preferentialLabel(countryName, data)} market access to domestic industrialisation goals. Chinese and EU partners often dominate import share, which has implications for FX exposure, supplier diversification, and local content policy compliance.`;
      const p3 = `SOUVERA's partner lens prioritises total-trade depth, bilateral balance, and badge status (AGOA/CBI eligibility) over headline GDP rank — the actionable insight is which relationships support preferential export growth versus import-substitution manufacturing.`;
      return [p1, p2, p3].join('\n\n');
    }
    case 'trade_composition': {
      const p1 = `${countryName}'s ${d('Direction')} composition is anchored by ${d('Top Sector 1')} (${d('Top Share 1')}) and ${d('Top Sector 2')} (${d('Top Share 2')}), with total ${d('Direction')} value of ${d('Total Value')}. Sector concentration signals where tariff preferences, logistics bottlenecks, and price volatility have the greatest P&L impact.`;
      const p2 = `High share in extractives or single-commodity lines amplifies terms-of-trade risk but can fund diversification into processing and light manufacturing — the classic ${prefLabel} value-add play. Import composition dominated by machinery and transport equipment indicates capital formation and infrastructure build-out, while food and chemical import shares flag consumer-market and agro-input dependencies.`;
      const p3 = `SOUVERA maps sector shares against U.S. demand signals and regional supply gaps to identify where ${countryName} can capture margin through processing, not just volume through raw exports.`;
      return [p1, p2, p3].join('\n\n');
    }
    case 'regional_agreements': {
      const p1 = `${countryName} participates in ${d('Agreement 1')}, anchoring regional market access and rules-of-origin frameworks that shape export competitiveness beyond bilateral corridors.`;
      const p2 = `${isCaribbean ? 'CBI/CARICOM' : 'AGOA/AfCFTA'}, ECOWAS, CARICOM, and WTO memberships interact — preferential access to the U.S. often complements (rather than substitutes for) intra-regional duty-free routing. SOUVERA tracks Evidence Vault status for each framework to flag when eligibility changes invalidate prior export certificates.`;
      const p3 = `Operators should map product lines to the agreement with the highest tariff margin and lowest compliance friction, then stress-test certificate-of-origin requirements before scaling multi-market distribution from ${countryName}.`;
      return [p1, p2, p3].join('\n\n');
    }
    case 'trade_finance': {
      const p1 = `${countryName} export and import operators access structured finance through ECAs, development finance institutions, and partner-bank L/C desks — channels mapped in SOUVERA's Trade Finance panel. Political risk insurance (MIGA/DFC) and Afreximbank-style supply-chain facilities are particularly relevant for cross-border manufacturing and commodity exports with long settlement cycles.`;
      const p2 = `Trade finance availability often gates SME participation in preferential export programmes: without confirmed L/C or ECA cover, ${isCaribbean ? 'CBI-eligible' : 'AGOA-eligible'} goods may remain uncompetitive despite zero tariffs. Currency convertibility, central-bank FX policy, and correspondent-banking depth determine whether export proceeds can be repatriated on schedule — a non-tariff barrier as binding as duty rates.`;
      const p3 = `Institutional investors should underwrite corridor exposure only where finance mapping, policy registry status, and sector demand signals align; SOUVERA integrates all three in the Trade tab for ${countryName}.`;
      return [p1, p2, p3].join('\n\n');
    }
    default:
      return `${countryName} trade intelligence powered by SOUVERA's data-driven analysis framework.`;
  }
}

function preferentialLabel(_countryName: string, data: Record<string, string | number | null | undefined>): string {
  return data['Preferential Framework'] != null ? String(data['Preferential Framework']) : 'AGOA/CBI';
}
