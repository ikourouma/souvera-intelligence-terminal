// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Notifications Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { NotificationsClient } from '@/components/admin/NotificationsClient';

export const metadata = {
  title: 'Notifications | Souvera Admin',
  description: 'System notifications and alerts',
};

export default async function NotificationsPage() {
  const { isAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/notifications');
  }

  return <NotificationsClient />;
}
