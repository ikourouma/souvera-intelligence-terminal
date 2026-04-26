// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// SQL Pack v1.1 Direct Deployer
//
// Connects directly to Supabase Postgres and
// executes the SQL Pack.
//
// Usage: npx tsx infra/supabase/deploy.ts
// ===========================================

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Extract project ref from URL
const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];

// Supabase direct connection string
// Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
// Or: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use the Transaction pooler for DDL
const DATABASE_URL = `postgresql://postgres.${PROJECT_REF}:${SERVICE_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
const DIRECT_URL = `postgresql://postgres:${SERVICE_KEY}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

async function main() {
  console.log('==============================================');
  console.log('  SOUVERA SQL PACK v1.1 — DIRECT DEPLOYER');
  console.log('==============================================\n');
  console.log(`Project: ${PROJECT_REF}`);

  const sqlPath = path.resolve(__dirname, 'sql-pack-v1.1.sql');
  const fullSql = fs.readFileSync(sqlPath, 'utf-8');

  console.log(`SQL file: ${sqlPath} (${fullSql.length} bytes)\n`);

  // Try direct connection first, then pooler
  let sql: ReturnType<typeof postgres> | null = null;

  for (const [label, connStr] of [
    ['Direct', DIRECT_URL],
    ['Pooler', DATABASE_URL],
  ] as const) {
    try {
      console.log(`Trying ${label} connection...`);
      sql = postgres(connStr, {
        ssl: 'require',
        connect_timeout: 15,
        idle_timeout: 30,
      });

      // Test connection
      const result = await sql`SELECT current_database(), now()`;
      console.log(`✅ ${label} connection successful: ${result[0].current_database}`);
      break;
    } catch (err) {
      console.log(`❌ ${label} connection failed: ${(err as Error).message?.substring(0, 100)}`);
      sql = null;
    }
  }

  if (!sql) {
    console.error('\n❌ Could not connect to Supabase Postgres.');
    console.log('\nPlease deploy SQL Pack manually:');
    console.log(`  1. Open: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
    console.log('  2. Paste the contents of: infra/supabase/sql-pack-v1.1.sql');
    console.log('  3. Click "Run"');
    process.exit(1);
  }

  // Deploy SQL Pack
  try {
    console.log('\nDeploying SQL Pack v1.1...\n');

    // Execute the full SQL pack
    await sql.unsafe(fullSql);

    console.log('✅ SQL Pack v1.1 deployed successfully!\n');

    // Verify deployment
    console.log('Verifying deployment...');

    const plans = await sql`SELECT id, name, rank FROM souvera_plans ORDER BY rank`;
    console.log(`\n📋 Plans (${plans.length}):`);
    for (const p of plans) {
      console.log(`   ${p.rank}. ${p.id} — ${p.name}`);
    }

    const sources = await sql`SELECT key, name, priority_rank FROM souvera_data_sources ORDER BY priority_rank`;
    console.log(`\n📡 Data Sources (${sources.length}):`);
    for (const s of sources) {
      console.log(`   ${s.priority_rank}. ${s.key} — ${s.name}`);
    }

    const indicators = await sql`SELECT key, label FROM souvera_indicators ORDER BY key`;
    console.log(`\n📊 Indicators (${indicators.length}):`);
    for (const i of indicators) {
      console.log(`   - ${i.key} — ${i.label}`);
    }

    const countries = await sql`SELECT COUNT(*) as count FROM souvera_countries`;
    console.log(`\n🌍 Countries: ${countries[0].count}`);

    console.log('\n==============================================');
    console.log('  SQL PACK v1.1 DEPLOYMENT COMPLETE ✅');
    console.log('==============================================\n');
  } catch (err) {
    console.error('\n❌ SQL Pack deployment failed:', (err as Error).message);
    console.log('\nIf the error mentions existing objects, the schema may be partially deployed.');
    console.log('Check the Supabase Dashboard for current state.');
  } finally {
    await sql.end();
  }
}

main();
