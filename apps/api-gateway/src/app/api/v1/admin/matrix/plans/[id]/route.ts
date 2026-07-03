// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Individual Plan Management API Route
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess();

    if (!isAdmin || !isSuperAdmin) {
      return NextResponse.json({ error: error || 'Super admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = getServiceClient();

    const { data: plan, error: fetchError } = await supabase
      .from('souvera_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const { data: planEntitlements } = await supabase
      .from('souvera_plan_entitlements')
      .select('entitlement_key')
      .eq('plan_id', id);

    return NextResponse.json({
      plan,
      entitlements: planEntitlements?.map(pe => pe.entitlement_key) || [],
    });
  } catch (err) {
    console.error('[Plan API] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin, isSuperAdmin, userId, error } = await verifyAdminAccess();

    if (!isAdmin || !isSuperAdmin) {
      return NextResponse.json({ error: error || 'Super admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, rank, description, is_public, is_enterprise, entitlements } = body;

    const supabase = getServiceClient();

    const { data: existingPlan } = await supabase
      .from('souvera_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (rank !== undefined) updates.rank = rank;
    if (description !== undefined) updates.description = description;
    if (is_public !== undefined) updates.is_public = is_public;
    if (is_enterprise !== undefined) updates.is_enterprise = is_enterprise;

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('souvera_plans')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        console.error('[Plan API] Update error:', updateError);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
      }
    }

    if (entitlements !== undefined) {
      await supabase
        .from('souvera_plan_entitlements')
        .delete()
        .eq('plan_id', id);

      if (entitlements.length > 0) {
        const planEntitlements = entitlements.map((key: string) => ({
          plan_id: id,
          entitlement_key: key,
        }));

        const { error: entError } = await supabase
          .from('souvera_plan_entitlements')
          .insert(planEntitlements);

        if (entError) {
          console.error('[Plan API] Entitlements update error:', entError);
        }
      }
    }

    await supabase.from('souvera_matrix_audit_log').insert({
      table_name: 'souvera_plans',
      record_id: id,
      action: 'update',
      old_values: existingPlan,
      new_values: { ...updates, entitlements },
      changed_by: userId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Plan API] Update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin, isSuperAdmin, userId, error } = await verifyAdminAccess();

    if (!isAdmin || !isSuperAdmin) {
      return NextResponse.json({ error: error || 'Super admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = getServiceClient();

    const protectedPlans = ['public', 'explorer', 'platform_admin'];
    if (protectedPlans.includes(id)) {
      return NextResponse.json({ error: 'This plan cannot be deleted' }, { status: 400 });
    }

    const { data: existingPlan } = await supabase
      .from('souvera_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const { count: subscriptionCount } = await supabase
      .from('souvera_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', id);

    if (subscriptionCount && subscriptionCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete plan with ${subscriptionCount} active subscriptions` 
      }, { status: 400 });
    }

    await supabase
      .from('souvera_plan_entitlements')
      .delete()
      .eq('plan_id', id);

    const { error: deleteError } = await supabase
      .from('souvera_plans')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Plan API] Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }

    await supabase.from('souvera_matrix_audit_log').insert({
      table_name: 'souvera_plans',
      record_id: id,
      action: 'delete',
      old_values: existingPlan,
      changed_by: userId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Plan API] Delete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
