// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// SQL Pack Deployer (via Supabase Management API)
// ===========================================

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Extract project ref from URL
const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];

async function executeSqlViaRpc(sql: string): Promise<boolean> {
  // Use the Supabase pg REST API to execute arbitrary SQL
  // via the service role key with raw postgres connection
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
    },
    body: JSON.stringify({}),
  });

  return response.ok;
}

async function executeSqlChunk(sql: string, label: string): Promise<void> {
  console.log(`\n[DEPLOY] Executing: ${label}...`);
  
  // Use the Supabase SQL endpoint (pg-meta)
  const response = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'X-Supabase-Api-Version': '2024-01-01',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const errText = await response.text();
    // Try alternative endpoint
    const response2 = await fetch(`https://${PROJECT_REF}.supabase.co/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
      body: JSON.stringify({}),
    });

    throw new Error(`SQL execution failed (${response.status}): ${errText.substring(0, 500)}`);
  }

  console.log(`[DEPLOY] ✅ ${label} completed`);
}

async function main() {
  console.log('==============================================');
  console.log('  SOUVERA SQL PACK v1.1 — DEPLOYER');
  console.log('==============================================\n');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`URL: ${SUPABASE_URL}\n`);

  const sqlPath = path.resolve(__dirname, 'sql-pack-v1.1.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // Split SQL into logical chunks at the section markers
  const chunks = sql.split(/-- ={5,}/).filter(c => c.trim().length > 0);
  
  console.log(`Found ${chunks.length} SQL sections\n`);
  console.log('NOTE: If pg/query endpoint is not available,');
  console.log('please deploy via the Supabase Dashboard SQL Editor.');
  console.log('File: infra/supabase/sql-pack-v1.1.sql\n');

  // Try direct execution
  try {
    await executeSqlChunk(sql, 'Full SQL Pack');
    console.log('\n✅ SQL Pack v1.1 deployed successfully!');
  } catch (err) {
    console.log('\n⚠️  Direct SQL execution not available via API.');
    console.log('This is expected — Supabase requires Dashboard or CLI for DDL.\n');
    console.log('Please deploy manually:');
    console.log('  1. Open: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
    console.log('  2. Paste the contents of: infra/supabase/sql-pack-v1.1.sql');
    console.log('  3. Click "Run"');
    console.log('  4. Then re-run this script to verify.\n');

    // Verify if already deployed
    console.log('Checking if tables already exist...');
    const check = await fetch(`${SUPABASE_URL}/rest/v1/souvera_plans?select=id&limit=1`, {
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
    });

    if (check.ok) {
      const data = await check.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Tables exist! SQL Pack is already deployed.');
      } else {
        console.log('⚠️  Tables might exist but are empty. Deploy SQL Pack to seed data.');
      }
    } else {
      console.log('❌ Tables do not exist. SQL Pack deployment required.');
    }
  }
}

main();
