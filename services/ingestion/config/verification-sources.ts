/**
 * Authoritative URLs for evidence-backed verification jobs.
 *
 * Design:
 * - Program anchor pages (USTR) = stable citations, not eligibility lists.
 * - Year-specific beneficiary PDFs = definitive AGOA status.
 * - CBI: USTR anchor + Trade.gov parse attempt; fail closed to under_review.
 */

export const USTR_AGOA_PROGRAM_URL =
  'https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa';

/** USTR program anchor pages (stable citations — not year-specific beneficiary lists). */
export const USTR_CBI_PROGRAM_URL =
  'https://ustr.gov/issue-areas/trade-development/preference-programs/caribbean-basin-initiative-cbi';

export const USTR_AFRICA_DIRECTORY_URL = 'https://ustr.gov/countries-regions/africa';

/** Trade.gov CBI page — secondary beneficiary list parse attempt. */
export const USTR_CBI_TRADEGOV_URL = 'https://www.trade.gov/caribbean-basin-initiative-cbi';

/** @deprecated Use USTR_CBI_PROGRAM_URL for anchors; USTR_CBI_TRADEGOV_URL for list parse attempts. */
export const USTR_CBI_PAGE_URL = USTR_CBI_TRADEGOV_URL;

function agoaListUrl(year: number, variant: 'eligible_ineligible' | 'eligible_only'): string {
  if (variant === 'eligible_only') {
    return `https://ustr.gov/sites/default/files/${year}%20AGOA%20Eligible%20Countries.pdf`;
  }
  return `https://ustr.gov/sites/default/files/${year}%20AGOA%20Eligible%20and%20Ineligible%20Countries.pdf`;
}

/**
 * Year-specific AGOA beneficiary list PDFs (USTR).
 * Verification tries newest first; additional years reduce single-point-of-failure if filenames shift.
 */
/** Working USTR-hosted list (discovered 2026-06 from program page). */
export const USTR_AGOA_LIST_2024_DISCOVERED =
  'https://ustr.gov/sites/default/files/2024%20List%20of%20AGOA%20Eligible%20and%20Ineligible%20Countries%2011162023.pdf';

export const USTR_AGOA_LIST_ARTIFACTS: Array<{
  label: string;
  url: string;
  effectiveYear: number;
}> = [
  { label: 'AGOA eligible and ineligible (2024 discovered)', url: USTR_AGOA_LIST_2024_DISCOVERED, effectiveYear: 2024 },
  { label: 'AGOA eligible and ineligible (2025)', url: agoaListUrl(2025, 'eligible_ineligible'), effectiveYear: 2025 },
  { label: 'AGOA eligible and ineligible (2024)', url: agoaListUrl(2024, 'eligible_ineligible'), effectiveYear: 2024 },
  { label: 'AGOA eligible countries (2024)', url: agoaListUrl(2024, 'eligible_only'), effectiveYear: 2024 },
  { label: 'AGOA eligible and ineligible (2023)', url: agoaListUrl(2023, 'eligible_ineligible'), effectiveYear: 2023 },
  { label: 'AGOA eligible countries (2023)', url: agoaListUrl(2023, 'eligible_only'), effectiveYear: 2023 },
  { label: 'AGOA eligible and ineligible (2022)', url: agoaListUrl(2022, 'eligible_ineligible'), effectiveYear: 2022 },
  { label: 'AGOA eligible countries (2022)', url: agoaListUrl(2022, 'eligible_only'), effectiveYear: 2022 },
  { label: 'AGOA eligible and ineligible (2021)', url: agoaListUrl(2021, 'eligible_ineligible'), effectiveYear: 2021 },
  { label: 'AGOA eligible countries (2021)', url: agoaListUrl(2021, 'eligible_only'), effectiveYear: 2021 },
  { label: 'AGOA eligible and ineligible (2020)', url: agoaListUrl(2020, 'eligible_ineligible'), effectiveYear: 2020 },
  { label: 'AGOA eligible countries (2020)', url: agoaListUrl(2020, 'eligible_only'), effectiveYear: 2020 },
];

/** Landing page for discovering moved/renamed annual AGOA list PDFs (capture as artifact only). */
export const USTR_AGOA_PROGRAM_DISCOVERY_URL = USTR_AGOA_PROGRAM_URL;

export const AU_AFCFTA_URL = 'https://au.int/en/ti/cfta/about/about-the-afcfta';

export const ECOWAS_MEMBERS_URL = 'https://www.ecowas.int/';

export const CARICOM_HOME_URL = 'https://caricom.org/';

export const CARICOM_MEMBERS_URL =
  'https://caricom.org/member-states-and-associate-members/';

export const CARICOM_ASSOCIATE_MEMBERS_URL = CARICOM_MEMBERS_URL;

/** IMF WEO SDMX — annual indicators per country. */
export const IMF_WEO_BASE = 'https://dataservices.imf.org/REST/SDMX_JSON.svc/CompactData/WEO';

export const IMF_WEO_INDICATORS = {
  debt_to_gdp_pct: 'GGXWDG_NGDP',
  fiscal_balance_pct_gdp: 'GGXONLB_NGDP',
} as const;

/** IMF AREAER country notes (HTML index). */
export const IMF_AREAER_INDEX_URL =
  'https://www.imf.org/en/Publications/Annual-Report-on-Exchange-Arrangements-and-Exchange-Restrictions';

export const WORLD_BANK_WGI_CODES: Record<string, string> = {
  wgi_control_of_corruption: 'CC.EST',
  wgi_government_effectiveness: 'GE.EST',
  wgi_political_stability: 'PV.EST',
  wgi_rule_of_law: 'RL.EST',
  wgi_regulatory_quality: 'RQ.EST',
  wgi_voice_accountability: 'VA.EST',
};
