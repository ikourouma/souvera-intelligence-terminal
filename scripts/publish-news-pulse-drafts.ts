/**
 * Publish all draft News Pulse signals (NGA + JAM pilot).
 * Run: npx tsx scripts/publish-news-pulse-drafts.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log('🚀 Publishing draft News Pulse signals...\n');

  const { data, error } = await supabase
    .from('souvera_country_news_signals')
    .update({
      status: 'published',
      reviewed_at: new Date().toISOString(),
    })
    .eq('status', 'draft')
    .select('id, country_id, signal_date');

  if (error?.message?.includes('status')) {
    console.log('ℹ️  status column not migrated — rows are already visible without publish step.');
    return;
  }

  if (error) {
    console.error('❌', error.message);
    process.exit(1);
  }

  console.log(`✅ Published ${data?.length ?? 0} draft signal(s).`);
  console.log('   Refresh /country/NGA and /country/JAM to see News Pulse.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
