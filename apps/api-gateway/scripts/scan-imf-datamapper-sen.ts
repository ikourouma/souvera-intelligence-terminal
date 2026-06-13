const BASE = 'https://www.imf.org/external/datamapper/api/v1';

async function main() {
  const indRes = await fetch(`${BASE}/indicators`);
  const indJson = await indRes.json();
  const indicators = indJson?.indicators ?? indJson?.values ?? indJson;

  for (const [id, meta] of Object.entries(indicators ?? {}) as Array<[string, { label?: string }]>) {
    const url = `${BASE}/${id}/SEN?periods=2022,2023,2024`;
    const res = await fetch(url, { headers: { 'User-Agent': 'SouveraProbe/1.0' } });
    if (!res.ok) continue;
    const json = await res.json();
    const values = json?.values?.[id]?.SEN;
    if (!values) continue;
    const recent = Object.entries(values).filter(([, v]) => v != null && v !== '');
    if (!recent.length) continue;
    const label = meta?.label ?? '';
    if (/reserve|import|remit|account|debt|fiscal|gdp|export|import/i.test(`${id} ${label}`)) {
      console.log(`${id} | ${label} | ${recent.map(([y, v]) => `${y}=${v}`).join(', ')}`);
    }
    await new Promise((r) => setTimeout(r, 40));
  }
}

main().catch(console.error);
