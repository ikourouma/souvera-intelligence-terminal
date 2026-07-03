// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Flash Banners Management Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { BannersClient } from '@/components/admin/marketing/BannersClient';

export const metadata = {
  title: 'Flash Banners | Souvera Admin',
  description: 'Manage announcement banners',
};

export default async function BannersPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/marketing/banners');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <BannersClient />;
}
