# Souvera Intelligence Terminal: Fortune-5 Readiness Audit

**Audit Date:** April 28, 2026  
**Auditor:** Senior Architecture & Audit Lead  
**Platform:** Souvera Intelligence Terminal  
**Live Site:** https://souvera.vercel.app/  
**Repository:** `apps/api-gateway` (Next.js 16.2.4, React 19.2.4)

---

## 1. Executive Summary

### Overall Readiness Score: 4.2 / 10

### Current Maturity Stage: **Early MVP / Marketing Shell**

The Souvera Intelligence Terminal presents a visually compelling dark terminal aesthetic with strong brand positioning language. However, the platform is **not safe for executive demo** in its current state due to critical infrastructure gaps, broken navigation, unverified claims, and missing core functionality.

### Strongest Assets

1. **Premium Visual Identity** - Dark terminal aesthetic is sophisticated and differentiating
2. **Clear Value Proposition** - "Africa & Caribbean Decision Engine" positioning is strong
3. **Comprehensive Navigation Architecture** - Mega menu structure is well-designed conceptually
4. **Institutional Tone** - Copy reads as executive-grade when claims are supportable
5. **Modular Component Architecture** - Clean React/Next.js structure enables rapid iteration

### Highest Risks

| Risk | Severity | Impact |
|------|----------|--------|
| 26+ broken navigation links leading to 404 | CRITICAL | Immediate credibility loss during demo |
| Unverified accuracy/performance claims | CRITICAL | Legal/reputational liability |
| Zero per-page SEO metadata | HIGH | Zero organic discoverability |
| AfDEC tight coupling throughout | HIGH | Brand confusion, dependency risk |
| Forms non-functional (no submission) | HIGH | Zero lead capture capability |
| No XML sitemap or robots.txt | MEDIUM | Search engine indexing issues |
| Missing subscription/pricing system | MEDIUM | No conversion path |

### Executive Demo Safety: **NO - NOT SAFE**

**Blocking Issues for Demo:**
- Clicking "Access Terminal" leads to 404
- Clicking "View Subscriptions" leads to 404
- Footer links broken (10+ destinations missing)
- Claims like "99.8% Accuracy" have no backing
- Contact form does not submit
- Login form does not authenticate

---

## 2. Route Inventory Table

### Existing Routes (30 pages)

| Route | Exists | Page Type | Quality Score | Recommended Action | Priority |
|-------|--------|-----------|---------------|-------------------|----------|
| `/` | YES | Marketing Landing | 6/10 | Fix broken CTAs, verify claims | P0 |
| `/about` | YES | Institutional | 5/10 | Remove placeholder board members, verify analyst count | P1 |
| `/africa-command-center` | YES | Presentation Brief | 6/10 | Verify "1,200+ data nodes" claim | P1 |
| `/api-documentation` | YES | Presentation Brief | 4/10 | Replace with actual API docs or "Coming Soon" | P1 |
| `/caribbean-command-center` | YES | Presentation Brief | 6/10 | Verify "240+ trade nodes" claim | P1 |
| `/careers` | YES | Placeholder | 3/10 | Add real job listings or remove route | P2 |
| `/compliance-hub` | YES | Legal/Governance | 5/10 | Verify GDPR/Malabo compliance claims | P1 |
| `/contact` | YES | Lead Capture | 4/10 | Wire form submission to backend | P0 |
| `/Data-Sources-&-Methodology` | YES | Institutional | 5/10 | Rename URL (remove &), verify source claims | P1 |
| `/faqs` | YES | Support | 5/10 | Review AfDEC references, verify claims | P1 |
| `/insights` | YES | Content Hub | 4/10 | Add real content or mark "Coming Soon" | P2 |
| `/intelligence-map` | YES | Presentation Brief | 5/10 | Link to actual map or gate access | P1 |
| `/legal` | YES | Legal Hub | 6/10 | Complete, links to sub-pages work | P2 |
| `/legal/accessibility` | YES | Legal | 5/10 | Review for compliance accuracy | P2 |
| `/legal/cookies` | YES | Legal | 5/10 | Standard policy page | P2 |
| `/legal/privacy` | YES | Legal | 5/10 | Standard policy page | P2 |
| `/legal/terms` | YES | Legal | 5/10 | Standard policy page | P2 |
| `/login` | YES | Auth | 4/10 | Wire to Supabase auth, remove "AfDEC Endorsed" | P0 |
| `/methodology` | YES | Institutional | 5/10 | Verify "99.2% correlation" claim | P1 |
| `/press-&-media` | YES | Press | 3/10 | Rename URL, add real press content | P2 |
| `/register` | YES | Auth | 4/10 | Wire to Supabase auth | P0 |
| `/sector-intelligence` | YES | Presentation Brief | 5/10 | Verify "98.5% accuracy" claim | P1 |
| `/sector/[sector]` | YES | Dynamic Sector | 6/10 | Works for defined sectors via corporate-service | P1 |
| `/signal-engine` | YES | Presentation Brief | 5/10 | Verify "94.2% predictive accuracy" claim | P1 |
| `/sitemap` | YES | Navigation | 4/10 | Fix broken links in sitemap, add XML sitemap | P1 |
| `/solutions` | YES | Enterprise | 5/10 | Verify "most robust pipeline" claim | P1 |
| `/source-registry` | YES | Data Transparency | 6/10 | Good page, verify latency figures | P1 |
| `/status` | YES | System Status | 3/10 | Wire to actual monitoring or remove | P2 |
| `/terminal/caribbean` | YES | Terminal UI | 5/10 | Map component present, needs data integration | P1 |
| `/terminal/map` | YES | Terminal UI | 6/10 | Map interactive, uses mock data | P1 |

### Missing Routes Referenced in Navigation (26 broken links)

