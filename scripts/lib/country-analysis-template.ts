/**
 * Shared Souvera Country Analysis markdown template (why_now_md).
 * Used by Nigeria, Jamaica, and future country overview seeds.
 *
 * Structure:
 * 1. Lead paragraph (inflection / window framing)
 * 2. Three `- **Pillar:** body` bullets with inline metrics
 * 3. `**Investment Window:**` callout
 */

export const COUNTRY_ANALYSIS_STRUCTURE = {
  pillarCount: 3,
  calloutTitle: 'Investment Window',
} as const;

/** Validate seed markdown has expected structure before upsert. */
export function validateCountryAnalysisMd(md: string, countryLabel: string): void {
  const issues: string[] = [];
  if (!md.trim()) issues.push('empty why_now_md');
  if (!md.includes('**Investment Window:**')) issues.push('missing Investment Window callout');
  const bullets = md.match(/^-\s*\*\*.+?:\*\*/gm);
  if (!bullets || bullets.length < 3) issues.push(`expected 3 pillar bullets, found ${bullets?.length ?? 0}`);
  if (issues.length) {
    throw new Error(`${countryLabel} why_now_md validation failed: ${issues.join('; ')}`);
  }
}
