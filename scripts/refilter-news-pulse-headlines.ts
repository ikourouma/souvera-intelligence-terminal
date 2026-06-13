/**
 * Re-filter stored News Pulse headlines for NGA/JAM — removes off-country bleed.
 * Run: npx tsx scripts/refilter-news-pulse-headlines.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  filterStoredHeadlines,
  newsPulseFilterConfig,
} from '../apps/api-gateway/src/lib/intelligence/news-pulse-relevance';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log('🧹 Re-filtering News Pulse headlines (NGA + JAM)...\n');

  for (const iso3 of ['NGA', 'JAM']) {
    const filterCfg = newsPulseFilterConfig(iso3);
    if (!filterCfg) continue;

    const { data: country } = await supabase
      .from('souvera_countries')
      .select('id')
      .eq('iso3', iso3)
      .maybeSingle();

    if (!country) continue;

    const { data: signals } = await supabase
      .from('souvera_country_news_signals')
      .select('id, top_headlines, headline_count')
      .eq('country_id', country.id)
      .order('signal_date', { ascending: false })
      .limit(5);

    for (const row of signals ?? []) {
      const raw = (row.top_headlines as { title: string }[]) ?? [];
      const filtered = filterStoredHeadlines(raw, filterCfg);
      const dropped = raw.length - filtered.length;

      if (dropped === 0) {
        console.log(`✅ ${iso3} signal ${row.id}: no changes (${filtered.length} headlines)`);
        continue;
      }

      const { error } = await supabase
        .from('souvera_country_news_signals')
        .update({
          top_headlines: filtered,
          headline_count: filtered.length,
        })
        .eq('id', row.id);

      if (error) {
        console.error(`❌ ${iso3} signal ${row.id}:`, error.message);
      } else {
        console.log(`✅ ${iso3} signal ${row.id}: removed ${dropped} off-country headline(s)`);
      }
    }
  }

  console.log('\nDone. Refresh /country/JAM to verify News Pulse.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
