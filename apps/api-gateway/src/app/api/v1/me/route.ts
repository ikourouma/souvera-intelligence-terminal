// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// GET /api/v1/me
// Owner: Afronovation, Inc.
// Access: Authenticated only
//
// Returns account summary for authenticated user.
// Provides single source of truth for:
// - user identity
// - access tier
// - plan details
// - entitlements
// ===========================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess, PLAN_RANKS, type AccessTier } from '@souvera/entitlements';

interface MeResponse {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    fullName?: string;
  };
  access?: {
    tier: AccessTier;
    planId: string;
    planLabel: string;
    rank: number;
    entitlements: string[];
  };
  role?: {
    isAdmin: boolean;
    isSuperAdmin: boolean;
  };
}

export async function GET() {
  try {
    // Verify authentication using server client
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { authenticated: false } as MeResponse,
        { status: 200 }
      );
    }

    // Resolve user access using entitlements package
    const access = await resolveUserAccess(supabase, user.id);

    // Get user profile for display name
    const { data: profile } = await supabase
      .from('souvera_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Check admin status - must have either admin plan OR admin org role
    const ADMIN_PLANS = ['platform_admin', 'super_admin'];
    const ADMIN_ROLES = ['platform_admin', 'super_admin'];

    // Check if user has an admin subscription plan
    const hasAdminPlan = access.planId && ADMIN_PLANS.includes(access.planId);

    // Check organization membership for admin role
    const { data: membership } = await supabase
      .from('souvera_organization_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ADMIN_ROLES)
      .maybeSingle();

    const hasAdminRole = !!membership;

    // User is admin if they have EITHER admin plan OR admin org role
    const isAdmin = hasAdminPlan || hasAdminRole;
    
    // Determine super admin status
    const isSuperAdmin = 
      membership?.role === 'super_admin' || 
      access.planId === 'super_admin';

    // Build plan label
    const planLabel = access.planId
      ? access.planId.charAt(0).toUpperCase() + access.planId.slice(1) + ' Plan'
      : 'Explorer Plan';

    const response: MeResponse = {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email || '',
        fullName: profile?.full_name || undefined,
      },
      access: {
        tier: access.planId as AccessTier,
        planId: access.planId,
        planLabel,
        rank: access.planRank,
        entitlements: access.entitlements,
      },
      role: {
        isAdmin,
        isSuperAdmin,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[API] /api/v1/me error:', error);
    return NextResponse.json(
      { 
        authenticated: false,
        error: 'Failed to resolve user access',
      } as MeResponse,
      { status: 500 }
    );
  }
}
