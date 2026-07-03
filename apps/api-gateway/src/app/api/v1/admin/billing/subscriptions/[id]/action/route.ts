// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Subscription Action API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

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
    const { action } = body;

    if (!['cancel', 'reactivate', 'extend'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: profile, error: fetchError } = await supabase
      .from('souvera_profiles')
      .select('id, email, status, subscription_ends_at')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    let updateData: Record<string, unknown> = {};
    let actionDescription = '';

    switch (action) {
      case 'cancel':
        updateData = { status: 'suspended' };
        actionDescription = 'Subscription cancelled';
        break;

      case 'reactivate':
        updateData = { status: 'active' };
        actionDescription = 'Subscription reactivated';
        break;

      case 'extend':
        const currentEnd = profile.subscription_ends_at
          ? new Date(profile.subscription_ends_at)
          : new Date();
        const newEnd = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
        updateData = { subscription_ends_at: newEnd.toISOString() };
        actionDescription = 'Subscription extended 30 days';
        break;
    }

    const { error: updateError } = await supabase
      .from('souvera_profiles')
      .update(updateData)
      .eq('id', subscriptionId);

    if (updateError) {
      console.error('[SubscriptionAction] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    await supabase.from('souvera_user_activity_log').insert({
      user_id: subscriptionId,
      action: `subscription_${action}`,
      details: {
        action: actionDescription,
        performed_by: userId,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: actionDescription,
    });
  } catch (error) {
    console.error('[SubscriptionAction] Error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
