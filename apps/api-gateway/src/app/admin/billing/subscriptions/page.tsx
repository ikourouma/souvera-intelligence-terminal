// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Subscriptions List Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { SubscriptionsClient } from '@/components/admin/billing/SubscriptionsClient';

export const metadata = {
  title: 'Subscriptions | Souvera Admin',
  description: 'Manage user subscriptions',
};

export default async function SubscriptionsPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/billing/subscriptions');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <SubscriptionsClient />;
}
