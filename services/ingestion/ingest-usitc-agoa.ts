/**
 * USITC DataWeb (v5) → souvera_agoa_trade_flows ingestion.
 *
 * USITC DataWeb is the official U.S. Census/Commerce trade dataset that agoa.info
 * republishes. It is the system of record for souvera_agoa_trade_flows.
 *
 * Two queries per year give the honest total-vs-preferential picture:
 *   1. import program "D" (AGOA excluding GSP) → agoa_exports_usd (preferential slice)
 *   2. all programs (general imports)          → total_exports_to_us_usd
 * Customs value measure = CONS_CUSTOMS_VALUE. Commodities at 2-digit HTS chapter,
 * countries broken out. Confirmed live against the API (program code, measure,
 * and response column order [HTS Number, Country, Description, <year>]).
 *
 * Requires USITC_DATAWEB_API_KEY. No-ops with a clear message when absent.
 * DRY RUN: set USITC_DRY_RUN=1 to fetch + summarise WITHOUT writing to the DB.
 *
 * Run: npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts ingest-usitc-agoa
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fetchAgoaEligibilityMap } from '../../apps/api-gateway/src/lib/intelligence/trade-policy-vault';

// The parseable env file is apps/api-gateway/.env.local (root .env.local is free-form notes).
dotenv.config({ path: path.resolve(__dirname, '../../apps/api-gateway/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BASE = 'https://datawebws.usitc.gov/dataweb';
const RUN_REPORT = `${BASE}/api/v2/report2/runReport`;
const MEASURE = 'CONS_CUSTOMS_VALUE';
const AGOA_PROGRAM = process.env.USITC_AGOA_PROGRAM_CODE || 'D'; // "D - AGOA (excluding GSP)"
const YEARS = (process.env.USITC_YEARS || '2021,2022,2023,2024').split(',').map((s) => s.trim()).filter(Boolean);
const DRY_RUN = process.env.USITC_DRY_RUN === '1';

/** HS 2-digit chapter → souvera AGOA category_group. */
function chapterToCategory(ch: number): string {
  if (ch >= 1 && ch <= 15) return 'agriculture';
  if (ch >= 16 && ch <= 24) return 'processed_foods';
  if (ch === 27) return 'petroleum';
  if (ch === 26 || ch === 25) return 'minerals';
  if (ch >= 28 && ch <= 40) return 'chemicals';
  if (ch >= 41 && ch <= 43) return 'leather';
  if (ch >= 44 && ch <= 49) return 'forest';
  if (ch >= 50 && ch <= 63) return 'textiles_apparel';
  if (ch >= 64 && ch <= 67) return 'footwear';
  if (ch >= 68 && ch <= 70) return 'minerals';
  if (ch >= 71 && ch <= 83) return 'minerals';
  if (ch === 84) return 'machinery';
  if (ch === 85) return 'electronics';
  if (ch >= 86 && ch <= 89) return 'vehicles';
  if (ch >= 90 && ch <= 93) return 'machinery';
  return 'handicrafts'; // 94-99 furniture, toys, art, special
}

const CATEGORY_LABEL: Record<string, string> = {
  agriculture: 'Agriculture', processed_foods: 'Processed Foods & Beverages', petroleum: 'Energy & Petroleum',
  minerals: 'Minerals & Metals', chemicals: 'Chemicals & Plastics', leather: 'Leather & Hides',
  forest: 'Forest Products', textiles_apparel: 'Textiles & Apparel', footwear: 'Footwear',
  machinery: 'Machinery', electronics: 'Electronics & ICT', vehicles: 'Transportation Equipment',
  handicrafts: 'Handicrafts & Misc Manufactures',
};

const CATEGORY_HS_CHAPTER: Record<string, string> = {
  agriculture: '08', processed_foods: '21', petroleum: '27', minerals: '26', chemicals: '28',
  leather: '41', forest: '44', textiles_apparel: '61', footwear: '64', machinery: '84',
  electronics: '85', vehicles: '87', handicrafts: '94',
};

