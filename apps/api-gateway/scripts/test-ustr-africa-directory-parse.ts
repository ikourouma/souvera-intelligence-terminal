/**
 * Unit test: USTR Africa directory parser (no network).
 */
import { parseUstrAfricaDirectoryHtml } from '../../../services/ingestion/lib/parse-ustr-africa-directory';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

const sample = `
<ul>
  <li><a href="/countries-regions/africa/nigeria">Nigeria</a></li>
  <li><a href="https://ustr.gov/countries-regions/africa/kenya">Kenya</a></li>
  <li><a href="/countries-regions/africa/cote-d-ivoire">Côte d'Ivoire</a></li>
</ul>
`;

const entries = parseUstrAfricaDirectoryHtml(sample);
assert(entries.length === 3, 'parses three country links');
assert(entries.some((e) => e.entityKey === 'NGA'), 'Nigeria → NGA');
assert(entries.some((e) => e.entityKey === 'KEN'), 'Kenya → KEN');
assert(entries.some((e) => e.entityKey === 'CIV'), "Côte d'Ivoire → CIV");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
