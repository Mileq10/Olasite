# Review: code quality, SEO / meta tags, accessibility

Scope: whole repo at commit `6f938e9` (Astro 5 static site, vanilla JS, one 1.7k-line CSS file, Web3Forms contact form).
Severity: **H** = fix soon, **M** = should fix, **L** = polish. IDs are referenced from `03-action-plan.md`.

Overall: the site is in good shape for its size. Semantic structure, skip link, canonical/OG/Twitter tags, sitemap, JSON-LD, `lang="pl"`, explicit image dimensions, `noindex` on 404, and a keyboard-operable lightbox are already in place. The findings below are mostly correctness details and gaps, not structural problems.

---

## 1. SEO and meta tags

| ID | Sev | Finding | Where |
|----|-----|---------|-------|
| SEO-1 | H | **OG image dimensions are wrong.** `og:image:width/height` are hard-coded to 1200×630, but the default image `hero/tlo.jpg` is 1920×1282. Scrapers may crop or ignore it. Use a dedicated 1200×630 share image (and a per-page one for galleries). | `Layout.astro`, `site.js:12-14` |
| SEO-2 | H | **No local-business signals.** `ProfessionalService` JSON-LD has no `address`/`areaServed` city, `priceRange`, `openingHours`, `geo`. The site never names a city or region in copy, title or description, so it cannot rank for "fotograf <miasto>". Biggest SEO lever for a local photographer. | `index.astro:13-23`, copy |
| SEO-3 | M | `telephone` is `+48500100200` — looks like a placeholder. Verify it is real before shipping (appears in JSON-LD, footer, contact). | `site.js:5` |
| SEO-4 | M | `/galeria` page reads `Astro.url.searchParams` but the site is `output: 'static'`; query params do not exist at build time, so the redirect always goes to `/galeria/biznesowa`. Replace with a fixed redirect in `astro.config.mjs`. | `pages/galeria.astro` |
| SEO-5 | M | **Generic image alt text.** Gallery alts are "Sesja biznesowa — zdjęcie 3"; hero alts are minimal ("Sesja rodzinna"). Write real descriptive alts (stored per photo in a data file) — helps image search and screen-reader users. | `[kategoria].astro:92`, `index.astro` |
| SEO-6 | M | Home `<title>` is ~72 chars (will truncate in SERPs, ~60 is the target). Gallery pages have no unique long descriptions or `ImageGallery` schema. | `index.astro:42` |
| SEO-7 | M | Stale duplicate image folders `public/zdjecia/portfolio/{eventy,sport,wydarzenia}` are shipped (and old URLs redirect to `eventy-sport`). Dead weight, risk of orphaned/duplicate image URLs. | `public/zdjecia/portfolio/` |
| SEO-8 | L | Missing `apple-touch-icon`, `manifest.webmanifest`, PNG favicon fallback (only `favicon.svg`). | `Layout.astro` |
| SEO-9 | L | No `og:image:alt` / `twitter:image:alt`. | `Layout.astro` |
| SEO-10 | L | Single-language self-referential `hreflang` is harmless but unnecessary; remove or keep consistently. | `Layout.astro:30` |
| SEO-11 | L | `robots.txt` is fine, but no `Disallow` for nothing is needed; ensure `/polityka-prywatnosci` stays indexable or add `noindex` deliberately (sitemap currently includes it — consistent). Set `trailingSlash` explicitly in `astro.config.mjs` so canonical and sitemap URLs cannot diverge. | `astro.config.mjs` |
| SEO-12 | L | Core Web Vitals: Google Fonts CSS is render-blocking, no `preload` for the hero image/fonts, images are unoptimised JPEGs from `public/` (no AVIF/WebP, no `srcset`). Total 7.3 MB of images. | `Layout.astro:55-57`, `public/` |

---

## 2. Accessibility (WCAG 2.2 AA oriented)

