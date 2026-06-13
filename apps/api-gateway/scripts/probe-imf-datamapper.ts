const BASE = 'https://www.imf.org/external/datamapper/api/v1';
const MARKETS = ['SEN', 'CIV', 'TZA', 'BRB'] as const;

async function fetchAll(indicatorId: string, iso3: string) {
  const url = `${BASE}/${indicatorId}/${iso3}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'SouveraProbe/1.0' } });
  if (!res.ok) return [];
  const json = await res.json();
  const values = json?.values?.[indicatorId]?.[iso3];
  if (!values) return [];
  return Object.entries(values)
    .filter(([, v]) => v != null && v !== '')
    .map(([y, v]) => [Number(y), Number(v)] as const)
    .sort((a, b) => b[0] - a[0]);
}

async function main() {
  const ids = ['BRASS_MI', 'Reserves_M', 'NGDPD', 'BM_GDP', 'BCA_NGDPD', 'BCA'];
  for (const iso of MARKETS) {
    console.log(`\n=== ${iso} ===`);
    for (const id of ids) {
      const series = await fetchAll(id, iso);
      const recent = series.filter(([y]) => y >= 2018 && y <= 2025);
      if (recent.length) {
        console.log(`  ${id}: ${recent.map(([y, v]) => `${y}=${v}`).join(', ')}`);
      }
    }
  }
}

main().catch(console.error);
