// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Subscription Details API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id: subscriptionId } = await params;
    const supabase = getServiceClient();

    // Verify the profile exists
    const { data: profile, error: profileError } = await supabase
      .from('souvera_profiles')
      .select('id, email, full_name')
      .eq('id', subscriptionId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Fetch activity log for this user
    const { data: activityLog, error: activityError } = await supabase
      .from('souvera_user_activity_log')
      .select('id, action, details, created_at')
      .eq('user_id', subscriptionId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (activityError) {
      console.error('[SubscriptionDetails] Activity log error:', activityError);
    }

    // Generate mock payment history based on subscription data
    // In production, this would come from a payments table or Stripe
    const paymentHistory = generatePaymentHistory(subscriptionId, profile);

    return NextResponse.json({
      activityLog: activityLog || [],
      paymentHistory,
    });
  } catch (error) {
    console.error('[SubscriptionDetails] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
}

function generatePaymentHistory(userId: string, profile: { email: string | null }) {
  // Generate realistic payment history
  // In production, fetch from actual payments table or Stripe
  const history = [];
  const now = new Date();
  
  // Generate up to 6 months of payment history for demo
  for (let i = 0; i < 6; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Skip if date is in the future
    if (date > now) continue;
    
    history.push({
      id: `pay_${userId.slice(0, 8)}_${i}`,
      amount: 49 + (i % 3) * 50, // Vary amounts slightly
      status: i === 0 && Math.random() > 0.9 ? 'pending' : 'completed',
      date: date.toISOString(),
      method: 'Credit Card',
    });
  }
  
  return history;
}
