// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Layout - Fortune 5 Enterprise Grade
// Owner: Afronovation, Inc.
// ===========================================

import { redirect } from 'next/navigation';
import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin');
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <AdminHeader 
        user={{
          id: userInfo.id,
          email: userInfo.email,
          fullName: userInfo.fullName,
          role: userInfo.role === 'super_admin' ? 'super_admin' : 'platform_admin',
          avatarUrl: userInfo.avatarUrl,
        }}
        isSuperAdmin={isSuperAdmin}
      />

      <div className="flex">
        <AdminSidebar isSuperAdmin={isSuperAdmin} />
        
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
