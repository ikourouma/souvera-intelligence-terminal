/** Quick parser smoke test — run: npx tsx scripts/test-narrative-parser.ts */
import { parseOpportunityThesis, parseRiskNarrative } from '../src/lib/reports/report-narrative-parser';

const oppSample = `Nigeria represents a $575 billion economy at a structural inflection point, offering multi-sector investment opportunities across technology, agriculture, infrastructure, and financial services. The investment thesis is anchored in three core pillars: **PILLAR 1: Technology Sector Leadership** Nigeria's technology ecosystem has reached critical mass, with Lagos emerging as Africa's leading tech hub. The fintech sector alone processed $40 billion in transactions in 2025, with mobile money penetration exceeding 60% of adults. Key opportunities: - Fintech infrastructure: Payment gateways, lending platforms, digital banking - AgriTech: Supply chain digitization **PILLAR 2: Agricultural Value-Add Processing** Nigeria is Africa's largest agricultural producer but imports $10 billion in processed food annually. **Investment Entry Points:** - Joint ventures with Nigerian conglomerates (Dangote, BUA, Flour Mills) - Private equity in mid-market tech companies **Regional Advantages:** - ECOWAS market access (350M people) - AfCFTA: Duty-free access to 1.3B African consumers`;

const riskSample = `Nigeria's investment landscape requires a balanced assessment of macro, political, and operational risks: **MACRO RISKS** *Currency Volatility (MODERATE):* The naira depreciated significantly post-2023 unification. Currency risk is mitigated through: - Hedging instruments available via Nigerian banks - Revenue generation in hard currency *Inflation (MODERATE-HIGH):* At 18.2% (2025), inflation remains elevated. **POLITICAL RISKS** *Governance & Stability (MODERATE):* Nigeria's democracy is mature but challenges persist. **MITIGATION SUMMARY** Risks are real but manageable through phased capital deployment.`;

const opp = parseOpportunityThesis(oppSample);
const risk = parseRiskNarrative(riskSample);

console.log('Opportunity pillars:', opp?.pillars.length, opp?.pillars.map((p) => p.title));
console.log('Entry points:', opp?.entryPoints.length);
console.log('Regional:', opp?.regionalAdvantages.length);
console.log('Risk categories:', risk?.categories.map((c) => `${c.title} (${c.items.length} items)`));
