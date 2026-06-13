import { worldBankCountryIndicatorApiUrl } from '../src/lib/indicators/top20';

const MARKETS = [
  ['SEN', 'SN'],
  ['CIV', 'CI'],
  ['TZA', 'TZ'],
  ['BRB', 'BB'],
] as const;

async function main() {
  for (const [iso3, iso2] of MARKETS) {
    const url = worldBankCountryIndicatorApiUrl(iso2, 'FI.RES.TOTL.CD', '2000:2025');
    const res = await fetch(url);
    const data = (await res.json()) as [{}, Array<{ date: string; value: number | null }> | null];
    const rows = (data[1] ?? []).filter((r) => r.value != null);
    console.log(`${iso3}: ${rows.length} values; recent: ${rows.slice(-5).map((r) => `${r.date}=${r.value}`).join(', ')}`);
  }
}

main();
