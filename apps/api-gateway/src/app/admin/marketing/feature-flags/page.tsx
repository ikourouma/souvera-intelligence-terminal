// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Feature Flags Management Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { FeatureFlagsClient } from '@/components/admin/marketing/FeatureFlagsClient';

export const metadata = {
  title: 'Feature Flags | Souvera Admin',
  description: 'Manage platform feature toggles',
};

export default async function FeatureFlagsPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/marketing/feature-flags');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <FeatureFlagsClient />;
}
