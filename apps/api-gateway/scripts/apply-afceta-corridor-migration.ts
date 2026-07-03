/**
 * Apply AfCETA corridor signals table migration via direct Postgres.
 * Set SUPABASE_DB_PASSWORD in .env.local if the service role key is not the DB password.
 *
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/apply-afceta-corridor-migration.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import postgres from 'postgres';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD ?? serviceKey;
  if (!url || !dbPassword) throw new Error('Missing Supabase env');

  const projectRef = url.replace('https://', '').split('.')[0];
  const regions = ['us-east-1', 'us-west-1', 'eu-west-1', 'eu-central-1', 'ap-southeast-1'];

  const candidates = [
    `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`,
    ...regions.map(
      (r) =>
        `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-${r}.pooler.supabase.com:6543/postgres`,
    ),
  ];

  const migrationPath = path.resolve(
    process.cwd(),
    'infra/supabase/migrations/create-afceta-corridor-signals.sql',
  );
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

  let client: ReturnType<typeof postgres> | null = null;

  for (const connStr of candidates) {
    try {
      console.log('[apply-afceta] Trying Postgres connection...');
      client = postgres(connStr, { ssl: 'require', connect_timeout: 10, idle_timeout: 20 });
      await client`SELECT current_database()`;
      console.log('[apply-afceta] Connected.');
      break;
    } catch (err) {
      console.warn('[apply-afceta]', (err as Error).message?.slice(0, 100));
      client = null;
    }
  }

  if (!client) {
    console.error('\n[apply-afceta] Could not connect to Postgres.');
    console.error(`Open SQL Editor: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.error('Paste and run: infra/supabase/migrations/create-afceta-corridor-signals.sql');
    console.error('Optional: set SUPABASE_DB_PASSWORD in apps/api-gateway/.env.local for direct deploy.\n');
    process.exit(1);
  }

  try {
    await client.unsafe(migrationSql);
    console.log('[apply-afceta] Migration applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
