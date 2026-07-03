/**
 * Seed USTR country page links for Africa markets absent from the USTR directory scrape (~15 listed).
 * URLs are authoritative USTR paths — not invented figures.
 *
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/seed-curated-ustr-africa-links.ts
 */
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

const CURATED: Array<{ iso3: string; url: string; label: string; slug: string }> = [
  {
    iso3: 'COD',
    slug: 'democratic-republic-congo',
    label: 'USTR — Democratic Republic of the Congo',
    url: 'https://ustr.gov/countries-regions/africa/central-africa/democratic-republic-congo',
  },
  {
    iso3: 'KEN',
    slug: 'kenya',
    label: 'USTR — Kenya',
    url: 'https://ustr.gov/countries-regions/africa/east-africa/kenya',
  },
  {
    iso3: 'ZAF',
    slug: 'south-africa',
    label: 'USTR — South Africa',
    url: 'https://ustr.gov/countries-regions/africa/southern-africa/south-africa',
  },
];

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const reviewedAt = new Date().toISOString();
  let upserted = 0;

  for (const row of CURATED) {
    const { data: existing } = await sb
      .from('souvera_external_reference_links')
      .select('id')
      .eq('entity_key', row.iso3)
      .eq('ref_type', 'USTR_COUNTRY_PAGE')
      .maybeSingle();

    if (existing) {
      console.log(`  skip ${row.iso3} — already linked`);
      continue;
    }

    const { error } = await sb.from('souvera_external_reference_links').upsert(
      {
        entity_key: row.iso3,
        ref_type: 'USTR_COUNTRY_PAGE',
        url: row.url,
        label: row.label,
        slug: row.slug,
        source_key: 'ustr_africa_curated',
        last_reviewed_at: reviewedAt,
      },
      { onConflict: 'ref_type,url' },
    );
    if (error) throw new Error(`${row.iso3}: ${error.message}`);
    upserted++;
    console.log(`  ✓ ${row.iso3} → ${row.url}`);
  }

  console.log(`\n[Curated USTR links] Upserted ${upserted}/${CURATED.length}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
