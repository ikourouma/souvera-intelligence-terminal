// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Organization Members API
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

    const { data: members, error } = await supabase
      .from('souvera_organization_members')
      .select(`
        id,
        user_id,
        role,
        created_at
      `)
      .eq('organization_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AdminOrgMembers] Query error:', error);
      return NextResponse.json({ members: [] });
    }

    const userIds = (members || []).map(m => m.user_id).filter(Boolean);
    let userDetails: Record<string, { email: string; full_name: string | null }> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('souvera_profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profiles) {
        userDetails = Object.fromEntries(
          profiles.map(p => [p.id, { email: p.email, full_name: p.full_name }])
        );
      }
    }

    const formattedMembers = (members || []).map(m => ({
      id: m.id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.created_at,
      email: userDetails[m.user_id]?.email || 'Unknown',
      full_name: userDetails[m.user_id]?.full_name || null,
    }));

    return NextResponse.json({ members: formattedMembers });
  } catch (error) {
    console.error('[AdminOrgMembers] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
