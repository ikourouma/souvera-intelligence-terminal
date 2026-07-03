/**
 * =====================================================
 * SOUVERA NEWS HEADLINE URL AUDIT SCRIPT
 * =====================================================
 *
 * Purpose: Audit the souvera_country_news_signals table to identify headlines
 * with missing or invalid URLs. Headlines live inside the `top_headlines` JSONB
 * array on each signal row, so we flatten them per country and report URL
 * coverage statistics.
 *
 * Usage: npx tsx apps/api-gateway/scripts/audit-news-headline-urls.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Headline {
  title?: string;
  url?: string;
  source?: string;
  publishedAt?: string;
}

interface SignalRow {
  id: string;
  signal_date: string | null;
  status: string | null;
  top_headlines: Headline[] | null;
  country: { iso3: string; name: string } | null;
}

interface CountryStats {
  iso3: string;
  countryName: string;
  totalHeadlines: number;
  withUrl: number;
  withoutUrl: number;
  urlCoverage: string;
}

function hasValidUrl(headline: Headline): boolean {
  const url = headline.url;
  return Boolean(url && url !== '#' && url.trim() !== '');
}

async function auditHeadlineUrls(): Promise<void> {
  console.log('\n============================================');
  console.log('SOUVERA NEWS HEADLINE URL AUDIT');
  console.log(`Run Date: ${new Date().toISOString()}`);
  console.log('============================================\n');

  const { data: rows, error } = await supabase
    .from('souvera_country_news_signals')
    .select(`
      id,
      signal_date,
      status,
      top_headlines,
      country:souvera_countries!inner(iso3, name)
    `)
    .order('signal_date', { ascending: false });

  if (error) {
    console.error('Error fetching news signal data:', error.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('No news signal data found.');
    return;
  }

  const countryMap = new Map<string, { countryName: string; headlines: Headline[] }>();

  for (const raw of rows as unknown as SignalRow[]) {
    const country = raw.country;
    const key = country?.iso3?.toUpperCase() ?? 'UNKNOWN';
    if (!countryMap.has(key)) {
      countryMap.set(key, { countryName: country?.name ?? key, headlines: [] });
    }
    const headlines = Array.isArray(raw.top_headlines) ? raw.top_headlines : [];
    countryMap.get(key)!.headlines.push(...headlines);
  }

  const countryStats: CountryStats[] = [];
  let totalHeadlines = 0;
  let totalWithUrl = 0;
  let totalWithoutUrl = 0;

  for (const [iso3, data] of countryMap.entries()) {
    const headlines = data.headlines;
    if (headlines.length === 0) continue;

    const withUrl = headlines.filter(hasValidUrl).length;
    const withoutUrl = headlines.length - withUrl;

    totalHeadlines += headlines.length;
    totalWithUrl += withUrl;
    totalWithoutUrl += withoutUrl;

    countryStats.push({
      iso3,
      countryName: data.countryName,
      totalHeadlines: headlines.length,
      withUrl,
      withoutUrl,
      urlCoverage: `${((withUrl / headlines.length) * 100).toFixed(1)}%`,
    });
  }

  console.log('OVERALL STATISTICS');
  console.log('─────────────────────────────────────────');
  console.log(`Total Headlines:    ${totalHeadlines}`);
  console.log(`With URLs:          ${totalWithUrl} (${totalHeadlines ? ((totalWithUrl / totalHeadlines) * 100).toFixed(1) : '0.0'}%)`);
  console.log(`Without URLs:       ${totalWithoutUrl} (${totalHeadlines ? ((totalWithoutUrl / totalHeadlines) * 100).toFixed(1) : '0.0'}%)`);
  console.log('');

  console.log('PER-COUNTRY BREAKDOWN');
  console.log('─────────────────────────────────────────');
  console.log('ISO3  Country                   Total   WithURL   NoURL   Coverage');
  console.log('────  ────────────────────────  ─────   ───────   ─────   ────────');

  const sortedStats = countryStats.sort((a, b) => b.totalHeadlines - a.totalHeadlines);

  for (const stat of sortedStats) {
    const countryPadded = stat.countryName.slice(0, 24).padEnd(24);
    const totalPadded = String(stat.totalHeadlines).padStart(5);
    const withUrlPadded = String(stat.withUrl).padStart(7);
    const withoutUrlPadded = String(stat.withoutUrl).padStart(5);
    const coveragePadded = stat.urlCoverage.padStart(8);

    console.log(`${stat.iso3}  ${countryPadded}  ${totalPadded}   ${withUrlPadded}   ${withoutUrlPadded}   ${coveragePadded}`);
  }

  console.log('');
  console.log('COUNTRIES WITH LOWEST URL COVERAGE (< 50%)');
  console.log('─────────────────────────────────────────');

  const lowCoverage = sortedStats.filter(s => s.totalHeadlines > 0 && (s.withUrl / s.totalHeadlines) < 0.5);

  if (lowCoverage.length === 0) {
    console.log('All countries have > 50% URL coverage.');
  } else {
    for (const stat of lowCoverage) {
      console.log(`  ${stat.iso3} (${stat.countryName}): ${stat.urlCoverage} coverage (${stat.withoutUrl} headlines missing URLs)`);
    }
  }

  console.log('');
  console.log('HEADLINES WITH MISSING URLs (Sample - First 10)');
  console.log('─────────────────────────────────────────');

  const missingSamples: { iso3: string; headline: Headline }[] = [];
  for (const [iso3, data] of countryMap.entries()) {
    for (const headline of data.headlines) {
      if (!hasValidUrl(headline)) {
        missingSamples.push({ iso3, headline });
        if (missingSamples.length >= 10) break;
      }
    }
    if (missingSamples.length >= 10) break;
  }

  if (missingSamples.length === 0) {
    console.log('  No headlines with missing URLs found.');
  } else {
    for (const { iso3, headline } of missingSamples) {
      console.log(`  [${iso3}] ${(headline.title ?? '').slice(0, 60)}...`);
      console.log(`         Source: ${headline.source ?? 'N/A'}`);
    }
  }

  console.log('\n============================================');
  console.log('AUDIT COMPLETE');
  console.log('============================================\n');
}

auditHeadlineUrls().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
