/**
 * Pre-flight checks for Explorer self-serve signup.
 * Manual email confirmation steps still required for full E2E.
 *
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/smoke-explorer-signup-flow.ts
 */
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('FAIL: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  let failures = 0;

  console.log('\n[Explorer signup smoke] Pre-flight checks\n');

  const { data: explorerPlan, error: planErr } = await sb
    .from('souvera_plans')
    .select('id, name, rank')
    .eq('id', 'explorer')
    .maybeSingle();

  if (planErr || !explorerPlan) {
    console.error('FAIL: explorer plan missing in souvera_plans');
    failures++;
  } else {
    console.log(`  ✓ explorer plan: ${explorerPlan.name} (rank ${explorerPlan.rank})`);
  }

  const { data: entitlements, error: entErr } = await sb
    .from('souvera_plan_entitlements')
    .select('entitlement_key')
    .eq('plan_id', 'explorer');

  if (entErr || !entitlements?.length) {
    console.error('FAIL: no entitlements for explorer plan');
    failures++;
  } else {
    console.log(`  ✓ explorer entitlements: ${entitlements.length} keys`);
  }

  const { count: profileCount } = await sb
    .from('souvera_profiles')
    .select('*', { count: 'exact', head: true });

  const { data: sampleSubs } = await sb
    .from('souvera_subscriptions')
    .select('user_id, plan_id, status')
    .eq('plan_id', 'explorer')
    .eq('status', 'active')
    .limit(3);

  console.log(`  ✓ souvera_profiles table reachable (${profileCount ?? 0} rows)`);
  console.log(`  ✓ sample explorer subscriptions: ${sampleSubs?.length ?? 0} active (showing up to 3)`);

  console.log('\n[Explorer signup smoke] App routes (verify in browser)\n');
  console.log('  1. GET /login — "Create free account" link → /signup');
  console.log('  2. POST signup form — supabase.auth.signUp → /signup/check-email');
  console.log('  3. Email link — /auth/confirm?next=/intelligence/map');
  console.log('  4. GET /api/v1/me — plan_id explorer after login');
  console.log('\n  Ops checklist: docs/ops/supabase-explorer-signup-checklist.md\n');

  if (failures > 0) {
    console.error(`\n[Explorer signup smoke] FAIL (${failures} check(s))\n`);
    process.exit(1);
  }

  console.log('[Explorer signup smoke] PASS (DB pre-flight)\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