| ID | Sev | Finding | Where |
|----|-----|---------|-------|
| A11Y-1 | H | **Form errors are not announced.** `.field-error` paragraphs have no `role="alert"`/`aria-live`; only focus moves to the first invalid field. Also no `required`/`aria-required` and no visible "required" marker on mandatory fields. | `index.astro` form, `home.js` |
| A11Y-2 | H | **Invalid HTML inside `<label>`:** `<p>` and `<div>` (phone input) are nested in `<label>`. Error text becomes part of the label's accessible name, so screen readers read "Adres e-mail Podaj poprawny adres…" every time. Restructure to `<label for>` + sibling error element. | `index.astro:~300-370` |
| A11Y-3 | H | **Lightbox is not a proper modal.** `role="dialog" aria-modal` but: no focus trap (Tab escapes into page behind), page behind is not `inert`, counter changes are not announced, and `:focus-visible` on its buttons sets `outline: none` (opacity only — weak indicator). | `lightbox.js`, `global.css:1161-1170` |
| A11Y-4 | M | **Offer accordion semantics.** Header buttons have `aria-expanded="true"` on desktop where nothing collapses (misleading), no `aria-controls`, and panels are not linked via `role="region"`/`aria-labelledby`. | `index.astro`, `home.js:63-100` |
| A11Y-5 | M | Mobile menu: verify closed menu links are not focusable/readable (`hidden`/`inert`/`visibility`), focus is moved into the menu on open and returned to the toggle on close (Esc handler exists, focus management does not). `<nav>` has no `aria-label` (header and footer nav are indistinguishable). | `Header.astro`, `nav.js` |
| A11Y-6 | M | **Reduced motion is only half respected.** `nav.js` calls `window.scrollTo({behavior:'smooth'})` and `scrollIntoView({behavior:'smooth'})` in `home.js` regardless of `prefers-reduced-motion`; the CSS media query cannot cancel those. | `nav.js`, `home.js` |
| A11Y-7 | M | **Contrast to verify:** several text colours are `rgba(255,255,255,0.45–0.48)` on `#1a1a1a` (~4.5:1, borderline; fails over photos/overlays). Measure with real backgrounds, raise alpha to ≥0.6 for body text. | `global.css:916, 988` |
| A11Y-8 | M | Honeypot wrapper uses `aria-hidden` while containing a focusable-in-principle input (`tabindex=-1` helps, but password managers/AT can still reach it). Use `inert` on the wrapper instead. | `index.astro` form |
| A11Y-9 | L | External links with `target="_blank"` give no "opens in new tab" cue for AT. | `Footer.astro`, `InstagramLink.astro` |
| A11Y-10 | L | Dual-text buttons (`btn-text-long` / `btn-text-short`): confirm the hidden variant is `display:none` (not just visually hidden) so screen readers hear only one; the short "Wybierz" loses context — add `aria-label`/`aria-describedby` with package name. | offer cards |
| A11Y-11 | L | Phone mask rewrites `value` on every input; editing in the middle of the number makes the caret jump to the end. | `home.js:117` |
| A11Y-12 | L | Decorative hero `alt=""` is correct; the three hero collage images are likely decorative too and could use `alt=""` or richer descriptions — decide deliberately. | `index.astro` |

---

## 3. Code quality

| ID | Sev | Finding | Where |
|----|-----|---------|-------|
| CODE-1 | H | **CSS typo breaks the root rule:** line 1 is `::root {` (should be `:root`). The `--header-h: 72px` fallback is silently ignored; layout relies on JS setting it. Flash of wrong offset before JS runs. | `global.css:1` |
| CODE-2 | M | **Duplicated source of truth for form logic.** `reportageKeys` in `home.js` duplicates `REPORTAGE` in `contact-schema.js`; the `<select>` options, package names and prices are hand-written HTML, separate from the schema. Import and generate from one config. | `home.js:9`, `contact-schema.js`, `index.astro` |
| CODE-3 | M | **Offer cards are copy-pasted 10×** (~230 lines in `index.astro`). Move to a data file (`src/data/offer.js`) and map. Prices then live in one place and can feed JSON-LD `Offer` schema. | `index.astro:109-340` |
| CODE-4 | M | `Header.astro` and `Footer.astro` each define the same `links` array. Share via `site.js`. | components |
| CODE-5 | M | `site.js` mixes constants with a hand-written JPEG/PNG header parser (`jpegSize`, `pngSize`) and `process.cwd()` filesystem access. Replace with `astro:assets` (`import.meta.glob` + `getImage`, or `sharp`) — gives dimensions, AVIF/WebP, `srcset`, hashed URLs for free and deletes ~70 lines. | `site.js:49-136` |
| CODE-6 | M | `home.js` does too much (prefill, accordion, validation, mask, submit, Web3Forms transport) and the submit handler duplicates the "reset form" block for the honeypot and success paths. Split into `form.js` / `offer.js` and extract `resetForm()`. | `home.js` |
| CODE-7 | M | Tracked file `public/zdjecia/CZYTAJ.txt` is also listed in `.gitignore` (so ignoring has no effect) and would be deployed publicly. Remove from the repo/build. Also `zgloszenia/` in `.gitignore` is a leftover from the old Node backend. | repo root |
| CODE-8 | M | **No tooling or safety net:** no ESLint/Prettier, no `astro check` (tsconfig exists but all files are JS), no tests (the Zod schema is trivially unit-testable), no CI workflow in the repo despite "GitHub Pages" in history, no README. | repo |
| CODE-9 | L | Duplicate comment line `/* Tło i nakładka */` ×2 and orphaned header comment; the stylesheet has no design tokens — colours/spacing/radii are literals (`#1a1a1a`, `rgba(255,255,255,.x)` repeated dozens of times). Introduce CSS custom properties; consider splitting by section. | `global.css:23-24` |
| CODE-10 | L | Mixed `var`/`function` IIFE style in `nav.js` vs ES modules + `const` elsewhere; `window.matchMedia.addListener` fallback is dead code for modern browsers. | `nav.js`, `home.js:97` |
| CODE-11 | L | `JSON.stringify` into `set:html` is safe today (static data) but should escape `<` (`replace(/</g,'\\u003c')`) to stay safe if content ever becomes dynamic. | `Layout.astro:53` |
| CODE-12 | L | Footer year is baked at build time (`new Date().getFullYear()`); fine, but a January rebuild is needed — note in README or move to a client snippet. | `Footer.astro` |

---

## 4. Verified-good (keep)

- Skip link, `lang`, landmark structure (`header`/`main`/`footer`), single `h1` per page.
- Canonical + OG + Twitter + sitemap + robots + per-page `noindex` on 404.
- Explicit `width`/`height` on images (no CLS), lazy loading below the fold, `fetchpriority=high` on the hero.
- Gallery thumbnails are real `<button>`s with descriptive `aria-label`s; lightbox supports Esc/arrows/swipe and restores focus.
- Phone/e-mail links use `tel:`/`mailto:`; `rel="noopener noreferrer"` on external links.
