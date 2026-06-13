import type { CuratedNewsArticle, CuratedNewsSource } from '@/types/curated-news';

export function mapCuratedNewsRow(
  row: Record<string, unknown>,
  sources?: Record<string, unknown>[]
): CuratedNewsArticle {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    summary: row.summary as string,
    bodyMd: row.body_md as string,
    status: row.status as CuratedNewsArticle['status'],
    publishedAt: (row.published_at as string | null) ?? null,
    region: (row.region as string[]) ?? [],
    countryIso3: (row.country_iso3 as string[]) ?? [],
    themes: (row.themes as string[]) ?? [],
    heroImageUrl: (row.hero_image_url as string | null) ?? null,
    liveWireFeatured: (row.live_wire_featured as boolean | undefined) ?? false,
    liveWireSort: (row.live_wire_sort as number | undefined) ?? 0,
    sourceCount: sources?.length,
    sources: sources?.map(mapSourceRow),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapSourceRow(row: Record<string, unknown>): CuratedNewsSource {
  return {
    id: row.id as string,
    sourceName: row.source_name as string,
    sourceUrl: row.source_url as string,
    snippet: (row.snippet as string | null) ?? null,
    retrievedAt: row.retrieved_at as string,
    confidence: row.confidence != null ? Number(row.confidence) : null,
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

export const CURATED_NEWS_SELECT = `
  id,
  slug,
  title,
  summary,
  body_md,
  status,
  published_at,
  region,
  country_iso3,
  themes,
  hero_image_url,
  live_wire_featured,
  live_wire_sort,
  created_at,
  updated_at
`;

export const CURATED_NEWS_SOURCE_SELECT = `
  id,
  news_id,
  source_name,
  source_url,
  snippet,
  retrieved_at,
  confidence,
  sort_order
`;
