import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data } = await sb
    .from('souvera_countries')
    .select('iso3, name, census_code')
    .not('census_code', 'is', null)
    .order('census_code');
  const byCode = new Map<string, string[]>();
  for (const r of data ?? []) {
    const arr = byCode.get(r.census_code!) ?? [];
    arr.push(r.iso3);
    byCode.set(r.census_code!, arr);
  }
  const dups = [...byCode.entries()].filter(([, v]) => v.length > 1);
  console.log('Total with census_code:', data?.length);
  console.log('Duplicate codes:', dups);
  const missing = (await sb.from('souvera_countries').select('iso3').is('census_code', null)).data;
  console.log('Missing census_code:', missing?.map((m) => m.iso3));
}

main();
