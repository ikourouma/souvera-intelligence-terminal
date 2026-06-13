/**
 * Discover current USTR / CARICOM / trade.gov links from landing pages.
 */
import { USTR_AGOA_PROGRAM_URL, USTR_CBI_PROGRAM_URL, CARICOM_HOME_URL } from '../config/verification-sources';

async function scan(label: string, url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'SouveraVerification/1.0' } });
  const html = await res.text();
  const pdfs = [...html.matchAll(/href="([^"]+\.pdf[^"]*)"/gi)].map((m) => m[1]);
  const agoa = [...html.matchAll(/agoa[^"']*\.pdf/gi)];
  const caricom = [...html.matchAll(/member[^"']*/gi)].slice(0, 5);
  console.log(`\n=== ${label} (${res.status}, ${html.length}) ===`);
  console.log('PDF hrefs:', [...new Set(pdfs)].slice(0, 15));
  console.log('AGOA pdf refs:', agoa.slice(0, 10).map((m) => m[0]));
  const memberLinks = [...html.matchAll(/href="([^"]*member[^"]*)"/gi)].map((m) => m[1]);
  console.log('member links:', [...new Set(memberLinks)].slice(0, 10));
}

async function main() {
  await scan('AGOA program', USTR_AGOA_PROGRAM_URL);
  await scan('CBI program', USTR_CBI_PROGRAM_URL);
  await scan('CARICOM home', CARICOM_HOME_URL);
}

main();
