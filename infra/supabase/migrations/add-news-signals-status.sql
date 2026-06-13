-- Sprint E: News Pulse review workflow — draft → published
ALTER TABLE public.souvera_country_news_signals
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived'));

ALTER TABLE public.souvera_country_news_signals
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE public.souvera_country_news_signals
  ADD COLUMN IF NOT EXISTS reviewed_by uuid;

CREATE INDEX IF NOT EXISTS idx_news_signals_status_date
  ON public.souvera_country_news_signals (status, signal_date DESC);

COMMENT ON COLUMN public.souvera_country_news_signals.status IS
  'draft = admin review pending; published = visible in terminal';
