/**
 * HTML → PDF via Puppeteer (R1). Falls back when Chromium is unavailable.
 *
 * Windows: Puppeteer’s default temp Chrome profile can hit EBUSY on close when
 * antivirus or a lingering Chromium process locks SQLite journal files. We use
 * an explicit userDataDir and retried close/cleanup to avoid that.
 */

import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { Browser, PDFOptions } from 'puppeteer';

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

const CHROMIUM_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isEBUSY(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const code = (err as NodeJS.ErrnoException).code;
  const message = (err as Error).message ?? '';
  return code === 'EBUSY' || /EBUSY|resource busy or locked/i.test(message);
}

async function createUserDataDir(): Promise<string> {
  const base = process.env.REPORT_PDF_USER_DATA_DIR?.trim();
  if (base) {
    return mkdtemp(join(base, 'run-'));
  }
  return mkdtemp(join(tmpdir(), 'souvera-pdf-'));
}

async function removeUserDataDir(userDataDir: string): Promise<void> {
  try {
    await rm(userDataDir, {
      recursive: true,
      force: true,
      maxRetries: 8,
      retryDelay: 250,
    });
  } catch (err) {
    if (!isEBUSY(err)) {
      console.warn('[render-pdf-puppeteer] profile cleanup skipped:', (err as Error).message);
    }
  }
}

async function closeBrowserSafely(browser: Browser, userDataDir: string): Promise<void> {
  try {
    const pages = await browser.pages();
    await Promise.all(pages.map((p) => p.close().catch(() => {})));
  } catch {
    /* ignore page close errors */
  }

  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      await browser.close();
      break;
    } catch (err) {
      if (!isEBUSY(err) || attempt >= 5) {
        console.warn('[render-pdf-puppeteer] browser.close:', (err as Error).message);
        break;
      }
      await delay(200 * (attempt + 1));
    }
  }

  await delay(100);
  await removeUserDataDir(userDataDir);
}

async function launchBrowser(): Promise<{ browser: Browser; userDataDir: string }> {
  const isServerless =
    process.env.VERCEL === '1' ||
    process.env.AWS_LAMBDA_FUNCTION_NAME != null ||
    process.env.REPORT_PDF_USE_SPARTICUZ === '1';

  const userDataDir = await createUserDataDir();

  if (isServerless) {
    const chromium = await import('@sparticuz/chromium');
    const puppeteer = await import('puppeteer-core');
    const executablePath = await chromium.default.executablePath();
    const browser = await puppeteer.default.launch({
      args: [...chromium.default.args, ...CHROMIUM_ARGS],
      defaultViewport: { width: 1280, height: 720 },
      executablePath,
      headless: true,
      userDataDir,
      timeout: 90_000,
      protocolTimeout: 120_000,
    });
    return { browser, userDataDir };
  }

  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    userDataDir,
    args: CHROMIUM_ARGS,
    timeout: 90_000,
    protocolTimeout: 120_000,
  });
  return { browser, userDataDir };
}

type PdfRenderExtras = {
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  margin?: PDFOptions['margin'];
};

async function renderHtmlToPdfOnce(
  html: string,
  pdfOptions: typeof PDF_OPTIONS_LETTER | typeof PDF_OPTIONS_A4,
  viewport: { width: number; height: number },
  extras?: PdfRenderExtras
): Promise<Uint8Array> {
  const { browser, userDataDir } = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60_000 });
    const pdf = await page.pdf({
      ...pdfOptions,
      displayHeaderFooter: extras?.displayHeaderFooter ?? pdfOptions.displayHeaderFooter,
      headerTemplate: extras?.headerTemplate,
      footerTemplate: extras?.footerTemplate,
      margin: extras?.margin ?? pdfOptions.margin,
    });
    return new Uint8Array(pdf);
  } finally {
    await closeBrowserSafely(browser, userDataDir);
  }
}

async function renderWithEBUSYRetry(
  html: string,
  pdfOptions: typeof PDF_OPTIONS_LETTER | typeof PDF_OPTIONS_A4,
  viewport: { width: number; height: number },
  extras?: PdfRenderExtras
): Promise<Uint8Array> {
  try {
    return await renderHtmlToPdfOnce(html, pdfOptions, viewport, extras);
  } catch (err) {
    if (!isEBUSY(err)) throw err;
    console.warn('[render-pdf-puppeteer] EBUSY during render, retrying once…');
    await delay(500);
    return await renderHtmlToPdfOnce(html, pdfOptions, viewport, extras);
  }
}

export async function renderHtmlToPdf(html: string): Promise<Uint8Array> {
  return renderWithEBUSYRetry(html, PDF_OPTIONS_LETTER, { width: 816, height: 1056 });
}

/** A4 institutional reports — margins controlled via @page in HTML/CSS. */
export async function renderHtmlToPdfA4(html: string): Promise<Uint8Array> {
  return renderWithEBUSYRetry(html, PDF_OPTIONS_A4, { width: 794, height: 1123 });
}

export interface ReportHeaderFooterMeta {
  countryName: string;
  iso3: string;
  reportLabel?: string;
}

/** Full v2 report with Puppeteer page numbers and confidentiality footer. */
export async function renderHtmlToPdfA4WithHeaderFooter(
  html: string,
  meta: ReportHeaderFooterMeta
): Promise<Uint8Array> {
  const headerTemplate = `<div style="font-size:8px;width:100%;padding:0 14mm;color:#6b7280;font-family:Inter,sans-serif;">
      <span>SOUVERA INTELLIGENCE TERMINAL</span>
    </div>`;

  const footerTemplate = `<div style="font-size:8px;width:100%;padding:0 14mm;color:#6b7280;font-family:Inter,sans-serif;display:flex;justify-content:space-between;">
      <span>Confidential — Licensed subscriber use only · ${meta.countryName} (${meta.iso3}) ${meta.reportLabel ?? 'Country Report'}</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`;

  return renderWithEBUSYRetry(
    html,
    PDF_OPTIONS_A4,
    { width: 794, height: 1123 },
    {
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: { top: '18mm', right: '14mm', bottom: '24mm', left: '14mm' },
    }
  );
}

export function isPuppeteerEnabled(): boolean {
  return process.env.REPORT_PDF_DISABLE_PUPPETEER !== '1';
}
