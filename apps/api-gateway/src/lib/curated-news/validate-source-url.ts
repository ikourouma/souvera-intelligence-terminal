/**
 * Validate external reference URLs before publish / public display.
 * Rejects 404/410; allows known institutional hosts that block bots (403).
 */

const TRUSTED_HOSTS = new Set([
  'au-afcfta.org',
  'www.worldbank.org',
  'worldbank.org',
  'www.ecowas.int',
  'ecowas.int',
  'www.cbn.gov.ng',
  'cbn.gov.ng',
  'boj.org.jm',
  'www.visitjamaica.com',
  'visitjamaica.com',
  'caricom.org',
  'www.caricom.org',
  'www.tralac.org',
  'tralac.org',
  'www.imf.org',
  'imf.org',
]);

export interface SourceUrlValidation {
  valid: boolean;
  status?: number;
  reason?: string;
}

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export async function validateSourceUrl(url: string): Promise<SourceUrlValidation> {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return { valid: false, reason: 'URL must start with http:// or https://' };
  }

  const host = hostname(trimmed);
  if (!host) {
    return { valid: false, reason: 'Invalid URL' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    let res: Response;
    try {
      res = await fetch(trimmed, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'SouveraSourceValidator/1.0' },
      });
    } catch {
      res = await fetch(trimmed, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'SouveraSourceValidator/1.0' },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (res.status === 404 || res.status === 410) {
      return { valid: false, status: res.status, reason: `Page not found (${res.status})` };
    }

    if (res.ok || (res.status >= 200 && res.status < 400)) {
      return { valid: true, status: res.status };
    }

    if (res.status === 403 && TRUSTED_HOSTS.has(host)) {
      return { valid: true, status: res.status, reason: 'Trusted host (bot-blocked)' };
    }

    if (TRUSTED_HOSTS.has(host) && res.status >= 500) {
      return { valid: false, status: res.status, reason: `Server error (${res.status})` };
    }

    return { valid: false, status: res.status, reason: `HTTP ${res.status}` };
  } catch (err) {
    if (host && TRUSTED_HOSTS.has(host)) {
      return { valid: true, reason: 'Trusted host (timeout on bot check)' };
    }
    const msg = err instanceof Error ? err.message : 'unreachable';
    return { valid: false, reason: msg };
  }
}

export async function filterValidSources<
  T extends { sourceUrl: string; sourceName: string }
>(sources: T[]): Promise<T[]> {
  const results = await Promise.all(
    sources.map(async (s) => ({
      source: s,
      check: await validateSourceUrl(s.sourceUrl),
    }))
  );
  return results.filter((r) => r.check.valid).map((r) => r.source);
}

export async function validateAllSources(
  sources: Array<{ sourceUrl: string; sourceName: string }>
): Promise<{ valid: true } | { valid: false; errors: string[] }> {
  const errors: string[] = [];
  for (const s of sources) {
    if (!s.sourceName?.trim()) {
      errors.push('Each source requires a name');
      continue;
    }
    const check = await validateSourceUrl(s.sourceUrl);
    if (!check.valid) {
      errors.push(`${s.sourceName}: ${check.reason ?? 'invalid URL'}`);
    }
  }
  if (errors.length) return { valid: false, errors };
  return { valid: true };
}
