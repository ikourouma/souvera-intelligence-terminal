/**
 * Replace COD (DR Congo) synthetic AGOA trade flows with authoritative figures.
 *
 * SOURCE: agoa.info DRC Trade Profile, sourced from USITC DataWeb / U.S. Dept of
 * Commerce (Census Bureau). Values in USD. DRC's AGOA-preferential imports are
 * ~99.9% minerals & metals (copper, cobalt); the 2023 surge in TOTAL imports is
 * driven by energy/crude that enters at MFN duty-free rates (not under AGOA).
 *
 *   Year | Total US imports | AGOA-preferential (mostly minerals)
 *   2021 | $268.8M          | $219.0M
 *   2022 | $183.3M          | $92.2M
 *   2023 | $275.1M          | $60.6M   <- declining utilization
 *
 * The previous rows were tier-B "Regional benchmark estimates" spread evenly
 * across 10 categories — plausible headline, fabricated composition. This script
 * deletes those and inserts authoritative, minerals-led, multi-year rows so the
 * Trade tab shows the correct ~$60.6M current AGOA exports, the real declining
 * trend, and an honest total-vs-preferential gap.
 *
 * Run (inspect only):  npx tsx apps/api-gateway/scripts/fix-cod-agoa-authoritative.ts
 * Run (apply):         npx tsx apps/api-gateway/scripts/fix-cod-agoa-authoritative.ts --apply
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ISO3 = 'COD';
const APPLY = process.argv.includes('--apply');
const SOURCE_NOTE =
  'USITC DataWeb / agoa.info — U.S. Dept of Commerce (Census). DRC AGOA imports are minerals-led (copper, cobalt).';

type Row = {
  year: number;
  category_group: string;
  total_exports_to_us_usd: number;
  agoa_exports_usd: number;
  agoa_share_pct: number;
  tariff_savings_usd: number;
};

const CATEGORY_LABEL: Record<string, string> = {
  minerals: 'Minerals & Metals',
  petroleum: 'Energy & Petroleum',
  agriculture: 'Agriculture',
  handicrafts: 'Handicrafts & Misc Manufactures',
  forest: 'Forest Products',
  chemicals: 'Chemicals',
};

const MFN_TARIFF_PCT: Record<string, number> = {
  minerals: 0.5,
  petroleum: 0,
  agriculture: 3,
  handicrafts: 4,
  forest: 0,
  chemicals: 3,
};

const HS_CHAPTER: Record<string, string> = {
  minerals: '26', // ores, slag, ash (copper/cobalt)
  petroleum: '27', // mineral fuels, oils
  agriculture: '08', // edible fruit, nuts
  handicrafts: '96', // miscellaneous manufactured articles
  forest: '44', // wood and articles of wood
  chemicals: '28', // inorganic chemicals
};

// Authoritative composition (USD). category_group values match the platform enum;
// 'petroleum' is excluded from AGOA-preferential totals by the API route.
const ROWS: Row[] = [
  // ---- 2021 (total $268.8M, AGOA $219.0M) ----
  { year: 2021, category_group: 'minerals',     total_exports_to_us_usd: 235_918_000, agoa_exports_usd: 218_957_000, agoa_share_pct: 92.8, tariff_savings_usd: 2_190_000 },
  { year: 2021, category_group: 'agriculture',  total_exports_to_us_usd:  27_621_000, agoa_exports_usd:      26_000, agoa_share_pct: 0.1,  tariff_savings_usd:      2_000 },
  { year: 2021, category_group: 'petroleum',    total_exports_to_us_usd:   1_493_000, agoa_exports_usd:           0, agoa_share_pct: 0,    tariff_savings_usd:          0 },
  { year: 2021, category_group: 'handicrafts',  total_exports_to_us_usd:   1_243_000, agoa_exports_usd:      82_000, agoa_share_pct: 6.6,  tariff_savings_usd:      8_000 },

  // ---- 2022 (total $183.3M, AGOA $92.2M) ----
  { year: 2022, category_group: 'minerals',     total_exports_to_us_usd: 109_955_000, agoa_exports_usd:  92_097_000, agoa_share_pct: 83.8, tariff_savings_usd:    920_000 },
  { year: 2022, category_group: 'petroleum',    total_exports_to_us_usd:  36_127_000, agoa_exports_usd:           0, agoa_share_pct: 0,    tariff_savings_usd:          0 },
  { year: 2022, category_group: 'agriculture',  total_exports_to_us_usd:  31_530_000, agoa_exports_usd:      30_000, agoa_share_pct: 0.1,  tariff_savings_usd:      3_000 },
  { year: 2022, category_group: 'handicrafts',  total_exports_to_us_usd:   2_974_000, agoa_exports_usd:      48_000, agoa_share_pct: 1.6,  tariff_savings_usd:      5_000 },

  // ---- 2023 (total $275.1M, AGOA $60.6M) — latest displayed year ----
  { year: 2023, category_group: 'minerals',     total_exports_to_us_usd: 117_268_000, agoa_exports_usd:  60_465_000, agoa_share_pct: 51.6, tariff_savings_usd:    605_000 },
  { year: 2023, category_group: 'petroleum',    total_exports_to_us_usd: 138_058_000, agoa_exports_usd:           0, agoa_share_pct: 0,    tariff_savings_usd:          0 },
  { year: 2023, category_group: 'forest',       total_exports_to_us_usd:   8_723_000, agoa_exports_usd:           0, agoa_share_pct: 0,    tariff_savings_usd:          0 },
  { year: 2023, category_group: 'agriculture',  total_exports_to_us_usd:   7_009_000, agoa_exports_usd:      38_000, agoa_share_pct: 0.5,  tariff_savings_usd:      4_000 },
  { year: 2023, category_group: 'chemicals',    total_exports_to_us_usd:   2_701_000, agoa_exports_usd:           0, agoa_share_pct: 0,    tariff_savings_usd:          0 },
  { year: 2023, category_group: 'handicrafts',  total_exports_to_us_usd:   1_164_000, agoa_exports_usd:      53_000, agoa_share_pct: 4.6,  tariff_savings_usd:      5_000 },
];

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing, error: selErr } = await sb
    .from('souvera_agoa_trade_flows')
    .select('*')
    .eq('iso3', ISO3);
  if (selErr) { console.error('Select error:', selErr.message); process.exit(1); }

  console.log(`\n=== Existing COD rows: ${existing?.length ?? 0} ===`);
  if (existing?.length) {
    console.log('Columns:', Object.keys(existing[0]).join(', '));
    const sample = existing[0] as Record<string, unknown>;
    console.log('Sample row:', JSON.stringify(sample, null, 2));
  }

  // Build explicit insert payloads. We intentionally do NOT inherit stale
  // descriptive columns (agoa_eligible=false, agoa_status='suspended',
  // category_label from an electronics row) — those are corrected per row.
  const template = (existing?.[0] ?? {}) as Record<string, unknown>;

  const payload = ROWS.map((r) => ({
    iso3: ISO3,
    country_id: template.country_id ?? null,
    country_name: 'Congo, Democratic Republic',
    region: 'Africa',
    sub_region: 'Central Africa',
    agoa_eligible: true,
    agoa_status: 'eligible',
    eligibility_since: 2021, // reinstated effective Jan 1, 2021
    year: r.year,
    hs_chapter: HS_CHAPTER[r.category_group] ?? '99',
    hs_code: null,
    category_group: r.category_group,
    category_label: CATEGORY_LABEL[r.category_group] ?? r.category_group,
    total_exports_to_us_usd: r.total_exports_to_us_usd,
    agoa_exports_usd: r.agoa_exports_usd,
    agoa_share_pct: r.agoa_share_pct,
    non_agoa_exports_usd: Math.max(r.total_exports_to_us_usd - r.agoa_exports_usd, 0),
    mfn_tariff_pct: MFN_TARIFF_PCT[r.category_group] ?? 0,
    tariff_savings_usd: r.tariff_savings_usd,
    is_textile_apparel: false,
    third_country_fabric_eligible: false,
    yoy_growth_pct: null,
    cagr_5yr_pct: null,
    top_products: [],
    us_total_imports_usd: null,
    country_share_of_us_imports_pct: null,
    competitor_suppliers: [],
    source_id: template.source_id ?? null,
    source_notes: SOURCE_NOTE,
    data_quality_tier: 'A',
  }));

  // Summary of the authoritative result.
  const byYear = new Map<number, { total: number; agoa: number }>();
  for (const r of ROWS) {
    const e = byYear.get(r.year) ?? { total: 0, agoa: 0 };
    e.total += r.total_exports_to_us_usd;
    e.agoa += r.agoa_exports_usd;
    byYear.set(r.year, e);
  }
  console.log('\n=== Authoritative COD result (to be written) ===');
  for (const [y, v] of [...byYear].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${y}: total US imports $${(v.total / 1e6).toFixed(1)}M | AGOA-preferential $${(v.agoa / 1e6).toFixed(1)}M`);
  }

  if (!APPLY) {
    console.log('\n[DRY RUN] Re-run with --apply to delete synthetic rows and insert authoritative data.\n');
    return;
  }

  const { error: delErr } = await sb.from('souvera_agoa_trade_flows').delete().eq('iso3', ISO3);
  if (delErr) { console.error('Delete error:', delErr.message); process.exit(1); }
  const { error: insErr } = await sb.from('souvera_agoa_trade_flows').insert(payload);
  if (insErr) { console.error('Insert error:', insErr.message); process.exit(1); }

  console.log(`\n✅ Replaced COD flows: deleted ${existing?.length ?? 0}, inserted ${payload.length} authoritative rows.\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
