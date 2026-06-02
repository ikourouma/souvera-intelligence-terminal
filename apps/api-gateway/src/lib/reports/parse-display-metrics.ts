/**
 * Parse formatted metric display strings into numbers for preflight comparison.
 */

export interface ParsedDisplayMetric {
  label: string;
  raw: string;
  valueUsd?: number;
  valuePct?: number;
  valuePlain?: number;
}

export function parseUsdString(s: string): number | undefined {
  const t = s.trim().replace(/,/g, '');
  const m = t.match(/\$?\s*([\d.]+)\s*([KMB])?/i);
  if (!m) return undefined;
  let n = parseFloat(m[1]);
  if (Number.isNaN(n)) return undefined;
  const suffix = (m[2] ?? '').toUpperCase();
  if (suffix === 'B') n *= 1e9;
  else if (suffix === 'M') n *= 1e6;
  else if (suffix === 'K') n *= 1e3;
  return n;
}

export function parsePctString(s: string): number | undefined {
  const m = s.trim().match(/(-?[\d.]+)\s*%/);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  return Number.isNaN(n) ? undefined : n;
}

export function parsePopulationString(s: string): number | undefined {
  const m = s.trim().match(/([\d.]+)\s*M/i);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  return Number.isNaN(n) ? undefined : n * 1e6;
}

export function parseDisplayMetrics(
  metrics: Array<{ label: string; value: string }>
): ParsedDisplayMetric[] {
  return metrics.map((m) => {
    const label = m.label.toLowerCase();
    const raw = m.value;
    const parsed: ParsedDisplayMetric = { label: m.label, raw };

    if (label.includes('gdp') && label.includes('current')) {
      parsed.valueUsd = parseUsdString(raw);
    } else if (label.includes('gdp') && label.includes('growth')) {
      parsed.valuePct = parsePctString(raw);
    } else if (label.includes('population')) {
      parsed.valuePlain = parsePopulationString(raw);
    } else if (label.includes('fdi')) {
      parsed.valueUsd = parseUsdString(raw);
    } else if (label.includes('inflation')) {
      parsed.valuePct = parsePctString(raw);
    } else if (label.includes('fx')) {
      const n = parseFloat(raw.replace(/,/g, ''));
      parsed.valuePlain = Number.isNaN(n) ? undefined : n;
    }

    return parsed;
  });
}

export function relativeDiff(a: number, b: number): number {
  if (b === 0) return Math.abs(a);
  return Math.abs(a - b) / Math.abs(b);
}
