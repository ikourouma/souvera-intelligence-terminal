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

export async function verifyAdminAccess(): Promise<{
  isAdmin: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    const authSupabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await authSupabase.auth.getUser();
    if (error || !user) return { isAdmin: false, error: 'Authentication required' };

    const supabase = getServiceClient();
    const { data: memberData } = await supabase
      .from('souvera_organization_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['org_admin', 'platform_admin', 'super_admin'])
      .limit(1);

    if (memberData?.length) return { isAdmin: true, userId: user.id };

    return { isAdmin: false, error: 'Admin role required' };
  } catch {
    return { isAdmin: false, error: 'Authentication failed' };
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
    const { data: memberData } = await supabase
      .from('souvera_organization_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['platform_admin', 'super_admin'])
      .limit(1);

    if (memberData?.length) return { isPlatformAdmin: true, userId: user.id };

    return { isPlatformAdmin: false, error: 'Platform admin role required' };
  } catch {
    return { isPlatformAdmin: false, error: 'Authentication failed' };
  }
}
