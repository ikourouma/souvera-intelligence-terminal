// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Plans Management API Routes
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET() {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess();

    if (!isAdmin || !isSuperAdmin) {
      return NextResponse.json({ error: error || 'Super admin access required' }, { status: 403 });
    }

    const supabase = getServiceClient();

    const { data: plans, error: plansError } = await supabase
      .from('souvera_plans')
      .select('*')
      .order('rank', { ascending: true });

    if (plansError) {
      console.error('[Plans API] Fetch error:', plansError);
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }

    const { data: entitlements, error: entitlementsError } = await supabase
      .from('souvera_entitlements')
      .select('*')
      .order('key', { ascending: true });

    if (entitlementsError) {
      console.error('[Plans API] Entitlements fetch error:', entitlementsError);
    }

    const { data: planEntitlementCounts } = await supabase
      .from('souvera_plan_entitlements')
      .select('plan_id');

    const entitlementCountMap: Record<string, number> = {};
    planEntitlementCounts?.forEach(pe => {
      entitlementCountMap[pe.plan_id] = (entitlementCountMap[pe.plan_id] || 0) + 1;
    });

    const plansWithCounts = plans?.map(plan => ({
      ...plan,
      entitlement_count: entitlementCountMap[plan.id] || 0,
    }));

    return NextResponse.json({
      plans: plansWithCounts || [],
      entitlements: entitlements || [],
    });
  } catch (err) {
    console.error('[Plans API] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, isSuperAdmin, userId, error } = await verifyAdminAccess();

    if (!isAdmin || !isSuperAdmin) {
      return NextResponse.json({ error: error || 'Super admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, rank, description, is_public, is_enterprise, entitlements } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'Plan ID and name are required' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: existingPlan } = await supabase
      .from('souvera_plans')
      .select('id')
      .eq('id', id)
      .single();

    if (existingPlan) {
      return NextResponse.json({ error: 'A plan with this ID already exists' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('souvera_plans')
      .insert({
        id,
        name,
        rank: rank || 0,
        description: description || null,
        is_public: is_public || false,
        is_enterprise: is_enterprise || false,
      });

    if (insertError) {
      console.error('[Plans API] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
    }

    if (entitlements?.length > 0) {
      const planEntitlements = entitlements.map((key: string) => ({
        plan_id: id,
        entitlement_key: key,
      }));

      const { error: entError } = await supabase
        .from('souvera_plan_entitlements')
        .insert(planEntitlements);

      if (entError) {
        console.error('[Plans API] Entitlements insert error:', entError);
      }
    }

    await supabase.from('souvera_matrix_audit_log').insert({
      table_name: 'souvera_plans',
      record_id: id,
      action: 'create',
      new_values: { id, name, rank, is_public, is_enterprise, entitlements },
      changed_by: userId,
    });

    return NextResponse.json({ success: true, plan: { id, name } });
  } catch (err) {
    console.error('[Plans API] Create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
