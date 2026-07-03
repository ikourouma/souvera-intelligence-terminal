/**
 * READ-ONLY inspection of the USITC DataWeb v5 API before enabling live ingestion.
 *
 * Confirms: (1) auth works, (2) the AGOA program code(s) from getImportPrograms,
 * (3) the runReport response column labels + sample rows + which dataToReport
 * measure code returns customs value. Writes the raw JSON to a temp file.
 *
 * Does NOT write to the database.
 *
 * Run: npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/inspect-usitc-agoa.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// The parseable env file lives at apps/api-gateway/.env.local. Resolve it
// deterministically from this script's location so cwd doesn't matter.
dotenv.config({ path: path.resolve(__dirname, '../../apps/api-gateway/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BASE = 'https://datawebws.usitc.gov/dataweb';

function headers(token: string) {
  return { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}` };
}

// Recursively collect column labels from column_groups (mirrors the API guide).
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

function buildQuery(year: string, measure: string, extPrograms: string[]) {
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
      componentSettings: { dataToReport: [measure], scale: '1', timeframeSelectType: 'fullYears', years: [year], startDate: null, endDate: null, startMonth: null, endMonth: null, yearsTimeline: 'Annual' },
      countries: { aggregation: 'Break Out Countries', countries: [], countriesExpanded: [{ name: 'All Countries', value: 'all' }], countriesSelectType: 'all', countryGroups: { systemGroups: [], userGroups: [] } },
    },
    sortingAndDataFormat: { DataSort: { columnOrder: [], fullColumnOrder: [], sortOrder: [] }, reportCustomizations: { exportCombineTables: false, showAllSubtotal: true, subtotalRecords: '', totalRecords: '20000', exportRawData: false } },
  };
}

async function main() {
  const token = process.env.USITC_DATAWEB_API_KEY;
  if (!token) { console.error('USITC_DATAWEB_API_KEY not set'); process.exit(1); }

  // 0. getAllCountries shape.
  console.log('\n=== getAllCountries ===');
  const cRes = await fetch(`${BASE}/api/v2/country/getAllCountries`, { headers: headers(token) });
  console.log(`   HTTP ${cRes.status}`);
  const cJson = await cRes.json();
  console.log('   top keys:', JSON.stringify(Object.keys(cJson)));
  const opts = cJson?.options ?? [];
  console.log('   options length:', Array.isArray(opts) ? opts.length : typeof opts);
  console.log('   first 5:', JSON.stringify(opts.slice?.(0, 5)));
  const nigeria = (opts as Array<{ name?: string }>).filter?.((o) => /niger|congo|lesotho/i.test(o.name ?? ''));
  console.log('   sample matches:', JSON.stringify(nigeria?.slice(0, 6)));

  // 1. Import programs — find AGOA.
  console.log('\n=== getImportPrograms ===');
  const progRes = await fetch(`${BASE}/api/v2/query/getImportPrograms`, {
    method: 'POST', headers: headers(token), body: JSON.stringify({ tradeType: 'Import' }),
  });
  if (!progRes.ok) { console.error(`HTTP ${progRes.status}: ${await progRes.text()}`); process.exit(1); }
  const progJson = await progRes.json();
  const options: Array<{ name?: string; value?: string }> = progJson?.options ?? progJson ?? [];
  console.log(`Total programs: ${options.length}`);
  const agoa = options.filter((o) => /agoa/i.test(o.name ?? ''));
  console.log('AGOA-matching programs:');
  for (const a of agoa) console.log(`   value="${a.value}"  name="${a.name}"`);
  const agoaCodes = agoa.map((a) => String(a.value)).filter(Boolean);

  // 2. Dump the full response for one accepted measure to learn the real structure.
  const measure = process.env.USITC_MEASURE || 'GEN_VAL';
  console.log(`\n=== runReport full dump (year=2023, measure=${measure}, AGOA "D") ===`);
  const res = await fetch(`${BASE}/api/v2/report2/runReport`, {
    method: 'POST', headers: headers(token), body: JSON.stringify(buildQuery('2023', measure, agoaCodes)),
  });
  const text = await res.text();
  fs.writeFileSync(path.resolve(__dirname, 'usitc-agoa-raw.json'), text.slice(0, 800000));
  console.log(`   HTTP ${res.status}, ${text.length} bytes → usitc-agoa-raw.json`);
  try {
    const json = JSON.parse(text);
    const dto = json?.dto ?? {};
    console.log('   dto keys:', JSON.stringify(Object.keys(dto)));
    console.log('   errors:', JSON.stringify(dto.errors));
    console.log('   needMoreTime:', JSON.stringify(dto.needMoreTime));
    console.log('   complexityThreshold:', JSON.stringify(dto.complexityThreshold));
    console.log('   tables:', Array.isArray(dto.tables) ? `len=${dto.tables.length}` : typeof dto.tables);
    if (dto.tables?.[0]) {
      const t0 = dto.tables[0];
      console.log('   tables[0] keys:', JSON.stringify(Object.keys(t0)));
      const cols = getColumns(t0.column_groups ?? []);
      console.log('   columns:', JSON.stringify(cols));
      const rows = t0.row_groups?.[0]?.rowsNew ?? [];
      console.log('   sample rows:');
      for (const r of rows.slice(0, 10)) console.log('     ', JSON.stringify((r.rowEntries ?? []).map((e: { value?: unknown }) => e?.value)));
    }
  } catch { console.log('   (non-JSON) preview:', text.slice(0, 600)); }
}

main().catch((e) => { console.error(e); process.exit(1); });
