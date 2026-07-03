// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Organizations Management Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { OrganizationsClient } from '@/components/admin/OrganizationsClient';

export const metadata = {
  title: 'Organizations | Souvera Admin',
  description: 'Manage platform organizations and teams',
};

export default async function OrganizationsPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/users/organizations');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <OrganizationsClient />;
}
