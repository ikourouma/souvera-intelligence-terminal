import { matchIso3InBlob } from '../lib/country-name-iso3';

const AGOA_2024 =
  'https://ustr.gov/sites/default/files/2024%20List%20of%20AGOA%20Eligible%20and%20Ineligible%20Countries%2011162023.pdf';

async function main() {
  const res = await fetch(AGOA_2024, { headers: { 'User-Agent': 'SouveraVerification/1.0' } });
  const buf = Buffer.from(await res.arrayBuffer());
  console.log('status', res.status, 'bytes', buf.length, 'content-type', res.headers.get('content-type'));

  const utf8 = buf.toString('utf8');
  console.log('utf8 mentions', matchIso3InBlob(utf8, 'africa').size);
  console.log('utf8 sample', utf8.slice(0, 200));

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
    const parsed = await pdfParse(buf);
    console.log('pdf-parse text len', parsed.text.length);
    console.log('pdf-parse mentions', matchIso3InBlob(parsed.text, 'africa').size);
    const nigeria = /nigeria/i.test(parsed.text);
    console.log('mentions Nigeria', nigeria);
    console.log('text sample', parsed.text.slice(0, 500));
  } catch (e) {
    console.log('pdf-parse not available:', (e as Error).message);
  }
}

main();
