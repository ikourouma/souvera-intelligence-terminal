/**
 * Structural data gap registry — markets where Top 20 coverage is constrained
 * by the market's own institutional structure, not by Souvera's pipeline.
 *
 * Source: Phase 0X audit 2026-06-10 (docs/data/74-market-coverage-audit-2026-06-10.md).
 * These markets are NOT broken — they are honest about what international
 * statistical databases actually publish.
 */

export type DataGapTier = 'structural' | 'near_threshold';

export interface StructuralDataGap {
  iso3: string;
  name: string;
  top20Score: number;
  tier: DataGapTier;
  /** Short headline shown in the amber badge */
  headline: string;
  /** Full disclaimer shown on expand — specific to the institutional reason */
  disclaimer: string;
  /** Primary source that does exist (if any) */
  availableSource?: string;
}

export const STRUCTURAL_DATA_GAPS: StructuralDataGap[] = [
  {
    iso3: 'ERI',
    name: 'Eritrea',
    top20Score: 8,
    tier: 'structural',
    headline: 'Limited macro data — government reporting suspended',
    disclaimer:
      'Eritrea has not published standard macroeconomic series to the IMF or World Bank since 2019. ' +
      'Data gaps reflect a government decision to restrict data sharing with international institutions, ' +
      'not a Souvera platform limitation. Available indicators (population, electricity access, ' +
      'internet penetration, urban population) are sourced from UN agency surveys that operate ' +
      'independently of government cooperation.',
    availableSource: 'UN agency surveys (UNDP, ITU, WHO)',
  },
  {
    iso3: 'SSD',
    name: 'South Sudan',
    top20Score: 11,
    tier: 'structural',
    headline: 'Limited macro data — youngest nation, developing statistical system',
    disclaimer:
      'South Sudan, established as an independent state in July 2011, has limited availability of ' +
      'historical macroeconomic series in international databases. GDP, trade flow, and financial ' +
      'sector data are incomplete as the National Bureau of Statistics continues to develop its ' +
      'reporting infrastructure. Coverage will improve as the national statistical system matures ' +
      'and IMF Article IV consultations accumulate a longer historical record.',
    availableSource: 'IMF WEO projections, UNDP Human Development Reports',
  },
  {
    iso3: 'CUB',
    name: 'Cuba',
    top20Score: 12,
    tier: 'structural',
    headline: 'Limited macro data — restricted participation in international databases',
    disclaimer:
      "Cuba's participation in standard IMF Article IV consultations and World Bank development " +
      'indicators reporting is limited by its current economic and financial arrangements. ' +
      'Financial sector, FDI, inflation, and reserves data are not available through the ' +
      'international databases Souvera sources from. Trade data from UN Comtrade and demographic ' +
      'indicators from UNDP are available and displayed where present.',
    availableSource: 'UN Comtrade, UNDP, ECLAC/CEPAL',
  },
  {
    iso3: 'PRI',
    name: 'Puerto Rico',
    top20Score: 13,
    tier: 'structural',
    headline: 'Limited macro data — US territory tracked through federal systems',
    disclaimer:
      'Puerto Rico is a US Commonwealth territory. Economic and financial statistics are reported ' +
      'through US federal systems — the Bureau of Economic Analysis (BEA) and US Census Bureau — ' +
      'rather than through standard World Bank or IMF country-level databases. Key series such as ' +
      'CPI inflation, FDI, current account balance, and reserves follow US Treasury and Federal ' +
      'Reserve reporting frameworks that are not mapped to standard international country series. ' +
      'This reflects the institutional structure of a US territory, not a data quality issue.',
    availableSource: 'US BEA, US Census Bureau, Federal Reserve',
  },
  {
    iso3: 'VGB',
    name: 'British Virgin Islands',
    top20Score: 5,
    tier: 'structural',
    headline: 'Minimal macro data — UK overseas territory, no independent statistical office',
    disclaimer:
      'The British Virgin Islands is a UK Overseas Territory with no independent central bank, ' +
      'no national statistical office, and no participation in standard IMF Article IV ' +
      'consultations as an independent country. National accounts, trade flows, inflation, and ' +
      'financial sector data are not reported to World Bank or IMF country-level databases. ' +
      'The BVI operates primarily as an international financial centre; economic activity is ' +
      'dominated by offshore financial services that are structurally excluded from standard ' +
      'macroeconomic reporting.',
    availableSource: 'BVI Financial Services Commission (partial)',
  },
  {
    iso3: 'TCA',
    name: 'Turks and Caicos Islands',
    top20Score: 9,
    tier: 'structural',
    headline: 'Limited macro data — UK overseas territory, no independent national accounts',
    disclaimer:
      'The Turks and Caicos Islands is a UK Overseas Territory without an independent central ' +
      'bank or national statistical office. Standard macroeconomic series — including trade ' +
      'flows, CPI inflation, reserves, and current account balances — are not reported to ' +
      'the World Bank or IMF country databases that Souvera sources from. Available data ' +
      'covers demographic and infrastructure indicators from UN agencies.',
    availableSource: 'UN agency surveys (ITU, WHO, UNDP)',
  },
];

/** Lookup a structural gap by ISO3 — returns null if the market has full coverage */
export function getStructuralDataGap(iso3: string): StructuralDataGap | null {
  return STRUCTURAL_DATA_GAPS.find((g) => g.iso3 === iso3) ?? null;
}

/** ISO3 set for fast membership checks */
export const STRUCTURAL_GAP_ISO3 = new Set(STRUCTURAL_DATA_GAPS.map((g) => g.iso3));
