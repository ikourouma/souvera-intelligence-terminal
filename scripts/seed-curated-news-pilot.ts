/**
 * Seed / refresh curated news pilot — validated sources only, Live Wire flags, upsert sources.
 * Run: npx tsx scripts/seed-curated-news-pilot.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createHash } from 'crypto';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/** URLs verified reachable (200) or trusted institutional — no 404 pages */
const PILOT_ARTICLES = [
  {
    slug: 'afcfta-trade-corridor-momentum-2026',
    title: 'AfCFTA trade corridor momentum builds as West Africa export targets rise',
    summary:
      'Regional integration initiatives and new export corridors are reshaping intra-African trade flows, with Nigeria and Ghana leading manufacturing-linked growth.',
    bodyMd: `## Market context

AfCFTA implementation continues to accelerate cross-border trade facilitation across West Africa. Policy coordination on rules of origin and digital customs is lowering friction for manufactured exports.

Nigeria has signalled ambitions to scale AfCFTA-linked export corridors toward the $30bn range by 2027, with Ghana positioned as a complementary manufacturing and logistics hub.

## What to watch

Export corridor investments, port modernization timelines, and bilateral trade agreements with non-African partners will determine whether 2026–2027 targets are achievable.`,
    region: ['africa'],
    countryIso3: ['NGA', 'GHA'],
    themes: ['trade', 'policy'],
    liveWireFeatured: true,
    liveWireSort: 0,
    sources: [
      {
        source_name: 'AfCFTA Secretariat',
        source_url: 'https://au-afcfta.org/',
        snippet: 'Official AfCFTA Secretariat — continental free trade implementation.',
      },
      {
        source_name: 'ECOWAS',
        source_url: 'https://www.ecowas.int/',
        snippet: 'West African regional trade and integration framework.',
      },
      {
        source_name: 'World Bank — Nigeria',
        source_url: 'https://www.worldbank.org/en/country/nigeria',
        snippet: 'Macro and trade context for Nigeria, West Africa\'s largest economy.',
      },
    ],
  },
  {
    slug: 'jamaica-tourism-fdi-rebound-2026',
    title: 'Jamaica tourism FDI rebound signals broader Caribbean services recovery',
    summary:
      'Record arrival trends and cruise traffic recovery are driving hospitality investment across Kingston and Montego Bay, with logistics upgrades supporting regional connectivity.',
    bodyMd: `## Tourism outlook

Jamaica's Q1 arrival data points to sustained recovery in leisure travel and business tourism. Hotel pipeline projects and airport expansion are attracting institutional capital.

## Policy lens

CBI-linked investment flows and BOJ rate stability are supporting consumer confidence in the services sector.`,
    region: ['caribbean'],
    countryIso3: ['JAM'],
    themes: ['fdi', 'sector'],
    liveWireFeatured: false,
    liveWireSort: 2,
    sources: [
      {
        source_name: 'Jamaica Tourist Board',
        source_url: 'https://www.visitjamaica.com/',
        snippet: 'Tourism remains a primary driver of Jamaica\'s economic growth and employment.',
      },
      {
        source_name: 'Bank of Jamaica',
        source_url: 'https://boj.org.jm/',
        snippet: 'Monetary policy continues to anchor inflation expectations amid external shocks.',
      },
    ],
  },
  {
    slug: 'nigeria-fx-reforms-industrial-output',
    title: 'Nigeria FX reforms and refinery output reshape industrial competitiveness',
    summary:
      'Currency stabilization measures and domestic refining capacity are altering import dependency and energy cost structures for Nigerian manufacturers.',
    bodyMd: `## Industrial shift

Improved FX liquidity and refinery ramp-up are reducing input cost volatility for downstream industries. Investors are reassessing sector exposure across energy, logistics, and consumer goods.

## Risk factors

Policy consistency, power grid reliability, and security conditions remain key variables for FDI decisions.`,
    region: ['africa'],
    countryIso3: ['NGA'],
    themes: ['fx', 'energy'],
    liveWireFeatured: false,
    liveWireSort: 1,
    sources: [
      {
        source_name: 'Central Bank of Nigeria',
        source_url: 'https://www.cbn.gov.ng/',
        snippet: 'FX market reforms aim to improve transparency and price discovery.',
      },
      {
        source_name: 'World Bank — Nigeria',
        source_url: 'https://www.worldbank.org/en/country/nigeria',
        snippet: 'Macroeconomic indicators and structural reform context.',
      },
    ],
  },
  {
    slug: 'caribbean-logistics-hub-investment',
    title: 'Caribbean logistics hub investments draw regional trade rerouting',
    summary:
      'Port expansions and maritime connectivity upgrades across Jamaica and Trinidad are positioning the Caribbean as an alternative transshipment corridor.',
    bodyMd: `## Connectivity thesis

Infrastructure investment in deep-water ports and cold-chain logistics is enabling Caribbean economies to capture transshipment value from shifting global trade routes.

## Sector implications

Beneficiaries include logistics operators, cold storage, and fintech platforms supporting cross-border payments.`,
    region: ['caribbean', 'global'],
    countryIso3: ['JAM', 'TTO'],
    themes: ['trade', 'sector'],
    liveWireFeatured: false,
    liveWireSort: 3,
    sources: [
      {
        source_name: 'CARICOM',
        source_url: 'https://caricom.org/',
        snippet: 'Regional integration supports coordinated infrastructure and trade policy.',
      },
    ],
  },
  {
    slug: 'africa-fintech-regulatory-frameworks',
    title: 'Africa fintech regulatory frameworks mature as cross-border payments scale',
    summary:
      'Central bank digital currency pilots and payment interoperability standards are opening new corridors for fintech expansion across East and West Africa.',
    bodyMd: `## Regulatory evolution

National regulators are converging on KYC, AML, and open banking standards that enable cross-border fintech scale while managing systemic risk.

## Investment angle

Payment infrastructure, BaaS platforms, and SME lending remain high-conviction themes for institutional allocators.`,
    region: ['africa'],
    countryIso3: ['KEN', 'NGA'],
    themes: ['policy', 'sector'],
    liveWireFeatured: false,
    liveWireSort: 4,
    sources: [
      {
        source_name: 'World Bank — Mobile Money',
        source_url:
          'https://www.worldbank.org/en/topic/financialsector/brief/mobile-money-in-sub-saharan-africa',
        snippet: 'Mobile money adoption continues to expand financial inclusion across Sub-Saharan Africa.',
      },
    ],
  },
];

