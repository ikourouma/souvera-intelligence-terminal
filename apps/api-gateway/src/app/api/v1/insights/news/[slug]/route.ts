import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  CURATED_NEWS_SELECT,
  CURATED_NEWS_SOURCE_SELECT,
  mapCuratedNewsRow,
} from '@/lib/curated-news/mapper';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/v1/insights/news/[slug] — public article detail

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = getAnonClient();

    const { data: article, error } = await supabase
      .from('souvera_curated_news')
      .select(CURATED_NEWS_SELECT)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const { data: sources } = await supabase
      .from('souvera_curated_news_sources')
      .select(CURATED_NEWS_SOURCE_SELECT)
      .eq('news_id', article.id)
      .order('sort_order', { ascending: true });

    return NextResponse.json({
      article: mapCuratedNewsRow(article, sources ?? []),
    });
  } catch (err) {
    console.error('GET /api/v1/insights/news/[slug]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
