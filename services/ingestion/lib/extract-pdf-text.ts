/**
 * Extract searchable text from PDF buffers for verification parsers.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (b: Buffer) => Promise<{ text: string }>;

export async function extractPdfText(buf: Buffer): Promise<string> {
  try {
    const parsed = await pdfParse(buf);
    return parsed.text ?? '';
  } catch {
    return '';
  }
}
