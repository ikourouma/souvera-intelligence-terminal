/**
 * Daily policy status coverage audit.
 *
 * Usage: npx tsx scripts/audit-policy-status-coverage.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { entityKeysForRegion } from '../apps/api-gateway/src/lib/entity-registry';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const FRAMEWORKS = ['AGOA', 'CBI', 'AfCFTA', 'ECOWAS', 'CARICOM'] as const;

function expectedFrameworksForEntity(entityKey: string, region: 'africa' | 'caribbean'): string[] {
  const ecowasScope = new Set([
    'BEN', 'BFA', 'CPV', 'CIV', 'GMB', 'GHA', 'GIN', 'GNB', 'LBR', 'MLI', 'NER', 'NGA', 'SEN',
    'SLE', 'TGO',
  ]);
  if (region === 'caribbean') return ['CBI', 'CARICOM'];
  const out: string[] = ['AGOA', 'AfCFTA'];
  if (ecowasScope.has(entityKey)) out.push('ECOWAS');
  return out;
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: rows, error } = await supabase
    .from('souvera_country_policy_status')
    .select(
      'country_iso3, framework, status, evidence_artifact_id, last_reviewed_at, souvera_evidence_artifacts(status)'
    );

  if (error) {
    console.error('Query failed:', error.message);
    process.exit(1);
  }

  const byFramework: Record<string, Record<string, number>> = {};
  for (const fw of FRAMEWORKS) {
    byFramework[fw] = {};
  }

  for (const row of rows ?? []) {
    const fw = row.framework as string;
    const st = row.status as string;
    if (!byFramework[fw]) byFramework[fw] = {};
    byFramework[fw][st] = (byFramework[fw][st] ?? 0) + 1;
  }

  const africa = entityKeysForRegion('africa');
  const caribbean = entityKeysForRegion('caribbean');
  const missing: Array<{ entityKey: string; framework: string }> = [];

  for (const entityKey of africa) {
    for (const fw of expectedFrameworksForEntity(entityKey, 'africa')) {
      const found = (rows ?? []).some(
        (r) => r.country_iso3 === entityKey && r.framework === fw
      );
      if (!found) missing.push({ entityKey, framework: fw });
    }
  }
  for (const entityKey of caribbean) {
    for (const fw of expectedFrameworksForEntity(entityKey, 'caribbean')) {
      const found = (rows ?? []).some(
        (r) => r.country_iso3 === entityKey && r.framework === fw
      );
      if (!found) missing.push({ entityKey, framework: fw });
    }
  }

  const lines: string[] = [
    '# Policy status coverage audit',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Counts by framework and status',
    '',
  ];

  for (const fw of FRAMEWORKS) {
    lines.push(`### ${fw}`);
    const counts = byFramework[fw] ?? {};
    if (!Object.keys(counts).length) {
      lines.push('- (no rows)');
    } else {
      for (const [st, n] of Object.entries(counts).sort()) {
        lines.push(`- ${st}: ${n}`);
      }
    }
    lines.push('');
  }

  lines.push('## Entities missing expected policy rows');
  if (!missing.length) {
    lines.push('- None');
  } else {
    for (const m of missing) {
      lines.push(`- ${m.entityKey} / ${m.framework}`);
    }
  }

  const outPath = path.resolve(process.cwd(), 'tmp/policy-status-audit.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

  console.log(lines.join('\n'));
  console.log(`\nWrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
