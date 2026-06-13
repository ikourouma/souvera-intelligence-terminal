/**
 * Parse country profile markdown narratives into structured PDF blocks.
 */

import { markdownToHtml, sanitizeHtml } from '@/lib/intelligence/markdown';

export interface ParsedPillar {
  title: string;
  subtitle?: string;
  narrative: string;
  bullets: string[];
}

export interface ParsedOpportunity {
  lead: string;
  pillars: ParsedPillar[];
  entryPoints: Array<{ title: string; body: string }>;
  regionalAdvantages: string[];
}

export interface ParsedRiskItem {
  title: string;
  severity?: string;
  body: string;
  mitigants: string[];
}

export interface ParsedRiskCategory {
  title: string;
  items: ParsedRiskItem[];
}

export interface ParsedRisk {
  lead: string;
  categories: ParsedRiskCategory[];
  closingSummary: string;
}

/** PDF-safe markdown HTML (no Tailwind color classes). */
export function markdownToReportHtml(md: string): string {
  if (!md) return '';
  const html = markdownToHtml(md);
  return sanitizeHtml(
    html
      .replace(/\sclass="[^"]*"/g, '')
      .replace(/<p>/g, '<p class="pillar-narrative">')
      .replace(/<ul>/g, '<ul class="bullet-list">')
      .replace(/<strong>/g, '<strong>')
  );
}

function normalizeBlockMarkers(md: string): string {
  return md
    .replace(/\s\*\*PILLAR\s+(\d+):/gi, '\n\n**PILLAR $1:')
    .replace(/\s\*\*Investment Entry Points:\*\*/gi, '\n\n**Investment Entry Points:**')
    .replace(/\s\*\*Regional Advantages:\*\*/gi, '\n\n**Regional Advantages:**')
    .replace(/\s\*\*(MACRO|POLITICAL|OPERATIONAL|SECTOR-SPECIFIC)\s+RISKS\*\*/gi, '\n\n**$1 RISKS**')
    .replace(/\s\*\*MITIGATION SUMMARY\*\*/gi, '\n\n**MITIGATION SUMMARY**');
}

function splitInlineBullets(text: string): { narrative: string; bullets: string[] } {
  const trimmed = text.trim();
  if (!trimmed) return { narrative: '', bullets: [] };

  const marker = trimmed.search(/\s-\s+[A-Za-z]/);
  if (marker === -1) {
    return { narrative: trimmed, bullets: [] };
  }

  const narrative = trimmed.slice(0, marker).trim();
  const bulletText = trimmed.slice(marker);
  const bullets = bulletText
    .split(/\s-\s+/)
    .map((b) => b.trim())
    .filter(Boolean);
  return { narrative, bullets };
}

function parseTitleBodyBullet(line: string): { title: string; body: string } {
  const colon = line.indexOf(':');
  if (colon === -1) return { title: line.trim(), body: '' };
  return {
    title: line.slice(0, colon).trim(),
    body: line.slice(colon + 1).trim(),
  };
}

export function parseOpportunityThesis(md: string | undefined): ParsedOpportunity | null {
  if (!md?.trim()) return null;

  const normalized = normalizeBlockMarkers(md);
  const blocks = normalized.split(/\n(?=\*\*)/);

  let lead = '';
  const pillars: ParsedPillar[] = [];
  const entryPoints: Array<{ title: string; body: string }> = [];
  const regionalAdvantages: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
    if (!headingMatch) {
      if (!lead) lead = trimmed;
      else lead = `${lead} ${trimmed}`;
      continue;
    }

    const heading = headingMatch[1].trim();
    const body = headingMatch[2].trim();

    if (/^PILLAR\s+\d+:/i.test(heading)) {
      const title = heading.replace(/^PILLAR\s+\d+:\s*/i, '').trim();
      const { narrative, bullets } = splitInlineBullets(body);
      pillars.push({ title, narrative, bullets });
    } else if (/Investment Entry Points/i.test(heading)) {
      const { bullets } = splitInlineBullets(body.startsWith('-') ? body : `- ${body.replace(/^:\s*/, '')}`);
      for (const b of bullets) {
        entryPoints.push(parseTitleBodyBullet(b));
      }
    } else if (/Regional Advantages/i.test(heading)) {
      const { bullets } = splitInlineBullets(body.startsWith('-') ? body : `- ${body.replace(/^:\s*/, '')}`);
      regionalAdvantages.push(...bullets);
    } else if (!lead) {
      lead = `${heading}${body ? `: ${body}` : ''}`.trim();
    }
  }

  if (!lead && pillars.length === 0 && entryPoints.length === 0) return null;

  return { lead, pillars, entryPoints, regionalAdvantages };
}

