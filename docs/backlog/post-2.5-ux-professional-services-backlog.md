# Post–Phase 2.5 UX & Professional Services Backlog

**Created:** 2026-07-03  
**Owner:** Afronovation, Inc.  
**Status:** Open — not part of Phase 2.5 certification scope  
**Context:** Pre–Phase 2.5 redirect gate shipped v1 `/professional-services` and sector CTA banners. Fortune 5 polish and sector hero imagery deferred here.

---

## Priority Legend

- **P1 (High):** Address before public institutional launch campaigns
- **P2 (Medium):** Enhance within 4–8 weeks post sign-off
- **P3 (Low):** Future phase

---

## PS-BG-001 — Sector hero background imagery (P1)

### Goal

Add hi-fi / hi-def, **sector-relevant** background imagery to each of the 10 sector overview pages under [`apps/api-gateway/src/app/sectors/`](../../apps/api-gateway/src/app/sectors/), with subtle motion inspired by Bloomberg Professional product pages:

- [Enterprise Data](https://professional.bloomberg.com/products/data/)
- [Trading](https://professional.bloomberg.com/products/trading/)
- [Risk](https://professional.bloomberg.com/products/risk/)
- [Indices](https://www.bloomberg.com/professional/products/indices/)

### Requirements

| Sector slug | Imagery direction |
|-------------|-------------------|
| `fintech` | Mobile payments, digital rails, urban finance hubs |
| `energy` | Solar/wind installations, grid infrastructure, LNG (non-generic oil rigs) |
| `logistics` | Container ports, AfCFTA corridor maps, cold-chain |
| `agriculture` | Cocoa/horticulture exports, agro-processing (region-specific) |
| `critical-minerals` | Processing/refining, EV supply chain (not stock earth photos) |
| `tourism-hospitality` | Premium resort/coastal hospitality (Caribbean/Africa context) |
| `digital-infrastructure` | Fiber backhaul, datacenter, tower infrastructure |
| `technology` | Developer hubs, nearshore delivery (Lagos/Nairobi/Kingston context) |
| `manufacturing-textiles` | Apparel/factory floors, SEZ industrial parks |
| `mining` | Responsible mining operations, bauxite/gold context |

### Quality bar

- **Rule:** If no asset passes relevance and quality bar, use accent gradient only — no filler stock photos.
- Format: WebP preferred, lazy-loaded, `prefers-reduced-motion` respected.
- Animation: subtle gradient mesh, slow parallax, optional looped video fallback (Bloomberg-style).
- Implementation target: extend [`SectorOverviewPage.tsx`](../../apps/api-gateway/src/components/sectors/SectorOverviewPage.tsx) hero with optional `backgroundImage` + CSS animation layer.

### Acceptance criteria

- [ ] Asset brief documented per sector with license/source attribution
- [ ] All 10 pages render hero backgrounds or approved gradient fallback
- [ ] Lighthouse performance regression &lt; 5 points on sector pages
- [ ] Reduced-motion mode disables animation

---

## PS-F5-001 — Professional Services Fortune 5 polish (P1)

### Goal

Elevate [`/professional-services`](../../apps/api-gateway/src/app/professional-services/) from v1 static page to Fortune 5 institutional standard, referencing [Stripe Professional Services](https://stripe.com/professional-services) information architecture while keeping Souvera/Afronovation content and complementarity vs Bloomberg execution services.

### v1 shipped (2026-07-03)

- Hero + expert teams + three service pillars (Implementation, Advisory, Strategy)
- Sector anchor grid with deep-links from sector CTA banners
- Differentiation block (data + execution vs terminal-only providers)
- Contact CTAs → `/contact?intent=professional-services`

### Fortune 5 deliverables

| Item | Description |
|------|-------------|
| Case study carousel | Trade mission outcomes, partner capital deployed, corridor activation metrics |
| Dedicated lead capture | Form beyond `/contact` query params; CRM routing to Afronovation sales |
| Sector deep sections | Expand `#fintech`, `#energy`, etc. with service SKUs matching sector banner promises |
| Motion design | Bloomberg/Stripe-grade hero motion, scroll-triggered reveals |
| CMS integration | Testimonials, service tiers, and hero copy in marketing CMS |
| Cross-linking | `/access/institutional`, intelligence upgrade prompts, trade hub CTAs |

### Complementarity positioning (Bloomberg reference)

Bloomberg Professional Services emphasizes enterprise data, terminal, trading, and risk products. Souvera Pro Services should **complement** — not compete on terminal/data feeds — by selling:

- Trade mission design and execution
- Corridor activation programs
- Capital partner matching
- Institutional onboarding tied to Souvera intelligence

### Acceptance criteria

- [ ] Fortune 5 stress-test doc signed (mirror `traction-pages-fortune5-stress-test.md` pattern)
- [ ] Case studies with verifiable outcomes (no fabricated metrics)
- [ ] Lead capture integrated with existing leads API or CRM webhook
- [ ] Sector banners and pro-services page copy stay in sync via shared data module

---

## Related documents

- Pre–Phase 2.5 redirect audit: [`docs/audits/pre-2.5-redirect-audit.md`](../audits/pre-2.5-redirect-audit.md)
- Phase 2.5 certification (separate): [`docs/ux/phase-2.5-certification.md`](../ux/phase-2.5-certification.md)
- Comparison Lab (Phase 2.6+): [`docs/ux/comparison-lab-phase-2.6.md`](../ux/comparison-lab-phase-2.6.md)
