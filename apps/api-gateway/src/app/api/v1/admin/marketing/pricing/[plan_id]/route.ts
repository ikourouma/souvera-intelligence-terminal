// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Pricing Plan Individual API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ plan_id: string }> }
) {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { plan_id } = await params;
    const supabase = getServiceClient();

    const { data: plan, error } = await supabase
      .from('souvera_pricing_display')
      .select('*')
      .eq('plan_id', plan_id)
      .single();

    if (error || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('[AdminPricingPlan] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ plan_id: string }> }
) {
  const { isAdmin, isSuperAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { plan_id } = await params;
    const body = await request.json();
    const supabase = getServiceClient();

    const { data: oldPlan } = await supabase
      .from('souvera_pricing_display')
      .select('*')
      .eq('plan_id', plan_id)
      .single();

    if (!oldPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Don't allow changing plan_id
    delete body.plan_id;

    const { data: plan, error } = await supabase
      .from('souvera_pricing_display')
      .update({
        ...body,
        updated_by: userId,
      })
      .eq('plan_id', plan_id)
      .select()
      .single();

    if (error) {
      console.error('[AdminPricingPlan] Update error:', error);
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }

    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_pricing_display',
      record_id: plan_id,
      action: 'update',
      old_values: oldPlan,
      new_values: plan,
      changed_by: userId,
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('[AdminPricingPlan] Error:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ plan_id: string }> }
) {
  const { isAdmin, isSuperAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { plan_id } = await params;
    const supabase = getServiceClient();

    const { data: oldPlan } = await supabase
      .from('souvera_pricing_display')
      .select('*')
      .eq('plan_id', plan_id)
      .single();

    if (!oldPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('souvera_pricing_display')
      .delete()
      .eq('plan_id', plan_id);

    if (error) {
      console.error('[AdminPricingPlan] Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }

    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_pricing_display',
      record_id: plan_id,
      action: 'delete',
      old_values: oldPlan,
      changed_by: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AdminPricingPlan] Error:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
