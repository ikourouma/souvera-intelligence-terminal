// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Plan Management Page - Access Control
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { PlansClient } from '@/components/admin/matrix/PlansClient';

export const metadata = {
  title: 'Plans Management | Souvera Admin',
  description: 'Manage subscription plans and their configurations',
};

export default async function PlansPage() {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();
  
  if (!isAdmin || !isSuperAdmin) {
    redirect('/admin');
  }

  return <PlansClient />;
}