function parseRiskItemChunk(titlePart: string, content: string): ParsedRiskItem {
  const tsMatch = titlePart.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  const title = tsMatch ? tsMatch[1].trim() : titlePart.replace(/:$/, '').trim();
  const severity = tsMatch ? tsMatch[2].trim() : undefined;

  const mitigantSplit = content.split(
    /(?:Mitigation:|Mitigating factors:|Currency risk is mitigated through:|Risks are real but manageable through:)/i
  );
  const mainRaw = mitigantSplit[0]?.trim() ?? '';
  const mitigantRaw = mitigantSplit.slice(1).join(' ').trim();

  const { narrative, bullets } = splitInlineBullets(mainRaw);
  const mitigants = mitigantRaw ? splitInlineBullets(mitigantRaw).bullets : bullets.length ? [] : [];

  let body = narrative;
  if (!body && bullets.length) {
    body = bullets.join('. ');
  }

  const itemMitigants =
    mitigants.length > 0
      ? mitigants
      : mitigantRaw
        ? splitInlineBullets(mitigantRaw).bullets
        : [];

  return { title, severity, body, mitigants: itemMitigants };
}

function parseRiskCategoryItems(body: string): ParsedRiskItem[] {
  const items: ParsedRiskItem[] = [];
  const chunks = body.split(/\*([^*]+?):\*/);

  if (chunks.length <= 1) {
    const { narrative, bullets } = splitInlineBullets(body);
    if (narrative || bullets.length) {
      items.push({ title: 'Overview', body: narrative || bullets.join('. '), mitigants: [] });
    }
    return items;
  }

  for (let i = 1; i < chunks.length; i += 2) {
    const titlePart = chunks[i]?.trim() ?? '';
    const content = chunks[i + 1]?.trim() ?? '';
    if (!titlePart) continue;
    items.push(parseRiskItemChunk(titlePart, content));
  }

  return items;
}

export function parseRiskNarrative(md: string | undefined): ParsedRisk | null {
  if (!md?.trim()) return null;

  const normalized = normalizeBlockMarkers(md);
  const blocks = normalized.split(/\n(?=\*\*)/);

  let lead = '';
  const categories: ParsedRiskCategory[] = [];
  let closingSummary = '';

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
    if (!headingMatch) {
      if (!lead) lead = trimmed;
      continue;
    }

    const heading = headingMatch[1].trim();
    const body = headingMatch[2].trim();

    if (/RISKS$/i.test(heading)) {
      categories.push({ title: heading, items: parseRiskCategoryItems(body) });
    } else if (/MITIGATION SUMMARY/i.test(heading)) {
      const { narrative, bullets } = splitInlineBullets(body);
      closingSummary = [narrative, ...bullets].filter(Boolean).join(' ');
    } else if (!lead) {
      lead = body ? `${heading}: ${body}` : heading;
    }
  }

  if (!lead && categories.length === 0) return null;

  return { lead, categories, closingSummary };
}

export function mergeOpportunityPillars(
  parsed: ParsedPillar[] | undefined,
  structured: Array<{ title: string; subtitle: string; narrative: string; bullets: string[] }>
): ParsedPillar[] {
  if (parsed?.length) {
    return parsed.map((p, i) => ({
      ...p,
      subtitle: structured[i]?.subtitle,
      bullets: p.bullets.length ? p.bullets : structured[i]?.bullets ?? [],
      narrative: p.narrative || structured[i]?.narrative || '',
    }));
  }
  return structured.map((s) => ({
    title: s.title,
    subtitle: s.subtitle,
    narrative: s.narrative,
    bullets: s.bullets,
  }));
}

export function mergeRiskCategories(
  parsed: ParsedRiskCategory[] | undefined,
  structured: Array<{
    title: string;
    items: Array<{ title: string; severity: string; body: string; mitigants?: string[] }>;
  }>
): ParsedRiskCategory[] {
  if (parsed?.length) {
    return parsed.map((cat) => {
      const structCat = structured.find(
        (c) =>
          c.title.toLowerCase().includes(cat.title.split(' ')[0].toLowerCase()) ||
          cat.title.toLowerCase().includes(c.title.split(' ')[0].toLowerCase())
      );
      return {
        title: cat.title,
        items: cat.items.map((item) => {
          const structItem = structCat?.items.find(
            (s) =>
              s.title.toLowerCase() === item.title.toLowerCase() ||
              item.title.toLowerCase().includes(s.title.toLowerCase().slice(0, 8))
          );
          return {
            title: item.title,
            severity: item.severity ?? structItem?.severity,
            body: item.body || structItem?.body || '',
            mitigants:
              item.mitigants.length > 0 ? item.mitigants : structItem?.mitigants ?? [],
          };
        }),
      };
    });
  }

  return structured.map((c) => ({
    title: c.title,
    items: c.items.map((i) => ({
      title: i.title,
      severity: i.severity,
      body: i.body,
      mitigants: i.mitigants ?? [],
    })),
  }));
}
