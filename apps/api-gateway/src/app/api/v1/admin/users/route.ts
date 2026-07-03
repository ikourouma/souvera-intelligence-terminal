// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Users API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

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
    const planFilter = searchParams.get('plan');
    const statusFilter = searchParams.get('status');

    const supabase = getServiceClient();
    const offset = (page - 1) * limit;

    // Query profiles - the base table
    let profileQuery = supabase
      .from('souvera_profiles')
      .select('id, email, full_name, created_at, updated_at, avatar_url', { count: 'exact' });

    if (search) {
      profileQuery = profileQuery.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: profiles, count, error } = await profileQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[AdminUsers] Query error:', error);
      return NextResponse.json({ 
        users: [], 
        totalPages: 1, 
        stats: { total: 0, active: 0, suspended: 0, newThisWeek: 0 } 
      });
    }

    // Get subscriptions for these users to find their plan_id
    const userIds = (profiles || []).map(p => p.id);
    let subscriptionsByUser: Record<string, { plan_id: string; status: string }> = {};

    if (userIds.length > 0) {
      const { data: subscriptions } = await supabase
        .from('souvera_subscriptions')
        .select('user_id, plan_id, status')
        .in('user_id', userIds)
        .in('status', ['active', 'trial']);

      if (subscriptions) {
        subscriptionsByUser = Object.fromEntries(
          subscriptions.map(s => [s.user_id, { plan_id: s.plan_id, status: s.status }])
        );
      }
    }

    // Apply plan filter in memory if specified (since we can't join in Supabase easily)
    let filteredProfiles = profiles || [];
    if (planFilter && planFilter !== 'all') {
      filteredProfiles = filteredProfiles.filter(p => 
        subscriptionsByUser[p.id]?.plan_id === planFilter
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      filteredProfiles = filteredProfiles.filter(p => {
        const sub = subscriptionsByUser[p.id];
        if (statusFilter === 'active') return sub?.status === 'active' || sub?.status === 'trial';
        if (statusFilter === 'suspended') return !sub || sub.status === 'canceled';
        return true;
      });
    }

    // Stats queries
    const [totalResult, newResult] = await Promise.all([
      supabase
        .from('souvera_profiles')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('souvera_profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Count active subscriptions for "active users" stat
    const { count: activeSubsCount } = await supabase
      .from('souvera_subscriptions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['active', 'trial']);

    const formattedUsers = filteredProfiles.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      planId: subscriptionsByUser[user.id]?.plan_id || 'public',
      status: subscriptionsByUser[user.id]?.status === 'active' || subscriptionsByUser[user.id]?.status === 'trial' ? 'active' : 'inactive',
      lastActive: user.updated_at,
      createdAt: user.created_at,
      avatarUrl: user.avatar_url,
    }));

    return NextResponse.json({
      users: formattedUsers,
      totalPages: Math.ceil((count || 0) / limit),
      stats: {
        total: totalResult.count || 0,
        active: activeSubsCount || 0,
        suspended: 0,
        newThisWeek: newResult.count || 0,
      },
    });
  } catch (error) {
    console.error('[AdminUsers] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
