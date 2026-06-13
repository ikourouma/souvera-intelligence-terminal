/**
 * Bloomberg-grade metric highlighting for intelligence narratives.
 * @see docs/execution/metric-highlighting-recommendation.md
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrap(className: string, match: string): string {
  return `<span class="${className}">${match}</span>`;
}

/** Apply inline **bold** after metric highlighting. */
function applyBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
}

/**
 * Highlight key metrics in narrative prose for terminal-grade scanability.
 * Safe for use before dangerouslySetInnerHTML (escapes input first).
 */
export function highlightIntelligenceMetrics(text: string): string {
  if (!text) return '';

  let s = escapeHtml(text);

  // Dollar amounts: $5.1B, $575 billion, $2.4B+
  s = s.replace(
    /\$[\d,.]+(?:\.\d+)?(?:\s*(?:billion|million|trillion|B|M|T|bn|mn))?\+?/gi,
    (m) => wrap('text-emerald-400 font-semibold', m)
  );

  // Demographic: median age X years
  s = s.replace(
    /median age \d+(?:\.\d+)? years/gi,
    (m) => wrap('text-purple-400 font-semibold', m)
  );

  // Time windows: 24-36 month
  s = s.replace(
    /\d+[-–]\d+\s+month/gi,
    (m) => wrap('text-blue-300 font-semibold', m)
  );

  // Large scale counts: 200,000+ or 1.3B consumers style already caught; catch NNN+
  s = s.replace(
    /\b\d{1,3}(?:,\d{3})+\+?\b/g,
    (m) => wrap('text-blue-300 font-semibold', m)
  );

  // Percentages and YoY: 6.2%, +15% YoY, 75%
  s = s.replace(
    /\+?\d+(?:\.\d+)?(?:\s*YoY)?%/gi,
    (m) => wrap('text-blue-400 font-semibold', m)
  );

  // Year ranges in parentheses: (2024-2025)
  s = s.replace(
    /\(\d{4}[-–]\d{4}\)/g,
    (m) => wrap('text-zinc-400', m)
  );

  // Policy continuity years: through 2027
  s = s.replace(
    /through \d{4}/gi,
    (m) => wrap('text-blue-300', m)
  );

  return applyBold(s);
}

/** Full narrative format: metrics + bold markers. */
export function formatNarrativeText(text: string): string {
  return highlightIntelligenceMetrics(text);
}
