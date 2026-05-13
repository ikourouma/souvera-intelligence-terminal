# Navigation QA Checklist

**Last Updated:** April 28, 2026  
**Target:** Pre-Afreximbank / ACTIF 2026 Demo Readiness

---

## Pre-Demo Checklist

### Mega Menu (Desktop)

| Menu Group | Links Verified | No 404s | Correct Labels |
|------------|---------------|---------|----------------|
| Platform | [ ] | [ ] | [ ] |
| Intelligence | [ ] | [ ] | [ ] |
| Sectors | [ ] | [ ] | [ ] |
| Insights | [ ] | [ ] | [ ] |
| Access | [ ] | [ ] | [ ] |
| Resources | [ ] | [ ] | [ ] |

### Mega Menu (Mobile)

| Item | Opens Correctly | Links Work | Closes on Navigate |
|------|-----------------|------------|-------------------|
| Accordion menus | [ ] | [ ] | [ ] |
| Mobile CTAs | [ ] | [ ] | [ ] |
| Utility links | [ ] | [ ] | [ ] |

### Header CTAs

| CTA | Label | Destination | Working |
|-----|-------|-------------|---------|
| Access Terminal | `/intelligence/map` | [ ] |
| Sign In | `/login` | [ ] |

### Footer Links

| Section | All Links Verified | No External 404s |
|---------|-------------------|------------------|
| Platform | [ ] | [ ] |
| Intelligence | [ ] | [ ] |
| Access | [ ] | [ ] |
| Company | [ ] | [ ] |
| Legal | [ ] | [ ] |

### Homepage CTAs

| Section | Primary CTA | Secondary CTA | Both Working |
|---------|-------------|---------------|--------------|
| Hero Slide 1 | `/platform` | `/access/request-access` | [ ] |
| Hero Slide 2 | `/intelligence/africa` | `/intelligence/caribbean` | [ ] |
| Hero Slide 3 | `/sectors` | `/access/request-demo` | [ ] |
| Command Centers | `/intelligence/africa` | `/intelligence/caribbean` | [ ] |
| Product Suite | `/platform/terminal` + others | `/access` | [ ] |
| Sector Showcase | Individual sectors | `/sectors` | [ ] |
| Top Economies | `/insights/rankings` | `/intelligence/caribbean` | [ ] |
| Pricing Tiers | `/access/request-access` | `/access` | [ ] |
| Newsletter | `/access` | - | [ ] |

---

## Page Existence Verification

### Hub Pages (Must Exist)

| Route | Page Created | Has Content | Has SEO |
|-------|-------------|-------------|---------|
| `/platform` | [ ] | [ ] | [ ] |
| `/intelligence` | [ ] | [ ] | [ ] |
| `/sectors` | [ ] | [ ] | [ ] |
| `/insights` | [ ] | [ ] | [ ] |
| `/access` | [ ] | [ ] | [ ] |
| `/resources` | [ ] | [ ] | [ ] |

### Critical Pages (Must Exist)

| Route | Page Created | Has Content | Has SEO |
|-------|-------------|-------------|---------|
| `/about` | [x] | [ ] | [ ] |
| `/contact` | [x] | [ ] | [ ] |
| `/login` | [x] | [ ] | [ ] |
| `/intelligence/africa` | [ ] | [ ] | [ ] |
| `/intelligence/caribbean` | [ ] | [ ] | [ ] |
| `/intelligence/map` | [ ] | [ ] | [ ] |
| `/access/request-access` | [ ] | [ ] | [ ] |

### Legal Pages (Must Exist)

| Route | Page Created | Content Verified |
|-------|-------------|-----------------|
| `/legal` | [x] | [ ] |
| `/legal/privacy` | [x] | [ ] |
| `/legal/terms` | [x] | [ ] |
| `/legal/cookies` | [x] | [ ] |
| `/legal/accessibility` | [x] | [ ] |

---

## Redirect Verification

Test each legacy URL redirects correctly:

| Legacy URL | Expected Destination | Status |
|------------|---------------------|--------|
| `/terminal/africa` | `/intelligence/africa` | [ ] |
| `/subscriptions` | `/access` | [ ] |
| `/signal-engine` | `/platform/signal-engine` | [ ] |
| `/africa-command-center` | `/intelligence/africa` | [ ] |
| `/sector-intelligence` | `/sectors` | [ ] |
| `/faqs` | `/resources/faq` | [ ] |
| `/api-documentation` | `/platform/api` | [ ] |

---

## External Link Audit

| Link | Destination | Valid | Notes |
|------|-------------|-------|-------|
| Afronovation | https://www.afronovation.com | [ ] | |
| LinkedIn | # | [ ] | Needs real URL |
| X/Twitter | # | [ ] | Needs real URL |

---

## Forms Verification

| Form | Location | Submits | Backend Connected |
|------|----------|---------|-------------------|
| Contact | `/contact` | [ ] | [ ] |
| Login | `/login` | [ ] | [ ] |
| Newsletter | Homepage | [ ] | [ ] |
| Request Access | `/access/request-access` | [ ] | [ ] |
| Request Demo | `/access/request-demo` | [ ] | [ ] |

---

## Browser Testing

| Browser | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Chrome | [ ] | [ ] | [ ] |
| Safari | [ ] | [ ] | [ ] |
| Firefox | [ ] | [ ] | [ ] |
| Edge | [ ] | [ ] | [ ] |

---

## Notes

- Run through entire site navigation before any demo
- Check all visible links (underlined text, buttons, cards)
- Verify no "404 Not Found" pages appear
- Ensure all CTAs have clear destinations
- Test on mobile viewport
