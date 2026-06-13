-- Curated News — platform editorial feed (/insights/news)
-- Backend-first: admin CMS + ingest queue before public nav

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_curated_news_status') THEN
    CREATE TYPE public.souvera_curated_news_status AS ENUM (
      'draft',
      'in_review',
      'published',
      'archived'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_curated_news_ingest_status') THEN
    CREATE TYPE public.souvera_curated_news_ingest_status AS ENUM (
      'pending',
      'processed',
      'rejected',
      'promoted'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.souvera_curated_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body_md TEXT NOT NULL DEFAULT '',
  status public.souvera_curated_news_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  region TEXT[] NOT NULL DEFAULT '{}',
  country_iso3 TEXT[] NOT NULL DEFAULT '{}',
  themes TEXT[] NOT NULL DEFAULT '{}',
  hero_image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  editor_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.souvera_curated_news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES public.souvera_curated_news(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  snippet TEXT,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confidence NUMERIC(4, 3) DEFAULT 0.800,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.souvera_curated_news_ingest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_url TEXT NOT NULL,
  url_hash TEXT NOT NULL UNIQUE,
  raw_title TEXT NOT NULL,
  raw_summary TEXT,
  ai_draft_md TEXT,
  region TEXT[] NOT NULL DEFAULT '{}',
  country_iso3 TEXT[] NOT NULL DEFAULT '{}',
  themes TEXT[] NOT NULL DEFAULT '{}',
  status public.souvera_curated_news_ingest_status NOT NULL DEFAULT 'pending',
  promoted_to_id UUID REFERENCES public.souvera_curated_news(id) ON DELETE SET NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_curated_news_status_published
  ON public.souvera_curated_news (status, published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_curated_news_slug
  ON public.souvera_curated_news (slug);

CREATE INDEX IF NOT EXISTS idx_curated_news_sources_news_id
  ON public.souvera_curated_news_sources (news_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_curated_news_ingest_status
  ON public.souvera_curated_news_ingest (status, fetched_at DESC);

DROP TRIGGER IF EXISTS trg_souvera_curated_news_updated_at ON public.souvera_curated_news;
CREATE TRIGGER trg_souvera_curated_news_updated_at
  BEFORE UPDATE ON public.souvera_curated_news
  FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

ALTER TABLE public.souvera_curated_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_curated_news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_curated_news_ingest ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published curated news" ON public.souvera_curated_news;
CREATE POLICY "Public read published curated news"
  ON public.souvera_curated_news FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Public read sources for published news" ON public.souvera_curated_news_sources;
CREATE POLICY "Public read sources for published news"
  ON public.souvera_curated_news_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.souvera_curated_news n
      WHERE n.id = news_id AND n.status = 'published'
    )
  );

COMMENT ON TABLE public.souvera_curated_news IS
  'Souvera editorial curated news for /insights/news — distinct from country News Pulse';
COMMENT ON TABLE public.souvera_curated_news_ingest IS
  'Background ingest queue; admin promotes to souvera_curated_news';
