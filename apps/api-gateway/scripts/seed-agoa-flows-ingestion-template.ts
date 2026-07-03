/**
 * Seed the "AGOA Trade Flows Upload" ingestion template so admins can upload real
 * USITC DataWeb / agoa.info AGOA trade-flow data through the batch pipeline
 * (upload → parse → validate → approve → publish → souvera_agoa_trade_flows).
 *
 * Idempotent: updates the template in place if it already exists.
 *
 * Expected CSV/JSON columns (source → target):
 *   iso3, year, category_group, category_label, hs_chapter           (required)
 *   total_exports_to_us_usd, agoa_exports_usd, agoa_share_pct,
 *   non_agoa_exports_usd, mfn_tariff_pct, tariff_savings_usd,
 *   agoa_eligible, agoa_status, eligibility_since, country_name,
 *   region, sub_region, source_notes, data_quality_tier             (optional)
 *
 * Run: npx tsx apps/api-gateway/scripts/seed-agoa-flows-ingestion-template.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TEMPLATE_NAME = 'AGOA Trade Flows Upload';

const COLUMN_MAPPINGS = [
  { source: 'iso3', target: 'iso3', required: true, transform: 'uppercase' },
  { source: 'year', target: 'year', required: true },
  { source: 'category_group', target: 'category_group', required: true },
  { source: 'category_label', target: 'category_label', required: true },
  { source: 'hs_chapter', target: 'hs_chapter', required: true },
  { source: 'total_exports_to_us_usd', target: 'total_exports_to_us_usd' },
  { source: 'agoa_exports_usd', target: 'agoa_exports_usd' },
  { source: 'agoa_share_pct', target: 'agoa_share_pct' },
  { source: 'non_agoa_exports_usd', target: 'non_agoa_exports_usd' },
  { source: 'mfn_tariff_pct', target: 'mfn_tariff_pct' },
  { source: 'tariff_savings_usd', target: 'tariff_savings_usd' },
  { source: 'agoa_eligible', target: 'agoa_eligible', transform: 'boolean' },
  { source: 'agoa_status', target: 'agoa_status' },
  { source: 'eligibility_since', target: 'eligibility_since' },
  { source: 'country_name', target: 'country_name' },
  { source: 'region', target: 'region' },
  { source: 'sub_region', target: 'sub_region' },
  { source: 'source_notes', target: 'source_notes' },
  { source: 'data_quality_tier', target: 'data_quality_tier' },
];

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const payload = {
    template_name: TEMPLATE_NAME,
    template_description:
      'Upload AGOA bilateral trade-flow data (USITC DataWeb / agoa.info). Publishes to souvera_agoa_trade_flows keyed on (iso3, year, category_group).',
    target_table: 'souvera_agoa_trade_flows',
    target_data_type: 'agoa_trade_flows',
    column_mappings: COLUMN_MAPPINGS,
    country_column: 'iso3',
    country_mapping_type: 'iso3',
    required_columns: ['iso3', 'year', 'category_group', 'category_label', 'hs_chapter'],
    default_confidence: 'high',
  };

  const { data: existing } = await sb
    .from('souvera_source_ingestion_templates')
    .select('id')
    .eq('template_name', TEMPLATE_NAME)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await sb
      .from('souvera_source_ingestion_templates')
      .update(payload)
      .eq('id', existing.id);
    if (error) { console.error('Update error:', error.message); process.exit(1); }
    console.log(`✅ Updated existing template "${TEMPLATE_NAME}" (${existing.id}).`);
  } else {
    const { data, error } = await sb
      .from('souvera_source_ingestion_templates')
      .insert(payload)
      .select('id')
      .single();
    if (error) { console.error('Insert error:', error.message); process.exit(1); }
    console.log(`✅ Created template "${TEMPLATE_NAME}" (${data.id}).`);
  }

  console.log('\nAdmins can now select this template at /admin/data/upload and publish');
  console.log('real AGOA trade-flow data straight into souvera_agoa_trade_flows.\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
