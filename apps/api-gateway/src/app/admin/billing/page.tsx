// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Billing Dashboard Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { BillingDashboardClient } from '@/components/admin/billing/BillingDashboardClient';

export const metadata = {
  title: 'Billing | Souvera Admin',
  description: 'Revenue metrics and subscription management',
};

export default async function BillingPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/billing');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <BillingDashboardClient />;
}
