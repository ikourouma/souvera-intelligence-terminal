// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Subscriptions List API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

const PLAN_PRICES: Record<string, number> = {
  explorer: 0,
  professional: 49,
  business: 199,
  investor: 499,
  institutional: 1999,
};

export async function GET(request: NextRequest) {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const planFilter = searchParams.get('plan') || 'all';
    const statusFilter = searchParams.get('status') || 'all';

    const supabase = getServiceClient();

    let query = supabase
      .from('souvera_profiles')
      .select('id, email, full_name, plan_id, status, created_at, subscription_ends_at', { count: 'exact' })
      .neq('plan_id', 'platform_admin')
      .neq('plan_id', 'super_admin')
      .neq('plan_id', 'public');

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (planFilter !== 'all') {
      query = query.eq('plan_id', planFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        query = query.eq('status', 'active');
      } else if (statusFilter === 'cancelled') {
        query = query.eq('status', 'suspended');
      } else if (statusFilter === 'pending') {
        query = query.eq('status', 'pending');
      }
    }

    const offset = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error('[Subscriptions] Error fetching:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    const subscriptions = (profiles || []).map((profile) => {
      const plan = profile.plan_id || 'explorer';
      const isPaid = !['public', 'explorer'].includes(plan);
      
      let status: 'active' | 'cancelled' | 'pending' | 'expired' = 'active';
      if (profile.status === 'suspended') {
        status = 'cancelled';
      } else if (profile.status === 'pending') {
        status = 'pending';
      } else if (profile.subscription_ends_at && new Date(profile.subscription_ends_at) < new Date()) {
        status = 'expired';
      }

      return {
        id: profile.id,
        userId: profile.id,
        email: profile.email || '',
        fullName: profile.full_name || 'Unknown',
        plan,
        status,
        startDate: profile.created_at,
        endDate: profile.subscription_ends_at,
        amount: PLAN_PRICES[plan] || 0,
        billingCycle: 'monthly' as const,
        lastPayment: isPaid ? profile.created_at : null,
      };
    });

    return NextResponse.json({
      subscriptions,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('[Subscriptions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
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
    const { userId: targetUserId, plan, billingCycle, startDate, endDate, notes } = body;

    if (!targetUserId || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and plan' },
        { status: 400 }
      );
    }

    const validPlans = ['explorer', 'professional', 'business', 'investor', 'institutional'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Verify the target user exists
    const { data: existingUser, error: userError } = await supabase
      .from('souvera_profiles')
      .select('id, email, plan_id, status')
      .eq('id', targetUserId)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active paid subscription
    if (
      existingUser.status === 'active' &&
      existingUser.plan_id &&
      !['public', 'explorer'].includes(existingUser.plan_id)
    ) {
      return NextResponse.json(
        { error: 'User already has an active subscription. Please modify the existing one.' },
        { status: 400 }
      );
    }

    // Update the user's subscription
    const updateData: Record<string, unknown> = {
      plan_id: plan,
      status: 'active',
      subscription_ends_at: endDate || null,
    };

    const { error: updateError } = await supabase
      .from('souvera_profiles')
      .update(updateData)
      .eq('id', targetUserId);

    if (updateError) {
      console.error('[CreateSubscription] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // Log the activity
    await supabase.from('souvera_user_activity_log').insert({
      user_id: targetUserId,
      action: 'subscription_created',
      details: {
        plan,
        billing_cycle: billingCycle,
        start_date: startDate,
        end_date: endDate,
        notes: notes || null,
        created_by: userId,
        timestamp: new Date().toISOString(),
      },
    });

    // Log in audit trail
    await supabase.from('souvera_matrix_audit_log').insert({
      changed_by: userId,
      change_type: 'subscription_created',
      changes: {
        user_id: targetUserId,
        user_email: existingUser.email,
        plan,
        billing_cycle: billingCycle,
        start_date: startDate,
        end_date: endDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Subscription created for ${existingUser.email}`,
      subscription: {
        userId: targetUserId,
        plan,
        billingCycle,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error('[CreateSubscription] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
