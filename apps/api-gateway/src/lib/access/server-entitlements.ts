/**
 * Server-Side Entitlement Helpers
 * 
 * Utilities for checking entitlements in Server Components and API routes.
 * Uses Supabase server client for secure server-side access checks.
 * 
 * @example
 * // In Server Component
 * export default async function TradePage() {
 *   const { hasAccess, access } = await checkServerEntitlement('trade_data');
 *   
 *   if (!hasAccess) {
 *     return <UpgradePrompt requiredTier="business" />;
 *   }
 *   
 *   return <TradeIntelligence />;
 * }
 * 
 * @example
 * // In API Route
 * export async function GET(request: Request) {
 *   const { hasAccess, error } = await checkServerEntitlement('api_access');
 *   
 *   if (!hasAccess) {
 *     return Response.json({ error: 'Access denied' }, { status: 403 });
 *   }
 *   
 *   // Continue with API logic...
 * }
 */

import { createServerClient } from '@/lib/supabase/server';
import {
  resolveUserAccess,
  hasEntitlement,
  hasMinimumPlan,
  createAccessDeniedError,
  UserAccess,
  EntitlementKey,
  AccessTier,
} from '@souvera/entitlements';

/**
 * Check if current user has specific entitlement (server-side)
 */
export async function checkServerEntitlement(
  required: EntitlementKey
): Promise<{
  hasAccess: boolean;
  access: UserAccess;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      const access = await resolveUserAccess(supabase);
      return {
        hasAccess: false,
        access,
        error: 'Authentication required',
      };
    }

    // Resolve user access
    const access = await resolveUserAccess(supabase, user.id);
    
    // Check entitlement
    const hasAccess = hasEntitlement(access, required);
    
    return {
      hasAccess,
      access,
      error: hasAccess ? undefined : `Missing entitlement: ${required}`,
    };
  } catch (error) {
    console.error('[checkServerEntitlement] Error:', error);
    const access = await resolveUserAccess(await createServerClient());
    return {
      hasAccess: false,
      access,
      error: 'Access check failed',
    };
  }
}

/**
 * Check if current user has minimum tier (server-side)
 */
export async function checkServerMinimumTier(
  minimumTier: AccessTier
): Promise<{
  hasAccess: boolean;
  access: UserAccess;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      const access = await resolveUserAccess(supabase);
      return {
        hasAccess: false,
        access,
        error: 'Authentication required',
      };
    }

    // Resolve user access
    const access = await resolveUserAccess(supabase, user.id);
    
    // Check minimum tier
    const hasAccess = hasMinimumPlan(access, minimumTier);
    
    return {
      hasAccess,
      access,
      error: hasAccess ? undefined : `Requires ${minimumTier} tier or higher`,
    };
  } catch (error) {
    console.error('[checkServerMinimumTier] Error:', error);
    const access = await resolveUserAccess(await createServerClient());
    return {
      hasAccess: false,
      access,
      error: 'Access check failed',
    };
  }
}

/**
 * Get current user's access (server-side)
 */
export async function getServerUserAccess(): Promise<UserAccess> {
  try {
    const supabase = await createServerClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Resolve user access (returns PUBLIC_ACCESS if no user)
    return await resolveUserAccess(supabase, user?.id);
  } catch (error) {
    console.error('[getServerUserAccess] Error:', error);
    // Return public access on error
    const supabase = await createServerClient();
    return await resolveUserAccess(supabase);
  }
}

/**
 * Create standardized access denied response for API routes
 */
export function createAccessDeniedResponse(
  requiredEntitlement: EntitlementKey,
  currentPlan: string
): Response {
  const error = createAccessDeniedError(requiredEntitlement, currentPlan);
  return Response.json(error, { status: 403 });
}

/**
 * Require entitlement in API route (throws if denied)
 */
export async function requireEntitlement(
  required: EntitlementKey
): Promise<UserAccess> {
  const { hasAccess, access, error } = await checkServerEntitlement(required);
  
  if (!hasAccess) {
    throw new Error(error || 'Access denied');
  }
  
  return access;
}

/**
 * Require minimum tier in API route (throws if denied)
 */
export async function requireMinimumTier(
  minimumTier: AccessTier
): Promise<UserAccess> {
  const { hasAccess, access, error } = await checkServerMinimumTier(minimumTier);
  
  if (!hasAccess) {
    throw new Error(error || 'Access denied');
  }
  
  return access;
}
