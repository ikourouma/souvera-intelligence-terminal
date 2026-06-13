/**
 * Curated AfCFTA implementation status — rollout African countries (Preview MVP).
 * Sources: AfCFTA Secretariat, tralac, AU Commission.
 */

export type AfCftaStatus = 'signed' | 'ratified' | 'deposited' | 'trading';

export interface AfCftaCountryRecord {
  country_iso3: string;
  country_name: string;
  afcfta_status: AfCftaStatus;
  afcfta_signed_date?: string;
  afcfta_ratified_date?: string;
  afcfta_deposited_date?: string;
  afcfta_trading_since?: string;
  afcfta_tariff_offers_submitted?: boolean;
  afcfta_services_offers_submitted?: boolean;
  afcfta_notes?: string;
  afcfta_source_url: string;
  afcfta_as_of_date: string;
}

const AFCFTA_SOURCE = 'https://au-afcfta.org/';

/** Rollout African ISO3 — pilot + Wave 1 */
export const AFCFTA_ROLLOUT_ISO3 = [
  'NGA', 'KEN', 'GHA', 'ZAF', 'ETH', 'SEN', 'CIV', 'TZA',
] as const;

const CURATED: AfCftaCountryRecord[] = [
  {
    country_iso3: 'NGA',
    country_name: 'Nigeria',
    afcfta_status: 'trading',
    afcfta_signed_date: '2019-07-07',
    afcfta_ratified_date: '2020-12-05',
    afcfta_deposited_date: '2020-12-05',
    afcfta_trading_since: '2021-01-01',
    afcfta_tariff_offers_submitted: true,
    afcfta_services_offers_submitted: true,
    afcfta_notes: 'Africa\'s largest economy; AfCFTA trading active with ECOWAS integration as primary regional corridor.',
    afcfta_source_url: AFCFTA_SOURCE,
    afcfta_as_of_date: '2026-01-15',
  },
  {
    country_iso3: 'KEN',
    country_name: 'Kenya',
    afcfta_status: 'trading',
    afcfta_signed_date: '2018-03-21',
    afcfta_ratified_date: '2018-05-09',
    afcfta_deposited_date: '2018-05-09',
    afcfta_trading_since: '2021-01-01',
    afcfta_tariff_offers_submitted: true,
    afcfta_services_offers_submitted: true,
    afcfta_notes: 'Early ratifier; EAC and AfCFTA dual market access supports EPZ apparel and horticulture exports.',
    afcfta_source_url: AFCFTA_SOURCE,
    afcfta_as_of_date: '2026-01-15',
  },
  {
    country_iso3: 'GHA',
    country_name: 'Ghana',
    afcfta_status: 'trading',
    afcfta_signed_date: '2018-03-21',
    afcfta_ratified_date: '2020-04-28',
    afcfta_deposited_date: '2020-04-28',
    afcfta_trading_since: '2021-01-01',
    afcfta_tariff_offers_submitted: true,
    afcfta_services_offers_submitted: true,
    afcfta_notes: 'ECOWAS hub with active AfCFTA trading; cocoa and gold exports benefit from continental market access.',
    afcfta_source_url: AFCFTA_SOURCE,
    afcfta_as_of_date: '2026-01-15',
  },
  {
    country_iso3: 'ZAF',
    country_name: 'South Africa',
    afcfta_status: 'trading',
    afcfta_signed_date: '2018-07-01',
    afcfta_ratified_date: '2019-02-10',
    afcfta_deposited_date: '2019-02-10',
    afcfta_trading_since: '2021-01-01',
    afcfta_tariff_offers_submitted: true,
    afcfta_services_offers_submitted: true,
    afcfta_notes: 'SADC anchor economy; automotive and mining exports leverage AfCFTA rules of origin.',
    afcfta_source_url: AFCFTA_SOURCE,
    afcfta_as_of_date: '2026-01-15',
  },
  {
    country_iso3: 'ETH',
    country_name: 'Ethiopia',
    afcfta_status: 'deposited',
    afcfta_signed_date: '2018-03-21',
    afcfta_ratified_date: '2019-06-10',
    afcfta_deposited_date: '2019-06-10',
    afcfta_tariff_offers_submitted: true,
    afcfta_services_offers_submitted: false,
    afcfta_notes: 'Ratified and deposited; trading commencement pending tariff schedule finalization for key industrial goods.',
    afcfta_source_url: AFCFTA_SOURCE,
    afcfta_as_of_date: '2026-01-15',
  },
  {
    country_iso3: 'SEN',
    country_name: 'Senegal',
    afcfta_status: 'trading',
    afcfta_signed_date: '2018-03-21',
    afcfta_ratified_date: '2020-11-19',
    afcfta_deposited_date: '2020-11-19',
    afcfta_trading_since: '2021-01-01',
    afcfta_tariff_offers_submitted: true,
    afcfta_services_offers_submitted: true,
    afcfta_notes: 'UEMOA/ECOWAS member with active AfCFTA trading; fisheries and phosphate exports to continental markets.',
    afcfta_source_url: AFCFTA_SOURCE,
    afcfta_as_of_date: '2026-01-15',
  },
  {
    country_iso3: 'CIV',
    country_name: "Côte d'Ivoire",
    afcfta_status: 'trading',
    afcfta_signed_date: '2018-03-21',
    afcfta_ratified_date: '2018-11-23',
    afcfta_deposited_date: '2018-11-23',
    afcfta_trading_since: '2021-01-01',
    afcfta_tariff_offers_submitted: true,
    afcfta_services_offers_submitted: true,
    afcfta_notes: 'West African trade hub; cocoa processing and cashew exports under AfCFTA preferential access.',
    afcfta_source_url: AFCFTA_SOURCE,
    afcfta_as_of_date: '2026-01-15',
  },
  {
    country_iso3: 'TZA',
    country_name: 'Tanzania',
    afcfta_status: 'trading',
    afcfta_signed_date: '2018-03-21',
    afcfta_ratified_date: '2019-04-17',
    afcfta_deposited_date: '2019-04-17',
    afcfta_trading_since: '2021-01-01',
    afcfta_tariff_offers_submitted: true,
    afcfta_services_offers_submitted: true,
    afcfta_notes: 'EAC member with AfCFTA trading; gold, horticulture, and EPZ apparel exports to continental markets.',
    afcfta_source_url: AFCFTA_SOURCE,
    afcfta_as_of_date: '2026-01-01',
  },
];

export function buildCuratedAfCftaStatuses(
  iso3?: string,
  statusFilter?: string
): AfCftaCountryRecord[] {
  let rows = [...CURATED];
  if (iso3) {
    rows = rows.filter((r) => r.country_iso3 === iso3.toUpperCase());
  }
  if (statusFilter) {
    rows = rows.filter((r) => r.afcfta_status === statusFilter);
  }
  return rows;
}

export function getAfCftaStatusLabel(status: AfCftaStatus): string {
  const labels: Record<AfCftaStatus, string> = {
    signed: 'Signed',
    ratified: 'Ratified',
    deposited: 'Deposited',
    trading: 'Trading',
  };
  return labels[status] ?? status;
}

export function getAfCftaStatusColor(status: AfCftaStatus): string {
  const colors: Record<AfCftaStatus, string> = {
    signed: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    ratified: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    deposited: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    trading: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  return colors[status] ?? colors.signed;
}
