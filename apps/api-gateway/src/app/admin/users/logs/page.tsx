// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// User Access Logs Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { AccessLogsClient } from '@/components/admin/AccessLogsClient';

export const metadata = {
  title: 'Access Logs | Souvera Admin',
  description: 'View user access and activity logs',
};

export default async function AccessLogsPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/users/logs');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <AccessLogsClient />;
}
