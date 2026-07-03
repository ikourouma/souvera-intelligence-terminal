// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Hero Slides Management Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';
import { HeroSlidesClient } from '@/components/admin/marketing/HeroSlidesClient';

export const metadata = {
  title: 'Hero Slides | Souvera Admin',
  description: 'Manage homepage carousel slides',
};

export default async function HeroSlidesPage() {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/marketing/hero-slides');
  }

  if (!isSuperAdmin) {
    redirect('/admin?error=unauthorized');
  }

  return <HeroSlidesClient />;
}
