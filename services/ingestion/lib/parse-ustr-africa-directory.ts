/**
 * Parse USTR Africa directory HTML — country page URLs only (no eligibility inference).
 */

import { slugToIso3 } from './ustr-slug-iso3';

export interface UstrAfricaDirectoryEntry {
  slug: string;
  url: string;
  label: string;
  entityKey: string | null;
}

const LINK_RE =
  /href=["'](?:https?:\/\/(?:www\.)?ustr\.gov)?\/countries-regions\/africa\/([a-z0-9-]+)\/?["'][^>]*>([^<]+)</gi;

export function parseUstrAfricaDirectoryHtml(html: string): UstrAfricaDirectoryEntry[] {
  const seen = new Set<string>();
  const entries: UstrAfricaDirectoryEntry[] = [];

  let match: RegExpExecArray | null;
  while ((match = LINK_RE.exec(html)) !== null) {
    const slug = match[1].toLowerCase();
    if (slug === 'africa' || seen.has(slug)) continue;
    seen.add(slug);

    const label = match[2].replace(/\s+/g, ' ').trim();
    const url = `https://ustr.gov/countries-regions/africa/${slug}`;
    const entityKey = slugToIso3(slug, label);

    entries.push({ slug, url, label, entityKey });
  }

  return entries;
}
