/**
 * GDELT 2.0 DOC API client for News Pulse ingest.
 * @see https://blog.gdeltproject.org/gdelt-doc-2-0-api-debut/
 *
 * GDELT is rate-limited (~1 req / 5s) and can be slow to connect.
 * Uses node:https with retries instead of fetch to avoid undici's 10s connect timeout.
 */

import https from 'node:https';

export interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language?: string;
  sourcecountry?: string;
}

export interface GdeltDocResponse {
  articles?: GdeltArticle[];
}

const GDELT_DOC_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';
const GDELT_MIN_INTERVAL_MS = 6_000;
const REQUEST_TIMEOUT_MS = 90_000;
const MAX_ATTEMPTS = 4;

let lastRequestAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRateLimit(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < GDELT_MIN_INTERVAL_MS) {
    await sleep(GDELT_MIN_INTERVAL_MS - elapsed);
  }
}

function httpsGet(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Souvera-NewsPulse/1.0 (research; contact@souvera.io)',
        },
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ status: res.statusCode ?? 0, body });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error(`GDELT connect/read timeout after ${REQUEST_TIMEOUT_MS}ms`));
    });
    req.on('error', reject);
  });
}

function isRateLimitResponse(status: number, body: string): boolean {
  return status === 429 || body.toLowerCase().includes('limit requests to one every 5 seconds');
}

function parseGdeltBody(body: string): GdeltArticle[] {
  const trimmed = body.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    throw new Error(`GDELT non-JSON response: ${trimmed.slice(0, 120)}`);
  }
  const data = JSON.parse(trimmed) as GdeltDocResponse;
  return data.articles ?? [];
}

export async function fetchGdeltArticles(
  query: string,
  maxRecords = 25
): Promise<GdeltArticle[]> {
  const params = new URLSearchParams({
    query,
    mode: 'artlist',
    maxrecords: String(maxRecords),
    format: 'json',
    timespan: '7d',
    sort: 'datedesc',
  });

  const url = `${GDELT_DOC_BASE}?${params.toString()}`;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    await waitForRateLimit();

    try {
      const { status, body } = await httpsGet(url);
      lastRequestAt = Date.now();

      if (isRateLimitResponse(status, body)) {
        lastError = new Error('GDELT rate limit (max 1 request per 5 seconds)');
        console.warn(`  ⏳ GDELT rate limit — waiting 6s (attempt ${attempt}/${MAX_ATTEMPTS})`);
        await sleep(6_000);
        continue;
      }

      if (status < 200 || status >= 300) {
        throw new Error(`GDELT HTTP ${status}: ${body.slice(0, 120)}`);
      }

      return parseGdeltBody(body);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const cause =
        err instanceof Error && 'cause' in err && err.cause instanceof Error
          ? ` (${err.cause.message})`
          : '';
      lastError = new Error(`${message}${cause}`);
      console.warn(`  ⚠️  GDELT attempt ${attempt}/${MAX_ATTEMPTS} failed: ${lastError.message}`);

      if (attempt < MAX_ATTEMPTS) {
        const backoff = attempt * 8_000;
        console.warn(`  ⏳ Retrying in ${backoff / 1000}s...`);
        await sleep(backoff);
      }
    }
  }

  throw lastError ?? new Error('GDELT fetch failed after retries');
}

/**
 * Single OR-block query — GDELT does not support nested OR groups.
 * Example: Nigeria (economy OR investment OR trade OR AGOA)
 */
export function buildNewsPulseQuery(
  countryKeyword: string,
  regionTerms: string
): string {
  return `${countryKeyword} (economy OR investment OR policy OR trade OR ${regionTerms})`;
}

export function parseGdeltSeenDate(seenDate: string): string {
  if (seenDate.length < 8) return new Date().toISOString();
  const y = seenDate.slice(0, 4);
  const m = seenDate.slice(4, 6);
  const d = seenDate.slice(6, 8);
  return `${y}-${m}-${d}`;
}

export function dedupeArticles(articles: GdeltArticle[]): GdeltArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = a.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
