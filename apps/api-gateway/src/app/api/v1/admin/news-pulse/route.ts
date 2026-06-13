// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin News Pulse API
// GET  /api/v1/admin/news-pulse — list signals for review
// PATCH /api/v1/admin/news-pulse — publish or archive a signal
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyAdminAccess(): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  try {
    const authSupabase = await createServerClient();
    const { data: { user }, error } = await authSupabase.auth.getUser();
    if (error || !user) return { isAdmin: false, error: 'Authentication required' };

    const supabase = getServiceClient();
    const { data: memberData } = await supabase
      .from('souvera_organization_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['org_admin', 'platform_admin'])
      .limit(1);

    if (memberData?.length) return { isAdmin: true, userId: user.id };
    return { isAdmin: false, error: 'Admin access required' };
  } catch {
    return { isAdmin: false, error: 'Authentication failed' };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error: authError } = await verifyAdminAccess();
    if (!isAdmin) return NextResponse.json({ error: authError }, { status: 403 });

    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? 'draft';
    const iso3 = searchParams.get('iso3');

    let query = supabase
      .from('souvera_country_news_signals')
      .select(`
        id,
        signal_date,
        headline_count,
        sentiment_score,
        risk_intensity,
        opportunity_intensity,
        top_headlines,
        source_mix,
        status,
        reviewed_at,
        generated_at,
        country:souvera_countries!inner(iso3, name)
      `)
      .eq('status', status)
      .order('signal_date', { ascending: false })
      .limit(50);

    if (iso3) {
      query = query.eq('souvera_countries.iso3', iso3.toUpperCase());
    }

    const { data: signals, error } = await query;

    if (error) {
      console.error('News pulse fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch news signals' }, { status: 500 });
    }

    const items = (signals ?? []).map((row: Record<string, unknown>) => {
      const country = row.country as { iso3: string; name: string } | null;
      return {
        id: row.id,
        iso3: country?.iso3,
        countryName: country?.name,
        signalDate: row.signal_date,
        headlineCount: row.headline_count,
        sentimentScore: row.sentiment_score,
        riskIntensity: row.risk_intensity,
        opportunityIntensity: row.opportunity_intensity,
        topHeadlines: row.top_headlines,
        sourceMix: row.source_mix,
        status: row.status,
        reviewedAt: row.reviewed_at,
        generatedAt: row.generated_at,
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error('GET /api/v1/admin/news-pulse:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin || !userId) return NextResponse.json({ error: authError }, { status: 403 });

    const body = await request.json();
    const { id, status } = body as { id: number; status: 'published' | 'archived' | 'draft' };

    if (!id || !status || !['published', 'archived', 'draft'].includes(status)) {
      return NextResponse.json({ error: 'id and status (published|archived|draft) required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('souvera_country_news_signals')
      .update({
        status,
        reviewed_at: status === 'published' ? new Date().toISOString() : null,
        reviewed_by: status === 'published' ? userId : null,
      })
      .eq('id', id)
      .select('id, status, signal_date')
      .single();

    if (error) {
      console.error('News pulse update error:', error);
      return NextResponse.json({ error: 'Failed to update signal' }, { status: 500 });
    }

    return NextResponse.json({ signal: data });
  } catch (err) {
    console.error('PATCH /api/v1/admin/news-pulse:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
