/**
 * useEntitlements Hook
 * 
 * Provides convenient methods to check user entitlements and access levels.
 * Built on top of useUserAccess for easy consumption by components.
 * 
 * @example
 * const { hasEntitlement, hasMinimumTier, currentTier } = useEntitlements();
 * 
 * if (hasEntitlement('trade_data')) {
 *   return <TradeIntelligence />;
 * }
 * 
 * if (hasMinimumTier('business')) {
 *   return <BusinessFeatures />;
 * }
 */

'use client';

import { useUserAccess } from './useUserAccess';
import {
  hasEntitlement as checkEntitlement,
  hasAllEntitlements as checkAllEntitlements,
  hasAnyEntitlement as checkAnyEntitlement,
  hasMinimumPlan,
  AccessTier,
  EntitlementKey,
  PLAN_RANKS,
} from '@souvera/entitlements';

export function useEntitlements() {
  const { access, loading, error } = useUserAccess();

  /**
   * Check if user has a specific entitlement
   */
  const hasEntitlement = (key: EntitlementKey): boolean => {
    if (!access) return false;
    return checkEntitlement(access, key);
  };

  /**
   * Check if user has all specified entitlements
   */
  const hasAllEntitlements = (keys: EntitlementKey[]): boolean => {
    if (!access) return false;
    return checkAllEntitlements(access, keys);
  };

  /**
   * Check if user has any of the specified entitlements
   */
  const hasAnyEntitlement = (keys: EntitlementKey[]): boolean => {
    if (!access) return false;
    return checkAnyEntitlement(access, keys);
  };

  /**
   * Check if user has minimum plan tier
   */
  const hasMinimumTier = (tier: AccessTier): boolean => {
    if (!access) return false;
    return hasMinimumPlan(access, tier);
  };

  /**
   * Get user's current tier
   */
  const currentTier = access?.planId as AccessTier | undefined;

  /**
   * Get user's plan rank (0 = public, 100 = super_admin)
   */
  const planRank = access?.planRank ?? 0;

  /**
   * Get all user's entitlements
   */
  const entitlements = access?.entitlements ?? [];

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = access?.isAuthenticated ?? false;

  /**
   * Check if user is admin (platform_admin or super_admin)
   */
  const isAdmin = hasAnyEntitlement(['admin_access', 'super_admin_access']);

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = hasEntitlement('super_admin_access');

  /**
   * Get next tier user should upgrade to
   */
  const getNextTier = (): AccessTier | null => {
    if (!currentTier) return 'explorer';
    
    const tierOrder: AccessTier[] = [
      'public',
      'explorer', 
      'professional',
      'business',
      'investor',
      'institutional',
    ];

    const currentIndex = tierOrder.indexOf(currentTier);
    if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
      return null; // Already at top tier or invalid tier
    }

    return tierOrder[currentIndex + 1];
  };

  return {
    // Access info
    access,
    loading,
    error,
    currentTier,
    planRank,
    entitlements,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    
    // Check methods
    hasEntitlement,
    hasAllEntitlements,
    hasAnyEntitlement,
    hasMinimumTier,
    
    // Utility
    getNextTier,
  };
}
