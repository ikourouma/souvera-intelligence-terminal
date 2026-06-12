/**
 * =========================================================
 * Apply Super Admin Migration
 * =========================================================
 *
 * This script applies the super admin migration to add:
 * - super_admin role to souvera_user_role enum
 * - super_admin plan with rank 100
 * - super_admin entitlements
 * - investor plan (if missing)
 *
 * Usage:
 *   npx tsx scripts/apply-super-admin-migration.ts
 *
 * Prerequisites:
 *   1. Set NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   2. Set SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api-gateway/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function validateEnvironment(): void {
  if (!SUPABASE_URL) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
    process.exit(1);
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  console.log('✓ Environment variables loaded');
}

async function main(): Promise<void> {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' APPLYING SUPER ADMIN MIGRATION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  validateEnvironment();

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Read migration file
  const migrationPath = path.resolve(
    process.cwd(),
    'infra/supabase/migrations/20260612000000_add_super_admin_tier.sql'
  );

  console.log(`Reading migration: ${migrationPath}`);
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Applying migration...');
  console.log('───────────────────────────────────────────────────────────────');

  // Execute the migration
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: migrationSQL,
  });

  if (error) {
    // If exec_sql RPC doesn't exist, try direct execution
    console.log('  Attempting direct SQL execution...');
    
    // Split SQL into statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (!statement) continue;
      
      const { error: execError } = await supabase.from('_').select('*').limit(0);
      
      // This is a workaround - we need to use the SQL editor or Supabase CLI
      console.log('  ⚠️  Direct SQL execution not available via client library');
      break;
    }

    console.error('');
    console.error('❌ Migration cannot be applied automatically');
    console.error('');
    console.error('Please apply the migration manually:');
    console.error('');
    console.error('1. Open Supabase Dashboard');
    console.error('2. Navigate to SQL Editor');
    console.error('3. Paste and execute the following SQL:');
    console.error('');
    console.error('─────────────────────────────────────────────────────────────');
    console.error(migrationSQL);
    console.error('─────────────────────────────────────────────────────────────');
    console.error('');
    console.error('4. After applying, run: npx tsx scripts/seed-super-admin.ts');
    console.error('');
    process.exit(1);
  }

  console.log('✅ Migration applied successfully');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' NEXT STEPS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Run the super admin provisioning script:');
  console.log('  npx tsx scripts/seed-super-admin.ts');
  console.log('');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
