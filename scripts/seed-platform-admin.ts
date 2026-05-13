/**
 * =========================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * Platform Admin Provisioning Script
 * Owner: Afronovation, Inc.
 * =========================================================
 *
 * This script provisions a dev/test-only platform admin user
 * for Phase 4B-V2-B manual workflow validation.
 *
 * SECURITY NOTICE:
 * - This account is for LOCAL/DEV QA ONLY
 * - DO NOT use this password in production or staging
 * - DO NOT commit real production credentials
 * - Rotate or delete this account after remote QA if needed
 * - Uses SUPABASE_SERVICE_ROLE_KEY (server-side only)
 *
 * Usage:
 *   npx tsx scripts/seed-platform-admin.ts
 *
 * Prerequisites:
 *   1. Set NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   2. Set SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api-gateway/.env.local') });

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = 'admin@souveraterminal.com';
const ADMIN_PASSWORD = 'Password1!';
const ADMIN_FULL_NAME = 'Dev Platform Admin';
const ORGANIZATION_NAME = 'Admin Test Organization';
const ORGANIZATION_SLUG = 'admin-test-org';

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

async function ensureOrganization(supabase: SupabaseClient): Promise<string> {
  // Check if organization exists
  const { data: existingOrg, error: findError } = await supabase
    .from('souvera_organizations')
    .select('id')
    .eq('name', ORGANIZATION_NAME)
    .single();

  if (existingOrg) {
    console.log(`  Organization exists: ${ORGANIZATION_NAME}`);
    return existingOrg.id;
  }

  if (findError && findError.code !== 'PGRST116') {
    throw new Error(`Error checking organization: ${findError.message}`);
  }

  // Create organization
  console.log(`  Creating organization: ${ORGANIZATION_NAME}`);
  const { data: newOrg, error: createError } = await supabase
    .from('souvera_organizations')
    .insert({
      name: ORGANIZATION_NAME,
      slug: ORGANIZATION_SLUG,
    })
    .select('id')
    .single();

  if (createError || !newOrg) {
    throw new Error(`Failed to create organization: ${createError?.message}`);
  }

  return newOrg.id;
}

async function provisionPlatformAdmin(supabase: SupabaseClient): Promise<void> {
  console.log('Provisioning platform admin...');
  console.log('───────────────────────────────────────────────────────────────');

  // Step 1: Check if user already exists
  const existingUserId = await findUserByEmail(supabase, ADMIN_EMAIL);

  let userId: string;

  if (existingUserId) {
    console.log(`  User exists: ${ADMIN_EMAIL} (updating...)`);

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      existingUserId,
      {
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: ADMIN_FULL_NAME },
      }
    );

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    userId = updatedUser.user.id;
  } else {
    console.log(`  Creating user: ${ADMIN_EMAIL}`);

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_FULL_NAME },
    });

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    userId = newUser.user.id;

    // Wait briefly for profile trigger to fire
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Step 2: Ensure organization exists
  const organizationId = await ensureOrganization(supabase);

  // Step 3: Ensure profile exists
  const { data: profile, error: profileError } = await supabase
    .from('souvera_profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.log(`  Creating profile manually for ${ADMIN_EMAIL}`);
    await supabase.from('souvera_profiles').upsert({
      id: userId,
      email: ADMIN_EMAIL,
      full_name: ADMIN_FULL_NAME,
    });
  }

  // Step 4: Assign platform_admin role in organization
  console.log(`  Assigning platform_admin role...`);

  const { error: memberError } = await supabase
    .from('souvera_organization_members')
    .upsert(
      {
        organization_id: organizationId,
        user_id: userId,
        role: 'platform_admin',
      },
      {
        onConflict: 'organization_id,user_id',
      }
    );

  if (memberError) {
    throw new Error(`Failed to assign platform_admin role: ${memberError.message}`);
  }

  console.log(`  ✅ Platform admin role assigned`);

  // Step 5: Create platform_admin subscription for full UI access
  console.log(`  Creating platform_admin subscription...`);

  // Deactivate any non-platform_admin subscriptions
  const { error: deactivateError } = await supabase
    .from('souvera_subscriptions')
    .update({ status: 'canceled' })
    .eq('user_id', userId)
    .neq('plan_id', 'platform_admin')
    .in('status', ['trial', 'active']);

  if (deactivateError) {
    console.log(`  Warning: Could not deactivate old subscriptions: ${deactivateError.message}`);
  }

  // Check if platform_admin subscription exists
  const { data: existingSub } = await supabase
    .from('souvera_subscriptions')
    .select('id, status')
    .eq('user_id', userId)
    .eq('plan_id', 'platform_admin')
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
      throw new Error(`Failed to update platform_admin subscription: ${updateError.message}`);
    }
  } else {
    // Create fresh platform_admin subscription
    const { error: subError } = await supabase.from('souvera_subscriptions').insert({
      user_id: userId,
      plan_id: 'platform_admin',
      status: 'active',
      starts_at: new Date().toISOString(),
    });

    if (subError) {
      throw new Error(`Failed to create platform_admin subscription: ${subError.message}`);
    }
  }

  console.log(`  ✅ Platform admin subscription created`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' SOUVERA PLATFORM ADMIN PROVISIONING');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Validate environment
  validateEnvironment();

  // Create admin client
  const supabase = createAdminClient();
  console.log('✓ Supabase admin client initialized');
  console.log('');

  // Provision platform admin
  try {
    await provisionPlatformAdmin(supabase);
  } catch (error) {
    console.error('');
    console.error('❌ Provisioning failed:', error);
    process.exit(1);
  }

  // Print summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' PLATFORM ADMIN READY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Email: admin@souveraterminal.com');
  console.log('  Role: platform_admin');
  console.log('  Subscription: platform_admin (full access)');
  console.log('  Organization: Admin Test Organization');
  console.log('  Status: ✅ Ready for local QA');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' SECURITY REMINDER');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  ⚠️  This credential is for LOCAL/DEV QA ONLY');
  console.log('  ⚠️  Do NOT use in production or staging');
  console.log('  ⚠️  Rotate or delete after remote QA if provisioned outside local dev');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' NEXT STEPS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('1. Log in at http://localhost:3010/login');
  console.log('2. Navigate to /admin/data/upload');
  console.log('3. Run parse/validate API calls with this session');
  console.log('');
  console.log('To verify admin role and subscription:');
  console.log('');
  console.log('  SELECT u.email, om.role, o.name as organization, s.plan_id, s.status');
  console.log('  FROM auth.users u');
  console.log('  LEFT JOIN souvera_organization_members om ON om.user_id = u.id');
  console.log('  LEFT JOIN souvera_organizations o ON o.id = om.organization_id');
  console.log('  LEFT JOIN souvera_subscriptions s ON s.user_id = u.id AND s.status = \'active\'');
  console.log("  WHERE u.email = 'admin@souveraterminal.com';");
  console.log('');
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
