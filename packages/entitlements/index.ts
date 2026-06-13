import type { SupabaseClient } from '@supabase/supabase-js';

// =========================================================
// SOUVERA ENTITLEMENTS PACKAGE
// Server-side access control and entitlement resolution
// Owner: Afronovation, Inc.
// =========================================================

/**
 * All available access tiers in the Souvera platform
 */
export type AccessTier =
  | 'public'
  | 'explorer'
  | 'professional'
  | 'business'
  | 'investor'
  | 'institutional'
  | 'platform_admin'
  | 'super_admin';

/**
 * All available entitlement keys
 */
export type EntitlementKey =
  | 'country_identity'
  | 'headline_macro'
  | 'sector_teasers'
  | 'news_teasers'
  | 'compare_lite'
  | 'full_macro'
  | 'sector_rationale'
  | 'reports_preview'
  | 'trade_data'
  | 'risk_analysis'
  | 'investment_thesis'
  | 'fx_metrics'
  | 'forecast_metrics'
  | 'supply_demand_matrix'
  | 'api_access'
  | 'export_access'
  | 'admin_access'
  | 'super_admin_access'
  | 'user_management'
  | 'system_configuration'
  | 'marketing_cms'
  | 'billing_management'
  | 'audit_logs';

/**
 * Organization roles
 */
export type OrgRole =
  | 'viewer'
  | 'analyst'
  | 'strategist'
  | 'executive'
  | 'org_admin'
  | 'platform_admin'
  | 'super_admin';

/**
 * Resolved user access information
 * Compatible with existing API route expectations
 */
export interface UserAccess {
  userId: string;
  email: string | null;
  planRank: number;
  planId: string;
  entitlements: string[];
  organizationId: string | null;
  organizationRole: OrgRole | null;
  isAuthenticated: boolean;
}

/**
 * Static mapping of plans to their ranks
 * Higher rank = more access
 */
export const PLAN_RANKS: Record<AccessTier, number> = {
  public: 0,
  explorer: 1,
  professional: 2,
  business: 3,
  investor: 4,
  institutional: 5,
  platform_admin: 99,
  super_admin: 100,
};

/**
 * Static mapping of plans to entitlements
 */
export const PLAN_ENTITLEMENTS: Record<AccessTier, EntitlementKey[]> = {
  public: [
    'country_identity',
    'headline_macro',
    'sector_teasers',
    'news_teasers',
  ],
  explorer: [
    'country_identity',
    'headline_macro',
    'sector_teasers',
    'news_teasers',
    'compare_lite',
  ],
  professional: [
    'country_identity',
    'headline_macro',
    'sector_teasers',
    'news_teasers',
    'compare_lite',
    'full_macro',
    'sector_rationale',
    'fx_metrics',
  ],
  business: [
    'country_identity',
    'headline_macro',
    'sector_teasers',
    'news_teasers',
    'compare_lite',
    'full_macro',
    'sector_rationale',
    'reports_preview',
    'trade_data',
    'risk_analysis',
    'investment_thesis',
    'fx_metrics',
    'forecast_metrics',
  ],
  investor: [
    'country_identity',
    'headline_macro',
    'sector_teasers',
    'news_teasers',
    'compare_lite',
    'full_macro',
    'sector_rationale',
    'reports_preview',
    'trade_data',
    'risk_analysis',
    'investment_thesis',
    'fx_metrics',
    'forecast_metrics',
    'supply_demand_matrix',
  ],
  institutional: [
    'country_identity',
    'headline_macro',
    'sector_teasers',
    'news_teasers',
    'compare_lite',
    'full_macro',
    'sector_rationale',
    'reports_preview',
    'trade_data',
    'risk_analysis',
    'investment_thesis',
    'api_access',
    'export_access',
    'fx_metrics',
    'forecast_metrics',
    'supply_demand_matrix',
  ],
  platform_admin: [
    'country_identity',
    'headline_macro',
    'sector_teasers',
    'news_teasers',
    'compare_lite',
    'full_macro',
    'sector_rationale',
    'reports_preview',
    'trade_data',
    'risk_analysis',
    'investment_thesis',
    'api_access',
    'export_access',
    'admin_access',
    'fx_metrics',
    'forecast_metrics',
    'supply_demand_matrix',
  ],
  super_admin: [
    'country_identity',
    'headline_macro',
    'sector_teasers',
    'news_teasers',
    'compare_lite',
    'full_macro',
    'sector_rationale',
    'reports_preview',
    'trade_data',
    'risk_analysis',
    'investment_thesis',
    'api_access',
    'export_access',
    'admin_access',
    'fx_metrics',
    'forecast_metrics',
    'supply_demand_matrix',
    'super_admin_access',
    'user_management',
    'system_configuration',
    'marketing_cms',
    'billing_management',
    'audit_logs',
  ],
};

/**
 * Default access for unauthenticated users
 */
export const PUBLIC_ACCESS: UserAccess = {
  userId: '',
  email: null,
  planRank: 0,
  planId: 'public',
  entitlements: PLAN_ENTITLEMENTS.public,
  organizationId: null,
  organizationRole: null,
  isAuthenticated: false,
};

/**
 * Resolve user access from Supabase
 * Handles both authenticated and public users safely
 */
