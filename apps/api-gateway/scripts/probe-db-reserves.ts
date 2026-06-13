import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  for (const iso3 of ['GHA', 'SEN', 'CIV', 'TZA', 'BRB']) {
    const { data: c } = await sb.from('souvera_countries').select('id').eq('iso3', iso3).single();
    const { data: ind } = await sb.from('souvera_indicators').select('id').eq('key', 'reserves_total_usd').single();
    const { data: obs } = await sb
      .from('souvera_country_observations')
      .select('period_date, value_numeric, source_id, souvera_data_sources(key)')
      .eq('country_id', c!.id)
      .eq('indicator_id', ind!.id)
      .gte('period_date', '2020-01-01')
      .order('period_date', { ascending: false })
      .limit(3);
    console.log(
      iso3,
      obs?.map((o) => `${o.period_date.slice(0, 4)}=${o.value_numeric} (${(o.souvera_data_sources as { key: string } | null)?.key})`).join(', ') || 'none'
    );
  }
}

main();
