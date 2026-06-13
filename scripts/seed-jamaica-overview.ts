/**
 * Seed Jamaica Overview Content — Caribbean template aligned with Nigeria.
 * Run: npx tsx scripts/seed-jamaica-overview.ts
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

const JAMAICA_OVERVIEW = {
  summary_md: `Jamaica is the Caribbean's third-largest English-speaking economy and a regional digital gateway, with GDP of approximately $19 billion (2025) and a population of 2.8 million. The economy is driven by tourism, bauxite mining, agriculture, and an emerging digital services sector.

Kingston serves as the financial and technology hub of the English-speaking Caribbean, with growing fintech adoption, submarine cable connectivity, and government digital transformation initiatives. Tourism contributes roughly 30% of GDP, while remittance inflows exceed $3.5 billion annually, providing macro stability and consumer spending support.

Jamaica benefits from preferential U.S. market access through CARICOM and Caribbean Basin Initiative (CBI) arrangements. The Jam-Dex CBDC pilot and submarine cable landing stations position Jamaica as the Caribbean's leading nearshore digital hub for North American firms seeking English-speaking, US time-zone aligned operations.`,

  why_now_md: `Jamaica is positioned as the Caribbean's digital infrastructure gateway, with three converging opportunities supporting a strategic 24-36 month entry window:

- **Digital Infrastructure:** Submarine cable connectivity, data center investment, and e-government modernization create a regional hub opportunity with **English-speaking Caribbean leadership** in cloud readiness. Fintech interoperability via the Jam-Dex CBDC pilot and growing BPO capacity support a $500M+ digital services expansion thesis.

- **Tourism Recovery:** Post-pandemic tourism rebound with luxury and eco-tourism segments expanding. Arrivals recovering toward pre-pandemic peaks with **15%+ higher average spend** per visitor versus 2019, driven by high-end resort investment and sustainable tourism diversification.

- **Nearshoring:** English-speaking workforce and US time-zone alignment attract BPO and tech services investment. Kingston emerging as a nearshore delivery hub for North American firms, with labor cost advantages of **30-40%** versus US metro markets and improving fiber connectivity.

**Investment Window:** Jamaica offers a 24-36 month positioning window as digital infrastructure scales and tourism diversification accelerates. Institutional investors entering now capture regional gateway economics before valuations reflect Jamaica's emerging role as the Caribbean's tech and services hub.`,

  opportunity_thesis_md: `Jamaica represents a $19 billion Caribbean economy at a digital inflection point, offering multi-sector investment opportunities across tourism, digital infrastructure, and mining/energy transition.

**PILLAR 1: Digital Infrastructure & Fintech**
Caribbean digital gateway with submarine cable landing stations, growing cloud readiness, and fintech interoperability (Jam-Dex CBDC pilot). Key opportunities:
- Data center and cloud edge investment
- BPO and tech services nearshoring
- Fintech rails and cross-border payments

**PILLAR 2: Tourism & Hospitality**
World-renowned destination with luxury segment growth, cruise port expansion, and sustainable tourism investment. Tourism recovery driving **15%+** RevPAR growth in premium segments.

**PILLAR 3: Mining & Energy Transition**
Bauxite/alumina sector transitioning to renewable energy and green hydrogen potential. Energy diversification reducing import dependence and supporting ESG-aligned industrial investment.

**Regional Advantages:**
- CARICOM market access (15 member states)
- CBI preferential U.S. trade access
- English-speaking workforce with US time-zone alignment
- Strong diaspora remittance flows ($3.5B+ annually)`,

  risk_narrative_md: `Jamaica's investment landscape requires balanced assessment of macro, political, and operational risks:

**MACRO RISKS**
*Currency Volatility (MODERATE):* JMD exchange rate volatility persists; IMF program anchors fiscal discipline. Mitigation through USD-linked revenue streams in tourism and remittances.

*Debt Sustainability (MODERATE):* Debt-to-GDP elevated but improving under IMF Extended Fund Facility. Fiscal reforms targeting primary surplus maintenance.

**POLITICAL RISKS**
*Governance & Stability (LOW-MODERATE):* Stable democracy, peaceful transitions, low geopolitical risk relative to region. Policy continuity on digital transformation and tourism investment.

**OPERATIONAL RISKS**
*Hurricane Exposure (MODERATE):* Seasonal hurricane risk to tourism and infrastructure. Mitigation through insurance, resilient building codes, and diversified economic base.

*Infrastructure Gaps (MODERATE):* Rural connectivity and grid reliability variable outside Kingston corridor. Mitigation through PPP models and renewable self-generation.

**SECTOR RISKS**
*Tourism Concentration:* Over-reliance on tourism cyclicality; diversification into digital services and mining mitigates.`,

  signal_level: 'emerging' as const,
};

async function main() {
  console.log('🚀 Seeding Jamaica Overview Content...\n');

  validateCountryAnalysisMd(JAMAICA_OVERVIEW.why_now_md, 'Jamaica');

  const { data: country, error: countryError } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', 'JAM')
    .maybeSingle();

  if (countryError || !country) {
    console.error('❌ Jamaica (JAM) not found in souvera_countries. Add country record first.');
    process.exit(1);
  }

  console.log(`✅ Found ${country.name}: ${country.id}\n`);

  const { error: upsertError } = await supabase.from('souvera_country_profiles').upsert(
    {
      country_id: country.id,
      summary_md: JAMAICA_OVERVIEW.summary_md,
      why_now_md: JAMAICA_OVERVIEW.why_now_md,
      opportunity_thesis_md: JAMAICA_OVERVIEW.opportunity_thesis_md,
      risk_narrative_md: JAMAICA_OVERVIEW.risk_narrative_md,
      signal_level: JAMAICA_OVERVIEW.signal_level,
      economic_momentum: '28',
      investor_readiness: '68',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'country_id' }
  );

  if (upsertError) {
    console.error('❌ Error upserting profile:', upsertError.message);
    process.exit(1);
  }

  console.log('✅ Successfully seeded Jamaica overview content');
  console.log('   - Summary (3 paragraphs)');
  console.log('   - Souvera Country Analysis (3 pillars + Investment Window)');
  console.log('   - Opportunity Thesis (3 pillars)');
  console.log('   - Risk Narrative');
  console.log('   - Signal Level: emerging\n');
}

main()
  .then(() => {
    console.log('✅ Done! Overview tab should display aligned Country Analysis for Jamaica.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
