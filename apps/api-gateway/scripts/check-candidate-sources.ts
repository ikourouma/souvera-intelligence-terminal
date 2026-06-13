/**
 * Best-effort HEAD/GET for candidate backlog source links.
 * Run: npx tsx scripts/check-candidate-sources.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { CLAIM_CATEGORY_SOURCES } from '../src/lib/data-backlog/candidate-sources';

async function checkUrl(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    return { ok: res.status >= 200 && res.status < 400, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

async function main() {
  const seen = new Set<string>();
  const results: Array<{ name: string; url: string; ok: boolean; status: number }> = [];

  for (const sources of Object.values(CLAIM_CATEGORY_SOURCES)) {
    for (const s of sources) {
      if (seen.has(s.url)) continue;
      seen.add(s.url);
      const r = await checkUrl(s.url);
      results.push({ name: s.name, url: s.url, ok: r.ok, status: r.status });
      console.log(`${r.ok ? 'OK' : 'FAIL'} ${r.status} ${s.name}`);
      await new Promise((res) => setTimeout(res, 200));
    }
  }

  const outDir = path.resolve(process.cwd(), '..', '..', 'tmp');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'source-link-health.json'),
    JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2)
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
