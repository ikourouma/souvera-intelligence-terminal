/**
 * Discover AGOA/CBI beneficiary PDF links from USTR program HTML.
 */

export function discoverPdfLinksFromHtml(html: string, baseUrl: string): string[] {
  const hrefs = [...html.matchAll(/href="([^"]+\.pdf[^"]*)"/gi)].map((m) => m[1]);
  const absolute = hrefs.map((href) => {
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return `https:${href}`;
    if (href.startsWith('/')) return new URL(href, baseUrl).href;
    return new URL(href, baseUrl).href;
  });
  return [...new Set(absolute)];
}

export function filterAgoaListPdfs(urls: string[]): string[] {
  return urls.filter((u) => /agoa/i.test(u) && /eligible|ineligible|subsaharan/i.test(u));
}

export function filterCbiReportPdfs(urls: string[]): string[] {
  return urls.filter((u) => /caribbean|cbi|cbera/i.test(u) && /\.pdf$/i.test(u));
}
