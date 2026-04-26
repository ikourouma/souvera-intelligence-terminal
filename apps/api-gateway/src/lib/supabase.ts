import { getSupabaseClient } from '@souvera/config/src/supabase';

// Re-exporting configured Supabase client from packages/config to satisfy AfDEC component imports
export const supabase = getSupabaseClient();
