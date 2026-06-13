/**
 * Curated AGOA eligibility + legislative timeline data.
 * Sourced from USTR public guidance; used as API fallback when DB is empty.
 * @see docs/strategy/agoa-afcfta-trade-intelligence-assessment.md
 */

export type AgoaDbStatus =
  | 'eligible'
  | 'suspended'
  | 'graduated'
  | 'ineligible'
  | 'not_applicable'
  | 'under_review';

export interface AgoaCountryRecord {
  country_iso3: string;
  country_name: string;
  agoa_status: AgoaDbStatus;
  agoa_apparel_eligible: boolean;
  agoa_eligible_since?: string;
  agoa_suspension_date?: string;
  agoa_notes?: string;
  /** Internal audit — not printed in client PDF body. */
  agoa_source_url: string;
  /** Client attribution name (e.g. USTR). */
  agoa_source_name?: string;
  /** Machine-readable as-of stamp. */
  agoa_as_of_date: string;
  /** Client display label for list vintage (e.g. 2025 USTR AGOA eligibility list). */
  agoa_as_of_label?: string;
  agoa_last_reviewed_at: string;
}

export interface AgoaLegislativeEvent {
  id: string;
  date: string;
  title: string;
  summary: string;
  status: 'active' | 'upcoming' | 'completed' | 'watchpoint';
  impact: 'high' | 'medium';
  source_url?: string;
  affected_iso3?: string[];
}

export const AGOA_SOURCE_URL =
  'https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa';

export const AGOA_LEGISLATIVE_EVENTS: AgoaLegislativeEvent[] = [
  {
    id: 'agoa-reauth-2026',
    date: '2025-12-31',
    title: 'AGOA Temporary Reauthorization Through December 31, 2026',
    summary:
      'Congress extended AGOA preferential access through end of 2026. Long-term reauthorization and modernization remain under active legislative review.',
    status: 'active',
    impact: 'high',
    source_url: AGOA_SOURCE_URL,
  },
  {
    id: 'ustr-modernization-2026',
    date: '2026-05-15',
    title: 'USTR AGOA Modernization Consultation — Comments Due',
    summary:
      'USTR solicited stakeholder input on AGOA program modernization, eligibility criteria, and sector-specific preferences ahead of reauthorization debate.',
    status: 'completed',
    impact: 'high',
    source_url: AGOA_SOURCE_URL,
  },
  {
    id: 'annual-eligibility-review-2026',
    date: '2026-01-15',
    title: '2026 Presidential AGOA Eligibility Determinations',
    summary:
      'Annual review maintained eligibility for qualifying sub-Saharan African countries. Several countries remain under enhanced monitoring for governance and labor criteria.',
    status: 'completed',
    impact: 'high',
    source_url: AGOA_SOURCE_URL,
  },
  {
    id: 'nga-restoration-review',
    date: '2026-06-30',
    title: 'Nigeria AGOA Restoration — Legislative Watchpoint',
    summary:
      'Nigeria AGOA status is reconciled against the USTR beneficiary list (Evidence Vault). Historical 2015 suspension and restoration proposals remain a policy watchpoint — confirm current eligibility on the Trade tab before export planning.',
    status: 'watchpoint',
    impact: 'high',
    affected_iso3: ['NGA'],
    source_url: AGOA_SOURCE_URL,
  },
  {
    id: 'apparel-third-country-2026',
    date: '2026-09-30',
    title: 'AGOA Apparel Third-Country Fabric Rule — Renewal Window',
    summary:
      'Third-country fabric provision for apparel exports remains critical for Kenya, Ghana, and Lesotho EPZ manufacturers. Renewal timing affects sourcing decisions for 2027 orders.',
    status: 'upcoming',
    impact: 'medium',
    affected_iso3: ['KEN', 'GHA', 'LSO', 'MDG'],
    source_url: AGOA_SOURCE_URL,
  },
  {
    id: 'reauth-deadline-2027',
    date: '2027-01-01',
    title: 'AGOA Reauthorization Deadline — Post-2026 Cliff Risk',
    summary:
      'Without further congressional action, AGOA preferences lapse after December 31, 2026. Exporters should model dual tariff scenarios for 2027 planning.',
    status: 'upcoming',
    impact: 'high',
    source_url: AGOA_SOURCE_URL,
  },
];

