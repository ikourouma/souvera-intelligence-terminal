// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Platform Stats Page
// Owner: Afronovation, Inc.
// ===========================================

import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Platform Stats | Souvera Admin',
  description: 'Platform analytics and statistics',
};

export default async function StatsPage() {
  const { isAdmin, userInfo } = await verifyAdminAccess();
  
  if (!isAdmin || !userInfo) {
    redirect('/login?redirect=/admin/stats');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Platform Statistics
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Analytics and usage metrics
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-zinc-800/50 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-zinc-400 text-lg font-medium">Coming Soon</p>
        <p className="text-zinc-500 text-sm mt-2">
          Detailed platform analytics will be available in the next update.
        </p>
      </div>
    </div>
  );
}
