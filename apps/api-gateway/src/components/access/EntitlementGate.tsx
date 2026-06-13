/**
 * EntitlementGate Component
 * 
 * Conditionally renders children based on user entitlements.
 * Shows fallback (upgrade prompt) if user doesn't have required access.
 * 
 * @example
 * <EntitlementGate
 *   required="trade_data"
 *   fallback={<UpgradePrompt feature="Trade Intelligence" requiredTier="business" />}
 * >
 *   <TradeIntelligenceModule />
 * </EntitlementGate>
 * 
 * @example
 * // Require minimum tier
 * <EntitlementGate
 *   minimumTier="professional"
 *   fallback={<UpgradePrompt requiredTier="professional" />}
 * >
 *   <ProfessionalFeatures />
 * </EntitlementGate>
 * 
 * @example
 * // Require multiple entitlements (all)
 * <EntitlementGate
 *   requiredAll={['trade_data', 'export_access']}
 *   fallback={<PaywallBanner />}
 * >
 *   <ExportButton />
 * </EntitlementGate>
 */

'use client';

import { ReactNode } from 'react';
import { useEntitlements } from '@/hooks/useEntitlements';
import { EntitlementKey, AccessTier } from '@souvera/entitlements';

interface EntitlementGateProps {
  children: ReactNode;
  
  /** Single entitlement required */
  required?: EntitlementKey;
  
  /** All of these entitlements required */
  requiredAll?: EntitlementKey[];
  
  /** Any one of these entitlements required */
  requiredAny?: EntitlementKey[];
  
  /** Minimum tier required */
  minimumTier?: AccessTier;
  
  /** What to show if access denied */
  fallback?: ReactNode;
  
  /** Show loading state while checking access */
  loadingFallback?: ReactNode;
}

export function EntitlementGate({
  children,
  required,
  requiredAll,
  requiredAny,
  minimumTier,
  fallback = null,
  loadingFallback = null,
}: EntitlementGateProps) {
  const {
    loading,
    hasEntitlement,
    hasAllEntitlements,
    hasAnyEntitlement,
    hasMinimumTier,
  } = useEntitlements();

  // Show loading state
  if (loading) {
    return <>{loadingFallback}</>;
  }

  // Check access based on provided props
  let hasAccess = true;

  if (required && !hasEntitlement(required)) {
    hasAccess = false;
  }

  if (requiredAll && !hasAllEntitlements(requiredAll)) {
    hasAccess = false;
  }

  if (requiredAny && !hasAnyEntitlement(requiredAny)) {
    hasAccess = false;
  }

  if (minimumTier && !hasMinimumTier(minimumTier)) {
    hasAccess = false;
  }

  // Render children if has access, otherwise show fallback
  return <>{hasAccess ? children : fallback}</>;
}
