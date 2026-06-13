-- Canonical template id + download filename audit columns

ALTER TABLE public.souvera_report_requests
  ADD COLUMN IF NOT EXISTS template_id TEXT,
  ADD COLUMN IF NOT EXISTS report_filename TEXT,
  ADD COLUMN IF NOT EXISTS generator_used TEXT,
  ADD COLUMN IF NOT EXISTS generated_at_utc TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_report_requests_template_id
  ON public.souvera_report_requests (template_id)
  WHERE template_id IS NOT NULL;
