/**
 * Debug verification parser inputs (local only).
 * npx tsx services/ingestion/scripts/debug-verify-parsers.ts
 */

import { USTR_AGOA_LIST_ARTIFACTS, USTR_AGOA_PROGRAM_URL, USTR_CBI_PAGE_URL, CARICOM_MEMBERS_URL } from '../config/verification-sources';
import { matchIso3InBlob } from '../lib/country-name-iso3';
import { parseCaricomPages } from '../lib/parse-caricom-membership';

async function main() {
  console.log('--- AGOA PDFs ---');
  for (const a of USTR_AGOA_LIST_ARTIFACTS.slice(0, 3)) {
    const res = await fetch(a.url, { headers: { 'User-Agent': 'SouveraVerification/1.0' } });
    const buf = Buffer.from(await res.arrayBuffer());
    const text = buf.toString('utf8');
    const mentions = matchIso3InBlob(text, 'africa');
    console.log(a.label, 'http', res.status, 'bytes', buf.length, 'mentions', mentions.size);
  }

  console.log('\n--- AGOA program HTML ---');
  const prog = await fetch(USTR_AGOA_PROGRAM_URL, { headers: { 'User-Agent': 'SouveraVerification/1.0' } });
  const progHtml = await prog.text();
  console.log('http', prog.status, 'len', progHtml.length, 'mentions', matchIso3InBlob(progHtml, 'africa').size);

  console.log('\n--- CARICOM members ---');
  const car = await fetch(CARICOM_MEMBERS_URL, { headers: { 'User-Agent': 'SouveraVerification/1.0' } });
  const carHtml = await car.text();
  const parsed = parseCaricomPages({ membersHtml: carHtml, associatesHtml: '', membersHttpOk: car.ok, associatesHttpOk: false });
  console.log('http', car.status, 'len', carHtml.length, 'members', parsed.memberSet.size, 'ok', parsed.membersPageOk);

  console.log('\n--- CBI trade.gov ---');
  const cbi = await fetch(USTR_CBI_PAGE_URL, { headers: { 'User-Agent': 'SouveraVerification/1.0' } });
  const cbiHtml = await cbi.text();
  console.log('http', cbi.status, 'len', cbiHtml.length, 'mentions', matchIso3InBlob(cbiHtml, 'caribbean').size);
}

main().catch(console.error);
