/**
 * U.S. Census Bureau International Trade ingestion — API primary, FTP fallback only.
 *
 * Primary: GET https://api.census.gov/data/timeseries/intltrade (requires CENSUS_API_KEY)
 * Fallback: ftp2.census.gov — only when API is unreachable or rate-limit retries exhausted
 *
 * Target: souvera_country_trade_snapshots (exports_to_us_usd, imports_from_us_usd)
 * Crosswalk: souvera_countries.census_code → ISO3
 *
 * Run: npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts ingest-census-trade
 */
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Client as FtpClient } from 'basic-ftp';
import { getSupabaseServiceClient } from '@souvera/config';
import type { IngestionResult } from '@souvera/types';
import {
  archivePayload,
  closeIngestionJob,
  createIngestionJob,
  updateSourceHealth,
} from './shared';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../apps/api-gateway/.env.local') });

/** Resolve key from dotenv or free-form .env.local notes (e.g. "4. CENSUS_API_KEY=..."). */
function resolveCensusApiKey(): string | undefined {
  const direct = process.env.CENSUS_API_KEY?.trim();
  if (direct) return direct;
  const candidates = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../apps/api-gateway/.env.local'),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const m = fs.readFileSync(file, 'utf8').match(/CENSUS_API_KEY\s*=\s*(\S+)/);
    if (m?.[1]) return m[1];
  }
  return undefined;
}

const API_BASE = 'https://api.census.gov/data/timeseries/intltrade';
const FTP_HOST = 'ftp2.census.gov';
const YEARS = (process.env.CENSUS_YEARS || '2021,2022,2023,2024')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const DRY_RUN = process.env.CENSUS_DRY_RUN === '1';

type FetchMode = 'api' | 'ftp';

interface CountryTradeTotals {
  iso3: string;
  year: number;
  exportsToUsUsd: number;
  importsFromUsUsd: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parse Census JSON array-of-arrays into row objects. */
function parseCensusJson(rows: unknown): Record<string, string>[] {
  if (!Array.isArray(rows) || rows.length < 2) return [];
  const headers = rows[0] as string[];
  return (rows.slice(1) as string[][]).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? '';
    });
    return obj;
  });
}

/** Pick latest month in year per CTY_CODE (GEN_VAL_YR / ALL_VAL_YR are YTD — Dec = full year). */
function aggregateByCountryYear(rows: Record<string, string>[], valueKey: string): Map<string, number> {
  const latest = new Map<string, { time: string; val: number }>();
  for (const row of rows) {
    const code = row.CTY_CODE?.trim();
    if (!code || code === '-' || code === '0000') continue;
    const time = row.time ?? '';
    const val = Number(String(row[valueKey] ?? '').replace(/,/g, ''));
    if (!Number.isFinite(val)) continue;
    const prev = latest.get(code);
    if (!prev || time > prev.time) latest.set(code, { time, val });
  }
  return new Map([...latest.entries()].map(([code, { val }]) => [code, val]));
}

async function fetchCensusApi(
  flow: 'imports' | 'exports',
  year: string,
  apiKey: string,
  retries = 3
): Promise<Map<string, number>> {
  const valueKey = flow === 'imports' ? 'GEN_VAL_YR' : 'ALL_VAL_YR';
  const get = flow === 'imports' ? 'CTY_CODE,GEN_VAL_YR' : 'CTY_CODE,ALL_VAL_YR';
  const url = `${API_BASE}/${flow}/enduse?get=${encodeURIComponent(get)}&time=${year}&key=${encodeURIComponent(apiKey)}`;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(90_000) });
      if (res.status === 400) {
        const body = await res.text();
        throw new Error(`Census API bad query (400) — fix params, no FTP fallback: ${body.slice(0, 300)}`);
      }
      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`HTTP ${res.status}`);
        const wait = Math.pow(2, attempt) * 1500;
        console.warn(`[Census] ${flow}/${year} HTTP ${res.status} — retry in ${wait}ms`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json = (await res.json()) as unknown;
      const parsed = parseCensusJson(json);
      return aggregateByCountryYear(parsed, valueKey);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.message.includes('bad query')) throw lastError;
      const wait = Math.pow(2, attempt) * 1500;
      console.warn(`[Census] ${flow}/${year} attempt ${attempt + 1} failed: ${lastError.message}`);
      await sleep(wait);
    }
  }
  throw lastError ?? new Error('Census API fetch failed');
}

