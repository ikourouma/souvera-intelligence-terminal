// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Pricing Display Management Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { PricingClient } from '@/components/admin/marketing/PricingClient';

export const metadata = {
  title: 'Pricing Display | Souvera Admin',
  description: 'Manage pricing plans and features',
};

export default async function PricingPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/marketing/pricing');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <PricingClient />;
}
