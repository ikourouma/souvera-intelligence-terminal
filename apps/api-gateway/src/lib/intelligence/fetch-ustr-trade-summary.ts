/**
 * Fetch parsed USTR country trade summary for country intelligence API.
 */

import { createClient } from '@supabase/supabase-js';
import type { UstrTradeSummaryPayload, UstrTradeSummaryMetric } from '@/types/country-intelligence';

type DbMetric = {
  scope: string;
  value_usd: number;
  year: number;
  yoy_pct?: number | null;
  yoy_direction?: 'up' | 'down' | null;
};

export async function fetchUstrTradeSummaryForCountry(
  iso3: string
): Promise<UstrTradeSummaryPayload | undefined> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return undefined;

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await supabase
    .from('souvera_ustr_trade_summaries')
    .select('iso3, source_url, agoa_status_text, trade_agreement_text, metrics, last_reviewed_at')
    .eq('iso3', iso3.toUpperCase())
    .maybeSingle();

  if (error || !data?.metrics) return undefined;

  const metrics = (data.metrics as DbMetric[]).map(
    (m): UstrTradeSummaryMetric => ({
      scope: m.scope as UstrTradeSummaryMetric['scope'],
      valueUsd: m.value_usd,
      year: m.year,
      yoyPct: m.yoy_pct ?? null,
      yoyDirection: m.yoy_direction ?? null,
    })
  );

  if (!metrics.length) return undefined;

  return {
    iso3: data.iso3 as string,
    sourceUrl: data.source_url as string,
    agoaStatusText: (data.agoa_status_text as string) ?? null,
    tradeAgreementText: (data.trade_agreement_text as string) ?? null,
    metrics,
    lastReviewedAt: data.last_reviewed_at as string,
    dataLabel: 'USTR official country trade summary (tertiary — Census/USITC remain primary)',
  };
}
