// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Dashboard - Index
// Owner: Afronovation, Inc.
// ===========================================

import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Dashboard | Souvera',
  description: 'Unified admin control panel for Souvera Intelligence Platform',
};

export default async function AdminIndexPage() {
  const { isAdmin } = await verifyAdminAccess();
  
  if (!isAdmin) {
    redirect('/login?redirect=/admin');
  }

  return <AdminDashboard />;
}
