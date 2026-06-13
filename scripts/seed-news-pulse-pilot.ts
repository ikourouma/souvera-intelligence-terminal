/**
 * Seed published News Pulse for NGA + JAM + KEN pilot (fallback when GDELT unavailable).
 * Run: npx tsx scripts/seed-news-pulse-pilot.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { NEWS_PULSE_PILOT, WAVE1_AFRICA_ISO3 } from './lib/news-pulse-pilot';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const PILOT_SEEDS = [
  {
    iso3: 'NGA',
    sentimentScore: 0.15,
    riskIntensity: 42,
    opportunityIntensity: 58,
    headlineCount: 12,
    topHeadlines: [
      {
        title: 'Nigeria targets $30bn AfCFTA export corridor by 2027',
        url: '/insights/news/afcfta-trade-corridor-momentum-2026',
        source: 'Souvera News',
        publishedAt: '2026-05-19',
      },
      {
        title: 'Dangote Refinery ramps output as FX reforms stabilize naira',
        url: '/insights/news/nigeria-fx-reforms-industrial-output',
        source: 'Souvera News',
        publishedAt: '2026-05-18',
      },
      {
        title: 'U.S. lawmakers discuss AGOA eligibility review for West Africa',
        url: '',
        source: 'Bloomberg',
        publishedAt: '2026-05-17',
      },
    ],
  },
  {
    iso3: 'JAM',
    sentimentScore: 0.28,
    riskIntensity: 35,
    opportunityIntensity: 62,
    headlineCount: 9,
    topHeadlines: [
      {
        title: 'Jamaica tourism arrivals hit record Q1 as cruise traffic rebounds',
        url: '/insights/news/jamaica-tourism-fdi-rebound-2026',
        source: 'Souvera News',
        publishedAt: '2026-05-19',
      },
      {
        title: 'Kingston port expansion draws regional logistics investment',
        url: '/insights/news/caribbean-logistics-hub-investment',
        source: 'Souvera News',
        publishedAt: '2026-05-16',
      },
      {
        title: 'BOJ holds policy rate steady amid inflation moderation',
        url: '',
        source: 'Reuters',
        publishedAt: '2026-05-18',
      },
    ],
  },
  {
    iso3: 'KEN',
    sentimentScore: 0.22,
    riskIntensity: 38,
    opportunityIntensity: 65,
    headlineCount: 10,
    topHeadlines: [
      {
        title: 'Kenya mobile money interoperability expands East Africa payment rails',
        url: '/insights/news/africa-fintech-regulatory-frameworks',
        source: 'Souvera News',
        publishedAt: '2026-05-19',
      },
      {
        title: 'Mombasa port throughput rises as Northern Corridor upgrades advance',
        url: '',
        source: 'Reuters',
        publishedAt: '2026-05-18',
      },
      {
        title: 'CBK holds policy rate steady as inflation moderates toward target',
        url: '',
        source: 'Bloomberg',
        publishedAt: '2026-05-17',
      },
    ],
  },
  {
    iso3: 'GHA',
    sentimentScore: 0.18,
    riskIntensity: 40,
    opportunityIntensity: 60,
    headlineCount: 8,
    topHeadlines: [
      {
        title: 'Ghana cocoa board advances AfCFTA processed cocoa export corridor',
        url: '',
        source: 'Reuters',
        publishedAt: '2026-05-19',
      },
    ],
  },
  {
    iso3: 'ZAF',
    sentimentScore: 0.12,
    riskIntensity: 44,
    opportunityIntensity: 55,
    headlineCount: 9,
    topHeadlines: [
      {
        title: 'South Africa automotive exports to U.S. hold steady under AGOA review window',
        url: '',
        source: 'Bloomberg',
        publishedAt: '2026-05-18',
      },
    ],
  },
  {
    iso3: 'ETH',
    sentimentScore: 0.08,
    riskIntensity: 48,
    opportunityIntensity: 52,
    headlineCount: 7,
    topHeadlines: [
      {
        title: 'Ethiopia apparel sector monitors AGOA suspension impact on industrial parks',
        url: '',
        source: 'Souvera News',
        publishedAt: '2026-05-17',
      },
    ],
  },
  {
    iso3: 'SEN',
    sentimentScore: 0.14,
    riskIntensity: 41,
    opportunityIntensity: 58,
    headlineCount: 6,
    topHeadlines: [
      {
        title: 'Senegal Diamniadio industrial zone advances AGOA-eligible manufacturing exports',
        url: '',
        source: 'Reuters',
        publishedAt: '2026-05-18',
      },
    ],
  },
  {
    iso3: 'CIV',
    sentimentScore: 0.16,
    riskIntensity: 39,
    opportunityIntensity: 61,
    headlineCount: 8,
    topHeadlines: [
      {
        title: "Côte d'Ivoire cocoa grind capacity expands ahead of AfCFTA value-add targets",
        url: '',
        source: 'Bloomberg',
        publishedAt: '2026-05-19',
      },
    ],
  },
  {
    iso3: 'TZA',
    sentimentScore: 0.11,
    riskIntensity: 43,
    opportunityIntensity: 57,
    headlineCount: 7,
    topHeadlines: [
      {
        title: 'Tanzania EPZ apparel exports hold AGOA corridor as Dar port upgrades proceed',
        url: '',
        source: 'Souvera News',
        publishedAt: '2026-05-18',
      },
    ],
  },
];

async function main() {
  const wave1Set = new Set<string>(WAVE1_AFRICA_ISO3);
  const missingWave1 = WAVE1_AFRICA_ISO3.filter(
    (iso) => !PILOT_SEEDS.some((s) => s.iso3 === iso)
  );
  if (missingWave1.length > 0) {
    console.error(`❌ WAVE1_AFRICA_ISO3 missing seed headlines: ${missingWave1.join(', ')}`);
    process.exit(1);
  }
  for (const entry of NEWS_PULSE_PILOT) {
    if (wave1Set.has(entry.iso3) && !PILOT_SEEDS.some((s) => s.iso3 === entry.iso3)) {
      console.error(`❌ NEWS_PULSE_PILOT entry ${entry.iso3} has no PILOT_SEEDS row`);
      process.exit(1);
    }
  }

  console.log('🚀 Seeding News Pulse pilot (NGA + JAM + KEN + wave1 Africa)...\n');
  const signalDate = new Date().toISOString().slice(0, 10);

  for (const seed of PILOT_SEEDS) {
    const { data: country } = await supabase
      .from('souvera_countries')
      .select('id, name')
      .eq('iso3', seed.iso3)
      .maybeSingle();

    if (!country) {
      console.warn(`⚠️  ${seed.iso3}: country not found`);
      continue;
    }

    const payload: Record<string, unknown> = {
      country_id: country.id,
      signal_date: signalDate,
      headline_count: seed.headlineCount,
      sentiment_score: seed.sentimentScore,
      risk_intensity: seed.riskIntensity,
      opportunity_intensity: seed.opportunityIntensity,
      top_headlines: seed.topHeadlines,
      source_mix: { provider: 'seed', pilot: true },
      generated_at: new Date().toISOString(),
    };

    // Include review fields when migration is applied
    const { error: withStatusError } = await supabase.from('souvera_country_news_signals').upsert(
      { ...payload, status: 'published', reviewed_at: new Date().toISOString() },
      { onConflict: 'country_id,signal_date' }
    );

    if (withStatusError?.message?.includes('status') || withStatusError?.message?.includes('reviewed_at')) {
      const { error: legacyError } = await supabase.from('souvera_country_news_signals').upsert(
        payload,
        { onConflict: 'country_id,signal_date' }
      );
      if (legacyError) {
        console.error(`❌ ${seed.iso3}: ${legacyError.message}`);
      } else {
        console.log(`✅ ${seed.iso3}: News Pulse seeded (pre-migration schema)`);
      }
    } else if (withStatusError) {
      console.error(`❌ ${seed.iso3}: ${withStatusError.message}`);
    } else {
      console.log(`✅ ${seed.iso3}: published News Pulse seeded`);
    }
  }

  console.log('\n✅ Done! SignalMomentumRow should show headlines for pilot + wave1 Africa.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