| Missing Route | Referenced From | Required Action | Priority |
|---------------|-----------------|-----------------|----------|
| `/subscriptions` | Mega Nav, Footer, Hero, Pricing | Create subscription/pricing page | P0 |
| `/terminal/africa` | Mega Nav (5x), Hero, Footer, Mobile | Create Africa terminal or redirect to `/terminal/map` | P0 |
| `/terminal/africa/map` | Mega Nav | Redirect to `/terminal/map` | P0 |
| `/terminal/africa#signals` | Mega Nav | Create anchor or route | P1 |
| `/terminal/africa#risk` | Mega Nav | Create anchor or route | P1 |
| `/terminal/africa/economies#fdi` | Mega Nav | Create or remove link | P1 |
| `/terminal/sectors` | Hero, Footer, SectorShowcase | Create sectors hub or redirect | P0 |
| `/terminal/economies` | Footer, TopEconomies | Create economies page | P1 |
| `/terminal/caribbean/economies` | Footer, TopEconomies | Create Caribbean economies page | P1 |
| `/terminal` | Footer (Africa Command Center) | Redirect to `/terminal/map` | P0 |
| `/signals` | Footer | Create or redirect to `/signal-engine` | P1 |
| `/data` | Footer | Create data hub or redirect to `/Data-Sources-&-Methodology` | P1 |
| `/data#sources` | Footer | Create anchor | P1 |
| `/data#attribution` | Footer | Create anchor | P1 |
| `/api-docs` | Footer | Redirect to `/api-documentation` | P1 |
| `/pricing` | ProductSuiteSection | Redirect to `/subscriptions` | P1 |
| `/docs/api` | ProductSuiteSection | Redirect to `/api-documentation` | P1 |
| `/terminal/sectors#...` | SectorShowcase cards | Create sector anchors | P1 |
| `/terminal/caribbean/sectors#...` | SectorShowcase cards | Create Caribbean sector anchors | P1 |
| `/forgot` | Login page | Create password recovery page | P1 |
| `/compliance/privacy-policy` | Sitemap page | Redirect to `/legal/privacy` | P1 |
| `/compliance/terms-of-service` | Sitemap page | Redirect to `/legal/terms` | P1 |
| `/compliance/cookie-policy` | Sitemap page | Redirect to `/legal/cookies` | P1 |
| `/compliance/accessibility` | Sitemap page | Redirect to `/legal/accessibility` | P1 |
| `/news` | TopNav | Create or remove link | P2 |
| `/events` | TopNav | Create or remove link | P2 |
| `/invest` | TopNav | Create or remove link | P2 |

---

## 3. Mega Menu Audit Table

### SouveraMegaNav - Active Navigation Component

| Menu Group | Label | Current href | Status | Issue | Recommended Label | Recommended href | Destination Required | Priority |
|------------|-------|--------------|--------|-------|-------------------|------------------|---------------------|----------|
| Intelligence | Africa Command Center | `/africa-command-center` | OK | None | Keep | Keep | Exists | - |
| Intelligence | Caribbean Command Center | `/caribbean-command-center` | OK | None | Keep | Keep | Exists | - |
| Intelligence | Intelligence Map Briefing | `/intelligence-map` | OK | None | Keep | Keep | Exists | - |
| Intelligence | Africa Dashboard | `/terminal/africa` | BROKEN | 404 | Africa Terminal | `/terminal/map` | Redirect needed | P0 |
| Intelligence | Caribbean Dashboard | `/terminal/caribbean` | OK | None | Keep | Keep | Exists | - |
| Intelligence | Geospatial Terminal | `/terminal/africa/map` | BROKEN | 404 | Geospatial Terminal | `/terminal/map` | Redirect needed | P0 |
| Sectors | Sector Intelligence Overview | `/sector-intelligence` | OK | None | Keep | Keep | Exists | - |
| Sectors | Energy & Renewables | `/sector/energy-&-renewables` | OK | Dynamic route | Keep | Keep | Works | - |
| Sectors | Mining & Critical Minerals | `/sector/mining-&-critical-minerals` | OK | Dynamic route | Keep | Keep | Works | - |
| Sectors | Fintech & Digital Finance | `/sector/fintech-&-digital-finance` | OK | Dynamic route | Keep | Keep | Works | - |
| Sectors | Tourism & Hospitality | `/sector/tourism-&-hospitality` | OK | Dynamic route | Keep | Keep | Works | - |
| Sectors | Logistics & Trade | `/sector/logistics-&-trade` | OK | Dynamic route | Keep | Keep | Works | - |
| Market Intelligence | Signal Engine Briefing | `/signal-engine` | OK | None | Keep | Keep | Exists | - |
| Market Intelligence | Growth Market Rankings | `/terminal/africa#signals` | BROKEN | 404 | Growth Rankings | `/terminal/map` | Create or redirect | P1 |
| Market Intelligence | Risk Index monitoring | `/terminal/africa#risk` | BROKEN | 404 | Risk Index | `/terminal/map` | Create or redirect | P1 |
| Market Intelligence | Country Intelligence Briefs | `/subscriptions` | BROKEN | 404 | Intelligence Briefs | `/contact` | Create subscriptions page | P0 |
| Market Intelligence | Investor Memos | `/subscriptions` | BROKEN | 404 | Investor Memos | `/contact` | Create subscriptions page | P0 |
| Market Intelligence | FDI Inflow Rankings | `/terminal/africa/economies#fdi` | BROKEN | 404 | FDI Rankings | `/terminal/map` | Create or redirect | P1 |
| Access | Subscription Plans | `/subscriptions` | BROKEN | 404 | Access Plans | Create page | Create subscriptions page | P0 |
| Access | API Documentation | `/api-documentation` | OK | Placeholder content | Keep | Keep | Needs real docs | P1 |
| Access | Enterprise Solutions | `/solutions` | OK | None | Keep | Keep | Exists | - |
| Access | Sign In to Terminal | `/login` | OK | Form not functional | Keep | Keep | Wire auth | P0 |
| Access | Create Free Account | `/login` | ISSUE | Same as Sign In | Create Account | `/register` | Use register route | P1 |
| Access | Request Demo | `/contact` | OK | Form not functional | Keep | Keep | Wire form | P0 |
| Resources | Data Sources & Methodology | `/Data-Sources-&-Methodology` | OK | Bad URL format | Data Sources | `/methodology` | Consolidate or redirect | P1 |
| Resources | Institutional Signal Ledger | `/source-registry` | OK | None | Keep | Keep | Exists | - |
| Resources | About Souvera | `/about` | OK | None | Keep | Keep | Exists | - |
| Resources | Source Registry | `/source-registry` | OK | Duplicate | Remove | - | Duplicate entry | P2 |
| Resources | Methodology | `/Data-Sources-&-Methodology` | OK | Duplicate | Remove | - | Duplicate entry | P2 |
| Resources | Legal Hub | `/legal` | OK | None | Keep | Keep | Exists | - |
| Resources | Sitemap | `/sitemap` | OK | Contains broken links | Keep | Keep | Fix internal links | P1 |
| Header CTA | Access Terminal | `/terminal/africa` | BROKEN | 404 | Access Terminal | `/terminal/map` | Redirect | P0 |
| Header CTA | Sign In | `/login` | OK | Form not functional | Keep | Keep | Wire auth | P0 |
| Mobile | Access Terminal | `/terminal/africa` | BROKEN | 404 | Access Terminal | `/terminal/map` | Redirect | P0 |
| Mobile | Subscriptions | `/subscriptions` | BROKEN | 404 | Plans | Create page | Create subscriptions page | P0 |
| Mobile | Latest Insights | `/insights` | OK | Placeholder content | Keep | Keep | Add content | P2 |
| Mobile | Contact | `/contact` | OK | Form not functional | Keep | Keep | Wire form | P0 |

