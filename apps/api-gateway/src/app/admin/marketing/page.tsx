// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Marketing CMS Dashboard Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { MarketingDashboardClient } from '@/components/admin/marketing/MarketingDashboardClient';

export const metadata = {
  title: 'Marketing CMS | Souvera Admin',
  description: 'Manage homepage content and marketing assets',
};

export default async function MarketingPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/marketing');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <MarketingDashboardClient />;
}