export async function resolveUserAccess(
  supabase: SupabaseClient,
  userId?: string
): Promise<UserAccess> {
  // If no userId, return public access
  if (!userId) {
    return PUBLIC_ACCESS;
  }

  try {
    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('souvera_profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.warn('[resolveUserAccess] No profile found for user:', userId);
      return PUBLIC_ACCESS;
    }

    // Get ALL active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('souvera_subscriptions')
      .select('plan_id, organization_id')
      .eq('user_id', userId)
      .in('status', ['trial', 'active']);

    if (subError) {
      console.error('[resolveUserAccess] Subscription query error:', {
        userId,
        error: subError.message,
      });
    }

    // Select highest rank subscription if multiple exist
    let subscription = null;
    if (subscriptions && subscriptions.length > 0) {
      if (subscriptions.length === 1) {
        subscription = subscriptions[0];
      } else {
        // Multiple active subscriptions - pick highest rank
        subscription = subscriptions.reduce((highest, current) => {
          const currentRank = PLAN_RANKS[current.plan_id as AccessTier] || 0;
          const highestRank = PLAN_RANKS[highest.plan_id as AccessTier] || 0;
          return currentRank > highestRank ? current : highest;
        });
        console.warn('[resolveUserAccess] Multiple active subscriptions found, selected highest rank:', {
          userId,
          subscriptionCount: subscriptions.length,
          selectedPlan: subscription.plan_id,
          allPlans: subscriptions.map(s => s.plan_id),
        });
      }
    }

    // If no subscription, fallback to explorer
    const planId = (subscription?.plan_id || 'explorer') as AccessTier;
    const planRank = PLAN_RANKS[planId] || PLAN_RANKS.explorer;
    const entitlements = PLAN_ENTITLEMENTS[planId] || PLAN_ENTITLEMENTS.explorer;

    // Get org role if applicable
    let organizationRole: OrgRole | null = null;
    if (subscription?.organization_id) {
      const { data: membership } = await supabase
        .from('souvera_organization_members')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', subscription.organization_id)
        .single();
      organizationRole = (membership?.role as OrgRole) || null;
    }

    return {
      userId,
      email: profile.email,
      planRank,
      planId,
      entitlements,
      organizationId: subscription?.organization_id || null,
      organizationRole,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('[resolveUserAccess] Unexpected error:', error);
    return PUBLIC_ACCESS;
  }
}

/**
 * Check if user has a specific entitlement
 * Accepts either UserAccess object or AccessTier string
 */
export function hasEntitlement(
  access: UserAccess | AccessTier,
  required: EntitlementKey
): boolean {
  if (typeof access === 'string') {
    // Access tier string provided
    const entitlements = PLAN_ENTITLEMENTS[access] || PLAN_ENTITLEMENTS.public;
    return entitlements.includes(required);
  }
  // UserAccess object provided
  return access.entitlements.includes(required);
}

/**
 * Check if user has all specified entitlements
 */
export function hasAllEntitlements(
  access: UserAccess,
  required: EntitlementKey[]
): boolean {
  return required.every(ent => access.entitlements.includes(ent));
}

/**
 * Check if user has any of the specified entitlements
 */
export function hasAnyEntitlement(
  access: UserAccess,
  required: EntitlementKey[]
): boolean {
  return required.some(ent => access.entitlements.includes(ent));
}

/**
 * Check if user has minimum plan rank
 */
export function hasMinimumPlan(access: UserAccess, minTier: AccessTier): boolean {
  return access.planRank >= PLAN_RANKS[minTier];
}

/**
 * Get the appropriate data view based on user's plan
 * Returns the view name for database queries
 */
export function getDataView(access: UserAccess): string {
  if (access.planRank >= PLAN_RANKS.business) {
    return 'souvera_country_business_v';
  }
  if (access.planRank >= PLAN_RANKS.professional) {
    return 'souvera_country_professional_v';
  }
  return 'souvera_country_lite_v';
}

/**
 * Filter data based on entitlement
 * Returns full data if entitled, fallback otherwise
 */
export function filterByEntitlement<T>(
  access: UserAccess,
  data: T,
  requiredEntitlement: EntitlementKey,
  fallback: T
): T {
  return hasEntitlement(access, requiredEntitlement) ? data : fallback;
}

/**
 * Create an access denied error response
 */
export function createAccessDeniedError(
  requiredEntitlement: EntitlementKey,
  currentPlan: string
): { error: string; required_entitlement: string; current_plan: string; upgrade_url: string } {
  return {
    error: 'Access denied. Upgrade your plan to access this feature.',
    required_entitlement: requiredEntitlement,
    current_plan: currentPlan,
    upgrade_url: '/access',
  };
}

/**
 * Get upgrade suggestions based on missing entitlements
 */
export function getUpgradeSuggestion(
  currentPlanId: AccessTier,
  requiredEntitlement: EntitlementKey
): { suggestedPlan: AccessTier; features: EntitlementKey[] } | null {
  const planOrder: AccessTier[] = ['explorer', 'professional', 'business', 'investor', 'institutional'];
  
  for (const planId of planOrder) {
    if (PLAN_RANKS[planId] > PLAN_RANKS[currentPlanId]) {
      if (PLAN_ENTITLEMENTS[planId].includes(requiredEntitlement)) {
        return {
          suggestedPlan: planId,
          features: PLAN_ENTITLEMENTS[planId].filter(
            ent => !PLAN_ENTITLEMENTS[currentPlanId].includes(ent)
          ),
        };
      }
    }
  }
  
  return null;
}
