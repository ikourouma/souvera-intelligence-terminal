/**
 * Background ingest for curated news — writes to souvera_curated_news_ingest queue.
 * Admin promotes items to drafts at /admin/content/news.
 *
 * Run: npx tsx scripts/ingest-curated-news.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createHash } from 'crypto';
import {
  buildNewsPulseQuery,
  dedupeArticles,
  fetchGdeltArticles,
} from './lib/gdelt-doc';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const INGEST_QUERIES = [
  {
    label: 'AfCFTA trade',
    query: buildNewsPulseQuery('AfCFTA', ['Africa', 'trade']),
    region: ['africa'],
    countryIso3: [] as string[],
    themes: ['trade', 'policy'],
  },
  {
    label: 'Caribbean tourism',
    query: buildNewsPulseQuery('Caribbean', ['tourism', 'investment']),
    region: ['caribbean'],
    countryIso3: ['JAM'],
    themes: ['fdi', 'sector'],
  },
  {
    label: 'Africa fintech',
    query: buildNewsPulseQuery('Africa fintech', ['payments', 'regulation']),
    region: ['africa'],
    countryIso3: ['NGA', 'KEN'],
    themes: ['policy', 'sector'],
  },
];

function urlHash(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

async function ingestQuery(config: (typeof INGEST_QUERIES)[0]): Promise<number> {
  console.log(`📡 ${config.label}: ${config.query}`);

  let articles;
  try {
    articles = dedupeArticles(await fetchGdeltArticles(config.query, 15));
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`   ❌ GDELT failed: ${detail}`);
    return 0;
  }

  let inserted = 0;

  for (const article of articles.slice(0, 10)) {
    if (!article.url || article.url === '#') continue;

    const hash = urlHash(article.url);
    const { error } = await supabase.from('souvera_curated_news_ingest').upsert(
      {
        external_url: article.url,
        url_hash: hash,
        raw_title: article.title,
        raw_summary: article.domain ? `Source: ${article.domain}` : null,
        region: config.region,
        country_iso3: config.countryIso3,
        themes: config.themes,
        status: 'pending',
        fetched_at: new Date().toISOString(),
      },
      { onConflict: 'url_hash', ignoreDuplicates: true }
    );

    if (!error) inserted++;
  }

  console.log(`   ✅ ${inserted} new queue items`);
  return inserted;
}

async function main() {
  console.log('🚀 Curated news ingest (background queue)...\n');

  const { error: tableCheck } = await supabase
    .from('souvera_curated_news_ingest')
    .select('id')
    .limit(1);

  if (tableCheck?.message?.includes('does not exist')) {
    console.error('❌ Table missing. Run migration: create-curated-news-tables.sql');
    process.exit(1);
  }

  let total = 0;
  for (const config of INGEST_QUERIES) {
    total += await ingestQuery(config);
    // GDELT rate limit courtesy pause
    await new Promise((r) => setTimeout(r, 6500));
  }

  console.log(`\n✅ Ingest complete — ${total} items queued. Review at /admin/content/news`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
