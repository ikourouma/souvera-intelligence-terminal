/**
 * Cache-Control for tiered intelligence API responses.
 * Authenticated payloads vary by plan — never cache them as public.
 */

export function tieredApiCacheControl(isAuthenticated: boolean): string {
  if (isAuthenticated) {
    return 'private, no-cache, no-store, must-revalidate';
  }
  return 'public, s-maxage=300, stale-while-revalidate=600';
}
