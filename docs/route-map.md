# Souvera Route Map

**Last Updated:** April 28, 2026  
**Framework:** Next.js 16.2.4 App Router

---

## Primary Navigation Structure

### Platform
| Route | Status | Description |
|-------|--------|-------------|
| `/platform` | Hub | Platform overview and product suite |
| `/platform/terminal` | Page | Intelligence terminal product page |
| `/platform/signal-engine` | Page | Signal engine product page |
| `/platform/data-foundation` | Page | Data foundation and methodology |
| `/platform/api` | Page | API documentation and access |

### Intelligence
| Route | Status | Description |
|-------|--------|-------------|
| `/intelligence` | Hub | Regional intelligence overview |
| `/intelligence/africa` | Page | Africa market intelligence |
| `/intelligence/caribbean` | Page | Caribbean market intelligence |
| `/intelligence/map` | Terminal | Interactive intelligence map |
| `/intelligence/compare` | Page | Country comparison tool |

### Sectors
| Route | Status | Description |
|-------|--------|-------------|
| `/sectors` | Hub | Sector intelligence overview |
| `/sectors/fintech` | Page | Fintech & digital finance |
| `/sectors/critical-minerals` | Page | Mining & critical minerals |
| `/sectors/energy` | Page | Energy & renewables |
| `/sectors/agriculture` | Page | Agriculture & agribusiness |
| `/sectors/logistics` | Page | Logistics & trade |
| `/sectors/tourism` | Page | Tourism & hospitality |

### Insights
| Route | Status | Description |
|-------|--------|-------------|
| `/insights` | Hub | Insights and research overview |
| `/insights/briefings` | Page | Strategic briefings |
| `/insights/rankings` | Page | Market rankings |
| `/insights/methodology` | Page | Data methodology |

### Access
| Route | Status | Description |
|-------|--------|-------------|
| `/access` | Hub | Access plans and pricing |
| `/access/request-access` | Form | Request access form |
| `/access/request-demo` | Form | Request demo form |
| `/access/institutional` | Page | Enterprise solutions |

### Resources
| Route | Status | Description |
|-------|--------|-------------|
| `/resources` | Hub | Resources overview |
| `/resources/data-sources` | Page | Data sources documentation |
| `/resources/source-registry` | Page | Source registry |
| `/resources/compliance` | Page | Compliance information |
| `/resources/faq` | Page | Frequently asked questions |

### Company & Legal
| Route | Status | Description |
|-------|--------|-------------|
| `/about` | Page | About Souvera |
| `/contact` | Form | Contact sales |
| `/careers` | Page | Careers |
| `/status` | Page | System status |
| `/legal` | Hub | Legal documents hub |
| `/legal/privacy` | Page | Privacy policy |
| `/legal/terms` | Page | Terms of service |
| `/legal/cookies` | Page | Cookie policy |
| `/legal/accessibility` | Page | Accessibility statement |

### Authentication
| Route | Status | Description |
|-------|--------|-------------|
| `/login` | Form | User login |

---

## Legacy Route Redirects

All legacy routes are configured in `next.config.ts` with permanent redirects (301).

| Legacy Route | Redirects To |
|--------------|--------------|
| `/terminal/africa` | `/intelligence/africa` |
| `/terminal/africa/map` | `/intelligence/map` |
| `/terminal` | `/intelligence/africa` |
| `/terminal/sectors` | `/sectors` |
| `/terminal/economies` | `/intelligence/africa` |
| `/terminal/caribbean/economies` | `/intelligence/caribbean` |
| `/terminal/countries` | `/intelligence/africa` |
| `/terminal/compare` | `/intelligence/compare` |
| `/terminal/reports` | `/insights/briefings` |
| `/terminal/signals` | `/platform/signal-engine` |
| `/signals` | `/platform/signal-engine` |
| `/signal-engine` | `/platform/signal-engine` |
| `/data` | `/resources/data-sources` |
| `/Data-Sources-&-Methodology` | `/resources/data-sources` |
| `/methodology` | `/insights/methodology` |
| `/source-registry` | `/resources/source-registry` |
| `/subscriptions` | `/access` |
| `/pricing` | `/access` |
| `/api-docs` | `/platform/api` |
| `/api-documentation` | `/platform/api` |
| `/docs/api` | `/platform/api` |
| `/africa-command-center` | `/intelligence/africa` |
| `/caribbean-command-center` | `/intelligence/caribbean` |
| `/intelligence-map` | `/intelligence/map` |
| `/sector-intelligence` | `/sectors` |
| `/sector/energy-&-renewables` | `/sectors/energy` |
| `/sector/mining-&-critical-minerals` | `/sectors/critical-minerals` |
| `/sector/fintech-&-digital-finance` | `/sectors/fintech` |
| `/sector/tourism-&-hospitality` | `/sectors/tourism` |
| `/sector/logistics-&-trade` | `/sectors/logistics` |
| `/sector/:sector` | `/sectors/:sector` |
| `/compliance-hub` | `/resources/compliance` |
| `/compliance/privacy-policy` | `/legal/privacy` |
| `/compliance/terms-of-service` | `/legal/terms` |
| `/compliance/cookie-policy` | `/legal/cookies` |
| `/compliance/accessibility` | `/legal/accessibility` |
| `/faqs` | `/resources/faq` |
| `/solutions` | `/access/institutional` |
| `/press-&-media` | `/about` |
| `/register` | `/access/request-access` |

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/v1/countries-lite` | GET | Public country list |
| `/api/v1/country-lite` | GET | Single country data |

---

## Implementation Status

- [x] Redirects configured
- [x] Navigation updated
- [x] Footer updated
- [ ] All hub pages created
- [ ] All sub-pages created
- [ ] SEO metadata added
- [ ] Forms wired to backend

---

## Notes

1. All routes use the App Router (file-based routing)
2. Route groups like `(auth)` do not affect URLs
3. Dynamic routes use `[param]` syntax
4. All pages should export metadata for SEO
