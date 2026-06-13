/**
 * Detect unresolved {{PLACEHOLDER}} tokens in client-facing report text.
 */

const PLACEHOLDER_RE = /\{\{[A-Z_]+\}\}/g;

export function findPlaceholderLeaks(text: string): string[] {
  const matches = text.match(PLACEHOLDER_RE);
  return matches ? [...new Set(matches)] : [];
}

export function textHasPlaceholderLeak(text: string): boolean {
  return PLACEHOLDER_RE.test(text);
}
