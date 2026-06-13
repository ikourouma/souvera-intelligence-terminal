import { matchIso3InBlob } from '../lib/country-name-iso3';
import { parseCaricomPages } from '../lib/parse-caricom-membership';

const MEMBERS = 'https://caricom.org/member-states-and-associate-members/';

async function main() {
  const res = await fetch(MEMBERS, { headers: { 'User-Agent': 'SouveraVerification/1.0' } });
  const html = await res.text();
  const mentions = matchIso3InBlob(html, 'caribbean');
  const parsed = parseCaricomPages({ membersHtml: html, associatesHtml: html, membersHttpOk: res.ok, associatesHttpOk: res.ok });
  console.log('status', res.status, 'len', html.length);
  console.log('mentions', [...mentions].sort().join(', '));
  console.log('count', mentions.size, 'membersPageOk', parsed.membersPageOk);
}

main();
