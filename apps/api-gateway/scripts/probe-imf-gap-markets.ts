import { fetchImfDataMapperSeries } from '../../../services/ingestion/imf-datamapper-client';

const MARKETS = ['SEN', 'CIV', 'BRB'] as const;
const IDS = ['BRASS_MI', 'Reserves_M', 'Reserves_ARA', 'BM_GDP', 'NGDPD', 'BCA_NGDPD'] as const;

async function main() {
  for (const iso of MARKETS) {
    console.log(`\n${iso}:`);
    for (const id of IDS) {
      const s = await fetchImfDataMapperSeries(id, iso, 2000, 2025);
      if (s.length) console.log(`  ${id}: ${s.map((r) => `${r.year}=${r.value}`).join(', ')}`);
    }
  }
}

main();
