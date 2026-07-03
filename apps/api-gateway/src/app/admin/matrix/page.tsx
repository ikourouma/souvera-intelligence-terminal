// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Access Control Matrix Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { MatrixManagementClient } from '@/components/admin/MatrixManagementClient';

export const metadata = {
  title: 'Access Control Matrix | Souvera Admin',
  description: 'Manage feature access across all user personas',
};

export default async function MatrixPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/matrix');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <MatrixManagementClient />;
}