function headers(token: string) {
  return { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}` };
}

function buildQuery(year: string, extPrograms: string[], countryCodes: Array<{ name: string; value: string }>) {
  const restrict = countryCodes.length > 0;
  return {
    savedQueryName: '', savedQueryDesc: '', isOwner: true, runMonthly: false,
    reportOptions: { tradeType: 'Import', classificationSystem: 'HTS' },
    searchOptions: {
      MiscGroup: {
        districts: { aggregation: 'Aggregate District', districtGroups: { userGroups: [] }, districts: [], districtsExpanded: [{ name: 'All Districts', value: 'all' }], districtsSelectType: 'all' },
        importPrograms: { aggregation: null, importPrograms: [], programsSelectType: 'all' },
        extImportPrograms: {
          aggregation: 'Aggregate CSC',
          extImportPrograms: extPrograms,
          extImportProgramsExpanded: [],
          programsSelectType: extPrograms.length ? 'list' : 'all',
        },
        provisionCodes: { aggregation: 'Aggregate RPCODE', provisionCodesSelectType: 'all', rateProvisionCodes: [], rateProvisionCodesExpanded: [] },
      },
      commodities: { aggregation: 'Break Out Commodities', codeDisplayFormat: 'YES', commodities: [], commoditiesExpanded: [], commoditiesManual: '', commodityGroups: { systemGroups: [], userGroups: [] }, commoditySelectType: 'all', granularity: '2', groupGranularity: null, searchGranularity: null },
      componentSettings: { dataToReport: [MEASURE], scale: '1', timeframeSelectType: 'fullYears', years: [year], startDate: null, endDate: null, startMonth: null, endMonth: null, yearsTimeline: 'Annual' },
      countries: {
        aggregation: 'Break Out Countries',
        countries: restrict ? countryCodes.map((c) => c.value) : [],
        countriesExpanded: restrict ? countryCodes : [{ name: 'All Countries', value: 'all' }],
        countriesSelectType: restrict ? 'list' : 'all',
        countryGroups: { systemGroups: [], userGroups: [] },
      },
    },
    sortingAndDataFormat: { DataSort: { columnOrder: [], fullColumnOrder: [], sortOrder: [] }, reportCustomizations: { exportCombineTables: false, showAllSubtotal: true, subtotalRecords: '', totalRecords: '20000', exportRawData: false } },
  };
}

function getColumns(groups: unknown[], acc: string[] = []): string[] {
  for (const g of groups) {
    if (Array.isArray(g)) getColumns(g, acc);
    else if (g && typeof g === 'object') {
      const obj = g as Record<string, unknown>;
      if (Array.isArray(obj.columns)) getColumns(obj.columns as unknown[], acc);
      else if (typeof obj.label === 'string') acc.push(obj.label);
    }
  }
  return acc;
}

interface ParsedRow { hts2: string; country: string; value: number }

async function fetchYear(token: string, year: string, extPrograms: string[], countryCodes: Array<{ name: string; value: string }>): Promise<ParsedRow[]> {
  const res = await fetch(RUN_REPORT, { method: 'POST', headers: headers(token), body: JSON.stringify(buildQuery(year, extPrograms, countryCodes)) });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const errs = json?.dto?.errors ?? [];
  if (errs.length) throw new Error(`DataWeb errors: ${errs.join('; ')}`);
  const table = json?.dto?.tables?.[0];
  if (!table) return [];
  const cols = getColumns(table.column_groups ?? []);
  const htsIdx = cols.findIndex((c) => /hts/i.test(c));
  const countryIdx = cols.findIndex((c) => /country/i.test(c));
  const valIdx = cols.findIndex((c) => c === year) >= 0 ? cols.findIndex((c) => c === year) : cols.length - 1;

  const out: ParsedRow[] = [];
  for (const group of table.row_groups ?? []) {
    for (const row of group.rowsNew ?? []) {
      const entries = (row.rowEntries ?? []) as Array<{ value?: unknown }>;
      const hts2 = String(entries[htsIdx]?.value ?? '').trim().slice(0, 2);
      const country = String(entries[countryIdx]?.value ?? '').trim();
      const value = Number(String(entries[valIdx]?.value ?? '0').replace(/[^0-9.-]/g, ''));
      if (hts2 && country && Number.isFinite(value)) out.push({ hts2, country, value });
    }
  }
  return out;
}

/** Normalize a country name for matching. */
function norm(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[`'’]/g, "'")
    .replace(/\bthe\b/g, '')
    .replace(/[^a-z]/g, '');
}

// USITC name → iso3 aliases for names that won't normalise to souvera_countries.name.
const NAME_ALIASES: Record<string, string> = {
  democraticrepublicofcongo: 'COD', democraticrepublicofthecongo: 'COD', congodemocraticrepublic: 'COD',
  congokinshasa: 'COD', republicofcongo: 'COG', congobrazzaville: 'COG', congorepublic: 'COG',
  cotedivoire: 'CIV', ivorycoast: 'CIV', capeverde: 'CPV', caboverde: 'CPV',
  gambia: 'GMB', tanzania: 'TZA', unitedrepublicoftanzania: 'TZA',
  swaziland: 'SWZ', eswatini: 'SWZ', eswatiniswaziland: 'SWZ', saotomeandprincipe: 'STP', saotomeprincipe: 'STP',
  guineabissau: 'GNB', equatorialguinea: 'GNQ', centralafricanrepublic: 'CAF',
  southafrica: 'ZAF', southsudan: 'SSD',
};

