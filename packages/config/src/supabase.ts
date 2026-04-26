// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Supabase Client Factory
// Owner: Afronovation, Inc.
// ===========================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let _anonClient: SupabaseClient | null = null;
let _serviceClient: SupabaseClient | null = null;

/**
 * Get a Supabase client with the anon key (for public/authenticated access).
 * Suitable for API routes that operate under user context.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_anonClient) {
    _anonClient = createClient(env.supabase.url(), env.supabase.anonKey());
  }
  return _anonClient;
}

/**
 * Get a Supabase client with the service role key (bypasses RLS).
 * ONLY for server-side operations: ingestion, admin tasks, migrations.
 * NEVER expose this client to the frontend.
 */
export function getSupabaseServiceClient(): SupabaseClient {
  if (!_serviceClient) {
    _serviceClient = createClient(env.supabase.url(), env.supabase.serviceRoleKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _serviceClient;
}
