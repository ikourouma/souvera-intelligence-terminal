// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// User Management Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { UserManagementClient } from '@/components/admin/UserManagementClient';

export const metadata = {
  title: 'User Management | Souvera Admin',
  description: 'Manage platform users, subscriptions, and access',
};

export default async function UsersPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/users');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <UserManagementClient />;
}
