/**
 * Parse souvera_country_profiles.why_now_md into structured Overview UI blocks.
 */

export interface CountryAnalysisPillar {
  title: string;
  emoji: string;
  body: string;
}

export interface ParsedCountryAnalysis {
  lead: string;
  pillars: CountryAnalysisPillar[];
  callout?: { title: string; body: string };
}

const PILLAR_EMOJI: Record<string, string> = {
  'economic momentum': '💹',
  'policy stability': '🏛️',
  'demographic dividend': '👥',
  'digital infrastructure': '🌐',
  'tourism recovery': '✈️',
  'nearshoring': '💻',
  'tourism & hospitality': '✈️',
  'mining & energy': '⚡',
};

const CALLOUT_TITLES = ['investment window', 'institutional entry', 'strategic window'];

function emojiForTitle(title: string): string {
  const normalized = title
    .replace(/^\d+\.\s*/, '')
    .replace(/:\s*$/, '')
    .trim()
    .toLowerCase();
  return PILLAR_EMOJI[normalized] ?? '📊';
}

function isCalloutTitle(title: string): boolean {
  const t = title.toLowerCase().replace(/:\s*$/, '').trim();
  return CALLOUT_TITLES.some((c) => t.includes(c));
}

function parsePillarLine(line: string): CountryAnalysisPillar | null {
  const bullet = line.match(/^[-*]\s*\*\*(.+?):\*\*\s*(.+)$/);
  if (bullet) {
    const title = bullet[1].replace(/^\d+\.\s*/, '').trim();
    return { title, emoji: emojiForTitle(title), body: bullet[2].trim() };
  }
  return null;
}

function parseHeadingBlock(title: string, body: string): CountryAnalysisPillar | null {
  const cleanTitle = title.replace(/^\d+\.\s*/, '').replace(/:\s*$/, '').trim();
  if (!cleanTitle || isCalloutTitle(cleanTitle)) return null;
  return {
    title: cleanTitle,
    emoji: emojiForTitle(cleanTitle),
    body: body.trim(),
  };
}

/**
 * Supports:
 * - Lead paragraph + `- **Title:** body` bullets + `**Investment Window:** callout`
 * - Legacy `**1. Title:** body` section blocks
 */
export function parseCountryAnalysis(md: string): ParsedCountryAnalysis {
  if (!md?.trim()) {
    return { lead: '', pillars: [] };
  }

  const lines = md.split('\n');
  const leadParts: string[] = [];
  const pillars: CountryAnalysisPillar[] = [];
  let callout: ParsedCountryAnalysis['callout'];
  let pendingCalloutBody: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const pillar = parsePillarLine(line);
    if (pillar) {
      pillars.push(pillar);
      continue;
    }

    const headingInline = line.match(/^\*\*(.+?):\*\*\s*(.+)$/);
    if (headingInline) {
      const title = headingInline[1].trim();
      const body = headingInline[2].trim();
      if (isCalloutTitle(title)) {
        callout = { title: title.replace(/:\s*$/, ''), body };
      } else {
        const p = parseHeadingBlock(title, body);
        if (p) pillars.push(p);
      }
      continue;
    }

    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      pendingCalloutBody = [];
      const title = line.slice(2, -2).trim();
      if (isCalloutTitle(title)) {
        callout = { title: title.replace(/:\s*$/, ''), body: '' };
      }
      continue;
    }

    if (callout && !line.startsWith('-')) {
      callout = { ...callout, body: callout.body ? `${callout.body} ${line}` : line };
      continue;
    }

    if (pillars.length === 0 && !callout) {
      leadParts.push(line);
    }
  }

  // Legacy: split on **Section** blocks if no bullet pillars found
  if (pillars.length === 0) {
    const blocks = md.split(/\n(?=\*\*[^*]+\*\*)/);
    for (const block of blocks) {
      const match = block.match(/^\*\*(.+?)\*\*\s*\n?([\s\S]*)/);
      if (!match) {
        if (block.trim() && !leadParts.length) leadParts.push(block.trim());
        continue;
      }
      const title = match[1].trim();
      const body = match[2].trim();
      if (isCalloutTitle(title)) {
        callout = { title: title.replace(/:\s*$/, ''), body };
        continue;
      }
      const p = parseHeadingBlock(title.replace(/:\s*$/, ''), body);
      if (p) pillars.push(p);
      else if (!leadParts.length) leadParts.push(block.trim());
    }
  }

  // Trailing paragraph after bullets → Investment Window callout if not set
  if (!callout && pillars.length > 0) {
    const lastPillarKey = pillars[pillars.length - 1]?.title;
    const afterPillars = md.split(
      new RegExp(`\\*\\*${lastPillarKey?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?\\*\\*`, 'i')
    );
    const tail = afterPillars[afterPillars.length - 1]?.trim();
    if (tail && !tail.startsWith('-')) {
      const withoutBullets = tail.replace(/^[-*]\s*\*\*.+?\*\*.+$/gm, '').trim();
      if (withoutBullets.length > 40) {
        callout = { title: 'Investment Window', body: withoutBullets };
      }
    }
  }

  return {
    lead: leadParts.join(' ').trim(),
    pillars,
    callout,
  };
}
