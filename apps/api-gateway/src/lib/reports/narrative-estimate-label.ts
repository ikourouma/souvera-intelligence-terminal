/**
 * Label unsourced numeric claims in narratives (Option 2 honesty).
 */

const NUMERIC_RE = /\$[\d,.]+\s*[BMK]?|\d+(?:\.\d+)?\s*%|\d+(?:\.\d+)?\s*(?:TCF|GW|MW)/i;
const ESTIMATE_TAG = '(Estimate — source not provided)';

export function labelUnverifiedNumericClaims(text: string): string {
  if (!NUMERIC_RE.test(text)) return text;
  if (text.includes(ESTIMATE_TAG)) return text;
  const trimmed = text.trim().replace(/\.\s*$/, '');
  return `${trimmed} ${ESTIMATE_TAG}.`;
}