---

## 4. Footer and CTA Audit Table

### SouveraFooter Links

| Location | Label | Current href | Status | Issue | Recommended Fix | Priority |
|----------|-------|--------------|--------|-------|-----------------|----------|
| Platform | Africa Command Center | `/terminal` | BROKEN | 404 | Change to `/africa-command-center` or `/terminal/map` | P0 |
| Platform | Caribbean Command Center | `/terminal/caribbean` | OK | None | Keep | - |
| Platform | Intelligence Map | `/terminal/map` | OK | None | Keep | - |
| Platform | Sector Intelligence | `/terminal/sectors` | BROKEN | 404 | Change to `/sector-intelligence` | P0 |
| Platform | API Documentation | `/api-docs` | BROKEN | 404 | Change to `/api-documentation` | P0 |
| Intelligence | Top 10 African Economies | `/terminal/economies` | BROKEN | 404 | Create page or link to `/terminal/map` | P1 |
| Intelligence | Top Caribbean Economies | `/terminal/caribbean/economies` | BROKEN | 404 | Create page or link to `/terminal/caribbean` | P1 |
| Intelligence | Signal Engine | `/signals` | BROKEN | 404 | Change to `/signal-engine` | P0 |
| Intelligence | Data Sources | `/data` | BROKEN | 404 | Change to `/Data-Sources-&-Methodology` | P1 |
| Intelligence | Source Registry | `/data#sources` | BROKEN | 404 | Change to `/source-registry` | P1 |
| Access | Explorer - Free | `/subscriptions` | BROKEN | 404 | Create subscriptions page or `/login` | P0 |
| Access | Professional Plan | `/subscriptions` | BROKEN | 404 | Create subscriptions page or `/contact` | P0 |
| Access | Business Plan | `/subscriptions` | BROKEN | 404 | Create subscriptions page or `/contact` | P0 |
| Access | Institutional Plan | `/subscriptions` | BROKEN | 404 | Create subscriptions page or `/contact` | P0 |
| Access | Contact for Demo | `https://afdec-nc.vercel.app/contact` | EXTERNAL | Routes to AfDEC | Change to `/contact` | P0 |
| Company | About Afronovation | `https://www.afronovation.com` | EXTERNAL | OK for parent company | Keep or add Souvera about | P2 |
| Company | AfDEC Partnership | `https://afdec-nc.vercel.app` | EXTERNAL | AfDEC coupling | Consider removing or moving to secondary position | P1 |
| Company | Media & Press | `https://afdec-nc.vercel.app/media` | EXTERNAL | Routes to AfDEC | Create `/press-&-media` content or remove | P1 |
| Company | Careers | `https://afdec-nc.vercel.app/careers` | EXTERNAL | Routes to AfDEC | Link to `/careers` or Afronovation careers | P1 |
| Legal | Privacy Policy | `/legal/privacy` | OK | None | Keep | - |
| Legal | Terms of Service | `/legal/terms` | OK | None | Keep | - |
| Legal | Cookie Policy | `/legal/cookies` | OK | None | Keep | - |
| Legal | Data Attribution | `/data#attribution` | BROKEN | 404 | Create anchor on methodology page | P1 |
| Legal | Compliance | `/legal` | OK | None | Keep | - |
| Social | LinkedIn | `#` | PLACEHOLDER | No real link | Add actual LinkedIn URL | P1 |
| Social | X (Twitter) | `#` | PLACEHOLDER | No real link | Add actual X URL | P1 |
| Copyright | Afronovation, Inc. | `https://www.afronovation.com` | EXTERNAL | OK | Keep | - |

### Homepage and Landing CTAs

