// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Dashboard - Index Page
// Owner: Afronovation, Inc.
// ===========================================

import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Dashboard | Souvera',
  description: 'Enterprise control panel for Souvera Intelligence Platform',
};

export default async function AdminIndexPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin');
  }

  return (
    <AdminDashboard 
      userInfo={{
        fullName: userInfo.fullName,
        role: userInfo.role,
      }}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
