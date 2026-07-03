// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Pricing Display API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET() {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const supabase = getServiceClient();

    const { data: plans, error } = await supabase
      .from('souvera_pricing_display')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[AdminPricing] Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
    }

    return NextResponse.json({ plans: plans || [] });
  } catch (error) {
    console.error('[AdminPricing] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { isAdmin, isSuperAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const supabase = getServiceClient();

    // Check if plan_id already exists
    const { data: existing } = await supabase
      .from('souvera_pricing_display')
      .select('plan_id')
      .eq('plan_id', body.plan_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Plan ID already exists' }, { status: 400 });
    }

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from('souvera_pricing_display')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.display_order || 0) + 1;

    const { data: plan, error } = await supabase
      .from('souvera_pricing_display')
      .insert({
        ...body,
        display_order: newOrder,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('[AdminPricing] Insert error:', error);
      return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
    }

    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_pricing_display',
      record_id: plan.plan_id,
      action: 'create',
      new_values: plan,
      changed_by: userId,
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('[AdminPricing] Error:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