/** Pilot + major economies — curated editorial overrides (merged into full 54-country coverage) */
export const AGOA_CURATED_OVERRIDES: AgoaCountryRecord[] = [
  {
    country_iso3: 'KEN',
    country_name: 'Kenya',
    agoa_status: 'eligible',
    agoa_apparel_eligible: true,
    agoa_eligible_since: '2000-01-01',
    agoa_notes:
      'Active AGOA beneficiary. Leading apparel (EPZ), horticulture, coffee, and nut exports under preferential access. Third-country fabric rule critical for textile supply chains.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'GHA',
    country_name: 'Ghana',
    agoa_status: 'eligible',
    agoa_apparel_eligible: true,
    agoa_eligible_since: '2000-01-01',
    agoa_notes: 'Eligible. Cocoa, cashew, apparel, and processed food exports benefit from duty-free U.S. access.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'ZAF',
    country_name: 'South Africa',
    agoa_status: 'eligible',
    agoa_apparel_eligible: true,
    agoa_eligible_since: '2000-01-01',
    agoa_notes:
      'Eligible with ongoing review of agricultural and automotive export provisions. AGOA reauthorization timing affects auto component supply chains.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'ETH',
    country_name: 'Ethiopia',
    agoa_status: 'suspended',
    agoa_apparel_eligible: false,
    agoa_suspension_date: '2022-01-01',
    agoa_notes: 'Suspended from AGOA eligibility. Apparel and leather exports previously benefited from preferential access.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'UGA',
    country_name: 'Uganda',
    agoa_status: 'eligible',
    agoa_apparel_eligible: true,
    agoa_eligible_since: '2000-01-01',
    agoa_notes: 'Eligible. Coffee, apparel, and agricultural exports under active AGOA utilization.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'TZA',
    country_name: 'Tanzania',
    agoa_status: 'eligible',
    agoa_apparel_eligible: false,
    agoa_eligible_since: '2000-01-01',
    agoa_notes: 'Eligible. Cashew, coffee, and textile exports; apparel provisions under monitoring.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'RWA',
    country_name: 'Rwanda',
    agoa_status: 'eligible',
    agoa_apparel_eligible: false,
    agoa_eligible_since: '2000-01-01',
    agoa_notes: 'Eligible. Coffee, tea, and specialty agriculture; used apparel import restrictions previously reviewed by USTR.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'SEN',
    country_name: 'Senegal',
    agoa_status: 'eligible',
    agoa_apparel_eligible: false,
    agoa_eligible_since: '2000-01-01',
    agoa_notes: 'Eligible. Fisheries, agriculture, and light manufacturing exports.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'CIV',
    country_name: "Côte d'Ivoire",
    agoa_status: 'eligible',
    agoa_apparel_eligible: false,
    agoa_eligible_since: '2000-01-01',
    agoa_notes: 'Eligible. Cocoa, cashew, and rubber exports with strong U.S. market linkage.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'MOZ',
    country_name: 'Mozambique',
    agoa_status: 'eligible',
    agoa_apparel_eligible: false,
    agoa_eligible_since: '2000-01-01',
    agoa_notes: 'Eligible. Aluminum, agriculture, and energy-linked exports.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'ZMB',
    country_name: 'Zambia',
    agoa_status: 'eligible',
    agoa_apparel_eligible: false,
    agoa_eligible_since: '2000-01-01',
    agoa_notes: 'Eligible. Copper-adjacent manufacturing and agricultural exports.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'BFA',
    country_name: 'Burkina Faso',
    agoa_status: 'suspended',
    agoa_apparel_eligible: false,
    agoa_suspension_date: '2022-01-01',
    agoa_notes: 'Suspended from AGOA. Cotton and gold exports previously utilized preferential access.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'MLI',
    country_name: 'Mali',
    agoa_status: 'suspended',
    agoa_apparel_eligible: false,
    agoa_suspension_date: '2022-01-01',
    agoa_notes: 'Suspended from AGOA eligibility.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'GIN',
    country_name: 'Guinea',
    agoa_status: 'suspended',
    agoa_apparel_eligible: false,
    agoa_suspension_date: '2022-01-01',
    agoa_notes: 'Suspended from AGOA. Bauxite and mining exports subject to standard U.S. tariffs.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'MUS',
    country_name: 'Mauritius',
    agoa_status: 'graduated',
    agoa_apparel_eligible: false,
    agoa_notes: 'Graduated from AGOA — upper-middle income threshold reached. Bilateral trade continues under standard WTO terms.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'BWA',
    country_name: 'Botswana',
    agoa_status: 'graduated',
    agoa_apparel_eligible: false,
    agoa_notes: 'Graduated from AGOA. Diamonds and beef exports continue under standard trade frameworks.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'NAM',
    country_name: 'Namibia',
    agoa_status: 'graduated',
    agoa_apparel_eligible: false,
    agoa_notes: 'Graduated from AGOA eligibility.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'COD',
    country_name: 'DRC',
    agoa_status: 'eligible',
    agoa_apparel_eligible: false,
    agoa_eligible_since: '2000-01-01',
    agoa_notes: 'Eligible. Critical minerals and agriculture under enhanced due diligence frameworks.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
  {
    country_iso3: 'AGO',
    country_name: 'Angola',
    agoa_status: 'eligible',
    agoa_apparel_eligible: false,
    agoa_eligible_since: '2000-01-01',
    agoa_notes: 'Eligible. Energy diversification and agricultural export potential under AGOA.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_as_of_date: '2026-01-15',
    agoa_last_reviewed_at: '2026-01-15T00:00:00Z',
  },
];
