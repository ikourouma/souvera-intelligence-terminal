-- Live Wire placement for /insights hub — super-admin managed

ALTER TABLE public.souvera_curated_news
  ADD COLUMN IF NOT EXISTS live_wire_featured BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.souvera_curated_news
  ADD COLUMN IF NOT EXISTS live_wire_sort INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_curated_news_live_wire
  ON public.souvera_curated_news (live_wire_featured, live_wire_sort, published_at DESC)
  WHERE status = 'published';

COMMENT ON COLUMN public.souvera_curated_news.live_wire_featured IS
  'When true, article appears as hero on /insights Live Wire';
COMMENT ON COLUMN public.souvera_curated_news.live_wire_sort IS
  'Sort order on Live Wire feed (lower = higher)';
