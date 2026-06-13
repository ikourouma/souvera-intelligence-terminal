import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  CURATED_NEWS_SELECT,
  mapCuratedNewsRow,
} from '@/lib/curated-news/mapper';

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/v1/insights/news — public published feed

export async function GET(request: NextRequest) {
  try {
    const supabase = getAnonClient();
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const theme = searchParams.get('theme');
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('souvera_curated_news')
      .select(`${CURATED_NEWS_SELECT}, sources:souvera_curated_news_sources(count)`, {
        count: 'exact',
      })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (region) query = query.contains('region', [region]);
    if (theme) query = query.contains('themes', [theme]);

    const { data, error, count } = await query;

    if (error) {
      console.error('Public curated news fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }

    const items = (data ?? []).map((row: Record<string, unknown>) => {
      const sources = row.sources as { count: number }[] | undefined;
      const article = mapCuratedNewsRow(row);
      article.sourceCount = sources?.[0]?.count ?? 0;
      return article;
    });

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: count ?? items.length,
        hasMore: (count ?? 0) > offset + limit,
      },
    });
  } catch (err) {
    console.error('GET /api/v1/insights/news:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
