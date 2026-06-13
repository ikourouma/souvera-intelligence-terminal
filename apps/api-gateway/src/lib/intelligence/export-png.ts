/**
 * PNG export via modern-screenshot (foreignObject rasterization).
 * Avoids html2canvas oklab/oklch parse errors from Tailwind v4.
 */

import { domToPng } from 'modern-screenshot';
import {
  DEFAULT_EXPORT_SOURCES,
  EXPORT_BRAND,
  iso2ToFlagEmoji,
} from '@/lib/intelligence/export-branding';

export interface ExportContext {
  countryName?: string;
  flagUrl?: string;
  iso2?: string;
  cardTitle?: string;
  sourceAttribution?: string;
  /** Metric freshness line shown in footer */
  dataAsOf?: string;
  /** Short disclaimer for intelligence exports */
  disclaimer?: string;
}

interface ExportOptions extends ExportContext {
  elementId: string;
  fileName: string;
}

interface ExportElementOptions extends ExportContext {
  element: HTMLElement;
  fileName: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripExportExcluded(root: HTMLElement): void {
  root.querySelectorAll('[data-export-exclude]').forEach((el) => el.remove());
}

function buildCountryBadge(ctx: ExportContext): string {
  const name = escapeHtml(ctx.countryName ?? 'Intelligence');
  const date = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const flagEmoji = iso2ToFlagEmoji(ctx.iso2);
  const flagImg = ctx.flagUrl
    ? `<img src="${escapeHtml(ctx.flagUrl)}" alt="" width="28" height="20" style="border-radius:2px;object-fit:cover;border:1px solid #52525b;" />`
    : flagEmoji
      ? `<span style="font-size:22px;line-height:1;">${flagEmoji}</span>`
      : '';

  return `
    <div style="display:flex;align-items:center;gap:10px;">
      ${flagImg}
      <div style="text-align:right;">
        <div style="color:#fff;font-weight:700;font-size:15px;line-height:1.2;">${name}</div>
        <div style="color:#a1a1aa;font-size:11px;margin-top:2px;">${date}</div>
      </div>
    </div>
  `;
}

function buildExportRoot(element: HTMLElement, ctx: ExportContext): HTMLDivElement {
  const root = document.createElement('div');
  root.style.cssText = `background:#18181b;width:${Math.max(element.offsetWidth, 320)}px;font-family:system-ui,sans-serif;position:relative;`;

  const header = document.createElement('div');
  header.style.cssText =
    'padding:14px 16px;border-bottom:1px solid #3f3f46;display:flex;justify-content:space-between;align-items:center;background:#18181b;';
  header.innerHTML = `
    <div>
      <div style="color:#60a5fa;font-weight:800;font-size:13px;letter-spacing:0.08em;">SOUVERA</div>
      ${ctx.cardTitle ? `<div style="color:#d4d4d8;font-size:11px;margin-top:2px;">${escapeHtml(ctx.cardTitle)}</div>` : ''}
    </div>
    ${buildCountryBadge(ctx)}
  `;

  const bodyWrap = document.createElement('div');
  bodyWrap.style.cssText = 'position:relative;overflow:hidden;';

  const body = element.cloneNode(true) as HTMLElement;
  body.style.margin = '0';
  stripExportExcluded(body);

  bodyWrap.appendChild(body);

  const sources = escapeHtml(ctx.sourceAttribution ?? DEFAULT_EXPORT_SOURCES);
  const dataAsOf = ctx.dataAsOf
    ? `<div style="color:#71717a;font-size:9px;margin-bottom:4px;">Data as of ${escapeHtml(ctx.dataAsOf)}</div>`
    : '';
  const disclaimer = ctx.disclaimer
    ? `<div style="color:#52525b;font-size:8px;margin-top:4px;line-height:1.3;">${escapeHtml(ctx.disclaimer)}</div>`
    : '';
  const year = new Date().getFullYear();

  const footer = document.createElement('div');
  footer.style.cssText =
    'padding:10px 16px;border-top:1px solid #3f3f46;background:#18181b;';
  footer.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;color:#a1a1aa;font-size:10px;margin-bottom:4px;">
      <span style="color:#60a5fa;font-weight:600;">${EXPORT_BRAND.domain}</span>
      <span>${EXPORT_BRAND.email}</span>
    </div>
    ${dataAsOf}
    <div style="color:#71717a;font-size:9px;line-height:1.4;">
      ${EXPORT_BRAND.copyright.replace('©', `© ${year}`)} · Source: ${sources}
    </div>
    ${disclaimer}
  `;

  root.appendChild(header);
  root.appendChild(bodyWrap);
  root.appendChild(footer);
  return root;
}

export async function exportElementToPNG({
  element,
  fileName,
  ...ctx
}: ExportElementOptions): Promise<void> {
  const mount = document.createElement('div');
  mount.setAttribute('aria-hidden', 'true');
  mount.style.cssText = 'position:fixed;left:-99999px;top:0;pointer-events:none;opacity:0;';

  const exportRoot = buildExportRoot(element, ctx);
  mount.appendChild(exportRoot);
  document.body.appendChild(mount);

  try {
    const dataUrl = await domToPng(exportRoot, {
      scale: 2,
      backgroundColor: '#18181b',
    });

    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('PNG export failed:', error);
    alert('Export failed. Please try again.');
  } finally {
    document.body.removeChild(mount);
  }
}

export async function exportCardToPNG({ elementId, fileName, ...ctx }: ExportOptions): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;
  return exportElementToPNG({ element, fileName, ...ctx });
}
