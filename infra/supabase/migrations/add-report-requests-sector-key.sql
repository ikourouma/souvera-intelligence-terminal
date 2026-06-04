-- Optional explicit column for Sector Deep-Dive (also stored in metadata.sectorKey)
ALTER TABLE public.souvera_report_requests
  ADD COLUMN IF NOT EXISTS sector_key TEXT;

CREATE INDEX IF NOT EXISTS idx_report_requests_sector_key
  ON public.souvera_report_requests (sector_key)
  WHERE sector_key IS NOT NULL;
