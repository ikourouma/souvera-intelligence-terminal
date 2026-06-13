/**
 * Ingest News Pulse from GDELT for NGA + JAM pilot countries.
 * Writes draft rows to souvera_country_news_signals for admin review.
 *
 * Run: npx tsx scripts/ingest-news-pulse.ts
 * Run: npx tsx scripts/ingest-news-pulse.ts --iso3=NGA
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  buildNewsPulseQuery,
  dedupeArticles,
  fetchGdeltArticles,
} from './lib/gdelt-doc';
import { NEWS_PULSE_PILOT } from './lib/news-pulse-pilot';
import { scoreNewsPulse } from './lib/news-pulse-scoring';
import {
  filterCountryRelevantArticles,
  newsPulseFilterConfig,
} from '../apps/api-gateway/src/lib/intelligence/news-pulse-relevance';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function ingestCountry(iso3: string): Promise<void> {
  const config = NEWS_PULSE_PILOT.find((c) => c.iso3 === iso3);
  if (!config) {
    console.warn(`⚠️  ${iso3}: not in pilot list, skipping`);
    return;
  }

  const { data: country, error: countryError } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', iso3)
    .maybeSingle();

  if (countryError || !country) {
    console.error(`❌ ${iso3}: country not found`);
    return;
  }

  const query = buildNewsPulseQuery(config.countryKeyword, config.regionTerms);
  console.log(`📡 ${iso3}: GDELT query → ${query}`);

  let articles;
  try {
    const raw = dedupeArticles(await fetchGdeltArticles(query, 30));
    const filterConfig = newsPulseFilterConfig(iso3);
    articles = filterConfig ? filterCountryRelevantArticles(raw, filterConfig) : raw;
    const dropped = raw.length - articles.length;
    if (dropped > 0) {
      console.log(`   🧹 Filtered ${dropped} off-country headline(s)`);
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`❌ ${iso3}: GDELT fetch failed — ${detail}`);
    console.error(`   Tip: GDELT allows ~1 request per 5 seconds. Wait 30s and retry, or use:`);
    console.error(`   npx tsx scripts/seed-news-pulse-pilot.ts`);
    return;
  }

  const score = scoreNewsPulse(articles);
  const signalDate = new Date().toISOString().slice(0, 10);

  const basePayload = {
    country_id: country.id,
    signal_date: signalDate,
    headline_count: score.headlineCount,
    sentiment_score: score.sentimentScore,
    risk_intensity: score.riskIntensity,
    opportunity_intensity: score.opportunityIntensity,
    top_headlines: score.topHeadlines,
    source_mix: { provider: 'gdelt', query },
    generated_at: new Date().toISOString(),
  };

  const publishDrafts = !process.argv.includes('--draft');
  const statusPayload = publishDrafts
    ? { ...basePayload, status: 'published', reviewed_at: new Date().toISOString() }
    : { ...basePayload, status: 'draft' };

  const { error: upsertError } = await supabase
    .from('souvera_country_news_signals')
    .upsert(statusPayload, { onConflict: 'country_id,signal_date' });

  const error =
    upsertError?.message?.includes('status')
      ? (await supabase.from('souvera_country_news_signals').upsert(basePayload, {
          onConflict: 'country_id,signal_date',
        })).error
      : upsertError;

  if (error) {
    console.error(`❌ ${iso3}: upsert failed —`, error.message);
    return;
  }

  console.log(
    `✅ ${iso3}: ${score.headlineCount} headlines → ${publishDrafts ? 'published' : 'draft'} (sentiment ${score.sentimentScore}, risk ${score.riskIntensity}, opp ${score.opportunityIntensity})`
  );
}

async function main() {
  const isoArg = process.argv.find((a) => a.startsWith('--iso3='));
  const targets = isoArg
    ? [isoArg.split('=')[1]!.toUpperCase()]
    : NEWS_PULSE_PILOT.map((c) => c.iso3);

  console.log('🚀 News Pulse ingest (GDELT pilot)\n');
  console.log(`Countries: ${targets.join(', ')}\n`);

  for (const iso3 of targets) {
    await ingestCountry(iso3);
    // GDELT requires ≥5s between requests
    await new Promise((r) => setTimeout(r, 6_000));
  }

  console.log('\n✅ Ingest complete. Review drafts at /admin/data/news-pulse');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
