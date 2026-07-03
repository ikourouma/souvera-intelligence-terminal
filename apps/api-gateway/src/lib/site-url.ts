/** Canonical public site URL for metadata, JSON-LD, and OG tags. */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://souveraterminal.com'
  );
}
