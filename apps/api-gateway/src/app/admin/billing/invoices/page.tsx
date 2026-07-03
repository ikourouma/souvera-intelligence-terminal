// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Invoice Management Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { InvoicesClient } from '@/components/admin/billing/InvoicesClient';

export const metadata = {
  title: 'Invoice Management | Souvera Admin',
  description: 'Manage subscription invoices',
};

export default async function InvoicesPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/billing/invoices');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <InvoicesClient />;
}
