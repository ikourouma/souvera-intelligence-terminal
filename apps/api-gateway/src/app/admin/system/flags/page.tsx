// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// System Feature Flags Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { FeatureFlagsClient } from '@/components/admin/system/FeatureFlagsClient';

export const metadata = {
  title: 'Feature Flags | Souvera Admin',
  description: 'Manage platform feature flags',
};

export default async function FeatureFlagsPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/system/flags');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <FeatureFlagsClient />;
}
