/**
 * Lightweight markdown → HTML for intelligence narratives.
 * Supports **bold**, bullet lists, and paragraph breaks.
 */

const ALLOWED_TAGS = /^(span|p|br|ul|ol|li|strong|em|h[1-4])$/;

/** Strip script/event handlers from HTML before dangerouslySetInnerHTML */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s(on\w+)=["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

export function markdownToHtml(md: string): string {
  if (!md) return '';

  const lines = md.split('\n');
  const htmlParts: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      continue;
    }

    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
      closeList();
      const heading = trimmed.slice(2, -2);
      htmlParts.push(`<p class="font-semibold text-white mt-3 mb-1">${formatInline(heading)}</p>`);
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        htmlParts.push('<ul class="list-disc list-inside space-y-1 my-2">');
        inList = true;
      }
      htmlParts.push(`<li>${formatInline(trimmed.slice(2))}</li>`);
      continue;
    }

    closeList();
    htmlParts.push(`<p class="mb-2">${formatInline(trimmed)}</p>`);
  }

  closeList();
  return sanitizeHtml(htmlParts.join(''));
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/** Parse markdown sections by **HEADING** markers */
export function parseMarkdownSections(md: string): Array<{ title: string; body: string }> {
  if (!md) return [];

  const sections: Array<{ title: string; body: string }> = [];
  const blocks = md.split(/\n(?=\*\*[^*]+\*\*)/);

  for (const block of blocks) {
    const match = block.match(/^\*\*(.+?)\*\*\s*\n?([\s\S]*)/);
    if (match) {
      sections.push({ title: match[1].trim(), body: match[2].trim() });
    } else if (block.trim()) {
      sections.push({ title: '', body: block.trim() });
    }
  }

  return sections;
}
