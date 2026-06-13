export type CuratedNewsStatus = 'draft' | 'in_review' | 'published' | 'archived';

export type CuratedNewsIngestStatus = 'pending' | 'processed' | 'rejected' | 'promoted';

export interface CuratedNewsSource {
  id: string;
  sourceName: string;
  sourceUrl: string;
  snippet?: string | null;
  retrievedAt: string;
  confidence?: number | null;
  sortOrder: number;
}

export interface CuratedNewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  bodyMd: string;
  status: CuratedNewsStatus;
  publishedAt: string | null;
  region: string[];
  countryIso3: string[];
  themes: string[];
  heroImageUrl: string | null;
  liveWireFeatured?: boolean;
  liveWireSort?: number;
  sourceCount?: number;
  sources?: CuratedNewsSource[];
  createdAt: string;
  updatedAt: string;
}

export interface CuratedNewsIngestItem {
  id: string;
  externalUrl: string;
  rawTitle: string;
  rawSummary: string | null;
  status: CuratedNewsIngestStatus;
  region: string[];
  countryIso3: string[];
  themes: string[];
  fetchedAt: string;
}
