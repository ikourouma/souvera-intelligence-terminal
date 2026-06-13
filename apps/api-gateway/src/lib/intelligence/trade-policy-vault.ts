/**
 * Phase 0B — Evidence Vault → trade / market-access UI (single policy authority).
 */

import { APPROVED_AFRICA_ISO3, isApprovedCaribbeanMarket } from '@/lib/market-coverage';
import { countryDisplayName } from '@/lib/intelligence/country-names';
import {
  fetchPolicyStatusFromDb,
  type DbPolicyRow,
  dbRowToPolicyRecord,
} from '@/lib/reports/policy-status-db';
import { resolvePolicyStatusRegistry } from '@/lib/reports/policy-status-registry';
import type { PolicyStatusRecord } from '@/types/report-integrity';
import type { AgoaCountryRecord, AgoaDbStatus } from '@/data/agoa-legislative-tracker';
import { AGOA_SOURCE_URL } from '@/data/agoa-legislative-tracker';
import type {
  MarketAccessFramework,
  MarketAccessStatus,
} from '@/lib/intelligence/market-access-registry';
import type { AgoaPolicyUiSnapshot } from '@/types/country-intelligence';

const FRAMEWORK_EMOJI: Record<string, string> = {
  AGOA: '🇺🇸',
  AfCFTA: '🌍',
  ECOWAS: '🌍',
  CBI: '🇺🇸',
  CARICOM: '🌴',
};

function mapVaultRawToAgoaDbStatus(raw: string, publishable: boolean): AgoaDbStatus {
  if (raw === 'under_review' || raw === 'needs_review') return 'under_review';
  if (!publishable) return 'under_review';
  switch (raw) {
    case 'eligible':
    case 'active':
    case 'member':
      return 'eligible';
    case 'suspended':
      return 'suspended';
    case 'graduated':
      return 'graduated';
    case 'ineligible':
    case 'not_a_member':
      return 'ineligible';
    case 'not_applicable':
      return 'not_applicable';
    default:
      return 'under_review';
  }
}

function policyStatusToMarketAccessStatus(record: PolicyStatusRecord): MarketAccessStatus {
  if (!record.publishable || record.status === 'needs_review') return 'info';
  switch (record.status) {
    case 'suspended':
      return 'suspended';
    case 'graduated':
      return 'graduated';
    case 'ineligible':
      return 'ineligible';
    case 'not_applicable':
      return 'not_applicable';
    case 'active':
      return 'active';
    default:
      return 'info';
  }
}

export function policyRecordToMarketAccessFramework(
  record: PolicyStatusRecord
): MarketAccessFramework {
  const id = record.framework.toLowerCase();
  return {
    id,
    label: record.framework,
    emoji: FRAMEWORK_EMOJI[record.framework],
    description: record.description,
    status: policyStatusToMarketAccessStatus(record),
    statusLabel: record.clientStatusLabel ?? record.statusLabel,
  };
}

export function policyRecordsToMarketAccessFrameworks(
  records: PolicyStatusRecord[]
): MarketAccessFramework[] {
  return records
    .filter((r) => r.status !== 'unknown' && r.status !== 'conflict')
    .map(policyRecordToMarketAccessFramework);
}

export function policyRecordToAgoaCountryRecord(
  record: PolicyStatusRecord,
  iso3: string,
  rawDbStatus?: string
): AgoaCountryRecord {
  const raw = rawDbStatus ?? record.statusLabel;
  const asOf = record.lastVerifiedAt?.slice(0, 10) ?? '2026-01-01';
  return {
    country_iso3: iso3.toUpperCase(),
    country_name: countryDisplayName(iso3),
    agoa_status: mapVaultRawToAgoaDbStatus(raw, record.publishable),
    agoa_apparel_eligible: record.publishable && ['eligible', 'active'].includes(raw),
    agoa_eligible_since: record.publishable && raw === 'eligible' ? record.lastReviewedDisplay ?? undefined : undefined,
    agoa_suspension_date: record.publishable && raw === 'suspended' ? asOf : undefined,
    agoa_notes: record.description,
    agoa_source_url: record.authoritativeSourceUrl ?? AGOA_SOURCE_URL,
    agoa_source_name: record.sourceDisplayName ?? 'USTR',
    agoa_as_of_label: record.lastReviewedDisplay ?? 'Evidence Vault',
    agoa_as_of_date: asOf,
    agoa_last_reviewed_at: record.lastVerifiedAt ?? `${asOf}T00:00:00Z`,
  };
}

/** AGOA tracker API row with honest verification label. */
export type AgoaVaultApiRow = ReturnType<typeof mapAgoaForApi>;

