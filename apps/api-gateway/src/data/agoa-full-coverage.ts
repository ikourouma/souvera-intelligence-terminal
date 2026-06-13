/**
 * @deprecated Seed / UI fallback only — NOT the publishing authority for institutional reports.
 * Authoritative AGOA status: `souvera_country_policy_status` (framework=AGOA) from verify:ustr:agoa.
 */

import { APPROVED_AFRICA_ISO3 } from '../lib/market-coverage';
import { countryDisplayName } from '../lib/intelligence/country-names';
import {
  AGOA_CURATED_OVERRIDES,
  AGOA_LEGISLATIVE_EVENTS,
  AGOA_SOURCE_URL,
  type AgoaCountryRecord,
  type AgoaDbStatus,
  type AgoaLegislativeEvent,
} from './agoa-legislative-tracker';

/** @deprecated Use USTR reconciliation output instead of static buckets. */
function defaultStatus(iso3: string): AgoaDbStatus {
  const override = AGOA_CURATED_OVERRIDES.find((r) => r.country_iso3 === iso3);
  if (override) return override.agoa_status;
  const northAfrica = new Set(['MAR', 'DZA', 'TUN', 'LBY', 'EGY']);
  if (northAfrica.has(iso3)) return 'not_applicable';
  return 'eligible';
}

function buildDefaultRecord(iso3: string): AgoaCountryRecord {
  const status = defaultStatus(iso3);
  const asOf = '2026-05-31';
  return {
    country_iso3: iso3,
    country_name: countryDisplayName(iso3),
    agoa_status: status,
    agoa_apparel_eligible: status === 'eligible',
    agoa_eligible_since: status === 'eligible' ? '2000-01-01' : undefined,
    agoa_notes:
      'Seed record — run verify:ustr:agoa for evidence-backed status in souvera_country_policy_status.',
    agoa_source_url: AGOA_SOURCE_URL,
    agoa_source_name: 'USTR',
    agoa_as_of_label: 'Evidence Vault (verify:ustr:agoa)',
    agoa_as_of_date: asOf,
    agoa_last_reviewed_at: `${asOf}T00:00:00Z`,
  };
}

export function getAllAgoaCountryStatuses(): AgoaCountryRecord[] {
  const overrideMap = new Map(AGOA_CURATED_OVERRIDES.map((r) => [r.country_iso3, r]));
  return APPROVED_AFRICA_ISO3.map((iso3) => overrideMap.get(iso3) ?? buildDefaultRecord(iso3));
}

export const AGOA_COUNTRY_STATUSES: AgoaCountryRecord[] = getAllAgoaCountryStatuses();

export function getAgoaCountryRecord(iso3: string): AgoaCountryRecord | undefined {
  return AGOA_COUNTRY_STATUSES.find((c) => c.country_iso3 === iso3.toUpperCase());
}

export function getAgoaEventsForCountry(iso3: string): AgoaLegislativeEvent[] {
  const key = iso3.toUpperCase();
  return AGOA_LEGISLATIVE_EVENTS.filter(
    (e) => !e.affected_iso3 || e.affected_iso3.includes(key)
  );
}

export function buildCuratedAgoaStatuses(iso3?: string, statusFilter?: string) {
  let rows = [...AGOA_COUNTRY_STATUSES];
  if (iso3) rows = rows.filter((r) => r.country_iso3 === iso3.toUpperCase());
  if (statusFilter) rows = rows.filter((r) => r.agoa_status === statusFilter);
  return rows.sort((a, b) => a.country_name.localeCompare(b.country_name));
}
