// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// System Configuration Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { ConfigClient } from '@/components/admin/system/ConfigClient';

export const metadata = {
  title: 'System Configuration | Souvera Admin',
  description: 'View platform configuration and environment',
};

export default async function ConfigPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/system/config');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <ConfigClient />;
}