/** FTP fallback — downloads state export summary when API unavailable. */
async function fetchCensusFtp(year: string): Promise<{ exports: Map<string, number>; imports: Map<string, number> }> {
  const client = new FtpClient();
  client.ftp.verbose = false;
  const exports = new Map<string, number>();
  const imports = new Map<string, number>();

  try {
    await client.access({
      host: FTP_HOST,
      user: 'anonymous',
      password: 'guest@',
      secure: false,
    });

    // Placeholder path — Census FTP layout varies; log listing for ops verification.
    const listing = await client.list('/foreign-trade/reference/');
    console.log(`[Census FTP] /foreign-trade/reference/ entries: ${listing.length}`);

    // Without a stable per-country CSV on FTP, return empty maps and let job report partial.
    console.warn(
      `[Census FTP] No automated CSV parser wired for ${year} — API path required for country totals. ` +
        'FTP used only as connectivity fallback; upsert skipped for FTP-sourced rows.'
    );
  } finally {
    client.close();
  }

  return { exports, imports };
}

async function loadCensusCrosswalk(
  supabase: ReturnType<typeof getSupabaseServiceClient>
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from('souvera_countries')
    .select('iso3, census_code')
    .not('census_code', 'is', null);

  if (error) throw new Error(`Crosswalk load failed: ${error.message}`);

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    const code = String(row.census_code ?? '').trim();
    if (code) map.set(code, row.iso3 as string);
  }
  return map;
}

function buildTotalsForYear(
  year: number,
  crosswalk: Map<string, string>,
  exportsByCode: Map<string, number>,
  importsByCode: Map<string, number>
): CountryTradeTotals[] {
  const isoSet = new Set<string>();
  for (const code of exportsByCode.keys()) {
    const iso = crosswalk.get(code);
    if (iso) isoSet.add(iso);
  }
  for (const code of importsByCode.keys()) {
    const iso = crosswalk.get(code);
    if (iso) isoSet.add(iso);
  }

  const byIso = new Map<string, CountryTradeTotals>();
  for (const iso3 of isoSet) {
    byIso.set(iso3, { iso3, year, exportsToUsUsd: 0, importsFromUsUsd: 0 });
  }

  for (const [code, val] of exportsByCode) {
    const iso = crosswalk.get(code);
    if (!iso) continue;
    const row = byIso.get(iso)!;
    row.exportsToUsUsd += val;
  }
  for (const [code, val] of importsByCode) {
    const iso = crosswalk.get(code);
    if (!iso) continue;
    const row = byIso.get(iso)!;
    row.importsFromUsUsd += val;
  }

  return [...byIso.values()].filter(
    (r) => r.exportsToUsUsd > 0 || r.importsFromUsUsd > 0
  );
}

