// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Governance Migrations Deployer
// Usage: npx tsx infra/supabase/deploy-governance.ts
// ===========================================

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api-gateway/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const DATABASE_URL = `postgresql://postgres.${PROJECT_REF}:${SERVICE_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
const DIRECT_URL = `postgresql://postgres:${SERVICE_KEY}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

async function main() {
  console.log('==============================================');
  console.log('  SOUVERA GOVERNANCE DEPLOYER');
  console.log('==============================================\n');

  let sql: ReturnType<typeof postgres> | null = null;

  for (const [label, connStr] of [
    ['Direct', DIRECT_URL],
    ['Pooler', DATABASE_URL],
  ] as const) {
    try {
      console.log(`Trying ${label} connection...`);
      sql = postgres(connStr, {
        ssl: 'require',
        connect_timeout: 10,
        idle_timeout: 20,
      });

      const result = await sql`SELECT current_database(), now()`;
      console.log(`✅ ${label} connection successful: ${result[0].current_database}`);
      break;
    } catch (err) {
      console.log(`❌ ${label} connection failed: ${(err as Error).message?.substring(0, 100)}`);
      sql = null;
    }
  }

  if (!sql) {
    console.error('\n❌ Could not connect directly to Supabase Postgres.');
    console.log('This is expected if the service key differs from the DB password.');
    console.log('Please copy and execute the migrations in the Supabase Dashboard SQL Editor manually:');
    console.log('  - file:///c:/Users/ikour/Projects/souvera/infra/supabase/sql-pack-v1.19-partner-map-locks.sql');
    console.log('  - file:///c:/Users/ikour/Projects/souvera/infra/supabase/sql-pack-v1.20-governance-events.sql');
    process.exit(1);
  }

  try {
    // 1. Deploy Map Locks
    const mapLocksPath = path.resolve(__dirname, 'sql-pack-v1.19-partner-map-locks.sql');
    console.log(`\nDeploying Map Locks from: ${mapLocksPath}`);
    const mapLocksSql = fs.readFileSync(mapLocksPath, 'utf-8');
    await sql.unsafe(mapLocksSql);
    console.log('✅ sql-pack-v1.19-partner-map-locks.sql deployed successfully!');

    // 2. Deploy Governance Events
    const govEventsPath = path.resolve(__dirname, 'sql-pack-v1.20-governance-events.sql');
    console.log(`\nDeploying Governance Events from: ${govEventsPath}`);
    const govEventsSql = fs.readFileSync(govEventsPath, 'utf-8');
    await sql.unsafe(govEventsSql);
    console.log('✅ sql-pack-v1.20-governance-events.sql deployed successfully!');

    console.log('\n==============================================');
    console.log('  GOVERNANCE SCHEMAS DEPLOYED SUCCESSFULLY ✅');
    console.log('==============================================\n');
  } catch (err) {
    console.error('\n❌ Migration failed:', (err as Error).message);
  } finally {
    await sql.end();
  }
}

main();
