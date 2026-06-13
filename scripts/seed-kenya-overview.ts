/**
 * Seed Kenya Overview Content — East Africa template aligned with NGA/JAM pilots.
 * Run: npx tsx scripts/seed-kenya-overview.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { validateCountryAnalysisMd } from './lib/country-analysis-template';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const KENYA_OVERVIEW = {
  summary_md: `Kenya is East Africa's largest economy and the continent's mobile money pioneer, with GDP of approximately $115 billion (2025) and a population of 56 million. Nairobi anchors a dense fintech cluster built on M-Pesa's foundational infrastructure, while Mombasa serves as the region's primary trade gateway.

The economy combines services-led growth, diversified agriculture exports (tea, coffee, horticulture), and a rapidly expanding renewable energy base dominated by geothermal, wind, and solar generation. Kenya derives over 90% of grid electricity from renewables, positioning it as East Africa's cleanest power producer.

Kenya is AGOA-eligible with duty-free access to U.S. markets for qualifying exports, and leads East African Community (EAC) integration as the logistics hub for Uganda, Rwanda, Burundi, South Sudan, and eastern DRC. The Standard Gauge Railway (SGR) and Northern Corridor upgrades are reducing inland transit costs and reinforcing Nairobi's role as a regional distribution center.`,

  why_now_md: `Kenya is at an East Africa inflection point, with three converging opportunities supporting a strategic 24-36 month entry window:

- **Fintech Scale:** M-Pesa and licensed digital lenders have created the world's most advanced mobile money ecosystem outside China. Cross-border payment interoperability across EAC markets, open banking pilots, and BaaS platforms are opening a **$2B+** regional fintech expansion corridor from Nairobi.

- **Clean Energy Leadership:** Geothermal baseload from the Rift Valley, Lake Turkana wind, and utility-scale solar create one of Africa's most attractive renewable IPP environments. Power Purchase Agreement frameworks and off-grid solar models support rural electrification and industrial load growth.

- **Logistics Gateway:** Mombasa port and SGR inland connectivity anchor East Africa trade flows. Northern Corridor efficiency gains and warehousing investment in Nairobi support re-export and AfCFTA value-chain positioning.

**Investment Window:** Kenya offers a 24-36 month positioning window as fintech rails mature, renewable capacity scales, and logistics infrastructure upgrades reduce regional trade friction. Institutional allocators entering now capture East Africa gateway economics before valuations reflect Kenya's role as the continent's digital finance and trade hub.`,

  opportunity_thesis_md: `Kenya represents a $115 billion East African economy at a digital and infrastructure inflection point, offering multi-sector investment opportunities across fintech, renewables, agriculture, and logistics.

**PILLAR 1: Fintech & Digital Finance**
World-leading mobile money infrastructure with M-Pesa processing billions of transactions annually. Key opportunities:
- Cross-border payments and EAC interoperability
- Digital lending, insurtech, and SME finance platforms
- BaaS and embedded finance for regional expansion

**PILLAR 2: Renewables & Energy Access**
Geothermal, wind, and solar dominate generation mix. Investment entry points include utility-scale IPPs, mini-grids, and commercial solar for agro-processing and cold chain.

**PILLAR 3: Agriculture & Agribusiness**
Tea, coffee, and horticulture exports to European markets via JKIA air cargo. Agritech platforms, cold chain, and smallholder aggregation improve yield and market access.

**PILLAR 4: Logistics & Trade Gateway**
Mombasa port throughput and SGR corridor support regional re-export models under EAC and AfCFTA frameworks.

**Regional Advantages:**
- AGOA-eligible duty-free U.S. market access
- EAC single market (300M+ consumers)
- AfCFTA continental trade integration
- English-speaking workforce and innovation ecosystem in Nairobi`,

  risk_narrative_md: `Kenya's investment landscape requires balanced assessment of macro, political, and operational risks:

**MACRO RISKS**
*Currency Volatility (MODERATE):* KES depreciation cycles persist; CBK intervention and forex reserves provide anchors. Mitigation through USD-linked export revenues in horticulture and tourism.

*Fiscal Pressure (MODERATE):* Debt-to-GDP elevated but IMF program supports fiscal consolidation. Revenue mobilization and expenditure discipline remain policy priorities.

**POLITICAL RISKS**
*Governance & Stability (LOW-MODERATE):* Stable democracy with peaceful transitions. Policy continuity on digital finance regulation and infrastructure investment.

**OPERATIONAL RISKS**
*Climate & Agriculture (MODERATE):* Drought cycles affect agricultural output and hydropower. Mitigation through irrigation expansion and diversified generation mix.

*Infrastructure Bottlenecks (MODERATE):* Port congestion and last-mile grid constraints outside Nairobi corridor. Mitigation through PPP port upgrades and transmission investments.

**SECTOR RISKS**
*Fintech Regulation:* Lending caps and consumer protection rules periodically adjust sector economics; licensed operators with strong compliance frameworks are best positioned.`,

  signal_level: 'high_growth' as const,
};

async function main() {
  console.log('🚀 Seeding Kenya Overview Content...\n');

  validateCountryAnalysisMd(KENYA_OVERVIEW.why_now_md, 'Kenya');

  const { data: country, error: countryError } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', 'KEN')
    .maybeSingle();

  if (countryError || !country) {
    console.error('❌ Kenya (KEN) not found in souvera_countries. Add country record first.');
    process.exit(1);
  }

  console.log(`✅ Found ${country.name}: ${country.id}\n`);

  const { error: upsertError } = await supabase.from('souvera_country_profiles').upsert(
    {
      country_id: country.id,
      summary_md: KENYA_OVERVIEW.summary_md,
      why_now_md: KENYA_OVERVIEW.why_now_md,
      opportunity_thesis_md: KENYA_OVERVIEW.opportunity_thesis_md,
      risk_narrative_md: KENYA_OVERVIEW.risk_narrative_md,
      signal_level: KENYA_OVERVIEW.signal_level,
      economic_momentum: '42',
      investor_readiness: '72',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'country_id' }
  );

  if (upsertError) {
    console.error('❌ Error upserting profile:', upsertError.message);
    process.exit(1);
  }

  console.log('✅ Successfully seeded Kenya overview content');
  console.log('   - Summary (3 paragraphs)');
  console.log('   - Souvera Country Analysis (3 pillars + Investment Window)');
  console.log('   - Opportunity Thesis (4 pillars)');
  console.log('   - Risk Narrative');
  console.log('   - Signal Level: high_growth\n');
}

main()
  .then(() => {
    console.log('✅ Done! Overview tab should display aligned Country Analysis for Kenya.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
