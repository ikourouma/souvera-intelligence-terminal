/**
 * Country relevance filter for News Pulse — every headline must relate to the target country.
 * Prevents cross-country bleed (e.g. Ghana "Black Stars" article appearing on JAM terminal).
 */

export interface CountryNewsFilterConfig {
  iso3: string;
  /** Primary match term — must appear in title (e.g. "Jamaica", "Nigeria") */
  countryKeyword: string;
  /** Optional city / alias terms that count when paired with economic context */
  aliases?: string[];
}

/** Title-only signals that indicate another country is the primary subject */
const FOREIGN_TITLE_SIGNALS: Record<string, string[]> = {
  GHA: ['ghana', 'black stars', 'accra', 'kumasi', 'cedi'],
  NGA: ['nigeria', 'nigerian', 'lagos', 'abuja', 'naira', 'ngx'],
  JAM: ['jamaica', 'jamaican', 'kingston', 'montego'],
  KEN: ['kenya', 'kenyan', 'nairobi'],
  ZAF: ['south africa', 'south african', 'johannesburg'],
  TTO: ['trinidad', 'tobago', 'port of spain'],
  ETH: ['ethiopia', 'ethiopian', 'addis ababa'],
  SEN: ['senegal', 'senegalese', 'dakar'],
  CIV: ['ivory coast', 'côte d\'ivoire', 'cote d\'ivoire', 'abidjan'],
  TZA: ['tanzania', 'tanzanian', 'dar es salaam'],
  BRB: ['barbados', 'barbadian', 'bridgetown'],
  BHS: ['bahamas', 'bahamian', 'nassau'],
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ');
}

function wordIncludes(text: string, term: string): boolean {
  const t = normalize(term);
  const n = normalize(text);
  if (t.length <= 3) return n.includes(t);
  const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return re.test(n);
}

/**
 * Returns true when the headline is primarily about the target country.
 * Strict pilot rule: title must mention country keyword OR approved alias.
 * Titles dominated by another country's signals are rejected.
 */
export function isHeadlineRelevantToCountry(
  title: string,
  config: CountryNewsFilterConfig
): boolean {
  if (!title?.trim()) return false;

  const keywordHit =
    wordIncludes(title, config.countryKeyword) ||
    (config.aliases ?? []).some((a) => wordIncludes(title, a));

  if (!keywordHit) return false;

  // Reject when another country's strong signals appear without our keyword dominating
  for (const [iso, signals] of Object.entries(FOREIGN_TITLE_SIGNALS)) {
    if (iso === config.iso3) continue;
    const foreignHit = signals.some((s) => wordIncludes(title, s));
    if (!foreignHit) continue;

    // Our keyword is present but foreign identity is the headline subject (e.g. "Black Stars" + Nigeria mention only in body)
    const ourKeywordInTitle = wordIncludes(title, config.countryKeyword);
    if (!ourKeywordInTitle) return false;

    // Both present — keep only if our keyword appears before foreign anchor or foreign is incidental
    const foreignAnchors = signals.filter((s) => wordIncludes(title, s));
    const primaryForeign = foreignAnchors.some((s) =>
      ['black stars', 'ghana', 'nigerian', 'nigeria'].includes(s)
    );
    if (primaryForeign && config.iso3 !== 'GHA') return false;
  }

  return true;
}

export interface GdeltLikeArticle {
  title: string;
  url?: string;
  domain?: string;
  seendate?: string;
}

export function filterCountryRelevantArticles<T extends GdeltLikeArticle>(
  articles: T[],
  config: CountryNewsFilterConfig
): T[] {
  return articles.filter((a) => isHeadlineRelevantToCountry(a.title, config));
}

export function filterStoredHeadlines<T extends { title: string }>(
  headlines: T[],
  config: CountryNewsFilterConfig
): T[] {
  return headlines.filter((h) => isHeadlineRelevantToCountry(h.title, config));
}

/** Config map for pilot + rollout countries */
export function newsPulseFilterConfig(iso3: string): CountryNewsFilterConfig | null {
  const map: Record<string, CountryNewsFilterConfig> = {
    NGA: {
      iso3: 'NGA',
      countryKeyword: 'Nigeria',
      aliases: ['Nigerian', 'Lagos', 'Abuja', 'Naira'],
    },
    JAM: {
      iso3: 'JAM',
      countryKeyword: 'Jamaica',
      aliases: ['Jamaican', 'Kingston', 'Montego Bay', 'BOJ'],
    },
    KEN: {
      iso3: 'KEN',
      countryKeyword: 'Kenya',
      aliases: ['Kenyan', 'Nairobi', 'M-Pesa', 'Mombasa'],
    },
    GHA: {
      iso3: 'GHA',
      countryKeyword: 'Ghana',
      aliases: ['Ghanaian', 'Accra', 'Cedi'],
    },
    ZAF: {
      iso3: 'ZAF',
      countryKeyword: 'South Africa',
      aliases: ['South African', 'Johannesburg', 'Cape Town', 'Rand'],
    },
    ETH: {
      iso3: 'ETH',
      countryKeyword: 'Ethiopia',
      aliases: ['Ethiopian', 'Addis Ababa'],
    },
    SEN: {
      iso3: 'SEN',
      countryKeyword: 'Senegal',
      aliases: ['Senegalese', 'Dakar', 'CFA'],
    },
    CIV: {
      iso3: 'CIV',
      countryKeyword: 'Ivory Coast',
      aliases: ['Côte d\'Ivoire', 'Cote d\'Ivoire', 'Abidjan', 'Ivorian'],
    },
    TZA: {
      iso3: 'TZA',
      countryKeyword: 'Tanzania',
      aliases: ['Tanzanian', 'Dar es Salaam', 'Dodoma'],
    },
    TTO: {
      iso3: 'TTO',
      countryKeyword: 'Trinidad',
      aliases: ['Tobago', 'Trinidadian', 'Port of Spain'],
    },
    BRB: {
      iso3: 'BRB',
      countryKeyword: 'Barbados',
      aliases: ['Barbadian', 'Bridgetown'],
    },
    BHS: {
      iso3: 'BHS',
      countryKeyword: 'Bahamas',
      aliases: ['Bahamian', 'Nassau'],
    },
  };
  return map[iso3.toUpperCase()] ?? null;
}
