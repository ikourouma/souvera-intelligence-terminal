-- Report generation requests (user-initiated PDF pipeline)
-- Run after sql-pack-v1.1.sql (requires souvera_countries, auth.users)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_report_request_status') THEN
    CREATE TYPE public.souvera_report_request_status AS ENUM (
      'queued',
      'processing',
      'completed',
      'failed'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.souvera_report_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_id UUID REFERENCES public.souvera_countries(id) ON DELETE SET NULL,
  iso3 TEXT NOT NULL,
  report_type TEXT NOT NULL,
  status public.souvera_report_request_status NOT NULL DEFAULT 'queued',
  query_text TEXT,
  file_path TEXT,
  download_url TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_report_requests_user_id
  ON public.souvera_report_requests(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_report_requests_status
  ON public.souvera_report_requests(status)
  WHERE status IN ('queued', 'processing');

DROP TRIGGER IF EXISTS trg_souvera_report_requests_updated_at ON public.souvera_report_requests;
CREATE TRIGGER trg_souvera_report_requests_updated_at
  BEFORE UPDATE ON public.souvera_report_requests
  FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

ALTER TABLE public.souvera_report_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own report requests"
  ON public.souvera_report_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own report requests"
  ON public.souvera_report_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket (run in Supabase dashboard if bucket creation via SQL is restricted):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);