export function mapAgoaForApi(
  record: PolicyStatusRecord,
  iso3: string,
  rawDbStatus: string | undefined,
  isProfessionalPlus: boolean
) {
  const base = policyRecordToAgoaCountryRecord(record, iso3, rawDbStatus);
  const displayStatus = record.clientStatusLabel ?? 'Under review';
  const evidenceBacked = record.publishable === true;

  const shared = {
    country_iso3: base.country_iso3,
    country_name: base.country_name,
    agoa_status: evidenceBacked ? base.agoa_status : base.agoa_status,
    agoa_display_status: displayStatus,
    agoa_evidence_backed: evidenceBacked,
    agoa_apparel_eligible: evidenceBacked ? base.agoa_apparel_eligible : false,
    source_type: evidenceBacked ? ('evidence_vault' as const) : ('under_review' as const),
    data_label: evidenceBacked ? 'USTR · Evidence Vault' : 'Under review',
  };

  if (!isProfessionalPlus) {
    return {
      ...shared,
      is_full_access: false,
      upgrade_message: 'Upgrade to Professional+ for full AGOA intelligence',
    };
  }

  return {
    ...shared,
    agoa_eligible_since: base.agoa_eligible_since,
    agoa_suspension_date: base.agoa_suspension_date,
    agoa_notes: base.agoa_notes,
    agoa_source_url: base.agoa_source_url,
    agoa_as_of_date: base.agoa_as_of_date,
    agoa_last_reviewed_at: base.agoa_last_reviewed_at,
    is_full_access: true,
  };
}

export async function fetchAgoaApiRowsFromVault(
  iso3: string | undefined,
  statusFilter: string,
  isProfessionalPlus: boolean
): Promise<{ rows: AgoaVaultApiRow[]; source: 'evidence_vault' | 'registry_fallback' }> {
  const targets = iso3
    ? [iso3.toUpperCase()]
    : [...APPROVED_AFRICA_ISO3];

  const rows: AgoaVaultApiRow[] = [];

  if (!iso3) {
    const { data } = await fetchAllAgoaVaultRows();
    const byIso = new Map((data ?? []).map((r) => [r.country_iso3, r]));

    for (const code of targets) {
      const dbRow = byIso.get(code);
      if (dbRow) {
        const record = dbRowToPolicyRecord(dbRow);
        rows.push(mapAgoaForApi(record, code, dbRow.status, isProfessionalPlus));
      } else {
        const fallback = await resolvePolicyStatusRegistry(code);
        const agoa = fallback.find((r) => r.framework === 'AGOA');
        if (agoa) rows.push(mapAgoaForApi(agoa, code, undefined, isProfessionalPlus));
      }
    }
  } else {
    const code = iso3.toUpperCase();
    const dbRows = await fetchPolicyStatusFromDb(code);
    const agoaDb = dbRows?.find((r) => r.framework === 'AGOA');
    if (agoaDb) {
      const raw = await fetchRawAgoaStatus(code);
      rows.push(mapAgoaForApi(agoaDb, code, raw, isProfessionalPlus));
    } else {
      const fallback = await resolvePolicyStatusRegistry(code);
      const agoa = fallback.find((r) => r.framework === 'AGOA');
      if (agoa) rows.push(mapAgoaForApi(agoa, code, undefined, isProfessionalPlus));
    }
  }

  return {
    rows: rows.sort((a, b) =>
      (a.country_name ?? '').localeCompare(b.country_name ?? '')
    ),
    source: rows.some((r) => r.agoa_evidence_backed) ? 'evidence_vault' : 'registry_fallback',
  };
}

async function fetchAllAgoaVaultRows(): Promise<{ data: DbPolicyRow[] | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { data: null };

  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await sb
    .from('souvera_country_policy_status')
    .select(
      `country_iso3, framework, status, status_effective_date, last_reviewed_at, source_key, evidence_artifact_id, confidence, notes,
       souvera_evidence_artifacts (status, url)`
    )
    .eq('framework', 'AGOA');

  if (error || !data?.length) return { data: null };
  return { data: data as DbPolicyRow[] };
}

async function fetchRawAgoaStatus(iso3: string): Promise<string | undefined> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return undefined;

  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data } = await sb
    .from('souvera_country_policy_status')
    .select('status')
    .eq('country_iso3', iso3.toUpperCase())
    .eq('framework', 'AGOA')
    .maybeSingle();

  return data?.status as string | undefined;
}

export async function resolveMarketAccessForCountry(iso3: string): Promise<MarketAccessFramework[]> {
  const records = await resolvePolicyStatusRegistry(iso3.toUpperCase());
  const fromVault = policyRecordsToMarketAccessFrameworks(records);
  if (fromVault.length) return fromVault;

  const upper = iso3.toUpperCase();
  if (isApprovedCaribbeanMarket(upper) || APPROVED_AFRICA_ISO3.includes(upper as never)) {
    return [];
  }
  return [];
}

export function policyRecordToAgoaUiSnapshot(
  record: PolicyStatusRecord,
  rawDbStatus?: string
): AgoaPolicyUiSnapshot {
  const raw = rawDbStatus ?? record.statusLabel;
  const rec = policyRecordToAgoaCountryRecord(record, 'XXX', raw);
  return {
    statusLabel: record.clientStatusLabel ?? 'Under review',
    evidenceBacked: record.publishable === true,
    apparelEligible: record.publishable && rec.agoa_apparel_eligible,
    notes: record.description,
    agoaStatus: rec.agoa_status,
  };
}
