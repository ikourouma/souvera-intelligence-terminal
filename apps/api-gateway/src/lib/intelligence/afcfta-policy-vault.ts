/**
 * AfCFTA tracker API — Evidence Vault primary, curated rollout detail fallback.
 */

import {
  AFCFTA_ROLLOUT_ISO3,
  buildCuratedAfCftaStatuses,
  type AfCftaCountryRecord,
  type AfCftaStatus,
} from '@/data/afcfta-status';
import { countryDisplayName } from '@/lib/intelligence/country-names';
import { resolvePolicyStatusRegistry } from '@/lib/reports/policy-status-registry';
import type { PolicyStatusRecord } from '@/types/report-integrity';

const AFCFTA_SOURCE = 'https://au-afcfta.org/';

function mapVaultToAfCftaStatus(
  record: PolicyStatusRecord | undefined,
  curated: AfCftaCountryRecord | undefined
): AfCftaStatus {
  if (!record) return curated?.afcfta_status ?? 'signed';
  if (record.publishable && record.status === 'active') {
    return curated?.afcfta_status ?? 'trading';
  }
  if (record.status === 'not_applicable') return 'signed';
  if (curated) return curated.afcfta_status;
  return 'deposited';
}

function buildRow(
  iso3: string,
  record: PolicyStatusRecord | undefined,
  curated: AfCftaCountryRecord | undefined,
  isProfessionalPlus: boolean
) {
  const status = mapVaultToAfCftaStatus(record, curated);
  const evidenceBacked = record?.publishable === true && record.status === 'active';
  const base = {
    country_iso3: iso3,
    country_name: curated?.country_name ?? countryDisplayName(iso3),
    afcfta_status: status,
    data_label: evidenceBacked
      ? 'AfCFTA · Evidence Vault'
      : record
        ? 'Under review · Evidence Vault'
        : 'Souvera Curated Intelligence',
    evidence_backed: evidenceBacked,
  };

  if (!isProfessionalPlus) {
    return {
      ...base,
      is_full_access: false,
      upgrade_message: 'Upgrade to Business+ for full AfCFTA intelligence',
    };
  }

  return {
    ...base,
    afcfta_signed_date: curated?.afcfta_signed_date,
    afcfta_ratified_date: curated?.afcfta_ratified_date,
    afcfta_deposited_date: curated?.afcfta_deposited_date,
    afcfta_trading_since: status === 'trading' ? curated?.afcfta_trading_since : undefined,
    afcfta_tariff_offers_submitted: curated?.afcfta_tariff_offers_submitted,
    afcfta_services_offers_submitted: curated?.afcfta_services_offers_submitted,
    afcfta_notes: record?.description ?? curated?.afcfta_notes,
    afcfta_source_url: curated?.afcfta_source_url ?? AFCFTA_SOURCE,
    afcfta_as_of_date: curated?.afcfta_as_of_date ?? record?.lastVerifiedAt?.slice(0, 10),
    is_full_access: true,
  };
}

export type AfCftaVaultApiRow = ReturnType<typeof buildRow>;

export async function fetchAfCftaApiRowsFromVault(
  iso3: string | undefined,
  isProfessionalPlus: boolean
): Promise<{ rows: AfCftaVaultApiRow[]; source: 'evidence_vault' | 'curated_fallback' }> {
  const curatedByIso = new Map(
    buildCuratedAfCftaStatuses().map((r) => [r.country_iso3, r])
  );
  const targets = iso3
    ? [iso3.toUpperCase()]
    : [...AFCFTA_ROLLOUT_ISO3];

  const rows: AfCftaVaultApiRow[] = [];

  for (const code of targets) {
    const records = await resolvePolicyStatusRegistry(code);
    const afcfta = records.find((r) => r.framework === 'AfCFTA');
    const curated = curatedByIso.get(code);
    rows.push(buildRow(code, afcfta, curated, isProfessionalPlus));
  }

  return {
    rows: rows.sort((a, b) => a.country_name.localeCompare(b.country_name)),
    source: rows.some((r) => r.evidence_backed) ? 'evidence_vault' : 'curated_fallback',
  };
}
