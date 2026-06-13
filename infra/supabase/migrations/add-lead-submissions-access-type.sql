-- Add structured access tier to lead submissions (upgrade / request flows)
ALTER TABLE lead_submissions
  ADD COLUMN IF NOT EXISTS access_type TEXT
  CHECK (access_type IS NULL OR access_type IN ('explorer', 'professional', 'business', 'institutional'));

CREATE INDEX IF NOT EXISTS idx_lead_submissions_access_type ON lead_submissions(access_type);

COMMENT ON COLUMN lead_submissions.access_type IS 'Requested Souvera access tier (explorer, professional, business, institutional)';
