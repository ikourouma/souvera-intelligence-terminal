/**
 * Deploy curated news migration to Supabase Postgres.
 * Run: npx tsx scripts/deploy-curated-news-migration.ts
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];

const DIRECT_URL = `postgresql://postgres:${SERVICE_KEY}@db.${PROJECT_REF}.supabase.co:5432/postgres`;
const POOLER_URL = `postgresql://postgres.${PROJECT_REF}:${SERVICE_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function main() {
  const migrationPath = path.join(
    process.cwd(),
    'infra/supabase/migrations/create-curated-news-tables.sql'
  );
  const sqlText = fs.readFileSync(migrationPath, 'utf-8');

  let sql: ReturnType<typeof postgres> | null = null;

  for (const [label, connStr] of [
    ['Direct', DIRECT_URL],
    ['Pooler', POOLER_URL],
  ] as const) {
    try {
      console.log(`Trying ${label} connection...`);
      sql = postgres(connStr, { ssl: 'require', connect_timeout: 15 });
      await sql`SELECT 1`;
      console.log(`✅ ${label} connected\n`);
      break;
    } catch (err) {
      console.log(`❌ ${label}: ${(err as Error).message?.slice(0, 80)}`);
      sql = null;
    }
  }

  if (!sql) {
    console.error('\nDeploy manually via Supabase SQL Editor:');
    console.error('  infra/supabase/migrations/create-curated-news-tables.sql');
    process.exit(1);
  }

  try {
    await sql.unsafe(sqlText);
    console.log('✅ Curated news migration deployed.');
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
