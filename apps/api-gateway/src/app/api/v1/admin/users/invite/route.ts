// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin User Invite API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function POST(request: NextRequest) {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email, fullName, planId } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: existingUser } = await supabase
      .from('souvera_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName || '',
        plan_id: planId || 'explorer',
      },
    });

    if (authError) {
      console.error('[AdminUserInvite] Auth error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Failed to send invitation' },
        { status: 500 }
      );
    }

    if (authData.user) {
      await supabase
        .from('souvera_profiles')
        .upsert({
          id: authData.user.id,
          email: email,
          full_name: fullName || '',
          plan_id: planId || 'explorer',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
    });
  } catch (error) {
    console.error('[AdminUserInvite] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
