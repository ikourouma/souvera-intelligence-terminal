'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUserAccess } from '@/hooks/useUserAccess';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { BusinessDashboard } from '@/components/dashboard/BusinessDashboard';
import { ExplorerDashboard } from '@/components/dashboard/ExplorerDashboard';
import { ProfessionalDashboard } from '@/components/dashboard/ProfessionalDashboard';
import { InvestorDashboard } from '@/components/dashboard/InvestorDashboard';
import { InstitutionalDashboard } from '@/components/dashboard/InstitutionalDashboard';

function PersonaDashboard({ tier, userAccess }: { tier: string; userAccess: NonNullable<ReturnType<typeof useUserAccess>['access']> }) {
  const props = { userAccess, tier };

  switch (tier) {
    case 'explorer':
      return <ExplorerDashboard {...props} />;
    case 'professional':
      return <ProfessionalDashboard {...props} />;
    case 'business':
      return <BusinessDashboard {...props} />;
    case 'investor':
      return <InvestorDashboard {...props} />;
    case 'institutional':
      return <InstitutionalDashboard {...props} />;
    default:
      return <ExplorerDashboard {...props} />;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { access: userAccess, loading } = useUserAccess();

  useEffect(() => {
    if (!loading && (!userAccess || userAccess.planId === 'public')) {
      router.push('/login');
    }
  }, [userAccess, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </main>
    );
  }

  if (!userAccess || userAccess.planId === 'public') {
    return null;
  }

  const tier = userAccess.planId || 'explorer';

  return (
    <div className="min-h-screen bg-zinc-950">
      <SouveraMegaNav />

      <div className="flex pt-16">
        <DashboardSidebar userAccess={userAccess} tier={tier} />

        <main className="flex-1 min-w-0">
          <PersonaDashboard tier={tier} userAccess={userAccess} />
        </main>
      </div>

      <SouveraFooter />
    </div>
  );
}