| Location | Label | Current href | Status | Issue | Recommended Fix | Priority |
|----------|-------|--------------|--------|-------|-----------------|----------|
| Hero Slide 1 | Access Terminal | `/terminal/africa` | BROKEN | 404 | Change to `/terminal/map` | P0 |
| Hero Slide 1 | View Subscriptions | `/subscriptions` | BROKEN | 404 | Create page or `/contact` | P0 |
| Hero Slide 2 | Explore Africa Command | `/terminal/africa` | BROKEN | 404 | Change to `/terminal/map` | P0 |
| Hero Slide 2 | Caribbean Intelligence | `/terminal/caribbean` | OK | None | Keep | - |
| Hero Slide 3 | Explore Sectors | `/terminal/sectors` | BROKEN | 404 | Change to `/sector-intelligence` | P0 |
| Hero Slide 3 | Request Demo | `https://afdec-nc.vercel.app/contact` | EXTERNAL | Routes to AfDEC | Change to `/contact` | P0 |
| CommandCenters | Open Africa Terminal | `/terminal/africa` | BROKEN | 404 | Change to `/terminal/map` | P0 |
| CommandCenters | Open Caribbean Terminal | `/terminal/caribbean` | OK | None | Keep | - |
| Pricing | Create Free Account | `/login` | OK | Form not functional | Keep, wire auth | P0 |
| Pricing | View Professional Plan | `/subscriptions` | BROKEN | 404 | Create page or `/contact` | P0 |
| Pricing | View Business Plan | `/subscriptions` | BROKEN | 404 | Create page or `/contact` | P0 |
| Pricing | Contact for Demo | `https://afdec-nc.vercel.app/contact` | EXTERNAL | Routes to AfDEC | Change to `/contact` | P0 |
| Pricing | Compare All Plans | `/subscriptions` | BROKEN | 404 | Create page or `/contact` | P0 |
| Newsletter | View All Plans | `/subscriptions` | BROKEN | 404 | Create page or `/contact` | P0 |
| ProductSuite | Compare Access Tiers | `/pricing` | BROKEN | 404 | Change to `/subscriptions` when created | P1 |
| ProductSuite | Explore (Terminal) | `/terminal/africa` | BROKEN | 404 | Change to `/terminal/map` | P0 |
| ProductSuite | Explore (Insights) | `/insights` | OK | Placeholder | Keep, add content | P2 |
| ProductSuite | Explore (API) | `/docs/api` | BROKEN | 404 | Change to `/api-documentation` | P1 |
| ProductSuite | Explore (Contact) | `/contact` | OK | Form not functional | Keep, wire form | P0 |
| TopEconomies | Full Rankings | `/terminal/economies` | BROKEN | 404 | Create page or `/terminal/map` | P1 |
| TopEconomies | Full Caribbean Rankings | `/terminal/caribbean/economies` | BROKEN | 404 | Create page or `/terminal/caribbean` | P1 |
| SectorShowcase | Full Sector Intelligence | `/terminal/sectors` | BROKEN | 404 | Change to `/sector-intelligence` | P0 |
| FlashBanner | Explore Platform | `/subscriptions` | BROKEN | 404 | Create page or `/login` | P1 |

---

## 5. Inner Page Audit Table

| Page | Primary Audience | Current Issues | Content Score | Design Score | SEO Score | Conversion Score | Recommended Rewrite Direction | Priority |
|------|------------------|----------------|---------------|--------------|-----------|------------------|------------------------------|----------|
| `/` (Home) | All | 10+ broken CTAs, unverified hero stats | 6/10 | 8/10 | 3/10 | 2/10 | Fix CTAs, verify claims, add page metadata | P0 |
| `/about` | Institutional | "40+ analysts" unverified, placeholder board photos | 5/10 | 7/10 | 2/10 | 4/10 | Verify analyst count, add real team or remove | P1 |
| `/africa-command-center` | DFI/Investors | "1,200+ data nodes", "99.8% accuracy" unverified | 6/10 | 7/10 | 2/10 | 5/10 | Soften claims, add evidence or methodology links | P1 |
| `/caribbean-command-center` | DFI/Investors | "240+ trade nodes" unverified | 6/10 | 7/10 | 2/10 | 5/10 | Soften claims, add evidence | P1 |
| `/api-documentation` | Developers | No actual API documentation | 3/10 | 6/10 | 2/10 | 2/10 | Add real docs or "Request Access" gate | P1 |
| `/careers` | Job Seekers | Empty placeholder | 2/10 | 5/10 | 1/10 | 1/10 | Add real listings or remove route | P2 |
| `/compliance-hub` | Legal/Compliance | Claims GDPR/AU/CARICOM compliance without proof | 5/10 | 7/10 | 2/10 | 3/10 | Verify compliance status, add certifications | P1 |
| `/contact` | All | Form doesn't submit, no backend | 4/10 | 7/10 | 2/10 | 1/10 | Wire to Supabase or email service | P0 |
| `/Data-Sources-&-Methodology` | Technical/Institutional | URL has special characters, duplicate of `/methodology` | 5/10 | 6/10 | 1/10 | 3/10 | Consolidate with `/methodology`, fix URL | P1 |
| `/faqs` | All | Contains AfDEC references, some claims unverified | 5/10 | 7/10 | 2/10 | 4/10 | Update AfDEC answer, verify "15-minute refresh" | P1 |
| `/insights` | Analysts/Investors | Placeholder content | 3/10 | 6/10 | 2/10 | 2/10 | Add real insights or "Coming Soon" | P2 |
| `/intelligence-map` | Analysts | Presentation page, links to broken terminal | 5/10 | 7/10 | 2/10 | 4/10 | Link to `/terminal/map` correctly | P1 |
| `/legal` | Legal | Hub page, links work | 6/10 | 6/10 | 2/10 | N/A | Add page-specific metadata | P2 |
| `/legal/privacy` | Legal | Standard policy | 5/10 | 5/10 | 2/10 | N/A | Add page-specific metadata | P2 |
| `/legal/terms` | Legal | Standard policy | 5/10 | 5/10 | 2/10 | N/A | Add page-specific metadata | P2 |
| `/legal/cookies` | Legal | Standard policy | 5/10 | 5/10 | 2/10 | N/A | Add page-specific metadata | P2 |
| `/legal/accessibility` | Legal | Accessibility statement | 5/10 | 5/10 | 2/10 | N/A | Verify WCAG compliance claims | P2 |
| `/login` | Users | Form not functional, "AfDEC Endorsed" in footer | 4/10 | 8/10 | 2/10 | 1/10 | Wire auth, remove AfDEC badge | P0 |
| `/methodology` | Technical/Institutional | "99.2% Source Correlation" unverified | 5/10 | 7/10 | 2/10 | 4/10 | Add evidence or soften claim | P1 |
| `/press-&-media` | Press | URL has special characters, placeholder | 3/10 | 5/10 | 1/10 | 2/10 | Fix URL, add real press content | P2 |
| `/register` | New Users | Form not functional | 4/10 | 8/10 | 2/10 | 1/10 | Wire to Supabase auth | P0 |
| `/sector-intelligence` | Sector Analysts | "98.5% growth accuracy" unverified | 5/10 | 7/10 | 2/10 | 5/10 | Soften accuracy claim | P1 |
| `/sector/[sector]` | Sector Analysts | Dynamic page works well | 6/10 | 7/10 | 2/10 | 5/10 | Add page-specific metadata via generateMetadata | P1 |
| `/signal-engine` | Quant/Analysts | "94.2% predictive accuracy" unverified | 5/10 | 7/10 | 2/10 | 5/10 | Soften claim or add methodology | P1 |
| `/sitemap` | Navigation | Contains broken links to `/compliance/...` | 4/10 | 6/10 | 2/10 | N/A | Fix broken links, align with actual routes | P1 |
| `/solutions` | Enterprise | "most robust pipeline" comparative claim | 5/10 | 7/10 | 2/10 | 4/10 | Soften comparative language | P1 |
| `/source-registry` | Technical | Good transparency page, verify latency figures | 6/10 | 7/10 | 2/10 | 4/10 | Add page metadata, verify latencies | P1 |
| `/status` | Operations | Placeholder, no real monitoring | 2/10 | 4/10 | 1/10 | 1/10 | Wire to real status or remove | P2 |
| `/terminal/caribbean` | Users | Map present, needs data integration | 5/10 | 7/10 | 2/10 | 4/10 | Integrate real data, add metadata | P1 |
| `/terminal/map` | Users | Interactive map with mock data | 6/10 | 8/10 | 2/10 | 5/10 | Integrate real API data, add metadata | P1 |

