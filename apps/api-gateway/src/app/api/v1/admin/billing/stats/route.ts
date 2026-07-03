// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Billing Stats API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

const PLAN_PRICES: Record<string, number> = {
  public: 0,
  explorer: 0,
  professional: 49,
  business: 199,
  investor: 499,
  institutional: 1999,
};

export async function GET() {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const supabase = getServiceClient();

    const { data: profiles, error: profilesError } = await supabase
      .from('souvera_profiles')
      .select('id, plan_id, created_at, status')
      .neq('plan_id', 'public')
      .neq('plan_id', 'platform_admin')
      .neq('plan_id', 'super_admin');

    if (profilesError) {
      console.error('[BillingStats] Error fetching profiles:', profilesError);
    }

    const activeProfiles = (profiles || []).filter(p => p.status !== 'suspended');
    
    const planCounts: Record<string, number> = {};
    let totalMrr = 0;

    for (const profile of activeProfiles) {
      const plan = profile.plan_id || 'explorer';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
      totalMrr += PLAN_PRICES[plan] || 0;
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const newSubscriptions7d = activeProfiles.filter(
      p => new Date(p.created_at) >= sevenDaysAgo
    ).length;

    const newSubscriptions30d = activeProfiles.filter(
      p => new Date(p.created_at) >= thirtyDaysAgo
    ).length;

    const previousMonthProfiles = activeProfiles.filter(
      p => new Date(p.created_at) >= sixtyDaysAgo && new Date(p.created_at) < thirtyDaysAgo
    );

    let previousMrr = 0;
    for (const profile of previousMonthProfiles) {
      const plan = profile.plan_id || 'explorer';
      previousMrr += PLAN_PRICES[plan] || 0;
    }

    const mrrChange = previousMrr > 0 
      ? ((totalMrr - previousMrr) / previousMrr) * 100 
      : totalMrr > 0 ? 100 : 0;

    const churnedCount = (profiles || []).filter(p => p.status === 'suspended').length;
    const churnRate = activeProfiles.length > 0 
      ? (churnedCount / (activeProfiles.length + churnedCount)) * 100 
      : 0;

    const avgRevenuePerUser = activeProfiles.length > 0 
      ? totalMrr / activeProfiles.length 
      : 0;

    const planDistribution = Object.entries(planCounts)
      .filter(([plan]) => plan !== 'explorer')
      .map(([plan, count]) => ({
        plan,
        count,
        revenue: count * (PLAN_PRICES[plan] || 0),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const revenueByMonth = generateMonthlyRevenue(activeProfiles);

    return NextResponse.json({
      mrr: totalMrr,
      arr: totalMrr * 12,
      mrrChange,
      activeSubscriptions: activeProfiles.filter(p => 
        p.plan_id && !['public', 'explorer'].includes(p.plan_id)
      ).length,
      newSubscriptions7d,
      newSubscriptions30d,
      churnRate,
      avgRevenuePerUser,
      planDistribution,
      revenueByMonth,
    });
  } catch (error) {
    console.error('[BillingStats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing stats' },
      { status: 500 }
    );
  }
}

function generateMonthlyRevenue(profiles: { plan_id: string | null; created_at: string }[]) {
  const months: { month: string; revenue: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthDate.toLocaleString('default', { month: 'short' });

    const activeInMonth = profiles.filter(p => {
      const createdAt = new Date(p.created_at);
      return createdAt <= monthEnd;
    });

    let monthRevenue = 0;
    for (const profile of activeInMonth) {
      const plan = profile.plan_id || 'explorer';
      monthRevenue += PLAN_PRICES[plan] || 0;
    }

    months.push({ month: monthName, revenue: monthRevenue });
  }

  return months;
}