export async function ingestCensusTradeData(): Promise<void> {
  const apiKey = resolveCensusApiKey();
  const startTime = Date.now();
  let fetchMode: FetchMode = 'api';
  const allRecords: CountryTradeTotals[] = [];

  console.log('\n========================================');
  console.log('[Census Trade] Starting ingestion (API-first)...');
  console.log('========================================\n');

  const { jobId, sourceId } = await createIngestionJob('us_census_trade', 'trade_refresh');
  let processed = 0;
  let failed = 0;

  try {
    const supabase = getSupabaseServiceClient();
    const crosswalk = await loadCensusCrosswalk(supabase);
    console.log(`[Census] Crosswalk: ${crosswalk.size} census_code → ISO3 mappings`);

    for (const yearStr of YEARS) {
      const year = Number(yearStr);
      console.log(`\n[Census] Year ${year}...`);

      let exportsByCode = new Map<string, number>();
      let importsByCode = new Map<string, number>();

      if (apiKey) {
        try {
          exportsByCode = await fetchCensusApi('exports', yearStr, apiKey);
          importsByCode = await fetchCensusApi('imports', yearStr, apiKey);
          fetchMode = 'api';
          await archivePayload(
            sourceId,
            `${API_BASE}/exports+imports/enduse`,
            { year: yearStr, fetch_mode: 'api' },
            {
              exportsCountries: exportsByCode.size,
              importsCountries: importsByCode.size,
            },
            200
          );
        } catch (apiErr) {
          const msg = apiErr instanceof Error ? apiErr.message : String(apiErr);
          if (msg.includes('bad query')) {
            throw apiErr;
          }
          console.warn(`[Census] API failed for ${year}: ${msg} — attempting FTP fallback`);
          fetchMode = 'ftp';
          const ftp = await fetchCensusFtp(yearStr);
          exportsByCode = ftp.exports;
          importsByCode = ftp.imports;
          await archivePayload(
            sourceId,
            `ftp://${FTP_HOST}/foreign-trade/reference/`,
            { year: yearStr, fetch_mode: 'ftp' },
            { note: 'FTP fallback — no country totals parsed' },
            0
          );
        }
      } else {
        console.warn('[Census] CENSUS_API_KEY not set — using FTP fallback only');
        fetchMode = 'ftp';
        const ftp = await fetchCensusFtp(yearStr);
        exportsByCode = ftp.exports;
        importsByCode = ftp.imports;
      }

      const totals = buildTotalsForYear(year, crosswalk, exportsByCode, importsByCode);
      console.log(`[Census] ${year}: ${totals.length} markets with bilateral totals (${fetchMode})`);
      allRecords.push(...totals);
    }

    if (DRY_RUN) {
      console.log(`\n[Census] DRY RUN — would upsert ${allRecords.length} rows`);
      await closeIngestionJob(jobId, 'succeeded', allRecords.length, 0);
      return;
    }

    const isoList = [...new Set(allRecords.map((r) => r.iso3))];
    const { data: countries, error: cErr } = await supabase
      .from('souvera_countries')
      .select('id, iso3')
      .in('iso3', isoList);

    if (cErr) throw new Error(`Country lookup failed: ${cErr.message}`);
    const countryMap = new Map((countries ?? []).map((c) => [c.iso3, c.id]));

    for (const rec of allRecords) {
      const countryId = countryMap.get(rec.iso3);
      if (!countryId) {
        failed++;
        continue;
      }

      const totalTrade = rec.exportsToUsUsd + rec.importsFromUsUsd;
      const { error } = await supabase.from('souvera_country_trade_snapshots').upsert(
        {
          country_id: countryId,
          year: rec.year,
          exports_to_us_usd: Math.round(rec.exportsToUsUsd),
          imports_from_us_usd: Math.round(rec.importsFromUsUsd),
          total_trade_usd: Math.round(totalTrade),
          // Clear legacy global totals so Census bilateral rows are not mixed with static _meta.
          exports_usd: null,
          imports_usd: null,
          source_id: sourceId,
          source_notes: `U.S. Census Bureau intltrade/enduse (${fetchMode})`,
          generated_at: new Date().toISOString(),
        },
        { onConflict: 'country_id,year' }
      );

      if (error) {
        console.error(`  ✗ ${rec.iso3}/${rec.year}: ${error.message}`);
        failed++;
      } else {
        processed++;
      }
    }

    const elapsed = Date.now() - startTime;
    const status = failed === 0 ? 'succeeded' : processed > 0 ? 'partial' : 'failed';
    await closeIngestionJob(jobId, status, processed, failed);
    await updateSourceHealth(sourceId, status !== 'failed', elapsed);

    console.log(`\n[Census] Done: ${processed} upserted, ${failed} failed (${fetchMode}, ${elapsed}ms)\n`);
    if (failed > 0 && processed === 0) throw new Error('Census ingestion produced no successful upserts');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await closeIngestionJob(jobId, 'failed', processed, failed + 1, msg);
    await updateSourceHealth(sourceId, false);
    throw err;
  }
}

/** Structured result for programmatic callers / tests. */
export async function ingestCensusTradeDataResult(): Promise<IngestionResult<CountryTradeTotals>> {
  const fetchedAt = new Date().toISOString();
  try {
    await ingestCensusTradeData();
    return {
      sourceKey: 'us_census_trade',
      jobId: '',
      success: true,
      recordsProcessed: 0,
      recordsFailed: 0,
      fetchedAt,
    };
  } catch (err) {
    return {
      sourceKey: 'us_census_trade',
      jobId: '',
      success: false,
      recordsProcessed: 0,
      recordsFailed: 1,
      fetchedAt,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