---

## 6. Claims Risk Register

| Claim | Location | Risk Level | Evidence Required | Recommended Action | Safer Replacement Language |
|-------|----------|------------|-------------------|-------------------|---------------------------|
| "74 Sovereign Markets" | Hero, Footer, TrustStrip | MEDIUM | List of 74 markets | Verify count matches actual coverage | "50+ African and Caribbean markets" |
| "42ms Data Latency" | Hero, Footer, Source Registry | HIGH | Performance monitoring data | Provide methodology or remove specific figure | "Sub-second data synchronization" |
| "99.8% Accuracy Score" | Africa Command Center | CRITICAL | Audit report, methodology | Remove or provide audit reference | "Validated against official sources" |
| "99.2% Source Correlation" | Methodology page | CRITICAL | Q3 2026 audit referenced | Provide audit or remove claim | "Cross-validated with primary sources" |
| "94.2% Predictive Accuracy" | Signal Engine | CRITICAL | Backtesting methodology | Remove or provide methodology link | "Model-driven signal analysis" |
| "98.5% Growth Accuracy" | Sector Intelligence | CRITICAL | Validation methodology | Remove or provide evidence | "Data-backed growth indicators" |
| "69+ macroeconomic nodes" | Methodology, About | HIGH | List of nodes | Verify count, provide registry | "Comprehensive sovereign data feeds" |
| "40+ regional analysts" | WhySouvera, About | HIGH | Team roster | Verify or remove specific number | "Expert analyst team" |
| "8+ Data Sources" | TrustStrip | LOW | Listed on page | Currently lists 8, verified | Keep - matches display |
| "1,200+ Data Nodes" | Africa Command | HIGH | Data inventory | Verify or soften | "Extensive data node network" |
| "240+ Trade Nodes" | Caribbean Command | HIGH | Data inventory | Verify or soften | "Comprehensive trade corridor coverage" |
| "85,000+ Normalized Nodes" | Signal Engine | HIGH | Data inventory | Verify or soften | "Large-scale data normalization" |
| "Hourly Signal Refresh" | TrustStrip, FAQ | MEDIUM | System logs | Verify refresh rate | Keep if verified, else "Regular updates" |
| "15-minute public refresh" | FAQ | MEDIUM | System logs | Verify refresh rate | Keep if verified |
| "24-hour verification cycle" | FAQ | MEDIUM | Process documentation | Document process | Keep if documented |
| "Global 2000 and Fortune 5" | WhySouvera | MEDIUM | None - aspiration | Clarify as target audience | "Built for enterprise and institutional use" |
| "The only intelligence platform" | WhySouvera | HIGH | Market analysis | Avoid "only" claims | "A leading intelligence platform" |
| "most trusted source" | Methodology | HIGH | Third-party validation | Remove superlative | "A trusted source" |
| "most robust data ingestion pipeline" | Solutions | HIGH | Comparative analysis | Remove comparative | "Robust data ingestion pipeline" |
| "Zero-knowledge encryption" | Contact page | HIGH | Technical documentation | Verify implementation | "Secure encrypted communications" |
| "256-bit AES encryption" | Login page | MEDIUM | Technical implementation | Verify implementation | Keep if implemented |
| "Sovereign Compliance Board" | Login, FAQ | MEDIUM | Governance documentation | Document or clarify | "Compliance review process" |
| "IMF 2026" projections | Hero, TopEconomies | LOW | IMF data access | Verify data source | Keep if using official IMF data |
| "Powered by IMF, World Bank" | Multiple locations | MEDIUM | Data licensing | Clarify as "data sourced from" | "Data sourced from IMF, World Bank, and other official sources" |
| "GDPR / Institutional Standards - Full Adherence" | Compliance Hub | HIGH | Compliance audit | Provide certification | "Committed to GDPR compliance standards" |
| "AU Malabo Convention - Aligned" | Compliance Hub | MEDIUM | Legal review | Verify alignment | Keep if verified |
| "CARICOM Privacy Standards - Compliant" | Compliance Hub | MEDIUM | Legal review | Verify compliance | Keep if verified |
| "$500M in executed capital" | Impact Report component | CRITICAL | Financial documentation | Provide evidence or remove | Remove if unverified |
| "Response: ~2.4h" | Contact page | LOW | Support metrics | Verify or remove | "We respond promptly" |

---

## 7. SEO Gap Matrix