export async function ingestUsitcAgoa(): Promise<void> {
  console.log('\n[ingest-usitc-agoa] Starting...\n');
  const token = process.env.USITC_DATAWEB_API_KEY;
  if (!token) {
    console.log('⚠️  USITC_DATAWEB_API_KEY not set — DataWeb ingestion is DEFERRED (no-op).');
    console.log('   Set it in apps/api-gateway/.env.local, then re-run.\n');
    return;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  // Country name → iso3 resolver from souvera_countries + aliases.
  const { data: countries } = await sb.from('souvera_countries').select('iso3, name');
  const normToIso3 = new Map<string, string>();
  for (const c of countries ?? []) {
    if (c.name && c.iso3) normToIso3.set(norm(String(c.name)), String(c.iso3));
  }
  for (const [k, v] of Object.entries(NAME_ALIASES)) normToIso3.set(k, v);
  const resolveIso3 = (name: string): string | null => normToIso3.get(norm(name)) ?? null;

  const eligibilityMap = await fetchAgoaEligibilityMap();

  // Resolve USITC country codes for the African markets, so the "all programs"
  // total query stays under DataWeb's 20,000-row cap (it otherwise breaks out
  // every world country × every HTS chapter).
  const { data: africanRows } = await sb
    .from('souvera_countries')
    .select('iso3, name, is_african_country')
    .eq('is_african_country', true);
  const wantedIso3 = new Set((africanRows ?? []).map((c) => String(c.iso3)));

  const ctyRes = await fetch(`${BASE}/api/v2/country/getAllCountries`, { headers: headers(token) });
  const ctyJson = ctyRes.ok ? await ctyRes.json() : { options: [] };
  // getAllCountries returns { options: [{ name, value, iso2, iso3 }] } — match on iso3 directly.
  const usitcCountries: Array<{ name?: string; value?: string; iso3?: string }> = ctyJson?.options ?? [];
  const countryCodes: Array<{ name: string; value: string }> = [];
  for (const opt of usitcCountries) {
    if (!opt.value || !opt.iso3) continue;
    if (wantedIso3.has(String(opt.iso3).toUpperCase())) {
      countryCodes.push({ name: opt.name ?? opt.iso3, value: String(opt.value) });
    }
  }
  console.log(`  Resolved ${countryCodes.length} USITC country codes for African markets (of ${wantedIso3.size}).`);
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no DB writes)' : 'LIVE (will upsert)'} · years: ${YEARS.join(', ')} · AGOA program: ${AGOA_PROGRAM}\n`);

  // accum[`${iso3}|${year}|${cat}`] = { total, agoa }
  const accum = new Map<string, { iso3: string; year: number; cat: string; total: number; agoa: number }>();
  const unmatched = new Set<string>();

  const add = (iso3: string, year: number, cat: string, field: 'total' | 'agoa', value: number) => {
    const k = `${iso3}|${year}|${cat}`;
    const e = accum.get(k) ?? { iso3, year, cat, total: 0, agoa: 0 };
    e[field] += value;
    accum.set(k, e);
  };

  for (const year of YEARS) {
    try {
      const agoaRows = await fetchYear(token, year, [AGOA_PROGRAM], countryCodes);
      await new Promise((r) => setTimeout(r, 800));
      const totalRows = await fetchYear(token, year, [], countryCodes);

      for (const r of agoaRows) {
        const iso3 = resolveIso3(r.country);
        if (!iso3) { unmatched.add(r.country); continue; }
        add(iso3, Number(year), chapterToCategory(Number(r.hts2)), 'agoa', r.value);
      }
      for (const r of totalRows) {
        const iso3 = resolveIso3(r.country);
        if (!iso3) { unmatched.add(r.country); continue; }
        add(iso3, Number(year), chapterToCategory(Number(r.hts2)), 'total', r.value);
      }
      console.log(`  ✅ ${year}: AGOA ${agoaRows.length} rows · total ${totalRows.length} rows`);
      await new Promise((r) => setTimeout(r, 800));
    } catch (e) {
      console.log(`  ⚠️  ${year}: ${e instanceof Error ? e.message : e}`);
    }
  }

  if (unmatched.size) {
    console.log(`\n  ⚠️  Unmatched country names (skipped): ${[...unmatched].join(' | ')}`);
  }

  // Summary (always printed).
  const byMarketYear = new Map<string, { total: number; agoa: number }>();
  for (const e of accum.values()) {
    const k = `${e.iso3}|${e.year}`;
    const m = byMarketYear.get(k) ?? { total: 0, agoa: 0 };
    m.total += e.total; m.agoa += e.agoa; byMarketYear.set(k, m);
  }
  console.log('\n  === Per-market AGOA-preferential vs total (USD) ===');
  const sample = [...byMarketYear.entries()].filter(([k]) => /\|2023$/.test(k)).sort();
  for (const [k, v] of sample.slice(0, 60)) {
    console.log(`    ${k.padEnd(12)} AGOA $${(v.agoa / 1e6).toFixed(1)}M  / total $${(v.total / 1e6).toFixed(1)}M`);
  }

  if (DRY_RUN) {
    console.log(`\n[ingest-usitc-agoa] DRY RUN complete. ${accum.size} (market,year,category) rows would be upserted.\n`);
    return;
  }

  // Clean replacement: delete existing rows for the markets/years we pulled so
  // stale synthetic categories (not present in the fresh DataWeb pull) don't
  // linger and double-count. Then insert the authoritative rows.
  const ingestedIso3 = [...new Set([...accum.values()].map((e) => e.iso3))];
  const ingestedYears = [...new Set([...accum.values()].map((e) => e.year))];
  const { error: delErr } = await sb
    .from('souvera_agoa_trade_flows')
    .delete()
    .in('iso3', ingestedIso3)
    .in('year', ingestedYears);
  if (delErr) { console.log(`  ❌ cleanup delete failed: ${delErr.message}`); }
  else console.log(`  Cleaned existing rows for ${ingestedIso3.length} markets × years [${ingestedYears.join(',')}].`);

  // MFN rates from existing DB rows (ingested from USITC HTS / curated flows) — no hard-coded map.
  const { data: mfnRows } = await sb
    .from('souvera_agoa_trade_flows')
    .select('category_group, mfn_tariff_pct, data_quality_tier')
    .not('mfn_tariff_pct', 'is', null)
    .order('data_quality_tier', { ascending: true });
  const mfnByCategory = new Map<string, number>();
  for (const row of mfnRows ?? []) {
    const cat = String(row.category_group);
    if (!mfnByCategory.has(cat) && row.mfn_tariff_pct != null) {
      mfnByCategory.set(cat, Number(row.mfn_tariff_pct));
    }
  }
  const CATEGORY_MFN_PEER: Record<string, string> = {
    processed_foods: 'agriculture',
    leather: 'footwear',
    forest: 'agriculture',
  };
  for (const [target, peer] of Object.entries(CATEGORY_MFN_PEER)) {
    if (!mfnByCategory.has(target) && mfnByCategory.has(peer)) {
      mfnByCategory.set(target, mfnByCategory.get(peer)!);
    }
  }
  console.log(`  Loaded MFN rates for ${mfnByCategory.size} category groups from DB.`);

  // Upsert into souvera_agoa_trade_flows.
  let upserted = 0;
  for (const e of accum.values()) {
    const eligible = eligibilityMap.get(e.iso3)?.eligible ?? false;
    const isPetro = e.cat === 'petroleum';
    const agoaUsd = isPetro ? 0 : Math.round(e.agoa);
    const totalUsd = Math.round(e.total || e.agoa);
    const share = totalUsd > 0 ? Math.min(100, Math.round((agoaUsd / totalUsd) * 1000) / 10) : 0;
    const mfnTariff = isPetro ? null : (mfnByCategory.get(e.cat) ?? null);
    const tariffSavings =
      isPetro || agoaUsd <= 0 || mfnTariff == null
        ? isPetro ? 0 : null
        : Math.round(agoaUsd * (mfnTariff / 100));
    const { error } = await sb.from('souvera_agoa_trade_flows').upsert(
      {
        iso3: e.iso3,
        year: e.year,
        category_group: e.cat,
        category_label: CATEGORY_LABEL[e.cat] ?? e.cat,
        hs_chapter: CATEGORY_HS_CHAPTER[e.cat] ?? '99',
        agoa_eligible: eligible,
        agoa_status: eligible ? 'eligible' : 'ineligible',
        total_exports_to_us_usd: totalUsd,
        agoa_exports_usd: agoaUsd,
        non_agoa_exports_usd: Math.max(totalUsd - agoaUsd, 0),
        agoa_share_pct: share,
        mfn_tariff_pct: mfnTariff,
        tariff_savings_usd: tariffSavings,
        data_quality_tier: 'A',
        source_notes: `USITC DataWeb ${e.year} · AGOA program "${AGOA_PROGRAM}" · CONS_CUSTOMS_VALUE · reporter USA`,
      },
      { onConflict: 'iso3,year,category_group' }
    );
    if (!error) upserted += 1;
    else console.log(`    ❌ ${e.iso3}/${e.year}/${e.cat}: ${error.message}`);
  }
  console.log(`\n[ingest-usitc-agoa] Upserted ${upserted} authoritative flow rows from DataWeb.\n`);
}

if (require.main === module) {
  ingestUsitcAgoa().catch((e) => { console.error(e); process.exit(1); });
}
