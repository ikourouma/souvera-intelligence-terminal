// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin User Detail API
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
    const { id } = await params;
    const supabase = getServiceClient();

    const { data: profile, error: profileError } = await supabase
      .from('souvera_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { count: reportsCount } = await supabase
      .from('souvera_report_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id);

    const { data: activityData } = await supabase
      .from('souvera_user_activity_log')
      .select('activity_type, metadata, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        planId: profile.plan_id || 'public',
        status: profile.status || 'active',
        lastActive: profile.last_active_at,
        createdAt: profile.created_at,
        avatarUrl: profile.avatar_url,
      },
      stats: {
        totalLogins: 0,
        reportsGenerated: reportsCount || 0,
        apiCalls: 0,
        lastLoginIp: null,
      },
      activity: (activityData || []).map(item => ({
        type: item.activity_type,
        description: `${item.activity_type} activity`,
        timestamp: item.created_at,
      })),
    });
  } catch (error) {
    console.error('[AdminUserDetail] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
