/**
 * Parse USTR per-country Africa trade summary blocks from HTML.
 * Read-only extraction — no eligibility inference from trade figures.
 */

export type UstrParsedMetricScope =
  | 'goods_and_services_total'
  | 'goods_total'
  | 'us_exports_to_country'
  | 'us_imports_from_country'
  | 'services_total';

export interface UstrParsedTradeMetric {
  scope: UstrParsedMetricScope;
  value_usd: number;
  year: number;
  yoy_pct: number | null;
  yoy_direction: 'up' | 'down' | null;
}

export interface UstrParsedCountryTradePage {
  agoa_status_text: string | null;
  trade_agreement_text: string | null;
  metrics: UstrParsedTradeMetric[];
}

function parseUsdFromText(raw: string): number {
  const cleaned = raw.replace(/,/g, '').trim();
  const m = cleaned.match(/\$?([\d.]+)\s*(billion|million|B|M)?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = (m[2] ?? '').toLowerCase();
  if (unit.startsWith('b')) return Math.round(n * 1e9);
  if (unit.startsWith('m')) return Math.round(n * 1e6);
  return Math.round(n);
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSection(text: string, heading: string, nextHeadings: string[]): string {
  const startIdx = text.indexOf(heading);
  if (startIdx < 0) return '';
  let end = text.length;
  for (const h of nextHeadings) {
    const idx = text.indexOf(h, startIdx + heading.length);
    if (idx > startIdx && idx < end) end = idx;
  }
  return text.slice(startIdx, end).trim();
}

function parseYoY(sentence: string): { yoy_pct: number | null; yoy_direction: 'up' | 'down' | null } {
  const m = sentence.match(/,\s*(up|down)\s+([\d.]+)\s+percent/i);
  if (!m) return { yoy_pct: null, yoy_direction: null };
  return { yoy_pct: parseFloat(m[2]), yoy_direction: m[1].toLowerCase() as 'up' | 'down' };
}

/** Parse USTR Africa country page HTML into structured trade summary metrics. */
export function parseUstrCountryTradePageHtml(html: string): UstrParsedCountryTradePage {
  const text = stripHtml(html);
  const metrics: UstrParsedTradeMetric[] = [];

  const agoaBlock = extractSection(text, 'AGOA Status', ['Trade Agreements', 'Trade Summary']);
  const tradeAgreements = extractSection(text, 'Trade Agreements', ['Trade Summary', 'Stay in the Know']);
  const tradeSummary = extractSection(text, 'Trade Summary', ['Stay in the Know', 'Subscribe']);

  const gsMatch = tradeSummary.match(
    /goods and services trade with .+? totaled an estimated \$([\d.,]+)\s*(billion|million)? in (\d{4})/i
  );
  if (gsMatch) {
    const { yoy_pct, yoy_direction } = parseYoY(tradeSummary);
    metrics.push({
      scope: 'goods_and_services_total',
      value_usd: parseUsdFromText(`$${gsMatch[1]} ${gsMatch[2] ?? ''}`),
      year: parseInt(gsMatch[3], 10),
      yoy_pct,
      yoy_direction,
    });
  }

  const goodsMatch = tradeSummary.match(
    /goods trade with .+? totaled an estimated \$([\d.,]+)\s*(billion|million)? in (\d{4})/i
  );
  if (goodsMatch) {
    metrics.push({
      scope: 'goods_total',
      value_usd: parseUsdFromText(`$${goodsMatch[1]} ${goodsMatch[2] ?? ''}`),
      year: parseInt(goodsMatch[3], 10),
      yoy_pct: null,
      yoy_direction: null,
    });
  }

  const usExpMatch = tradeSummary.match(
    /goods exports to .+? in (\d{4}) were \$([\d.,]+)\s*(billion|million)?,\s*(up|down)\s+([\d.]+)\s+percent/i
  );
  if (usExpMatch) {
    metrics.push({
      scope: 'us_exports_to_country',
      value_usd: parseUsdFromText(`$${usExpMatch[2]} ${usExpMatch[3] ?? ''}`),
      year: parseInt(usExpMatch[1], 10),
      yoy_pct: parseFloat(usExpMatch[5]),
      yoy_direction: usExpMatch[4].toLowerCase() as 'up' | 'down',
    });
  }

  const usImpMatch = tradeSummary.match(
    /goods imports from .+? totaled \$([\d.,]+)\s*(billion|million)? in (\d{4}),\s*(up|down)\s+([\d.]+)\s+percent/i
  );
  if (usImpMatch) {
    metrics.push({
      scope: 'us_imports_from_country',
      value_usd: parseUsdFromText(`$${usImpMatch[1]} ${usImpMatch[2] ?? ''}`),
      year: parseInt(usImpMatch[3], 10),
      yoy_pct: parseFloat(usImpMatch[5]),
      yoy_direction: usImpMatch[4].toLowerCase() as 'up' | 'down',
    });
  }

  const svcMatch = tradeSummary.match(
    /total services trade \(exports plus imports\) with .+? totaled an estimated \$([\d.,]+)\s*(billion|million)? in (\d{4})/i
  );
  if (svcMatch) {
    const { yoy_pct, yoy_direction } = parseYoY(
      tradeSummary.slice(tradeSummary.indexOf(svcMatch[0]))
    );
    metrics.push({
      scope: 'services_total',
      value_usd: parseUsdFromText(`$${svcMatch[1]} ${svcMatch[2] ?? ''}`),
      year: parseInt(svcMatch[3], 10),
      yoy_pct,
      yoy_direction,
    });
  }

  return {
    agoa_status_text: agoaBlock ? agoaBlock.replace(/^AGOA Status\s*/i, '').trim() || null : null,
    trade_agreement_text: tradeAgreements
      ? tradeAgreements.replace(/^Trade Agreements\s*/i, '').trim() || null
      : null,
    metrics,
  };
}
