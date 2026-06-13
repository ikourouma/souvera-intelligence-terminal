/**
 * Client PDF narrative hygiene — strip unsourced numerics from teasers/opportunity copy.
 */

const NUMERIC_PATTERNS: RegExp[] = [
  /\$[\d,.]+\s*[BMK]?\+?/gi,
  /\b\d+(?:\.\d+)?\+?\s*%/g,
  /\b\d+(?:\.\d+)?\s*(?:TCF|GW|MW|barrels?|million|billion)\b/gi,
  /\b\d[\d,]*\+?\s+(?:funded|deals|startups|companies|projects)\b/gi,
];

export function neutralizeClientNumericClaims(text: string): string {
  let out = text;
  for (const re of NUMERIC_PATTERNS) {
    out = out.replace(re, '');
  }
  return out.replace(/\s{2,}/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
}