| Route | Current Title | Current Meta Description | Has Canonical | Has Open Graph | Schema Recommendation | Keyword Intent | Missing Items |
|-------|---------------|-------------------------|---------------|----------------|----------------------|----------------|---------------|
| `/` | "Souvera Intelligence Terminal \| Afronovation" | "Sovereign-grade macroeconomic intelligence..." | NO | NO | Organization, WebSite, Product | africa investment intelligence, caribbean economic data | OG, Twitter, canonical, schema |
| `/about` | (inherits root) | (inherits root) | NO | NO | Organization, AboutPage | about souvera, africa data company | Title, description, OG, schema |
| `/africa-command-center` | (inherits root) | (inherits root) | NO | NO | Product, Service | africa economic intelligence, africa investment data | Title, description, OG, schema |
| `/api-documentation` | (inherits root) | (inherits root) | NO | NO | TechArticle, APIReference | souvera api, africa data api | Title, description, OG, schema |
| `/caribbean-command-center` | (inherits root) | (inherits root) | NO | NO | Product, Service | caribbean economic data, caricom intelligence | Title, description, OG, schema |
| `/careers` | (inherits root) | (inherits root) | NO | NO | JobPosting (when content added) | souvera careers, africa fintech jobs | Title, description, OG, schema |
| `/compliance-hub` | (inherits root) | (inherits root) | NO | NO | WebPage | data compliance, gdpr africa | Title, description, OG, schema |
| `/contact` | (inherits root) | (inherits root) | NO | NO | ContactPage | contact souvera, africa data inquiry | Title, description, OG, schema |
| `/Data-Sources-&-Methodology` | (inherits root) | (inherits root) | NO | NO | TechArticle | data methodology, economic data sources | Title, description, OG, schema, fix URL |
| `/faqs` | (inherits root) | (inherits root) | NO | NO | FAQPage | souvera faq, africa intelligence questions | Title, description, OG, FAQPage schema |
| `/insights` | (inherits root) | (inherits root) | NO | NO | Blog, CollectionPage | africa market insights, caribbean analysis | Title, description, OG, schema |
| `/intelligence-map` | (inherits root) | (inherits root) | NO | NO | Product | africa intelligence map, economic mapping | Title, description, OG, schema |
| `/legal` | (inherits root) | (inherits root) | NO | NO | WebPage | souvera legal, terms and conditions | Title, description, OG |
| `/legal/privacy` | (inherits root) | (inherits root) | NO | NO | WebPage | souvera privacy policy | Title, description, OG |
| `/legal/terms` | (inherits root) | (inherits root) | NO | NO | WebPage | souvera terms of service | Title, description, OG |
| `/legal/cookies` | (inherits root) | (inherits root) | NO | NO | WebPage | souvera cookie policy | Title, description, OG |
| `/legal/accessibility` | (inherits root) | (inherits root) | NO | NO | WebPage | souvera accessibility | Title, description, OG |
| `/login` | (inherits root) | (inherits root) | NO | NO | WebPage | souvera login, terminal access | Title, description, noindex recommended |
| `/methodology` | (inherits root) | (inherits root) | NO | NO | TechArticle | souvera methodology, data validation | Title, description, OG, schema |
| `/press-&-media` | (inherits root) | (inherits root) | NO | NO | CollectionPage, NewsArticle | souvera press, africa fintech news | Title, description, OG, schema, fix URL |
| `/register` | (inherits root) | (inherits root) | NO | NO | WebPage | souvera signup, create account | Title, description, noindex recommended |
| `/sector-intelligence` | (inherits root) | (inherits root) | NO | NO | Product, Service | africa sector analysis, industry intelligence | Title, description, OG, schema |
| `/sector/[sector]` | (inherits root) | (inherits root) | NO | NO | Product (dynamic) | [sector] africa intelligence | generateMetadata required |
| `/signal-engine` | (inherits root) | (inherits root) | NO | NO | Product, SoftwareApplication | signal engine, predictive analytics africa | Title, description, OG, schema |
| `/sitemap` | (inherits root) | (inherits root) | NO | NO | WebPage | souvera sitemap | Title, description |
| `/solutions` | (inherits root) | (inherits root) | NO | NO | Product, Service | enterprise africa intelligence, institutional data | Title, description, OG, schema |
| `/source-registry` | (inherits root) | (inherits root) | NO | NO | Dataset, DataCatalog | data sources, source registry | Title, description, OG, schema |
| `/status` | (inherits root) | (inherits root) | NO | NO | WebPage | souvera status, system uptime | Title, description, noindex recommended |
| `/terminal/caribbean` | (inherits root) | (inherits root) | NO | NO | SoftwareApplication | caribbean terminal, caricom data | Title, description, OG, schema |
| `/terminal/map` | (inherits root) | (inherits root) | NO | NO | SoftwareApplication, Map | africa map, intelligence terminal | Title, description, OG, schema |

### Critical SEO Infrastructure Missing

| Item | Status | Impact | Action Required |
|------|--------|--------|-----------------|
| `robots.txt` | MISSING | Search engines may crawl inefficiently | Create `public/robots.txt` |
| `sitemap.xml` | MISSING | Search engines cannot discover all pages | Create `app/sitemap.ts` for dynamic XML sitemap |
| Per-page metadata | MISSING | All pages show same title/description | Add `metadata` export or `generateMetadata` to each page |
| Open Graph images | MISSING | Poor social sharing appearance | Create OG images, add to metadata |
| Twitter cards | MISSING | Poor Twitter sharing appearance | Add twitter metadata |
| Canonical URLs | MISSING | Potential duplicate content issues | Add canonical to metadata |
| Structured data | MISSING | No rich snippets in search results | Add JSON-LD schema to pages |

---

## 8. Fortune-5 Elevation Backlog

### Navigation & Routing

| ID | Task | Current State | Target State | Priority | Effort |
|----|------|---------------|--------------|----------|--------|
| NAV-01 | Create `/subscriptions` page | 404 | Functional pricing/plans page | P0 | Medium |
| NAV-02 | Create `/terminal/africa` redirect | 404 | Redirects to `/terminal/map` | P0 | Low |
| NAV-03 | Fix footer Platform links | 5 broken | All functional | P0 | Low |
| NAV-04 | Fix footer Intelligence links | 5 broken | All functional | P0 | Low |
| NAV-05 | Fix footer Access links | 5 broken | All functional | P0 | Low |
| NAV-06 | Fix hero CTAs | 4 broken | All functional | P0 | Low |
| NAV-07 | Fix sitemap internal links | 4 broken `/compliance/...` paths | Correct `/legal/...` paths | P1 | Low |
| NAV-08 | Create `/forgot` password recovery | 404 | Functional page | P1 | Medium |
| NAV-09 | Consolidate duplicate methodology routes | 2 routes | 1 canonical route | P1 | Low |
| NAV-10 | Fix URL encoding issues | `&` in URLs | Clean URLs with hyphens | P1 | Medium |

