/**
 * Seed Nigeria Overview Content
 * Populates souvera_country_profiles with summary_md and why_now_md
 * Run: npx tsx scripts/seed-nigeria-overview.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { validateCountryAnalysisMd } from './lib/country-analysis-template';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const NIGERIA_OVERVIEW = {
  summary_md: `Nigeria is Africa's largest economy with a GDP of $575 billion (2025) and a population exceeding 220 million people. The country has emerged as West Africa's dominant economic power and the continent's leading technology hub, with Lagos serving as the financial capital of the region.

Following the 2023 currency reforms under President Bola Tinubu's administration, Nigeria entered a sustained growth phase, achieving 6.2% GDP expansion in 2025—the strongest performance in over a decade. The economy is increasingly diversified, with the technology sector now contributing 18% of GDP, driven by fintech innovation, digital payments, and e-commerce platforms.

Foreign Direct Investment has surged to record levels ($5.1 billion in 2025), reflecting renewed international confidence in Nigeria's economic trajectory. Key growth sectors include technology & telecommunications, agriculture value-add processing, financial services, and infrastructure development. The country benefits from its position as West Africa's gateway market, with preferential access to both the African Continental Free Trade Area (AfCFTA) and U.S. markets through AGOA eligibility.

Despite challenges including elevated inflation (18.2% in 2025, down from 24.5% peak) and currency volatility, Nigeria's fundamentals remain strong. The Central Bank of Nigeria has successfully stabilized the naira through a managed float policy, while government reforms in VAT collection and debt management have improved fiscal sustainability.`,

  why_now_md: `Nigeria is at a critical inflection point. The post-reform stabilization period (2024-2025) has created a rare window of opportunity for strategic investment, supported by three converging factors:

- **Economic Momentum:** Six consecutive quarters of accelerating growth (2024-2025), driven by technology sector expansion (+15% YoY) and agricultural modernization. GDP growth of 6.2% in 2025 signals a structural shift toward sustained high performance.

- **Policy Stability:** The Tinubu administration's economic reforms—currency unification, fuel subsidy removal, and tax reforms—have **passed the volatility phase**. Markets have adjusted, and policy continuity through 2027 is highly probable given broad political support.

- **Demographic Dividend:** Nigeria's youth bulge (median age 19.7 years) is maturing into a tech-savvy consumer class. Mobile internet penetration exceeds 75%, and digital payment adoption is accelerating at 35% annually. This creates unprecedented opportunities in fintech, e-commerce, and digital services.

**Investment Window:** The combination of economic momentum, policy stability, and demographic tailwinds creates a 24-36 month window for early-stage positioning before valuations adjust to reflect Nigeria's emerging status as Africa's next growth tiger. Institutional investors who enter now—while inflation is declining and FDI is still ramping—stand to capture outsized returns as the market matures.`,

  opportunity_thesis_md: `Nigeria represents a $575 billion economy at a structural inflection point, offering multi-sector investment opportunities across technology, agriculture, infrastructure, and financial services. The investment thesis is anchored in three core pillars:

**PILLAR 1: Technology Sector Leadership**
Nigeria's technology ecosystem has reached critical mass, with Lagos emerging as Africa's leading tech hub. The fintech sector alone processed $40 billion in transactions in 2025, with mobile money penetration exceeding 60% of adults. Key opportunities:
- Fintech infrastructure: Payment gateways, lending platforms, digital banking
- AgriTech: Supply chain digitization, farmer financing, logistics optimization
- EdTech: Online learning platforms serving 45 million school-age population
- E-commerce: Last-mile delivery, warehousing, B2B marketplaces

**PILLAR 2: Agricultural Value-Add Processing**
Nigeria is Africa's largest agricultural producer but imports $10 billion in processed food annually. Investment opportunities in:
- Cassava processing (Nigeria produces 60M tons/year, exports minimal value-add)
- Cocoa value chain (3rd largest producer, 70% exported raw)
- Rice milling (closing $2B import gap)
- Cold chain infrastructure (95% of post-harvest losses are preventable)

**PILLAR 3: Infrastructure Development**
$15 billion infrastructure pipeline (2025-2028) in:
- Power generation & distribution (targeting 25GW by 2030)
- Port modernization (Lekki Deep Sea Port Phase 2)
- Road & rail (Lagos-Kano standard gauge railway)
- Housing (20M unit deficit, urbanization at 3.5%/year)

**Investment Entry Points:**
- Joint ventures with Nigerian conglomerates (Dangote, BUA, Flour Mills)
- Private equity in mid-market tech companies (Series B-C stage)
- Greenfield projects in Special Economic Zones (tax holidays, repatriation guarantees)
- Listed equities via Nigerian Stock Exchange (NSE) for liquidity

**Regional Advantages:**
- ECOWAS market access (350M people)
- AfCFTA: Duty-free access to 1.3B African consumers
- AGOA restoration opportunity: Suspended since 2015; if restored, duty-free U.S. access unlocks significant export potential
- Skilled workforce: 200,000+ university graduates annually, English-speaking`,

  risk_narrative_md: `Nigeria's investment landscape requires a balanced assessment of macro, political, and operational risks, contextualized by structural reforms and mitigation frameworks:

**MACRO RISKS**

*Currency Volatility (MODERATE):* The naira depreciated significantly post-2023 unification (461 → 1,450 NGN/USD by 2025), but volatility has stabilized since Q4 2024. The Central Bank of Nigeria maintains a managed float with $37 billion in reserves (6 months import cover). Currency risk is mitigated through:
- Hedging instruments available via Nigerian banks
- Revenue generation in hard currency (exports, diaspora remittances)
- Natural hedges for import-substitution sectors

*Inflation (MODERATE-HIGH):* At 18.2% (2025), inflation remains elevated but declining from 24.5% peak (2023). Drivers include food insecurity (agricultural supply shocks) and imported inflation. Mitigation:
- CBN monetary tightening (interest rates at 18.5%)
- Government agricultural reforms (mechanization, security in farming regions)
- Price controls on essential commodities (limited effectiveness)

*Debt Sustainability (LOW-MODERATE):* Debt-to-GDP at 42.1% (2025) remains below IMF's 55% emerging market threshold. External debt service costs are 11% of exports (manageable). Fiscal reforms (VAT expansion, tax compliance) improving revenue generation.

**POLITICAL RISKS**

*Governance & Stability (MODERATE):* Nigeria's democracy is mature (25 years, 7 peaceful transitions), but challenges persist:
- 2027 presidential election: Watchpoint for policy continuity (Tinubu administration reforms)
- Security issues: Boko Haram (Northeast), banditry (Northwest), secessionist movements (Southeast)
- Corruption perception: Improving but still ranked 145/180 (Transparency International)

Mitigating factors:
- Strong institutions: Central Bank independence, independent judiciary
- Private sector resilience: Nigerian companies have operated through volatility cycles
- International oversight: IMF engagement, World Bank programs

**SECTOR-SPECIFIC RISKS**

*Agriculture:* Climate vulnerability (droughts, floods), insurgency in farming regions, land tenure disputes. Mitigation: Crop insurance, irrigation infrastructure investment.

*Technology:* Regulatory uncertainty (data protection, fintech licensing), infrastructure gaps (power, internet). Mitigation: Regulatory sandboxes, self-generation (solar).

*Infrastructure:* Execution risk (project delays, cost overruns), political interference. Mitigation: PPP structures with international partners, escrow accounts.

**OPERATIONAL RISKS**

*Power Supply:* Grid instability requires self-generation (diesel/solar), adding 15-25% to operating costs. Lagos/Abuja grids more reliable than national grid.

*Logistics:* Port congestion (10-14 days clearance), road quality variable. Lagos-Abuja corridor is well-maintained.

*Talent Retention:* Brain drain to Europe/U.S./Canada. Competitive salaries and equity participation can retain key staff.

**MITIGATION SUMMARY**
Risks are real but manageable through:
1. Local partnerships with established conglomerates
2. Insurance products (political risk, currency, credit)
3. Revenue diversification (domestic + export markets)
4. Phased capital deployment (de-risk through pilot phases)

Nigeria's risk-adjusted returns remain compelling for investors with 5-7 year horizons and operational flexibility.`,

  signal_level: 'high_growth'
};

async function main() {
  console.log('🚀 Seeding Nigeria Overview Content...\n');

  validateCountryAnalysisMd(NIGERIA_OVERVIEW.why_now_md, 'Nigeria');

  // Get Nigeria country ID
  const { data: country, error: countryError } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', 'NGA')
    .single();

  if (countryError || !country) {
    console.error('❌ Nigeria not found');
    process.exit(1);
  }

  console.log(`✅ Found ${country.name}: ${country.id}\n`);

  // Upsert country profile
  const { error: upsertError } = await supabase
    .from('souvera_country_profiles')
    .upsert({
      country_id: country.id,
      summary_md: NIGERIA_OVERVIEW.summary_md,
      why_now_md: NIGERIA_OVERVIEW.why_now_md,
      opportunity_thesis_md: NIGERIA_OVERVIEW.opportunity_thesis_md,
      risk_narrative_md: NIGERIA_OVERVIEW.risk_narrative_md,
      signal_level: NIGERIA_OVERVIEW.signal_level,
      economic_momentum: '55',
      investor_readiness: '74',
    }, {
      onConflict: 'country_id'
    });

  if (upsertError) {
    console.error('❌ Error upserting profile:', upsertError);
    process.exit(1);
  }

  console.log('✅ Successfully seeded Nigeria overview content');
  console.log('   - Summary (4 paragraphs)');
  console.log('   - Souvera Country Analysis (3 pillars + Investment Window)');
  console.log('   - Opportunity Thesis (3 pillars)');
  console.log('   - Risk Narrative (macro, political, sector, operational)');
  console.log('   - Signal Level: high_growth\n');

  // Verify
  const { data: verification } = await supabase
    .from('souvera_country_profiles')
    .select('country_id, signal_level')
    .eq('country_id', country.id)
    .single();

  if (verification) {
    console.log('✅ Verification: Profile exists in database');
  }
}

main()
  .then(() => {
    console.log('\n✅ Done! Overview tab should now display content for Nigeria.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
