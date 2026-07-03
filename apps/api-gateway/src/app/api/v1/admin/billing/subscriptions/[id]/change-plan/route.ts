// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Subscription Change Plan API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

const VALID_PLANS = ['explorer', 'professional', 'business', 'investor', 'institutional'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdmin, isSuperAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id: subscriptionId } = await params;
    const body = await request.json();
    const { newPlan } = body;

    if (!newPlan || !VALID_PLANS.includes(newPlan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: profile, error: fetchError } = await supabase
      .from('souvera_profiles')
      .select('id, email, plan_id')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const oldPlan = profile.plan_id;

    if (oldPlan === newPlan) {
      return NextResponse.json(
        { error: 'New plan is the same as current plan' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('souvera_profiles')
      .update({ plan_id: newPlan })
      .eq('id', subscriptionId);

    if (updateError) {
      console.error('[ChangePlan] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update plan' },
        { status: 500 }
      );
    }

    await supabase.from('souvera_user_activity_log').insert({
      user_id: subscriptionId,
      action: 'plan_changed',
      details: {
        old_plan: oldPlan,
        new_plan: newPlan,
        performed_by: userId,
        timestamp: new Date().toISOString(),
      },
    });

    await supabase.from('souvera_matrix_audit_log').insert({
      changed_by: userId,
      change_type: 'plan_change',
      changes: {
        user_id: subscriptionId,
        user_email: profile.email,
        old_plan: oldPlan,
        new_plan: newPlan,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Plan changed from ${oldPlan} to ${newPlan}`,
    });
  } catch (error) {
    console.error('[ChangePlan] Error:', error);
    return NextResponse.json(
      { error: 'Failed to change plan' },
      { status: 500 }
    );
  }
}