### Executive Content

| ID | Task | Current State | Target State | Priority | Effort |
|----|------|---------------|--------------|----------|--------|
| CON-01 | Verify/soften accuracy claims | 5 unverified % claims | Verified or softened language | P0 | Medium |
| CON-02 | Remove/verify analyst count | "40+ analysts" unverified | Verified count or generic | P1 | Low |
| CON-03 | Add real team content | Placeholder board photos | Real team or remove section | P1 | Medium |
| CON-04 | Verify data source partnerships | "Powered by IMF, World Bank" | Clarified sourcing language | P1 | Low |
| CON-05 | Review compliance claims | "Full GDPR Adherence" | Verified or softened | P1 | Medium |
| CON-06 | Remove comparative superlatives | "only", "most trusted", "most robust" | Neutral institutional language | P1 | Low |
| CON-07 | Add real press content | Placeholder | Actual press releases or remove | P2 | Medium |
| CON-08 | Add real insights content | Placeholder | Sample reports or "Coming Soon" | P2 | Medium |

### SEO & Metadata

| ID | Task | Current State | Target State | Priority | Effort |
|----|------|---------------|--------------|----------|--------|
| SEO-01 | Create robots.txt | Missing | `public/robots.txt` with proper rules | P0 | Low |
| SEO-02 | Create XML sitemap | Missing | `app/sitemap.ts` dynamic sitemap | P0 | Low |
| SEO-03 | Add per-page metadata | 0/30 pages | 30/30 pages with unique metadata | P1 | Medium |
| SEO-04 | Add Open Graph tags | Missing | All marketing pages have OG | P1 | Medium |
| SEO-05 | Add Twitter cards | Missing | All marketing pages have Twitter cards | P1 | Low |
| SEO-06 | Add JSON-LD schema | Missing | Key pages have structured data | P1 | Medium |
| SEO-07 | Create OG images | Missing | Branded OG images for key pages | P2 | Medium |
| SEO-08 | Add canonical URLs | Missing | All pages have canonical | P2 | Low |

### UX / Design System

| ID | Task | Current State | Target State | Priority | Effort |
|----|------|---------------|--------------|----------|--------|
| UX-01 | Add loading states | None | Skeleton loaders for data-heavy sections | P1 | Medium |
| UX-02 | Add error boundaries | None | Graceful error handling | P1 | Medium |
| UX-03 | Mobile navigation testing | Untested | Verified mobile experience | P1 | Low |
| UX-04 | Form validation feedback | None | Inline validation messages | P1 | Medium |
| UX-05 | 404 page design | Default Next.js | Branded 404 with navigation | P1 | Low |
| UX-06 | Accessibility audit | Unchecked | WCAG 2.1 AA compliance | P2 | High |

### Data Trust & Methodology

| ID | Task | Current State | Target State | Priority | Effort |
|----|------|---------------|--------------|----------|--------|
| DATA-01 | Create methodology whitepaper | Claims without docs | Downloadable PDF methodology | P1 | High |
| DATA-02 | Document data refresh rates | Claims unverified | Documented SLAs | P1 | Medium |
| DATA-03 | Create source verification page | Basic registry | Detailed source audit trail | P1 | Medium |
| DATA-04 | Add data timestamp displays | None | "Last updated" on data sections | P1 | Low |
| DATA-05 | Wire terminal to real API | Mock data | Live Supabase data | P1 | High |

### Request Access & Conversion

| ID | Task | Current State | Target State | Priority | Effort |
|----|------|---------------|--------------|----------|--------|
| CONV-01 | Wire contact form | Non-functional | Submits to Supabase/email | P0 | Medium |
| CONV-02 | Wire login form | Non-functional | Supabase auth | P0 | Medium |
| CONV-03 | Wire register form | Non-functional | Supabase auth | P0 | Medium |
| CONV-04 | Create native lead capture | Routes to AfDEC | Souvera-owned capture | P0 | Medium |
| CONV-05 | Add newsletter submission | Non-functional | Email capture working | P1 | Low |
| CONV-06 | Create gated content system | None | Tiered access controls | P2 | High |

### AfDEC Separation

| ID | Task | Current State | Target State | Priority | Effort |
|----|------|---------------|--------------|----------|--------|
| SEP-01 | Replace AfDEC contact CTA | External link | `/contact` | P0 | Low |
| SEP-02 | Remove "AfDEC Endorsed" from login | Prominent footer text | Remove or minimize | P0 | Low |
| SEP-03 | Update FAQ AfDEC answer | "core terminal for AfDEC" | Souvera-first positioning | P1 | Low |
| SEP-04 | Replace AfDEC careers link | External link | Afronovation careers or `/careers` | P1 | Low |
| SEP-05 | Replace AfDEC media link | External link | `/press-&-media` with content | P1 | Medium |
| SEP-06 | Review AfDEC footer positioning | Prominent "Company" section | Secondary "Partners" mention | P1 | Low |
| SEP-07 | Remove AfDEC from map source lines | "AfDEC Intelligence Desk" | "Souvera Intelligence" | P1 | Low |

### QA & Performance

| ID | Task | Current State | Target State | Priority | Effort |
|----|------|---------------|--------------|----------|--------|
| QA-01 | Fix TypeScript build errors | `ignoreBuildErrors: true` | Clean build | P1 | Medium |
| QA-02 | Add unit tests | None | Core component coverage | P2 | High |
| QA-03 | Add E2E tests | None | Critical path coverage | P2 | High |
| QA-04 | Performance audit | Unknown | Lighthouse 90+ scores | P2 | Medium |
| QA-05 | Bundle size optimization | Unknown | Optimized chunks | P2 | Medium |
| QA-06 | Image optimization | SVGs only | Optimized images with next/image | P2 | Low |

