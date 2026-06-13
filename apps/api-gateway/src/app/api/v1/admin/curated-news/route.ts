import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, verifyAdminAccess } from '@/lib/admin/verify-admin';
import { writeAuditLog } from '@/lib/admin/audit-log';
import { uniqueSlug } from '@/lib/curated-news/slug';
import {
  CURATED_NEWS_SELECT,
  mapCuratedNewsRow,
} from '@/lib/curated-news/mapper';

// GET  /api/v1/admin/curated-news — list articles for CMS
// POST /api/v1/admin/curated-news — create draft article

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error: authError } = await verifyAdminAccess();
    if (!isAdmin) return NextResponse.json({ error: authError }, { status: 403 });

    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);

    let query = supabase
      .from('souvera_curated_news')
      .select(`${CURATED_NEWS_SELECT}, sources:souvera_curated_news_sources(count)`)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      console.error('Curated news list error:', error);
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }

    const items = (data ?? []).map((row: Record<string, unknown>) => {
      const sources = row.sources as { count: number }[] | undefined;
      const article = mapCuratedNewsRow(row);
      article.sourceCount = sources?.[0]?.count ?? 0;
      return article;
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error('GET /api/v1/admin/curated-news:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin || !userId) return NextResponse.json({ error: authError }, { status: 403 });

    const body = await request.json();
    const {
      title,
      summary,
      bodyMd = '',
      region = [],
      countryIso3 = [],
      themes = [],
      heroImageUrl,
      editorNotes,
      sources = [],
    } = body as {
      title: string;
      summary: string;
      bodyMd?: string;
      region?: string[];
      countryIso3?: string[];
      themes?: string[];
      heroImageUrl?: string;
      editorNotes?: string;
      sources?: Array<{
        sourceName: string;
        sourceUrl: string;
        snippet?: string;
        confidence?: number;
      }>;
    };

    if (!title?.trim() || !summary?.trim()) {
      return NextResponse.json({ error: 'title and summary are required' }, { status: 400 });
    }

    if (!sources.length) {
      return NextResponse.json(
        { error: 'At least one source reference is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const slug = await uniqueSlug(title, async (candidate) => {
      const { data } = await supabase
        .from('souvera_curated_news')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle();
      return !!data;
    });

    const { data: article, error: insertError } = await supabase
      .from('souvera_curated_news')
      .insert({
        slug,
        title: title.trim(),
        summary: summary.trim().slice(0, 280),
        body_md: bodyMd,
        status: 'draft',
        region,
        country_iso3: countryIso3.map((c) => c.toUpperCase()),
        themes,
        hero_image_url: heroImageUrl ?? null,
        author_id: userId,
        editor_notes: editorNotes ?? null,
      })
      .select(CURATED_NEWS_SELECT)
      .single();

    if (insertError || !article) {
      console.error('Curated news insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }

    const sourceRows = sources.map((s, i) => ({
      news_id: article.id,
      source_name: s.sourceName.trim(),
      source_url: s.sourceUrl.trim(),
      snippet: s.snippet?.trim() ?? null,
      confidence: s.confidence ?? 0.8,
      sort_order: i,
    }));

    const { error: sourcesError } = await supabase
      .from('souvera_curated_news_sources')
      .insert(sourceRows);

    if (sourcesError) {
      console.error('Curated news sources insert error:', sourcesError);
      await supabase.from('souvera_curated_news').delete().eq('id', article.id);
      return NextResponse.json({ error: 'Failed to save sources' }, { status: 500 });
    }

    await writeAuditLog({
      actorId: userId,
      action: 'curated_news.create',
      resourceType: 'curated_news',
      resourceId: article.id,
      metadata: { slug: article.slug, title: article.title },
    });

    return NextResponse.json({ article: mapCuratedNewsRow(article) }, { status: 201 });
  } catch (err) {
    console.error('POST /api/v1/admin/curated-news:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
