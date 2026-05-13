import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Use the helper function to get invitation details
    const { data, error } = await supabase.rpc('souvera_get_invitation_by_token', {
      p_token: token,
    });

    if (error) {
      console.error('Error validating invitation:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to validate invitation' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = data[0];

    if (!invitation.is_valid) {
      return NextResponse.json({
        success: false,
        error: 'Invitation has expired or already been used',
        data: {
          expired: invitation.expires_at < new Date().toISOString(),
          already_accepted: invitation.accepted_at !== null,
        },
      }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      data: {
        email: invitation.email,
        organization_name: invitation.organization_name,
        role: invitation.role,
        plan_id: invitation.plan_id,
        plan_name: invitation.plan_name,
        expires_at: invitation.expires_at,
      },
    });

  } catch (error) {
    console.error('Invitation validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
