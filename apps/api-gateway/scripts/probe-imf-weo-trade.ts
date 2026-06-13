/** Probe IMF WEO trade series for rollout gap markets. */
const PAIRS = [
  ['NGA', 'BCAXGS_BP6_USD'],
  ['NGA', 'BCAIXGS_BP6_USD'],
  ['NGA', 'NGDP_RPCH'],
  ['JAM', 'BCAXGS_BP6_USD'],
  ['TTO', 'BCAXGS_BP6_USD'],
  ['BRB', 'BCAXGS_BP6_USD'],
] as const;

async function probe(iso3: string, code: string) {
  const url = `https://dataservices.imf.org/REST/SDMX_JSON.svc/CompactData/WEO/A.${iso3}.${code}?startPeriod=2018&endPeriod=2025`;
  const res = await fetch(url, { headers: { 'User-Agent': 'SouveraProbe/1.0' } });
  const text = await res.text();
  const hasObs = text.includes('@OBS_VALUE');
  console.log(`${iso3} ${code}: HTTP ${res.status} obs=${hasObs}`);
}

async function main() {
  for (const [iso3, code] of PAIRS) await probe(iso3, code);
}
main();
