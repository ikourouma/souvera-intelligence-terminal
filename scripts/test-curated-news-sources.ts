/**
 * Self-test curated news source URLs before publish.
 * Run: npx tsx scripts/test-curated-news-sources.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { validateSourceUrl } from '../apps/api-gateway/src/lib/curated-news/validate-source-url';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const { data: sources, error } = await supabase
    .from('souvera_curated_news_sources')
    .select('id, source_name, source_url, news_id, souvera_curated_news!inner(status, slug)')
    .eq('souvera_curated_news.status', 'published');

  if (error) {
    console.error('Failed to load sources:', error.message);
    process.exit(1);
  }

  let failed = 0;
  for (const s of sources ?? []) {
    const check = await validateSourceUrl(s.source_url);
    if (!check.valid) {
      failed++;
      console.error(`❌ ${s.source_name}: ${s.source_url} — ${check.reason}`);
    } else {
      console.log(`✅ ${s.source_name}`);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} invalid source(s). Run: npx tsx scripts/seed-curated-news-pilot.ts`);
    process.exit(1);
  }

  console.log(`\n✅ All ${sources?.length ?? 0} curated news sources validated.`);
}

main();
