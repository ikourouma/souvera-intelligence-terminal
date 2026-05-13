import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface CreateInvitationRequest {
  email: string;
  plan_id?: string;
  organization_id?: string;
  role?: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateInvitationRequest = await request.json();

    // Validate email
    if (!body.email || !validateEmail(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Validate plan_id if provided
    const validPlans = ['explorer', 'professional', 'business', 'investor', 'institutional'];
    const planId = body.plan_id || 'explorer';
    if (!validPlans.includes(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan_id' },
        { status: 400 }
      );
    }

    // Validate role if provided
    const validRoles = ['viewer', 'analyst', 'strategist', 'executive', 'org_admin'];
    const role = body.role || 'viewer';
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Call the database function to create invitation
    const { data, error } = await supabase.rpc('souvera_create_invitation', {
      p_email: body.email.toLowerCase().trim(),
      p_plan_id: planId,
      p_organization_id: body.organization_id || null,
      p_role: role,
    });

    if (error) {
      console.error('Error creating invitation:', error);
      
      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to create invitations' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // Get the invitation details to return
    const { data: invitation } = await supabase
      .from('souvera_invitations')
      .select('id, email, plan_id, organization_id, role, token, expires_at, created_at')
      .eq('id', data)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Invitation created successfully',
      data: {
        invitation_id: invitation?.id,
        email: invitation?.email,
        plan_id: invitation?.plan_id,
        expires_at: invitation?.expires_at,
        invite_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://souvera.vercel.app'}/auth/callback?invitation=${invitation?.token}`,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Invitation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const status = searchParams.get('status'); // 'pending', 'accepted', 'expired'

    let query = supabase
      .from('souvera_invitations')
      .select(`
        id,
        email,
        plan_id,
        organization_id,
        role,
        expires_at,
        accepted_at,
        created_at,
        invited_by
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (status === 'pending') {
      query = query.is('accepted_at', null).gt('expires_at', new Date().toISOString());
    } else if (status === 'accepted') {
      query = query.not('accepted_at', 'is', null);
    } else if (status === 'expired') {
      query = query.is('accepted_at', null).lt('expires_at', new Date().toISOString());
    }

    const { data: invitations, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invitations,
    });

  } catch (error) {
    console.error('Invitation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