---

## 9. Recommended Implementation Phases

### Phase 0: Route & Link Stabilization (Demo-Blocking)
**Goal:** Make the site navigable without 404 errors  
**Duration Estimate:** 1-2 days

1. Create `/subscriptions` page (can be simple "Contact for Access" initially)
2. Add redirects in `next.config.ts`:
   - `/terminal/africa` → `/terminal/map`
   - `/terminal/africa/map` → `/terminal/map`
   - `/terminal` → `/terminal/map`
   - `/terminal/sectors` → `/sector-intelligence`
   - `/signals` → `/signal-engine`
   - `/data` → `/Data-Sources-&-Methodology`
   - `/api-docs` → `/api-documentation`
   - `/pricing` → `/subscriptions`
   - `/docs/api` → `/api-documentation`
3. Fix footer link hrefs to match existing routes
4. Fix sitemap `/compliance/...` links to `/legal/...`
5. Replace all `https://afdec-nc.vercel.app/contact` with `/contact`
6. Remove "AfDEC Endorsed" text from login page footer
7. Wire contact form to basic email/Supabase submission

**Exit Criteria:** Zero 404s from any navigation click, contact form submits

---

### Phase 1: Executive Inner-Page Rebuild
**Goal:** Every page is demo-ready with verified or softened claims  
**Duration Estimate:** 3-5 days

1. Audit and soften all accuracy percentage claims:
   - Replace "99.8% Accuracy" → "Validated against official sources"
   - Replace "94.2% Predictive Accuracy" → "Model-driven signal analysis"
   - Replace "98.5% Growth Accuracy" → "Data-backed growth indicators"
   - Replace "99.2% Source Correlation" → "Cross-validated with primary sources"
2. Remove or verify "40+ analysts" claim
3. Replace placeholder board member photos or remove section
4. Remove comparative superlatives ("only", "most trusted", "most robust")
5. Clarify "Powered by IMF, World Bank" → "Data sourced from..."
6. Wire login/register forms to Supabase auth
7. Create branded 404 page
8. Add loading states to data-heavy components

**Exit Criteria:** No unverified quantitative claims, auth functional

---

### Phase 2: SEO & Conversion System
**Goal:** Organic discoverability and lead capture  
**Duration Estimate:** 3-5 days

1. Create `public/robots.txt`
2. Create `app/sitemap.ts` for XML sitemap
3. Add metadata to all 30 pages:
   - Unique title and description
   - Open Graph tags
   - Twitter cards
4. Add `generateMetadata` to dynamic routes (`/sector/[sector]`)
5. Add JSON-LD schema to key pages (Home, About, Products)
6. Create OG images for main marketing pages
7. Wire newsletter form submission
8. Add form validation with user feedback
9. Create gated "Coming Soon" pages for placeholder content

**Exit Criteria:** All pages have unique SEO, forms capture leads

---

### Phase 3: Data Trust & Methodology Pages
**Goal:** Institutional credibility through transparency  
**Duration Estimate:** 5-7 days

1. Create downloadable methodology whitepaper (PDF)
2. Document and display data refresh SLAs
3. Enhance source registry with verification dates
4. Add "Last updated" timestamps to data displays
5. Wire terminal map to real Supabase API data
6. Review and verify compliance claims with legal
7. Add data attribution section with proper citations
8. Create audit trail documentation

**Exit Criteria:** Data claims are documented and verifiable

---

### Phase 4: Terminal Functionality Alignment
**Goal:** Core product functionality matches marketing claims  
**Duration Estimate:** Ongoing

1. Integrate real-time data feeds into terminal
2. Build out country intelligence panels with live data
3. Implement tiered access controls (Explorer/Professional/Business/Institutional)
4. Create functional Signal Engine dashboard
5. Build sector drill-down dashboards
6. Implement comparison engine
7. Create downloadable country reports
8. Build API documentation with live examples
9. Add real-time status monitoring

**Exit Criteria:** Product functionality matches marketing promises

---

## Appendix A: Technical Architecture Summary

```
souvera/
├── apps/
│   └── api-gateway/           # Main Next.js 16.2.4 application
│       ├── src/
│       │   ├── app/           # App Router pages (30 routes)
│       │   ├── components/    # React components (49 files)
│       │   │   ├── landing/   # Homepage sections
│       │   │   ├── layout/    # Layout wrappers
│       │   │   ├── map/       # Map components
│       │   │   ├── panels/    # Intelligence panels
│       │   │   ├── templates/ # Page templates
│       │   │   └── ui/        # Shared UI (nav, footer, etc.)
│       │   └── lib/           # Utilities (Supabase, services)
│       ├── public/            # Static assets (minimal)
│       └── next.config.ts     # Build config (ignoreBuildErrors: true)
├── packages/
│   ├── config/                # Shared config
│   ├── types/                 # TypeScript types
│   ├── ui/                    # Shared UI components
│   ├── api-client/            # API client
│   └── entitlements/          # Access control
├── services/                  # Backend services (ingestion, etc.)
└── infra/                     # Infrastructure (Supabase, Vercel)
```

## Appendix B: Benchmark Comparison

| Criteria | Bloomberg Terminal | Palantir | Refinitiv | Souvera Current | Souvera Target |
|----------|-------------------|----------|-----------|-----------------|----------------|
| Data Verification | Extensive | Extensive | Extensive | Claims only | Documented |
| SEO/Discoverability | N/A (product) | Strong | Strong | None | Full |
| Navigation Reliability | 100% | 100% | 100% | ~60% | 100% |
| Claims Substantiation | Fully backed | Fully backed | Fully backed | Unverified | Evidence-based |
| Lead Capture | Sophisticated | Sophisticated | Sophisticated | Non-functional | Functional |
| Mobile Experience | App-based | Responsive | Responsive | Untested | Verified |
| Accessibility | WCAG compliant | WCAG compliant | WCAG compliant | Unknown | WCAG 2.1 AA |

---

**Report Generated:** April 28, 2026  
**Next Review:** Upon completion of Phase 0
