/**
 * Ensures the private `reports` storage bucket exists (service role).
 * Prevents "Bucket not found" when migration was not applied to this project.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_ID = 'reports';

export async function ensureReportsBucket(supabase: SupabaseClient): Promise<void> {
  let bucketExists = false;

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (!listError && buckets?.some((b) => b.id === BUCKET_ID || b.name === BUCKET_ID)) {
    bucketExists = true;
  }

  if (bucketExists) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(BUCKET_ID, {
    public: false,
    fileSizeLimit: 52_428_800,
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
  });

  if (createError && !createError.message.toLowerCase().includes('already exists')) {
    throw new Error(
      `Reports storage bucket missing and could not be created: ${createError.message}. ` +
        'Run infra/supabase/migrations/create-reports-storage-bucket.sql in Supabase, ' +
        'or verify SUPABASE_SERVICE_ROLE_KEY has storage admin access.'
    );
  }

  const { data: recheck, error: recheckError } = await supabase.storage.listBuckets();
  if (recheckError) {
    console.warn('[ensureReportsBucket] post-create listBuckets failed:', recheckError.message);
    return;
  }

  if (!recheck?.some((b) => b.id === BUCKET_ID || b.name === BUCKET_ID)) {
    throw new Error(
      'Reports storage bucket still missing after create attempt. ' +
        'Apply infra/supabase/migrations/create-reports-storage-bucket.sql in Supabase.'
    );
  }
}
