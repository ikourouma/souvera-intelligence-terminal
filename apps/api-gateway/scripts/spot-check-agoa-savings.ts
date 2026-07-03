/** Quick spot-check for AGOA tariff savings — NGA / ZWE / KEN */
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  for (const iso of ['NGA', 'ZWE', 'KEN']) {
    const { data } = await sb
      .from('souvera_agoa_trade_flows')
      .select('category_group, category_label, agoa_exports_usd, tariff_savings_usd, mfn_tariff_pct, total_exports_to_us_usd')
      .eq('iso3', iso)
      .eq('year', 2023)
      .order('total_exports_to_us_usd', { ascending: false });

    console.log(`\n${iso} (${data?.length ?? 0} rows):`);
    for (const r of data ?? []) {
      console.log(
        `  ${r.category_label ?? r.category_group} | total ${r.total_exports_to_us_usd} | agoa ${r.agoa_exports_usd} | savings ${r.tariff_savings_usd} | mfn ${r.mfn_tariff_pct}%`,
      );
    }
  }
}

main().catch(console.error);
