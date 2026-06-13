/**
 * External reference links (USTR country pages, etc.) — UI-only, not for PDFs.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import type { OfficialReferenceLink } from '@/types/country-intelligence';

export type ExternalRefType = 'USTR_COUNTRY_PAGE';
export type ExternalReferenceLink = OfficialReferenceLink;

function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function fetchExternalReferencesForEntity(
  entityKey: string,
  refTypes?: ExternalRefType[]
): Promise<ExternalReferenceLink[]> {
  const supabase = getServiceClient();
  if (!supabase) return [];

  let query = supabase
    .from('souvera_external_reference_links')
    .select('ref_type, url, label, source_key, last_reviewed_at')
    .eq('entity_key', entityKey.toUpperCase());

  if (refTypes?.length) {
    query = query.in('ref_type', refTypes);
  }

  const { data, error } = await query.order('last_reviewed_at', { ascending: false });
  if (error || !data?.length) return [];

  return data.map(
    (row): OfficialReferenceLink => ({
      refType: row.ref_type as string,
      label: row.label ?? 'Official reference',
      url: row.url as string,
      sourceKey: row.source_key as string,
      lastReviewedAt: row.last_reviewed_at as string,
    })
  );
}

/** Bulk USTR country pages for Africa map tooltips (entity_key → url). */
export async function fetchUstrAfricaPageMap(): Promise<Record<string, string>> {
  const supabase = getServiceClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from('souvera_external_reference_links')
    .select('entity_key, url')
    .eq('ref_type', 'USTR_COUNTRY_PAGE')
    .eq('source_key', 'ustr_africa_directory')
    .not('entity_key', 'is', null);

  if (error || !data) return {};

  const out: Record<string, string> = {};
  for (const row of data) {
    const key = row.entity_key as string;
    if (key && !out[key]) out[key] = row.url as string;
  }
  return out;
}