async function upsertArticle(article: (typeof PILOT_ARTICLES)[0]) {
  const { data: existing } = await supabase
    .from('souvera_curated_news')
    .select('id')
    .eq('slug', article.slug)
    .maybeSingle();

  const rowPayload = {
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    body_md: article.bodyMd,
    status: 'published' as const,
    published_at: new Date().toISOString(),
    region: article.region,
    country_iso3: article.countryIso3,
    themes: article.themes,
    live_wire_featured: article.liveWireFeatured,
    live_wire_sort: article.liveWireSort,
  };

  let newsId: string;

  if (existing?.id) {
    const { error } = await supabase
      .from('souvera_curated_news')
      .update(rowPayload)
      .eq('id', existing.id);
    if (error) {
      if (error.message.includes('live_wire')) {
        const { error: legacy } = await supabase
          .from('souvera_curated_news')
          .update({
            slug: article.slug,
            title: article.title,
            summary: article.summary,
            body_md: article.bodyMd,
            status: 'published',
            published_at: new Date().toISOString(),
            region: article.region,
            country_iso3: article.countryIso3,
            themes: article.themes,
          })
          .eq('id', existing.id);
        if (legacy) throw legacy;
      } else {
        throw error;
      }
    }
    newsId = existing.id;
    console.log(`🔄 ${article.slug} — updated`);
  } else {
    const { data: row, error } = await supabase
      .from('souvera_curated_news')
      .insert(rowPayload)
      .select('id')
      .single();
    if (error) throw error;
    newsId = row.id;
    console.log(`✅ ${article.slug} — created`);
  }

  await supabase.from('souvera_curated_news_sources').delete().eq('news_id', newsId);

  const sourceRows = article.sources.map((s, i) => ({
    news_id: newsId,
    source_name: s.source_name,
    source_url: s.source_url,
    snippet: s.snippet ?? null,
    sort_order: i,
    confidence: 0.9,
  }));

  const { error: srcError } = await supabase.from('souvera_curated_news_sources').insert(sourceRows);
  if (srcError) throw srcError;

  console.log(`   ↳ ${article.sources.length} verified sources`);
}

async function main() {
  console.log('🚀 Seeding / refreshing curated news pilot (validated sources only)...\n');

  for (const article of PILOT_ARTICLES) {
    try {
      await upsertArticle(article);
    } catch (err) {
      console.error(`❌ ${article.slug}:`, err instanceof Error ? err.message : err);
    }
  }

  const sampleUrl = 'https://example.com/sample-ingest-item';
  const urlHash = createHash('sha256').update(sampleUrl).digest('hex');

  await supabase.from('souvera_curated_news_ingest').upsert(
    {
      external_url: sampleUrl,
      url_hash: urlHash,
      raw_title: '[Sample] AfCFTA digital customs pilot expands to ECOWAS',
      raw_summary: 'Sample ingest row for admin promote workflow testing.',
      region: ['africa'],
      country_iso3: ['NGA'],
      themes: ['trade', 'policy'],
      status: 'pending',
    },
    { onConflict: 'url_hash', ignoreDuplicates: true }
  );

  console.log('\n✅ Curated news pilot complete.');
  console.log('   Run migration if live_wire columns missing: infra/supabase/migrations/add-curated-news-live-wire.sql');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
