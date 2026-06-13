/**
 * Generate docs/data/sourced-data-backlog.md from live NGA (+ optional ISO3 list).
 * Run: npx tsx scripts/generate-sourced-data-backlog.ts [ISO3...]
 */
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fetchCountryProfileReportData } from '../src/lib/reports/country-profile-data';
import {
  extractBacklogFromPayload,
  renderBacklogMarkdown,
} from '../src/lib/data-backlog/extract-claims';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const isoList = process.argv.slice(2).length ? process.argv.slice(2) : ['NGA'];
  const allItems: ReturnType<typeof extractBacklogFromPayload> = [];

  for (const iso of isoList) {
    try {
      const payload = await fetchCountryProfileReportData(iso);
      allItems.push(...extractBacklogFromPayload(payload));
      console.log(`Scanned ${iso}: ${allItems.length} cumulative items`);
    } catch (e) {
      console.warn(`Skip ${iso}:`, e);
    }
  }

  const md = renderBacklogMarkdown(allItems, new Date().toISOString());
  const outDir = path.resolve(process.cwd(), '..', '..', 'docs', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'sourced-data-backlog.md');
  fs.writeFileSync(outPath, md);
  console.log('Wrote', outPath, `(${allItems.length} items)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
