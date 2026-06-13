/**
 * Compare USTR Africa directory parse vs Souvera APPROVED_AFRICA_ISO3.
 *
 * Usage: npx tsx scripts/audit-ustr-africa-coverage.ts
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3 } from '../apps/api-gateway/src/lib/market-coverage';
import { countryDisplayName } from '../apps/api-gateway/src/lib/intelligence/country-names';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let ustrIso3 = new Set<string>();
  const nameMismatches: Array<{ iso3: string; ustrLabel: string; souveraName: string }> = [];

  if (url && key) {
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data } = await supabase
      .from('souvera_external_reference_links')
      .select('entity_key, label')
      .eq('ref_type', 'USTR_COUNTRY_PAGE')
      .not('entity_key', 'is', null);

    for (const row of data ?? []) {
      const iso = (row.entity_key as string).toUpperCase();
      ustrIso3.add(iso);
      const souveraName = countryDisplayName(iso);
      const ustrLabel = (row.label as string) ?? '';
      if (
        ustrLabel &&
        !ustrLabel.toLowerCase().includes(souveraName.toLowerCase().slice(0, 5)) &&
        !souveraName.toLowerCase().includes(ustrLabel.toLowerCase().slice(0, 5))
      ) {
        nameMismatches.push({ iso3: iso, ustrLabel, souveraName });
      }
    }
  }

  const unmatchedPath = path.resolve(process.cwd(), 'tmp/ustr-africa-unmatched.json');
  let unmatchedFromParse: string[] = [];
  if (fs.existsSync(unmatchedPath)) {
    const raw = JSON.parse(fs.readFileSync(unmatchedPath, 'utf8')) as {
      unmatched?: Array<{ slug: string; label: string }>;
      missingInUstr?: string[];
    };
    unmatchedFromParse = (raw.unmatched ?? []).map((u) => `${u.label} (${u.slug})`);
    if (raw.missingInUstr?.length) {
      for (const iso of raw.missingInUstr) ustrIso3.delete(iso);
    }
  }

  const souveraSet = new Set(APPROVED_AFRICA_ISO3);
  const missingInSouvera = [...ustrIso3].filter((iso) => !souveraSet.has(iso as never));
  const missingInUstr = APPROVED_AFRICA_ISO3.filter((iso) => !ustrIso3.has(iso));

  const lines = [
    '# USTR Africa coverage audit',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    `- Souvera Africa allowlist: **${APPROVED_AFRICA_ISO3.length}**`,
    `- USTR directory matched ISO3: **${ustrIso3.size}**`,
    '',
    '## Missing in Souvera (in USTR directory, not in allowlist)',
    ...(missingInSouvera.length
      ? missingInSouvera.map((iso) => `- ${iso}`)
      : ['- None']),
    '',
    '## Missing in USTR directory (in Souvera, no USTR country page link)',
    ...(missingInUstr.length
      ? missingInUstr.map((iso) => `- ${iso} (${countryDisplayName(iso)})`)
      : ['- None']),
    '',
    '## Name mismatches (manual review)',
    ...(nameMismatches.length
      ? nameMismatches.map(
          (m) => `- ${m.iso3}: USTR "${m.ustrLabel}" vs Souvera "${m.souveraName}"`
        )
      : ['- None']),
    '',
    '## Unmatched slugs (from last parse)',
    ...(unmatchedFromParse.length
      ? unmatchedFromParse.map((u) => `- ${u}`)
      : ['- Run `parse:ustr:africa_directory` first']),
    '',
  ];

  const outPath = path.resolve(process.cwd(), 'tmp/coverage-audit-ustr-africa.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(lines.join('\n'));
  console.log(`\nWrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
