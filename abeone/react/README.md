# AbëONE Daily Offer Seed

| Field | Value |
|-------|-------|
| Updated | 2026-05-04 |
| Status | PARKED_SEED |
| Phase | POST_TRIAL_OFFER_DISCOVERY |
| Vars | bravetto.offers.abeone_daily, bravetto.checkout.catalog, bravetto.routes.abeone |

## Context

This directory preserves a prototype idea for a future AbëONE continuation offer:
after a free trial, a person may continue for a simple daily price. It is part
of the Bravetto website repo, but it is not routed, not in the Stripe catalog,
and not a release surface. Substrate: `product.json`.

---

## Content

### What This Is

The files in this directory are a preserved experience seed for a possible
post-trial conversion flow:

`free trial -> arrival reflection -> AbëONE continuation offer -> checkout -> welcome`

The current human idea is: allow people to purchase AbëONE for `$1/day` as a
follow-up after a free trial. The timing is not now. The job of this directory
is preservation, not activation.

### Files

| File | Role | Current Status |
|------|------|----------------|
| `index.jsx` | Original React prototype | Unbuilt and not imported by the site |
| `preview.html` | Standalone browser preview | Local preview only, not production-routed |
| `README.md` | Preservation and trace record | Tracks intent, evidence, and questions |

### Current Runtime Evidence

| Surface | Evidence | Meaning |
|---------|----------|---------|
| `/abeone` | `vercel.json` rewrites to `abeone/index.html` | Production AbëONE page is the architecture page |
| `/welcome` | `vercel.json` rewrites to `welcome.html` | Checkout success and continuation target already exists |
| `/pricing` | `vercel.json` rewrites to `products.html` | Current sellable-product surface |
| `/api/checkout` | Expects `slug` and resolves through `api/product-map.js` | Checkout is catalog-driven |
| `api/checkout.js` | Adds `trial_period_days: 7` for recurring prices | Trial mechanics exist for subscription products |
| `scripts/sellable-catalog.mjs` | Canonical sellable slugs are listed there | No AbëONE `$1/day` product exists yet |

### Observed Separation

The current prototype should not be wired into production yet because:

- There is no `abeone` sellable slug in `scripts/sellable-catalog.mjs`.
- There is no test or live Stripe product id for an AbëONE daily offer.
- There is no entitlement or identity gate proving who has completed a trial.
- There is no confirmed billing unit decision: literal daily subscription vs
  monthly price expressed as about `$1/day`.
- The React prototype has known accessibility concerns captured in the local
  accessibility notes.
- The current production `/abeone` route is already occupied by the platform
  architecture page.

### Open Questions

1. Is `$1/day` literal daily billing, or monthly billing expressed as roughly
   `$30/month`?
2. How long is the free trial?
3. Does the trial require login/account identity, or is it checkout/session
   based?
4. After purchase, what does the user get access to immediately?
5. Should this be public-facing, or only shown after trial completion?
6. Should the offer use the existing `/welcome` page or a dedicated continuation
   page?
7. Is the prototype voice correct for a paid continuation moment, or is it too
   broad/front-door-oriented?
8. Should the stream remain curated/static, or must it be live before the offer
   can exist?
9. Should this become a Stripe catalog product only after entitlement and trial
   boundaries are defined?

### Future Activation Gate

Before this can become a release candidate, the next owner must read these files
end to end:

- `CLAUDE.md`
- `DOD-BRAVETTO-WEBSITE.md`
- `vercel.json`
- `product.json`
- `products.html`
- `welcome.html`
- `api/checkout.js`
- `api/product-map.js`
- `api/session-status.js`
- `api/portal.js`
- `scripts/sellable-catalog.mjs`
- `scripts/validate-product-catalog.mjs`
- `VALIDATION-A11Y-PROPOSAL.md`
- `# Code Citations.md`

The first valid activation decision is not a route. It is the offer contract:

`offer name + billing unit + trial boundary + entitlement + checkout slug`

Until that exists, this directory stays parked.

---

## Connections

| Doc | Relationship | Path |
|-----|--------------|------|
| product.json | Bravetto site substrate | `../../product.json` |
| vercel.json | Route contract | `../../vercel.json` |
| DOD-BRAVETTO-WEBSITE.md | Website release contract | `../../DOD-BRAVETTO-WEBSITE.md` |
| products.html | Current pricing surface | `../../products.html` |
| welcome.html | Checkout continuation surface | `../../welcome.html` |
| api/checkout.js | Checkout pipe | `../../api/checkout.js` |
| scripts/sellable-catalog.mjs | Canonical sellable catalog | `../../scripts/sellable-catalog.mjs` |
| VALIDATION-A11Y-PROPOSAL.md | Accessibility gate proposal | `../../VALIDATION-A11Y-PROPOSAL.md` |
