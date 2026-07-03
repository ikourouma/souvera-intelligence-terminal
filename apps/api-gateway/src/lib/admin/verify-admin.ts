import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface AdminUserInfo {
  id: string;
  email: string;
  fullName: string;
  role: 'platform_admin' | 'super_admin';
  planId?: string;
  avatarUrl?: string;
}

const ADMIN_PLANS = ['platform_admin', 'super_admin'];
const ADMIN_ROLES = ['platform_admin', 'super_admin'];

export async function verifyAdminAccess(): Promise<{
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userId?: string;
  userInfo?: AdminUserInfo;
  error?: string;
}> {
  try {
    const authSupabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await authSupabase.auth.getUser();
    if (error || !user) return { isAdmin: false, isSuperAdmin: false, error: 'Authentication required' };

    const supabase = getServiceClient();

    // First, verify the user has an admin subscription plan
    const { data: profileData } = await supabase
      .from('souvera_profiles')
      .select('full_name, avatar_url, plan_id')
      .eq('id', user.id)
      .single();

    // Check if user has admin plan OR has admin org role
    // This provides defense in depth - both conditions should ideally be true
    const hasAdminPlan = profileData?.plan_id && ADMIN_PLANS.includes(profileData.plan_id);

    // Check organization membership for admin role
    const { data: memberData } = await supabase
      .from('souvera_organization_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ADMIN_ROLES)
      .limit(1);

    const hasAdminRole = memberData && memberData.length > 0;

    // User must have EITHER admin plan OR admin org role to access admin panel
    // For maximum security, you could require BOTH: hasAdminPlan && hasAdminRole
    if (!hasAdminPlan && !hasAdminRole) {
      return { isAdmin: false, isSuperAdmin: false, error: 'Admin access required' };
    }

    // Determine the effective role (prefer org role if exists, fallback to plan)
    let role: 'platform_admin' | 'super_admin' = 'platform_admin';
    if (hasAdminRole) {
      role = memberData![0].role as 'platform_admin' | 'super_admin';
    } else if (profileData?.plan_id === 'super_admin') {
      role = 'super_admin';
    }

    const isSuperAdmin = role === 'super_admin';

    const userInfo: AdminUserInfo = {
      id: user.id,
      email: user.email || '',
      fullName: profileData?.full_name || user.email?.split('@')[0] || 'Admin',
      role,
      planId: profileData?.plan_id,
      avatarUrl: profileData?.avatar_url,
    };

    return { isAdmin: true, isSuperAdmin, userId: user.id, userInfo };
  } catch {
    return { isAdmin: false, isSuperAdmin: false, error: 'Authentication failed' };
  }
}

/** Destructive ops (report reset, etc.) — platform_admin only */
export async function verifyPlatformAdminAccess(): Promise<{
  isPlatformAdmin: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    const authSupabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await authSupabase.auth.getUser();
    if (error || !user) return { isPlatformAdmin: false, error: 'Authentication required' };

    const supabase = getServiceClient();

    // Check profile plan
    const { data: profileData } = await supabase
      .from('souvera_profiles')
      .select('plan_id')
      .eq('id', user.id)
      .single();

    const hasAdminPlan = profileData?.plan_id && ADMIN_PLANS.includes(profileData.plan_id);

    // Check organization membership
    const { data: memberData } = await supabase
      .from('souvera_organization_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ADMIN_ROLES)
      .limit(1);

    const hasAdminRole = memberData && memberData.length > 0;

    if (hasAdminPlan || hasAdminRole) {
      return { isPlatformAdmin: true, userId: user.id };
    }

    return { isPlatformAdmin: false, error: 'Platform admin role required' };
  } catch {
    return { isPlatformAdmin: false, error: 'Authentication failed' };
  }
}

/**
 * Verify organization-level admin access (for org-scoped features)
 * This includes org_admin, platform_admin, and super_admin roles
 */
export async function verifyOrgAdminAccess(): Promise<{
  isOrgAdmin: boolean;
  organizationId?: string;
  userId?: string;
  error?: string;
}> {
  try {
    const authSupabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await authSupabase.auth.getUser();
    if (error || !user) return { isOrgAdmin: false, error: 'Authentication required' };

    const supabase = getServiceClient();
    const { data: memberData } = await supabase
      .from('souvera_organization_members')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .in('role', ['org_admin', 'platform_admin', 'super_admin'])
      .limit(1);

    if (memberData?.length) {
      return { 
        isOrgAdmin: true, 
        organizationId: memberData[0].organization_id,
        userId: user.id 
      };
    }

    return { isOrgAdmin: false, error: 'Organization admin role required' };
  } catch {
    return { isOrgAdmin: false, error: 'Authentication failed' };
  }
}
