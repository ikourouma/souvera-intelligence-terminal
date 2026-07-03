// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Trust Logos Management Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { LogosClient } from '@/components/admin/marketing/LogosClient';

export const metadata = {
  title: 'Trust Logos | Souvera Admin',
  description: 'Manage data source badges and logos',
};

export default async function LogosPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/marketing/logos');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <LogosClient />;
}
