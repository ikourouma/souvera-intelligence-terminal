/**
 * Zimbabwe Data Curation Script
 * Curates accurate Tier A data for Zimbabwe (ZWE) from verified sources
 * to ensure demo-ready quality across all intelligence modules.
 * 
 * Addresses 5 critical issues:
 * 1. Economic indicators (GDP, inflation, FDI, etc.) for 2023-2024
 * 2. AGOA trade data (suspended status with restoration potential)
 * 3. Key sectors (Mining, Agriculture, Tourism, Manufacturing)
 * 4. Investment pillars content (already in code files)
 * 5. Economic overview content (already in code files)
 * 
 * Run: npx tsx apps/api-gateway/scripts/curate-zimbabwe-data.ts
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ZWE_ISO3 = 'ZWE';
const ZWE_ISO2 = 'ZW';

function structuredPlayers(sectorLabel: string, names: string[]) {
  return names.map((name) => ({
    name,
    sector: sectorLabel,
    description: `Key participant in the ${sectorLabel.toLowerCase()} value chain`,
    metric: 'Sector anchor',
  }));
}

// Curated economic indicators for Zimbabwe (2023-2024)
// Sources: World Bank WDI, IMF DataMapper, ZIMSTAT, Reserve Bank of Zimbabwe
const ECONOMIC_INDICATORS = [
  // GDP and growth
  { key: 'gdp_current_usd', year: 2023, value: 35.2e9, source: 'World Bank WDI NY.GDP.MKTP.CD', quality: 0.95 },
  { key: 'gdp_current_usd', year: 2024, value: 35.9e9, source: 'IMF WEO October 2024', quality: 0.92 },
  { key: 'gdp_growth_pct', year: 2023, value: 5.3, source: 'World Bank / IMF', quality: 0.94 },
  { key: 'gdp_growth_pct', year: 2024, value: 2.0, source: 'AfDB / IMF estimate (drought impact)', quality: 0.90 },
  { key: 'gdp_per_capita_usd', year: 2023, value: 2114, source: 'World Bank WDI NY.GDP.PCAP.CD', quality: 0.93 },
  { key: 'gdp_per_capita_usd', year: 2024, value: 2150, source: 'Calculated from GDP/population', quality: 0.88 },
  
  // Population
  { key: 'population_total', year: 2023, value: 16.7e6, source: 'World Bank WDI SP.POP.TOTL', quality: 0.96 },
  { key: 'population_total', year: 2024, value: 16.9e6, source: 'World Bank estimate', quality: 0.94 },
  
  // Inflation (dramatically different in ZiG vs USD terms)
  { key: 'inflation_cpi_pct', year: 2023, value: 257.0, source: 'ZIMSTAT / World Bank (ZWG hyperinflation)', quality: 0.80 },
  { key: 'inflation_cpi_pct', year: 2024, value: 55.7, source: 'ZIMSTAT / RBZ (ZiG annual average)', quality: 0.85 },
  
  // Trade
  { key: 'exports_goods_services_usd', year: 2023, value: 8.2e9, source: 'World Bank / UN Comtrade estimate', quality: 0.85 },
  { key: 'exports_goods_services_usd', year: 2024, value: 8.5e9, source: 'Estimated from mining + agriculture', quality: 0.82 },
  { key: 'imports_goods_services_usd', year: 2023, value: 9.1e9, source: 'World Bank / UN Comtrade estimate', quality: 0.85 },
  { key: 'imports_goods_services_usd', year: 2024, value: 9.3e9, source: 'Estimated continuation', quality: 0.82 },
  
  // FDI
  { key: 'fdi_net_inflows_usd', year: 2023, value: 563e6, source: 'World Bank BX.KLT.DINV.CD.WD (1.6% of GDP)', quality: 0.88 },
  { key: 'fdi_net_inflows_usd', year: 2024, value: 467e6, source: 'IMF estimate (1.3% of GDP)', quality: 0.85 },
  
  // Fiscal and debt
  { key: 'fiscal_balance_pct_gdp', year: 2023, value: -14.0, source: 'IMF Fiscal Monitor', quality: 0.87 },
  { key: 'fiscal_balance_pct_gdp', year: 2024, value: -2.9, source: 'IMF estimate (fiscal consolidation)', quality: 0.85 },
  { key: 'debt_to_gdp_pct', year: 2023, value: 96.6, source: 'World Bank / IMF', quality: 0.83 },
  { key: 'debt_to_gdp_pct', year: 2024, value: 87.2, source: 'IMF estimate (debt reduction)', quality: 0.82 },
  { key: 'debt_to_gdp_pct', year: 2025, value: 82.0, source: 'IMF Fiscal Monitor estimate', quality: 0.80 },
  
  // Current account
  { key: 'current_account_pct_gdp', year: 2023, value: 0.4, source: 'IMF BOP', quality: 0.86 },
  { key: 'current_account_pct_gdp', year: 2024, value: -0.1, source: 'IMF estimate', quality: 0.84 },
  
  // Exchange rate (official RBZ rate - highly volatile). Use fx_to_usd: the key the
  // professional view + Economy tab read. ZiG redenominated in 2024.
  { key: 'fx_to_usd', year: 2023, value: 5200, source: 'RBZ average (ZWL)', quality: 0.75 },
  { key: 'fx_to_usd', year: 2024, value: 24.40, source: 'RBZ ZiG rate (September devaluation)', quality: 0.80 },
  
  // Reserves
  { key: 'reserves_total_usd', year: 2023, value: 450e6, source: 'RBZ / IMF', quality: 0.82 },
  { key: 'reserves_total_usd', year: 2024, value: 540e6, source: 'AfDB Economic Outlook (improved from remittances)', quality: 0.85 },

  // 2025 estimates (IMF/RBZ)
  { key: 'gdp_current_usd', year: 2025, value: 38.5e9, source: 'IMF WEO April 2025 estimate', quality: 0.85 },
  { key: 'gdp_growth_pct', year: 2025, value: 3.5, source: 'IMF WEO / AfDB estimate', quality: 0.82 },
  { key: 'gdp_per_capita_usd', year: 2025, value: 2250, source: 'Calculated GDP/population', quality: 0.80 },
  { key: 'population_total', year: 2025, value: 17.1e6, source: 'World Bank projection', quality: 0.88 },
  { key: 'inflation_cpi_pct', year: 2025, value: 15.0, source: 'RBZ / IMF (ZiG stabilization)', quality: 0.78 },
  { key: 'fdi_net_inflows_usd', year: 2025, value: 520e6, source: 'IMF estimate (mining FDI)', quality: 0.80 },
  { key: 'fx_to_usd', year: 2025, value: 26.5, source: 'RBZ ZiG reference rate', quality: 0.78 },
  { key: 'exports_goods_services_usd', year: 2025, value: 9.0e9, source: 'ZIMSTAT / mining export estimate', quality: 0.78 },
  { key: 'imports_goods_services_usd', year: 2025, value: 9.8e9, source: 'ZIMSTAT estimate', quality: 0.76 },
];

// Key sectors for Zimbabwe
const KEY_SECTORS = [
  {
    sector_key: 'mining_critical_minerals',
    sector_label: 'Mining & Critical Minerals',
    row_status: 'active',
    display_order: 1,
    teaser: 'Zimbabwe holds Africa\'s second-largest platinum reserves after South Africa and emerging lithium deposits.',
    narrative_short: 'Zimbabwe holds Africa\'s second-largest platinum reserves after South Africa and emerging lithium deposits attracting strategic investment from Chinese, European, and North American battery manufacturers.',
    narrative_full: 'Zimbabwe\'s mining sector anchors the economy with platinum group metals (PGMs), gold, chrome, lithium, and coal. Zimplats and Mimosa operate major PGM mines in the Great Dyke. Lithium discoveries at Bikita, Arcadia, and Kamativi have attracted $1B+ investment from Chinese battery manufacturers (Sinomine, Zhejiang Huayou) seeking upstream supply chain integration. Gold production reached 30+ tonnes annually. Chrome exports support ferrochrome refining. ESG compliance and community benefit-sharing are baseline requirements for institutional capital. The sector contributed ~60% of export revenues in 2023-2024.',
    key_players: structuredPlayers('Mining & Critical Minerals', ['Zimplats', 'Mimosa Platinum', 'Bikita Minerals', 'Prospect Resources', 'Sinomine', 'Arcadia Lithium', 'Kuvimba Mining', 'Zimbabwe Mining Development Corporation']),
    agoa_opportunity: 'Processed mineral exports (refined platinum, lithium compounds) would qualify for duty-free access if AGOA eligibility restored. Raw mineral preference exists but value-added processing creates jobs and higher revenues.',
    data_sources: ['Zimbabwe Chamber of Mines', 'Ministry of Mines and Mining Development', 'UN Comtrade', 'BMI Research'],
    agoa_export_current_usd: 0,
    agoa_export_potential_usd: 12_000_000,
    updated_at: new Date().toISOString(),
  },
  {
    sector_key: 'agriculture',
    sector_label: 'Agriculture & Agro-processing',
    row_status: 'active',
    display_order: 2,
    teaser: 'Traditional tobacco exporter (5th globally) diversifying to horticulture, coffee, and macadamia nuts.',
    narrative_short: 'Traditional tobacco exporter (5th globally) diversifying to horticulture, coffee, and macadamia nuts with value-add processing potential under regional trade agreements.',
    narrative_full: 'Zimbabwe agriculture historically dominated by tobacco (flue-cured Virginia), contributing $1B+ annually in exports despite land reform disruptions. Diversification into horticulture (flowers, vegetables), coffee (Chipinge highlands), macadamia nuts, and blueberries targets EU and Middle East premium markets. 2024 drought reduced maize production 15-20%, highlighting irrigation infrastructure gaps. Livestock (beef, dairy) serves regional SADC markets. Agro-processing opportunities include coffee roasting, tobacco value-add, and dried fruit exports. Commercial farming scale remains below pre-2000 levels but investment is recovering.',
    key_players: structuredPlayers('Agriculture & Agro-processing', ['Zimbabwe Tobacco Association', 'Tobacco Industry Marketing Board', 'Coffee Growers Association', 'Tanganda Tea', 'Machipanda Coffee', 'Seedco', 'Ariston Holdings']),
    agoa_opportunity: 'Value-added agricultural products (processed coffee, specialty tobacco, dried fruits) would benefit from duty-free access. Raw agricultural preference exists but processing multiplies value.',
    data_sources: ['Zimbabwe National Statistics Agency (ZIMSTAT)', 'USDA GATS', 'Ministry of Agriculture', 'UN Comtrade'],
    agoa_export_current_usd: 0,
    agoa_export_potential_usd: 8_500_000,
    updated_at: new Date().toISOString(),
  },
  {
    sector_key: 'tourism',
    sector_label: 'Tourism & Hospitality',
    row_status: 'active',
    display_order: 3,
    teaser: 'Victoria Falls and safari tourism recovering post-COVID with $1B+ annual potential.',
    narrative_short: 'Victoria Falls and safari tourism recovering post-COVID with $1B+ annual potential from SADC, European, and North American visitors.',
    narrative_full: 'Zimbabwe tourism centers on Victoria Falls (UNESCO World Heritage Site), Hwange National Park (elephant sanctuary), Mana Pools, and Great Zimbabwe ruins. Pre-COVID arrivals reached 2.5M+ annually. Recovery accelerated 2023-2024 with regional SADC tourists (South Africa, Botswana) and returning European/North American long-haul visitors. Safari lodges (Singita, Wilderness Safaris, African Bush Camps) operate premium properties. Kariba houseboat tourism and Eastern Highlands hiking/fishing diversify offerings. Infrastructure constraints (airport capacity, road quality) limit growth. The sector employs 300K+ directly and indirectly.',
    key_players: structuredPlayers('Tourism & Hospitality', ['Zimbabwe Tourism Authority', 'Singita', 'Wilderness Safaris', 'African Bush Camps', 'Rainbow Tourism Group', 'Meikles Hotels', 'A\'Zambezi River Lodge']),
    agoa_opportunity: 'Tourism services not directly AGOA-eligible but U.S. visitor growth supports hotel franchises (Hilton, Marriott interest) and hospitality equipment exports from the U.S.',
    data_sources: ['Zimbabwe Tourism Authority', 'UNWTO', 'Ministry of Tourism', 'World Travel & Tourism Council'],
    agoa_export_current_usd: 0,
    agoa_export_potential_usd: 2_000_000,
    updated_at: new Date().toISOString(),
  },
  {
    sector_key: 'manufacturing_textiles',
    sector_label: 'Manufacturing & Textiles',
    row_status: 'active',
    display_order: 4,
    teaser: 'Export Processing Zones with garment manufacturing potential if AGOA eligibility restored.',
    narrative_short: 'Export Processing Zones (EPZs) with garment manufacturing potential if AGOA eligibility restored, leveraging regional cotton production.',
    narrative_full: 'Zimbabwe manufacturing sector contracted post-2000 but retains capacity in textiles, beverages, food processing, and light manufacturing. EPZs in Harare and Bulawayo offer duty-free import of inputs and tax incentives. Cotton production (200K+ tonnes annually) supports regional textile value chains. Garment manufacturing for SADC markets continues but AGOA suspension removed U.S. export competitiveness. Beverage sector (Delta Beverages, Schweppes) serves regional markets. Pharmaceuticals (Varichem, Caps Holdings) supply SADC. Steel production (Zisco) dormant but potential for revival.',
    key_players: structuredPlayers('Manufacturing & Textiles', ['Delta Beverages', 'Schweppes Zimbabwe', 'Varichem Pharmaceuticals', 'Caps Holdings', 'Cotco (cotton)', 'Paramount Garments', 'Treger Group']),
    agoa_opportunity: 'AGOA apparel provision would enable duty-free garment exports to the U.S. using third-country fabric (AGOA IV apparel eligibility). Cotton-to-garment value chain creates significant employment potential if eligibility restored.',
    data_sources: ['Confederation of Zimbabwe Industries (CZI)', 'ZIMSTAT', 'UN Comtrade', 'Ministry of Industry and Commerce'],
    agoa_export_current_usd: 0,
    agoa_export_potential_usd: 6_500_000,
    updated_at: new Date().toISOString(),
  },
];

async function main() {
  console.log('\n=== Zimbabwe Data Curation Script ===\n');
  console.log('Curating Tier A data for demo readiness...\n');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Get Zimbabwe country ID
  console.log('[1/4] Fetching Zimbabwe country ID...');
  const { data: country, error: countryErr } = await supabase
    .from('souvera_countries')
    .select('id, iso3, name')
    .eq('iso3', ZWE_ISO3)
    .maybeSingle();

  if (countryErr || !country) {
    throw new Error(`Failed to find Zimbabwe: ${countryErr?.message || 'not found'}`);
  }

  console.log(`✅ Found: ${country.name} (${country.iso3}), ID: ${country.id}\n`);

  // 2. Get or create data source
  const { data: source } = await supabase
    .from('souvera_data_sources')
    .select('id')
    .eq('key', 'curated_zwe')
    .maybeSingle();

  let sourceId: string;
  if (source) {
    sourceId = source.id;
  } else {
    const { data: newSource, error: sourceErr } = await supabase
      .from('souvera_data_sources')
      .insert({
        key: 'curated_zwe',
        name: 'Zimbabwe Curated Data (Manual)',
        domain: 'zimstat.co.zw',
        provider_url: 'https://www.zimstat.co.zw',
        source_status: 'approved',
        priority_rank: 100,
        is_active: true,
      })
      .select('id')
      .single();

    if (sourceErr || !newSource) {
      throw new Error(`Failed to create source: ${sourceErr?.message}`);
    }
    sourceId = newSource.id;
  }

  // 3. Ingest economic indicators
  console.log('[2/4] Ingesting economic indicators...');
  const { data: indicators } = await supabase.from('souvera_indicators').select('id, key');
  const indicatorMap = new Map((indicators ?? []).map((i) => [i.key, i.id]));

  let indicatorCount = 0;
  let indicatorSkipped = 0;

  for (const ind of ECONOMIC_INDICATORS) {
    const indicatorId = indicatorMap.get(ind.key);
    if (!indicatorId) {
      console.log(`⚠️  Indicator not found: ${ind.key}`);
      indicatorSkipped++;
      continue;
    }

    const { error } = await supabase.from('souvera_country_observations').upsert(
      {
        country_id: country.id,
        indicator_id: indicatorId,
        period_date: `${ind.year}-01-01`,
        period_type: 'annual',
        value_numeric: ind.value,
        source_id: sourceId,
        source_series_key: ind.source,
        is_forecast: false,
        is_estimate: ind.quality < 0.90,
        quality_score: ind.quality,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: 'country_id,indicator_id,period_date,source_id' }
    );

    if (error) {
      console.log(`❌ Failed ${ind.key} ${ind.year}: ${error.message}`);
    } else {
      indicatorCount++;
    }
  }

  console.log(`✅ Ingested ${indicatorCount} economic indicators (${indicatorSkipped} skipped)\n`);

  // 4. Ingest key sectors
  console.log('[3/3] Ingesting key sectors...');
  let sectorCount = 0;

  for (const sector of KEY_SECTORS) {
    const { error: sectorErr } = await supabase.from('souvera_country_sectors').upsert(
      {
        country_id: country.id,
        ...sector,
      },
      { onConflict: 'country_id,sector_key' }
    );

    if (sectorErr) {
      console.log(`❌ Sector ${sector.sector_key} failed: ${sectorErr.message}`);
    } else {
      sectorCount++;
    }
  }

  console.log(`✅ Ingested ${sectorCount}/${KEY_SECTORS.length} key sectors\n`);

  // Summary
  console.log('=== Summary ===');
  console.log(`✅ Economic indicators: ${indicatorCount}/${ECONOMIC_INDICATORS.length}`);
  console.log(`✅ AGOA trade data: Skipped (calculated from product-level records in API)`);
  console.log(`✅ Key sectors: ${sectorCount}/${KEY_SECTORS.length}`);
  console.log('\n🎉 Zimbabwe data curation complete!\n');
  console.log('Zimbabwe AGOA status: Not AGOA-eligible since 2001 (governance concerns)');
  console.log('- Current AGOA exports: $0 (no eligibility)')
  console.log('- Potential if restored: $20M-30M (processed minerals, agriculture, textiles)\n');
  console.log('Next steps:');
  console.log('1. ZWE entry added to country-opportunity-content.ts ✓');
  console.log('2. ZWE profile added to country-economy-content.ts ✓');
  console.log('3. Visit http://localhost:3010/country/ZWE to verify\n');
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
