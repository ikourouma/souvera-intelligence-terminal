/**
 * =========================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * Test User Provisioning Script
 * Owner: Afronovation, Inc.
 * =========================================================
 *
 * This script provisions test users into Supabase Auth with
 * correct plan subscriptions for tier-based QA testing.
 *
 * SECURITY NOTICE:
 * - This script reads credentials from a LOCAL file only
 * - DO NOT commit test-users.local.json to version control
 * - DO NOT log passwords to console
 * - Use SUPABASE_SERVICE_ROLE_KEY (server-side only)
 *
 * Usage:
 *   npx tsx scripts/seed-test-users.ts
 *
 * Prerequisites:
 *   1. Copy docs/examples/test-users.example.json to scripts/test-users.local.json
 *   2. Fill in actual credentials in the local file
 *   3. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api-gateway/.env.local') });

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TestUser {
  email: string;
  password: string;
  planId: 'explorer' | 'professional' | 'business' | 'institutional';
  fullName?: string;
}

interface TestUsersConfig {
  users: TestUser[];
}

interface ProvisionResult {
  email: string;
  planId: string;
  status: 'created' | 'updated' | 'skipped' | 'error';
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TEST_USERS_FILE = path.resolve(process.cwd(), 'scripts/test-users.local.json');
const EXAMPLE_FILE = path.resolve(process.cwd(), 'docs/examples/souvera-test-users.example.json');

// Valid plan IDs that can be assigned
const VALID_PLAN_IDS = ['explorer', 'professional', 'business', 'institutional', 'investor', 'platform_admin'];

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateEnvironment(): void {
  if (!SUPABASE_URL) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable');
    console.error('   Set this in .env.local or apps/api-gateway/.env.local');
    process.exit(1);
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    console.error('   This is required for admin operations');
    console.error('   Find it in Supabase Dashboard > Settings > API > service_role key');
    process.exit(1);
  }

  console.log('✓ Environment variables loaded');
  console.log(`  Supabase URL: ${SUPABASE_URL.substring(0, 30)}...`);
}

function loadTestUsers(): TestUsersConfig {
  // Check if local file exists
  if (!fs.existsSync(TEST_USERS_FILE)) {
    console.error(`❌ Test users file not found: ${TEST_USERS_FILE}`);
    console.error('');
    console.error('To create test users:');
    console.error(`  1. Copy ${EXAMPLE_FILE}`);
    console.error(`     to ${TEST_USERS_FILE}`);
    console.error('  2. Fill in actual email addresses and passwords');
    console.error('  3. Run this script again');
    console.error('');
    console.error('⚠️  NEVER commit test-users.local.json to version control!');
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(TEST_USERS_FILE, 'utf-8');
    const config: TestUsersConfig = JSON.parse(content);

    // Validate structure
    if (!config.users || !Array.isArray(config.users)) {
      throw new Error('Invalid config: "users" array is required');
    }

    // Validate each user
    for (const user of config.users) {
      if (!user.email || typeof user.email !== 'string') {
        throw new Error('Invalid user: "email" is required');
      }
      if (!user.password || typeof user.password !== 'string') {
        throw new Error(`Invalid user ${user.email}: "password" is required`);
      }
      if (user.password === 'PLACEHOLDER' || user.password.length < 8) {
        throw new Error(`Invalid user ${user.email}: password must be at least 8 characters (not PLACEHOLDER)`);
      }
      if (!user.planId || !VALID_PLAN_IDS.includes(user.planId)) {
        throw new Error(`Invalid user ${user.email}: "planId" must be one of: ${VALID_PLAN_IDS.join(', ')}`);
      }
    }

    console.log(`✓ Loaded ${config.users.length} test users from config`);
    return config;
  } catch (error) {
    console.error(`❌ Error reading test users file: ${error}`);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase Admin Operations
// ─────────────────────────────────────────────────────────────────────────────

function createAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function findUserByEmail(supabase: SupabaseClient, email: string): Promise<string | null> {
  // List users and find by email (admin API doesn't have direct lookup)
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    console.error(`  Error listing users: ${error.message}`);
    return null;
  }

  const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return user?.id || null;
}

async function provisionUser(supabase: SupabaseClient, testUser: TestUser): Promise<ProvisionResult> {
  const { email, password, planId, fullName } = testUser;

  try {
    // Check if user already exists
    const existingUserId = await findUserByEmail(supabase, email);

    let userId: string;

    if (existingUserId) {
      // User exists - update password if needed
      console.log(`  User exists: ${email} (updating...)`);

      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUserId,
        {
          password,
          email_confirm: true,
          user_metadata: fullName ? { full_name: fullName } : undefined,
        }
      );

      if (updateError) {
        return {
          email,
          planId,
          status: 'error',
          message: `Failed to update: ${updateError.message}`,
        };
      }

      userId = updatedUser.user.id;
    } else {
      // Create new user
      console.log(`  Creating user: ${email}`);

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: fullName ? { full_name: fullName } : { full_name: '' },
      });

      if (createError) {
        return {
          email,
          planId,
          status: 'error',
          message: `Failed to create: ${createError.message}`,
        };
      }

      userId = newUser.user.id;

      // Wait briefly for profile trigger to fire
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Ensure profile exists (trigger should have created it, but check anyway)
    const { data: profile, error: profileError } = await supabase
      .from('souvera_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      // Manually create profile if trigger didn't fire
      console.log(`  Creating profile manually for ${email}`);
      await supabase.from('souvera_profiles').upsert({
        id: userId,
        email,
        full_name: fullName || '',
      });
    }

    // Manage subscriptions: deactivate old ones, create/update correct one
    // Step 1: Deactivate any active subscriptions that are NOT the target plan
    const { error: deactivateError } = await supabase
      .from('souvera_subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', userId)
      .neq('plan_id', planId)
      .in('status', ['trial', 'active']);

    if (deactivateError) {
      console.log(`  Warning: Could not deactivate old subscriptions: ${deactivateError.message}`);
    }

    // Step 2: Check if correct subscription already exists
    const { data: existingSub } = await supabase
      .from('souvera_subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .single();

    if (existingSub) {
      // Update existing subscription to active
      const { error: updateError } = await supabase
        .from('souvera_subscriptions')
        .update({ 
          status: 'active',
          starts_at: new Date().toISOString(),
          ends_at: null,
        })
        .eq('id', existingSub.id);

      if (updateError) {
        return {
          email,
          planId,
          status: 'error',
          message: `Failed to update subscription: ${updateError.message}`,
        };
      }
    } else {
      // Create fresh subscription
      const { error: subError } = await supabase.from('souvera_subscriptions').insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        starts_at: new Date().toISOString(),
      });

      if (subError) {
        return {
          email,
          planId,
          status: 'error',
          message: `User created but subscription failed: ${subError.message}`,
        };
      }
    }

    return {
      email,
      planId,
      status: existingUserId ? 'updated' : 'created',
      message: `Successfully ${existingUserId ? 'updated' : 'created'} with ${planId} plan`,
    };
  } catch (error) {
    return {
      email,
      planId,
      status: 'error',
      message: `Unexpected error: ${error}`,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' SOUVERA TEST USER PROVISIONING');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Validate environment
  validateEnvironment();

  // Load test users
  const config = loadTestUsers();

  // Create admin client
  const supabase = createAdminClient();
  console.log('✓ Supabase admin client initialized');
  console.log('');

  // Provision each user
  console.log('Provisioning test users...');
  console.log('───────────────────────────────────────────────────────────────');

  const results: ProvisionResult[] = [];

  for (const testUser of config.users) {
    const result = await provisionUser(supabase, testUser);
    results.push(result);
  }

  // Print summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' PROVISIONING SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  const created = results.filter((r) => r.status === 'created').length;
  const updated = results.filter((r) => r.status === 'updated').length;
  const errors = results.filter((r) => r.status === 'error').length;

  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors:  ${errors}`);
  console.log('');

  console.log('Results by user:');
  console.log('───────────────────────────────────────────────────────────────');

  for (const result of results) {
    const icon = result.status === 'error' ? '❌' : result.status === 'created' ? '✅' : '🔄';
    console.log(`  ${icon} ${result.email}`);
    console.log(`     Plan: ${result.planId}`);
    console.log(`     Status: ${result.message}`);
    console.log('');
  }

  // Verification instructions
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' VERIFICATION STEPS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('1. Check Supabase Dashboard > Authentication > Users');
  console.log('2. Run SQL to verify subscriptions:');
  console.log('');
  console.log('   SELECT p.email, s.plan_id, s.status');
  console.log('   FROM souvera_subscriptions s');
  console.log('   JOIN souvera_profiles p ON p.id = s.user_id');
  console.log('   ORDER BY s.plan_id;');
  console.log('');
  console.log('3. Test login for each tier at /login');
  console.log('4. Call /api/v1/country-lite?iso3=NGA and verify tier-appropriate data');
  console.log('');

  // Exit with error code if any failures
  if (errors > 0) {
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
