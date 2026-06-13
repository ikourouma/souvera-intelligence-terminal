import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, verifyAdminAccess } from '@/lib/admin/verify-admin';

// GET  /api/v1/admin/curated-news/ingest — list ingest queue
// POST /api/v1/admin/curated-news/ingest — promote ingest item to draft article

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error: authError } = await verifyAdminAccess();
    if (!isAdmin) return NextResponse.json({ error: authError }, { status: 403 });

    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? 'pending';

    const { data, error } = await supabase
      .from('souvera_curated_news_ingest')
      .select(`
        id,
        external_url,
        raw_title,
        raw_summary,
        status,
        region,
        country_iso3,
        themes,
        fetched_at,
        promoted_to_id
      `)
      .eq('status', status)
      .order('fetched_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Ingest queue fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch ingest queue' }, { status: 500 });
    }

    const items = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      externalUrl: row.external_url,
      rawTitle: row.raw_title,
      rawSummary: row.raw_summary,
      status: row.status,
      region: row.region,
      countryIso3: row.country_iso3,
      themes: row.themes,
      fetchedAt: row.fetched_at,
      promotedToId: row.promoted_to_id,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error('GET /api/v1/admin/curated-news/ingest:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin || !userId) return NextResponse.json({ error: authError }, { status: 403 });

    const body = await request.json();
    const { ingestId } = body as { ingestId: string };

    if (!ingestId) {
      return NextResponse.json({ error: 'ingestId required' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: item, error: fetchError } = await supabase
      .from('souvera_curated_news_ingest')
      .select('*')
      .eq('id', ingestId)
      .maybeSingle();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Ingest item not found' }, { status: 404 });
    }

    if (item.status === 'promoted') {
      return NextResponse.json({ error: 'Already promoted' }, { status: 400 });
    }

    const slugBase = item.raw_title as string;
    const slug = slugBase
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80);

    const summary =
      (item.raw_summary as string | null)?.slice(0, 280) ??
      (item.raw_title as string).slice(0, 280);

    const { data: article, error: insertError } = await supabase
      .from('souvera_curated_news')
      .insert({
        slug: `${slug}-${Date.now().toString(36)}`,
        title: item.raw_title,
        summary,
        body_md: item.ai_draft_md ?? `## Summary\n\n${summary}\n\n_Sourced from web aggregation — edit before publishing._`,
        status: 'draft',
        region: item.region ?? [],
        country_iso3: item.country_iso3 ?? [],
        themes: item.themes ?? [],
        author_id: userId,
        editor_notes: `Promoted from ingest queue: ${item.external_url}`,
      })
      .select('id, slug, title')
      .single();

    if (insertError || !article) {
      console.error('Promote ingest error:', insertError);
      return NextResponse.json({ error: 'Failed to create draft from ingest' }, { status: 500 });
    }

    await supabase.from('souvera_curated_news_sources').insert({
      news_id: article.id,
      source_name: 'Web source',
      source_url: item.external_url,
      snippet: item.raw_summary,
      sort_order: 0,
    });

    await supabase
      .from('souvera_curated_news_ingest')
      .update({
        status: 'promoted',
        promoted_to_id: article.id,
        processed_at: new Date().toISOString(),
      })
      .eq('id', ingestId);

    return NextResponse.json({ articleId: article.id, slug: article.slug });
  } catch (err) {
    console.error('POST /api/v1/admin/curated-news/ingest:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
