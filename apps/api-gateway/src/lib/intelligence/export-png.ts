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
import { fetchCardAnalysisViaApi, type CardAnalysisInput } from '@/lib/intelligence/generate-card-analysis';

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
  /** AI analysis config for intelligent exports */
  aiAnalysisConfig?: CardAnalysisInput;
  /** Pre-built curated analysis (preferred over AI when provided) */
  curatedAnalysis?: string;
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
  root.querySelectorAll('[data-export-hide-analysis]').forEach((el) => el.remove());
}

/** Apply a solid background to a node if it is an exportable card and has none inline. */
function applyCardBackground(node: HTMLElement): void {
  if (node.classList.contains('exportable-card') && !node.style.backgroundColor) {
    node.style.backgroundColor = '#27272a';
  }
  if (node.classList.contains('exportable-card')) {
    node.style.borderColor = '#3f3f46';
  }
}

/** Ensure a node has a visible text color when Tailwind classes don't cascade into foreignObject. */
function applyTextColor(node: HTMLElement): void {
  if (!node.style.color) {
    const tag = node.tagName.toLowerCase();
    if (tag === 'h3') node.style.color = '#60a5fa';
    else if (node.classList.contains('text-zinc-500') || node.classList.contains('text-zinc-600')) {
      node.style.color = '#71717a';
    } else {
      node.style.color = '#d4d4d8';
    }
  }
}

/** Force visible state on cloned nodes before rasterization (animations start at opacity:0). */
function prepareCloneForCapture(root: HTMLElement): void {
  // The root node itself must be explicitly visible — modern-screenshot inlines
  // computed styles, and an inherited visibility:hidden from the off-screen mount
  // would otherwise produce a blank (near-black) capture.
  root.style.visibility = 'visible';
  root.style.opacity = '1';
  applyCardBackground(root);

  root.querySelectorAll('.animate-fade-in-up, [class*="animate-in"]').forEach((el) => {
    const node = el as HTMLElement;
    node.style.opacity = '1';
    node.style.transform = 'none';
    node.style.animation = 'none';
    node.style.animationDelay = '0s';
  });

  // Solid backgrounds on exportable cards (semi-transparent Tailwind can fail in foreignObject)
  root.querySelectorAll('.exportable-card').forEach((el) => applyCardBackground(el as HTMLElement));

  // Expand collapsible content for export
  root.querySelectorAll('[data-export-expand]').forEach((el) => {
    const node = el as HTMLElement;
    node.style.maxHeight = 'none';
    node.style.opacity = '1';
    node.style.overflow = 'visible';
  });

  // Ensure text is visible when Tailwind classes don't cascade into foreignObject.
  // Include `div` and `a` so values rendered in divs (e.g. FX rate, metric grids) survive.
  if (['H3', 'P', 'SPAN', 'LI', 'TD', 'TH', 'DIV', 'A'].includes(root.tagName)) {
    applyTextColor(root);
    root.style.visibility = 'visible';
  }
  root.querySelectorAll('h3, p, span, li, td, th, div, a').forEach((el) => {
    const node = el as HTMLElement;
    applyTextColor(node);
    node.style.opacity = '1';
    node.style.visibility = 'visible';
  });
}

/** 
 * Highlight currency, percentages, and risk/inflation metrics in analysis text for PNG footer.
 * Color schema:
 * - Currency ($27.3M, $1.5B): emerald #6ee7b7
 * - Large currency ($1B+): emerald bold
 * - Percentages (3.5%, 20%): blue #93c5fd
 * - Risk/inflation context: amber #fbbf24
 */
function highlightAnalysisHtml(text: string): string {
  const escaped = escapeHtml(text.trim());
  return escaped
    .replace(
      /(inflation|risk|debt|volatility|deficit)[:\s]+(\$?[\d,.]+[BMK%]*)/gi,
      '<span style="color:#fbbf24;font-weight:600;">$1: $2</span>'
    )
    .replace(/(\$[\d,.]+B(?:\/yr)?)/g, '<span style="color:#6ee7b7;font-weight:700;">$1</span>')
    .replace(/(\$[\d,.]+[MK]?(?:\/yr)?)/g, '<span style="color:#6ee7b7;font-weight:600;">$1</span>')
    .replace(/(\d+\.?\d*%)/g, '<span style="color:#93c5fd;font-weight:600;">$1</span>');
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

function buildExportRoot(element: HTMLElement, ctx: ExportContext, aiAnalysis?: string): HTMLDivElement {
  const root = document.createElement('div');
  root.style.cssText = `background:#18181b;width:${Math.max(element.offsetWidth, 320)}px;font-family:system-ui,sans-serif;position:relative;visibility:visible;opacity:1;`;

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
  prepareCloneForCapture(body);

  if (body.scrollHeight === 0) {
    console.warn('[export-png] Cloned body has zero height — PNG may be blank:', ctx.cardTitle);
  }

  bodyWrap.appendChild(body);

  // AI Analysis section (if provided)
  if (aiAnalysis) {
    const analysisSection = document.createElement('div');
    analysisSection.style.cssText = 'padding:12px 16px;background:#09090b;border-top:1px solid #27272a;';
    analysisSection.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span style="color:#60a5fa;font-weight:700;font-size:10px;letter-spacing:0.05em;">SOUVERA ANALYSIS</span>
      </div>
      <div style="color:#d4d4d8;font-size:11px;line-height:1.5;display:flex;flex-direction:column;gap:8px;">
        ${aiAnalysis
          .split(/\n\n+/)
          .map((para) => `<p style="margin:0;">${highlightAnalysisHtml(para)}</p>`)
          .join('')}
      </div>
    `;
    bodyWrap.appendChild(analysisSection);
  }

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
  // Keep the mount off-screen but renderable. `visibility:hidden` here would be
  // inlined by modern-screenshot onto the clone and produce a blank capture.
  mount.style.cssText = 'position:fixed;left:-99999px;top:0;pointer-events:none;';

  // Generate AI analysis if config provided (curated analysis takes precedence)
  let aiAnalysis: string | undefined = ctx.curatedAnalysis;
  if (!aiAnalysis && ctx.aiAnalysisConfig) {
    try {
      const result = await fetchCardAnalysisViaApi(ctx.aiAnalysisConfig);
      aiAnalysis = result.analysis;
    } catch (error) {
      console.error('[export-png] AI analysis failed:', error);
    }
  }

  const exportRoot = buildExportRoot(element, ctx, aiAnalysis);
  mount.appendChild(exportRoot);
  document.body.appendChild(mount);

  try {
    // Ensure web fonts are loaded so text rasterizes (blank text otherwise).
    if (document.fonts?.ready) {
      try { await document.fonts.ready; } catch { /* non-fatal */ }
    }

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
