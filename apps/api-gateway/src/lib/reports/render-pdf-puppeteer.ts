/**
 * HTML → PDF via Puppeteer (R1). Falls back when Chromium is unavailable.
 */

const PDF_OPTIONS_LETTER = {
  format: 'Letter' as const,
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  displayHeaderFooter: false,
};

const PDF_OPTIONS_A4 = {
  format: 'A4' as const,
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  displayHeaderFooter: false,
};

async function launchBrowser() {
  const isServerless =
    process.env.VERCEL === '1' ||
    process.env.AWS_LAMBDA_FUNCTION_NAME != null ||
    process.env.REPORT_PDF_USE_SPARTICUZ === '1';

  if (isServerless) {
    const chromium = await import('@sparticuz/chromium');
    const puppeteer = await import('puppeteer-core');
    const executablePath = await chromium.default.executablePath();
    return puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 1280, height: 720 },
      executablePath,
      headless: true,
    });
  }

  const puppeteer = await import('puppeteer');
  return puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

export async function renderHtmlToPdf(html: string): Promise<Uint8Array> {
  return renderHtmlToPdfWithOptions(html, PDF_OPTIONS_LETTER, { width: 816, height: 1056 });
}

/** A4 institutional reports — margins controlled via @page in HTML/CSS. */
export async function renderHtmlToPdfA4(html: string): Promise<Uint8Array> {
  return renderHtmlToPdfWithOptions(html, PDF_OPTIONS_A4, { width: 794, height: 1123 });
}

export interface ReportHeaderFooterMeta {
  countryName: string;
  iso3: string;
}

/** Full v2 report with Puppeteer page numbers and confidentiality footer. */
export async function renderHtmlToPdfA4WithHeaderFooter(
  html: string,
  meta: ReportHeaderFooterMeta
): Promise<Uint8Array> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60_000 });

    const headerTemplate = `<div style="font-size:8px;width:100%;padding:0 14mm;color:#6b7280;font-family:Inter,sans-serif;">
      <span>SOUVERA INTELLIGENCE TERMINAL</span>
    </div>`;

    const footerTemplate = `<div style="font-size:8px;width:100%;padding:0 14mm;color:#6b7280;font-family:Inter,sans-serif;display:flex;justify-content:space-between;">
      <span>Confidential — Licensed subscriber use only · ${meta.countryName} (${meta.iso3}) Country Report</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`;

    const pdf = await page.pdf({
      ...PDF_OPTIONS_A4,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: { top: '18mm', right: '0', bottom: '22mm', left: '0' },
    });
    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}

async function renderHtmlToPdfWithOptions(
  html: string,
  pdfOptions: typeof PDF_OPTIONS_LETTER | typeof PDF_OPTIONS_A4,
  viewport: { width: number; height: number }
): Promise<Uint8Array> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60_000 });
    const pdf = await page.pdf(pdfOptions);
    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}

export function isPuppeteerEnabled(): boolean {
  return process.env.REPORT_PDF_DISABLE_PUPPETEER !== '1';
}
