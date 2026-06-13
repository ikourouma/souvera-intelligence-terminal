/**
 * Probe IMF SDMX 3.0 for reserves / remittances codes.
 */
const BASES = [
  ['WEO', 'https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO/~', 'A'],
  ['IFS', 'https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.STA/IFS/~', 'M'],
] as const;

const MARKETS = ['BRB', 'SEN', 'CIV', 'TZA'] as const;

const CODES = [
  'RAXG_USD', 'RA_USD', 'RA_XDC', 'RAXG_XDC', 'GIR_USD', 'RES_USD', 'RESN_USD',
  'ENDA_USD', 'ENDA_XDC', 'ENDA_XDC_USD', 'TOTRES', 'TOT_RES',
  'BREM', 'BREMP', 'BREMF', 'BREMG', 'BREMX',
  'BX_BP6_USD', 'BCAXGS_BP6_USD', 'BCAIXGS_BP6_USD',
  'NGDPD', 'BCA_NGDPD',
] as const;

async function probe(flow: string, base: string, freq: string, iso3: string, code: string) {
  const url = `${base}/${iso3}.${code}.${freq}?startPeriod=2018&endPeriod=2025&format=jsondata`;
  const res = await fetch(url, { headers: { 'User-Agent': 'SouveraProbe/1.0', Accept: 'application/json' } });
  if (!res.ok) return null;
  const json = await res.json();
  const series = json?.data?.dataSets?.[0]?.series;
  const keys = series ? Object.keys(series) : [];
  if (!keys.length) return null;
  const obs = series[keys[0]].observations ?? {};
  const obsKeys = Object.keys(obs);
  if (!obsKeys.length) return null;
  const lastKey = obsKeys[obsKeys.length - 1];
  return `${flow}/${code}: obs=${obsKeys.length} last=${obs[lastKey][0]}`;
}

async function main() {
  for (const iso3 of MARKETS) {
    console.log(`\n=== ${iso3} ===`);
    for (const [flow, base, freq] of BASES) {
      for (const code of CODES) {
        const hit = await probe(flow, base, freq, iso3, code);
        if (hit) console.log(`  ${hit}`);
        await new Promise((r) => setTimeout(r, 60));
      }
    }
  }
}

main().catch(console.error);
