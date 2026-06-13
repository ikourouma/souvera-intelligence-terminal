/**
 * PDF rendering via pdf-lib (server-side, no browser required).
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { EXPORT_BRAND } from '@/lib/intelligence/export-branding';
import { buildReportSections, type ReportTemplateContext } from './templates';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const LINE_HEIGHT = 14;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;

function wrapText(text: string, font: Awaited<ReturnType<PDFDocument['embedFont']>>, size: number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(test, size);
    if (width > MAX_WIDTH && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export async function renderReportPdf(ctx: ReportTemplateContext): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const drawLine = (text: string, size: number, isBold = false) => {
    const font = isBold ? bold : regular;
    const lines = wrapText(text, font, size);
    for (const line of lines) {
      if (y < MARGIN + LINE_HEIGHT) {
        page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }
      page.drawText(line, { x: MARGIN, y, size, font, color: rgb(0.1, 0.1, 0.1) });
      y -= LINE_HEIGHT + (isBold ? 4 : 2);
    }
  };

  // Header chrome
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 36,
    width: PAGE_WIDTH,
    height: 36,
    color: rgb(0.09, 0.09, 0.11),
  });
  page.drawText('SOUVERA', {
    x: MARGIN,
    y: PAGE_HEIGHT - 24,
    size: 12,
    font: bold,
    color: rgb(0.37, 0.65, 0.98),
  });
  page.drawText(`${ctx.countryName} · ${ctx.generatedAt}`, {
    x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(`${ctx.countryName} · ${ctx.generatedAt}`, 9),
    y: PAGE_HEIGHT - 24,
    size: 9,
    font: regular,
    color: rgb(0.63, 0.63, 0.67),
  });
  y = PAGE_HEIGHT - MARGIN - 20;

  drawLine(ctx.reportType, 18, true);
  y -= 8;
  drawLine(`${ctx.countryName} (${ctx.iso3})`, 12, false);
  y -= 16;

  for (const section of buildReportSections(ctx)) {
    drawLine(section.title, 13, true);
    y -= 4;
    drawLine(section.body, 10, false);
    y -= 12;
  }

  // Footer on last page
  page.drawLine({
    start: { x: MARGIN, y: MARGIN + 20 },
    end: { x: PAGE_WIDTH - MARGIN, y: MARGIN + 20 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  page.drawText(EXPORT_BRAND.domain, { x: MARGIN, y: MARGIN + 6, size: 8, font: regular, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(EXPORT_BRAND.email, {
    x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(EXPORT_BRAND.email, 8),
    y: MARGIN + 6,
    size: 8,
    font: regular,
    color: rgb(0.5, 0.5, 0.5),
  });

  return doc.save();
}
