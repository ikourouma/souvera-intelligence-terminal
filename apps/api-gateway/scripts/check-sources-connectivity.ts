/**
 * HTTP connectivity check for Active registry sources with API bases.
 * Run: npx tsx scripts/check-sources-connectivity.ts
 * Output: tmp/source-connectivity.json
 */
import * as fs from 'fs';
import * as path from 'path';
import { SOURCE_REGISTRY } from '../src/data/source-registry';
import { DATA_SOURCE_URLS } from '@souvera/config';

interface CheckResult {
  sourceKey: string;
  url: string;
  ok: boolean;
  status: number;
  ms: number;
  error?: string;
}

async function probe(url: string, timeoutMs = 15000): Promise<CheckResult['status'] | 'error'> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    return res.status;
  } catch {
    clearTimeout(t);
    return 'error';
  }
}

async function main() {
  const results: CheckResult[] = [];
  const start = Date.now();

  const checks: Array<{ sourceKey: string; url: string }> = [
    {
      sourceKey: 'world_bank',
      url: `${DATA_SOURCE_URLS.worldBank}/country/NG/indicator/NY.GDP.MKTP.CD?format=json&per_page=5&date=2023:2024`,
    },
    {
      sourceKey: 'imf_dataservices',
      url: `${DATA_SOURCE_URLS.imfDataServices}Dataflow`,
    },
    {
      sourceKey: 'faostat',
      url: `${DATA_SOURCE_URLS.faostat}`,
    },
    {
      sourceKey: 'world_bank_projects',
      url: `${DATA_SOURCE_URLS.worldBankProjects}?format=json&rows=1`,
    },
    {
      sourceKey: 'rest_countries',
      url: `${DATA_SOURCE_URLS.restCountries}/alpha/nga`,
    },
    {
      sourceKey: 'un_comtrade',
      url: 'https://comtradeapi.un.org/docs',
    },
  ];

  for (const c of checks) {
    const t0 = Date.now();
    const status = await probe(c.url);
    const ms = Date.now() - t0;
    results.push({
      sourceKey: c.sourceKey,
      url: c.url,
      ok: typeof status === 'number' && status >= 200 && status < 400,
      status: typeof status === 'number' ? status : 0,
      ms,
      error: status === 'error' ? 'fetch failed' : undefined,
    });
    console.log(`${c.sourceKey}: ${status} (${ms}ms)`);
  }

  const outDir = path.resolve(process.cwd(), '..', '..', 'tmp');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'source-connectivity.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify({ checkedAt: new Date().toISOString(), durationMs: Date.now() - start, results, registryCount: SOURCE_REGISTRY.length }, null, 2)
  );
  console.log('Wrote', outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
