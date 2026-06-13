import { USTR_AGOA_LIST_2024_DISCOVERED } from '../config/verification-sources';
import { extractPdfText } from '../lib/extract-pdf-text';
import { parseAgoaPdfText } from '../lib/parse-agoa-pdf-text';

async function main() {
  const res = await fetch(USTR_AGOA_LIST_2024_DISCOVERED, {
    headers: { 'User-Agent': 'SouveraVerification/1.0' },
  });
  const buf = Buffer.from(await res.arrayBuffer());
  console.log('status', res.status, 'bytes', buf.length);
  const text = await extractPdfText(buf);
  console.log('text len', text.length);
  console.log('sample', text.slice(0, 400));
  const parsed = parseAgoaPdfText(text);
  console.log('eligible', parsed.eligible.size, [...parsed.eligible].slice(0, 5));
  console.log('ineligible', parsed.ineligible.size, [...parsed.ineligible]);
  console.log('NGA eligible?', parsed.eligible.has('NGA'));
  console.log('NGA ineligible?', parsed.ineligible.has('NGA'));
  console.log('parseOk', parsed.parseOk);
}

main();
