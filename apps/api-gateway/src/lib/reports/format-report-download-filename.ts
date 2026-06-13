/**
 * User-facing PDF download filenames (storage paths unchanged).
 */

import type { TemplateId } from './template-ids';

const MAX_SECTOR_TOKEN = 40;
const MAX_FILENAME = 160;

/** Filename token per canonical templateId (not display labels). */
const TEMPLATE_FILENAME_TOKEN: Record<TemplateId, string> = {
  country_profile_template: 'country_profile',
  country_investment_memo_template: 'investment_memo',
  country_trade_profile_template: 'trade_profile',
  sector_deep_dive_template: 'sector_deep_dive',
  ai_custom_report_template: 'custom_report',
};

function slugifyToken(raw: string): string {
  return raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function formatUtcStamp(generatedAtUtc: Date | string): string {
  const d = typeof generatedAtUtc === 'string' ? new Date(generatedAtUtc) : generatedAtUtc;
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${y}${mo}${da}_${h}${mi}${s}Z`;
}

export function normalizeSectorFilenameToken(sectorKey: string): string {
  const token = slugifyToken(sectorKey.replace(/-/g, '_'));
  return token.slice(0, MAX_SECTOR_TOKEN);
}

export interface FormatReportDownloadFilenameInput {
  countryName: string;
  iso3: string;
  templateId: TemplateId;
  sectorKey?: string;
  generatedAtUtc: Date | string;
}

export function formatReportDownloadFilename(input: FormatReportDownloadFilenameInput): string {
  const country = slugifyToken(input.countryName) || 'country';
  const iso = slugifyToken(input.iso3);
  const stamp = formatUtcStamp(input.generatedAtUtc);

  let parts: string[];
  if (input.templateId === 'sector_deep_dive_template') {
    if (!input.sectorKey?.trim()) {
      throw new Error('sectorKey required for sector_deep_dive_template filename');
    }
    parts = [
      country,
      iso,
      'sector_deep_dive',
      normalizeSectorFilenameToken(input.sectorKey),
      stamp,
    ];
  } else {
    const templateToken = TEMPLATE_FILENAME_TOKEN[input.templateId];
    parts = [country, iso, templateToken, stamp];
  }

  let filename = `${parts.join('_')}.pdf`;
  if (filename.length > MAX_FILENAME) {
    filename = `${filename.slice(0, MAX_FILENAME - 4)}.pdf`;
  }
  return filename;
}

/** @deprecated Use TEMPLATE_FILENAME_TOKEN */
export const TEMPLATE_SLUG = TEMPLATE_FILENAME_TOKEN;
