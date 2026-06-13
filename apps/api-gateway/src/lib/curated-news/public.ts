import { createClient } from '@supabase/supabase-js';
import {
  CURATED_NEWS_SELECT,
  CURATED_NEWS_SOURCE_SELECT,
  mapCuratedNewsRow,
} from '@/lib/curated-news/mapper';
import { filterValidSources } from '@/lib/curated-news/validate-source-url';
import type { CuratedNewsArticle } from '@/types/curated-news';

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function fetchPublishedNews(options?: {
  region?: string;
  theme?: string;
  limit?: number;
}): Promise<CuratedNewsArticle[]> {
  const supabase = getAnonClient();
  let query = supabase
    .from('souvera_curated_news')
    .select(`${CURATED_NEWS_SELECT}, sources:souvera_curated_news_sources(count)`)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(options?.limit ?? 20);

  if (options?.region) query = query.contains('region', [options.region]);
  if (options?.theme) query = query.contains('themes', [options.theme]);

  const { data, error } = await query;
  if (error) {
    console.error('fetchPublishedNews:', error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const sources = row.sources as { count: number }[] | undefined;
    const article = mapCuratedNewsRow(row);
    article.sourceCount = sources?.[0]?.count ?? 0;
    return article;
  });
}

export async function fetchPublishedArticleBySlug(
  slug: string
): Promise<CuratedNewsArticle | null> {
  const supabase = getAnonClient();

  const { data: article, error } = await supabase
    .from('souvera_curated_news')
    .select(CURATED_NEWS_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !article) return null;

  const { data: sources } = await supabase
    .from('souvera_curated_news_sources')
    .select(CURATED_NEWS_SOURCE_SELECT)
    .eq('news_id', article.id)
    .order('sort_order', { ascending: true });

  const mapped = mapCuratedNewsRow(article, sources ?? []);
  return attachVerifiedSources(mapped);
}

async function attachVerifiedSources(article: CuratedNewsArticle): Promise<CuratedNewsArticle> {
  if (!article.sources?.length) return article;
  const verified = await filterValidSources(article.sources);
  return { ...article, sources: verified, sourceCount: verified.length };
}

/** Published articles for /insights Live Wire — CMS-managed order */
export async function fetchLiveWireArticles(options?: {
  limit?: number;
}): Promise<CuratedNewsArticle[]> {
  const supabase = getAnonClient();
  const limit = options?.limit ?? 12;

  const { data, error } = await supabase
    .from('souvera_curated_news')
    .select(CURATED_NEWS_SELECT)
    .eq('status', 'published')
    .order('live_wire_featured', { ascending: false })
    .order('live_wire_sort', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(limit);

  let rows = data;

  if (error?.message?.includes('live_wire')) {
    const fallback = await supabase
      .from('souvera_curated_news')
      .select(CURATED_NEWS_SELECT)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
    if (fallback.error) {
      console.error('fetchLiveWireArticles:', fallback.error.message);
      return [];
    }
    rows = fallback.data;
  } else if (error) {
    console.error('fetchLiveWireArticles:', error.message);
    return [];
  }

  const articles = await Promise.all(
    (rows ?? []).map(async (row) => {
      const { data: sources } = await supabase
        .from('souvera_curated_news_sources')
        .select(CURATED_NEWS_SOURCE_SELECT)
        .eq('news_id', row.id as string)
        .order('sort_order', { ascending: true });
      const article = mapCuratedNewsRow(row, sources ?? []);
      return attachVerifiedSources(article);
    })
  );

  return articles;
}

const BRIEFING_THEMES = new Set(['policy', 'sector', 'fdi', 'trade', 'fx', 'energy']);

/** Strategic briefings — policy and deep-dive themed curated articles */
export async function fetchBriefingArticles(options?: {
  limit?: number;
}): Promise<CuratedNewsArticle[]> {
  const limit = options?.limit ?? 24;
  const all = await fetchPublishedNews({ limit: 50 });
  const themed = all.filter((a) => a.themes.some((t) => BRIEFING_THEMES.has(t)));
  return (themed.length ? themed : all).slice(0, limit);
}
