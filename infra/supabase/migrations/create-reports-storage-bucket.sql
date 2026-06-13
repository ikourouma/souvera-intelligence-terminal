-- Private storage bucket for generated report PDFs
-- Run after create-report-requests-table.sql

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  52428800,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Service role uploads via API; users download via signed URLs only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Service role full access reports bucket'
  ) THEN
    CREATE POLICY "Service role full access reports bucket"
      ON storage.objects FOR ALL
      TO service_role
      USING (bucket_id = 'reports')
      WITH CHECK (bucket_id = 'reports');
  END IF;
END $$;
