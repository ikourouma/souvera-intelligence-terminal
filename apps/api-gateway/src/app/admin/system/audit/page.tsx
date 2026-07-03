// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// System Audit Logs Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { AuditLogsClient } from '@/components/admin/system/AuditLogsClient';

export const metadata = {
  title: 'Audit Logs | Souvera Admin',
  description: 'View platform activity and change history',
};

export default async function AuditLogsPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/system/audit');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <AuditLogsClient />;
}
