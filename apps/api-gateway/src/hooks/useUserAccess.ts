/**
 * useUserAccess Hook
 * 
 * Fetches the current user's access tier, entitlements, and plan information.
 * Used across the application to determine what features the user can access.
 * 
 * @example
 * const { access, loading, error } = useUserAccess();
 * if (access?.planId === 'business') {
 *   // Show business features
 * }
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { resolveUserAccess, UserAccess, PUBLIC_ACCESS } from '@souvera/entitlements';

export function useUserAccess() {
  const [access, setAccess] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAccess() {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          throw new Error(`Auth error: ${authError.message}`);
        }

        if (!user) {
          // Not authenticated - use public access
          setAccess(PUBLIC_ACCESS);
          return;
        }

        // Resolve user's full access (plan, entitlements, org role)
        const userAccess = await resolveUserAccess(supabase, user.id);
        setAccess(userAccess);

      } catch (err) {
        console.error('[useUserAccess] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load access');
        // Fallback to public access on error
        setAccess(PUBLIC_ACCESS);
      } finally {
        setLoading(false);
      }
    }

    fetchAccess();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchAccess();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { access, loading, error };
}
