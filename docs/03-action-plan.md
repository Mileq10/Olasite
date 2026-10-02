# Action plan: planned fixes

Source: `01-review-seo-a11y-code.md` (SEO-, A11Y-, CODE- IDs) and `02-form-security.md` (SEC- IDs).
Effort: **S** < 1 h, **M** 1–4 h, **L** > 4 h. Tick boxes as you go. Each phase should be one PR.

## Phase 0 — Quick wins (≈ 1–2 h total, no design decisions)
- [ ] **CODE-1** Fix `::root` → `:root` in `global.css` line 1. (S)
- [ ] **CODE-9** Remove duplicate comment lines in `global.css`. (S)
- [ ] **CODE-7** Remove `public/zdjecia/CZYTAJ.txt` from git/build; drop `zgloszenia/` from `.gitignore`. (S)
- [ ] **SEO-7** Delete stale `public/zdjecia/portfolio/{eventy,sport,wydarzenia}` (after confirming nothing references them; keep `okladka.jpg` where used). (S)
- [ ] **SEO-4** Replace `pages/galeria.astro` query-param redirect with `redirects: {'/galeria': '/galeria/biznesowa'}` in `astro.config.mjs`. (S)
- [ ] **SEO-11** Set `trailingSlash` explicitly in `astro.config.mjs`. (S)
- [ ] **CODE-11** Escape `<` in JSON-LD output. (S)
- [ ] **CODE-4** Share nav `links` between Header and Footer via `site.js`. (S)
- [ ] **SEO-3** Confirm the real phone number replaces the placeholder `+48500100200`. (S)

## Phase 1 — Form security and privacy (highest value)
- [ ] **SEC-3** Send `botcheck` in the Web3Forms payload (keep client short-circuit). (S)
- [ ] **SEC-1** Domain-restrict the Web3Forms key in the dashboard, then rotate it and update `form-config.js`. (S, needs owner login)
- [ ] **SEC-4** Add Cloudflare Turnstile (or hCaptcha) to the form + enable in Web3Forms. (M)
- [ ] **SEC-4** Time trap (min 3 s) + 30–60 s client cooldown after a send. (S)
- [ ] **SEC-9/10** Replace server error text with fixed friendly message + `mailto:`/phone fallback; keep user input. (S)
- [ ] **SEC-14** Add `.max()` to `telefon`/`pakiet` in `contact-schema.js`; add `.trim()` to e-mail. (S)
- [ ] **SEC-13** (optional) Reject > 2 URLs in message. (S)
- [ ] **SEC-8** Add meta CSP in `Layout.astro` (allow self, Google Fonts until self-hosted, `api.web3forms.com`, Turnstile). Test all pages. (M)
- [ ] **SEC-5/6/7** Update privacy policy + form disclaimer: controller identity & contact e-mail, name Web3Forms (and Cloudflare/Turnstile) as processors, third-country transfers, concrete retention, remove "regulamin", simplify legal basis. (M, owner/legal input needed)
- [ ] **SEC-2** Decide: stay on Option A/B or build the proxy (Option C in `02-form-security.md`). (decision)

## Phase 2 — Accessibility
- [ ] **A11Y-2** Restructure form fields: `<label for>`, separate error element outside the label, no `<p>`/`<div>` inside `<label>`. (M)
- [ ] **A11Y-1** `role="alert"` (or a single `aria-live` region) for field errors; `required` + `aria-required` + visible marker; error summary on submit. (M)
- [ ] **A11Y-3** Lightbox: focus trap, `inert` on page content, announce counter (`aria-live="polite"`), visible focus ring instead of `outline:none`. (M)
- [ ] **A11Y-4** Offer accordion: `aria-controls`, region labelling; set `aria-expanded` only when collapsible (mobile). (S)
- [ ] **A11Y-5** Mobile nav: `inert`/`hidden` when closed, focus management on open/close, `aria-label` on both `<nav>`s. (M)
- [ ] **A11Y-6** Respect `prefers-reduced-motion` in `nav.js`/`home.js` scroll calls. (S)
- [ ] **A11Y-7** Measure contrast with real backgrounds; raise low-alpha text colours to ≥ 4.5:1. (S–M)
- [ ] **A11Y-8** Use `inert` on honeypot wrapper. (S)
- [ ] **A11Y-9/10/11/12** Polish items: new-tab cue, short-button labels, phone mask caret, hero alt decisions. (S each)
- [ ] Run axe / Lighthouse a11y + a manual keyboard & screen-reader pass (VoiceOver/NVDA) on `/`, a gallery, lightbox, form errors. (M)

## Phase 3 — SEO and performance
- [ ] **SEO-1** Create 1200×630 default share image (+ optional per-gallery); fix width/height meta; add `og:image:alt`. (S–M, design asset)
- [ ] **SEO-2** Add city/region to copy, title, description and JSON-LD (`address`, `areaServed`, `priceRange`, `openingHoursSpecification`, `geo`); consider `Offer` entries generated from offer data (CODE-3). (M, owner provides data)
- [ ] **SEO-5** Real alt text per photo (data file keyed by filename). (M, content)
- [ ] **SEO-6** Shorten home title to ≤ 60 chars; add `ImageGallery` JSON-LD on gallery pages. (S)
- [ ] **SEO-8/9/10** apple-touch-icon, manifest, PNG favicon, image alt meta, tidy hreflang. (S)
- [ ] **SEO-12** Self-host Google Fonts (`@fontsource` or local woff2, `font-display: swap`, preload); move images to `astro:assets` for AVIF/WebP + `srcset`; Lighthouse target ≥ 95 mobile. (M–L)

## Phase 4 — Code quality and tooling
- [ ] **CODE-8** Add Prettier + ESLint (+ `eslint-plugin-astro`, `jsx-a11y`-style rules), `astro check`, npm scripts. (M)
- [ ] **CODE-8** Add Vitest tests for `contact-schema.js` (package/topic combinations, phone digits). (S–M)
- [ ] **CODE-8** Add GitHub Actions: build + lint + check on PR; deploy to GitHub Pages on main. (M)
- [ ] **CODE-8** Write `README.md` (run, build, add photos, change prices, form setup, deploy). (S)
- [ ] **CODE-3** Move offer data to `src/data/offer.js`, render cards by loop. (M)
- [ ] **CODE-2/6** Single source of truth for topics/packages; split `home.js` into `form.js` + `offer.js`; extract `resetForm()`. (M)
- [ ] **CODE-5** Replace hand-rolled image-size parser with `astro:assets`/`sharp`. (M; do together with SEO-12)
- [ ] **CODE-9** Introduce CSS custom properties (colours, spacing, radii); split `global.css` by section. (M–L)
- [ ] **CODE-10/12** Modernise `nav.js` to ES module style; remove dead `addListener` fallback. (S)

## Suggested order and PR slicing
1. PR 1 = Phase 0. 2. PR 2 = Phase 1 (form + privacy). 3. PR 3 = Phase 2 (a11y). 4. PR 4 = Phase 3 (SEO/perf). 5. PR 5+ = Phase 4 (tooling first, so later PRs are linted/tested).

## Definition of done
Lighthouse mobile: Performance ≥ 90, Accessibility 100, Best Practices 100, SEO 100; axe: 0 serious/critical; Rich Results Test passes; direct-POST spam test (see `02-form-security.md` §3) passes; CI green.
