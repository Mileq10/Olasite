# Improvements and feature ideas

Beyond the fixes in `03-action-plan.md`. Grouped by value for a small photographer-business site. **Impact** / **Effort** are rough (H/M/L). "Needs backend" marks anything that cannot live on pure static hosting.

## A. Nice to have (low risk, polish the existing site)

| # | Idea | Impact | Effort | Notes |
|---|------|:-----:|:-----:|-------|
| N1 | **Self-hosted fonts + image pipeline (AVIF/WebP, `srcset`, blur-up placeholders)** | H | M | Faster LCP, better privacy, no Google request. Use `astro:assets`. |
| N2 | **Scroll-reveal / gentle fade transitions**, honouring `prefers-reduced-motion` | L | S | Keep subtle; don't hurt CWV. |
| N3 | **Astro View Transitions** between home ↔ galleries | M | S | Smooth navigation without a SPA. |
| N4 | **Back-to-top button + active-section highlight in nav** (IntersectionObserver) | L | S | Helps on the long home page. |
| N5 | **Lightbox upgrades:** pinch-zoom, preload neighbours (exists), image counter live region, download disabled/watermark option, deep-linkable photos (`#3`) | M | M | Deep links make photos shareable. |
| N6 | **Gallery filters / "masonry" by orientation or sub-theme** inside a category | L | M | Only worth it once galleries grow. |
| N7 | **Print stylesheet and dark/light theme toggle** (site is dark-only) | L | M | Optional; light theme helps outdoor mobile readability. |
| N8 | **Custom 404 with links to galleries and contact** (currently just a back link) | L | S | |
| N9 | **Cookie-free, privacy-friendly analytics** (Plausible / Umami / Cloudflare Web Analytics) | M | S | Lets you measure which offers get clicks; update privacy policy. |
| N10 | **Structured logging of form events (client)** e.g. which package button preceded a send (via analytics events) | M | S | Conversion insight. |
| N11 | **Floating "Zadzwoń / Napisz" action bar on mobile** | M | S | Click-to-call is the top conversion on mobile for local services. |
| N12 | **Prefill form from URL** (`/?pakiet=standard&tematyka=portretowa#kontakt`) | L | S | Shareable offer links; reuses existing `fillForm`. |
| N13 | **Lazy-load below-the-fold sections' JS, `content-visibility: auto`** | L | S | Micro-perf. |
| N14 | **PWA basics** (manifest, theme colour, maybe offline 404) | L | S | Mostly cosmetic. |

## B. Proposed features (new capabilities)

| # | Feature | Impact | Effort | Needs backend | Description |
|---|---------|:-----:|:-----:|:---:|-------------|
| F1 | **Testimonials / reviews section** | H | S | no | 3–6 short client quotes with first name + session type, plus `Review`/`AggregateRating` JSON-LD (only with real, verifiable reviews). Social proof is the biggest missing trust element. |
| F2 | **Per-session case studies / "Realizacje"** | H | M | no | Blog-like pages (Astro content collections, Markdown): one wedding/session with story, 10–15 photos, location, style. Great long-tail SEO ("sesja ślubna w <miasto>"), reusable in Instagram. |
| F3 | **FAQ section** (pricing, delivery time, rescheduling, deposit, number of photos, RAW policy) with `FAQPage` JSON-LD | H | S | no | Cuts repetitive questions, rich results in Google. |
| F4 | **Process / "How it works" section** (contact → consultation → shoot → gallery → delivery) | M | S | no | Sets expectations; supports pricing. |
| F5 | **Online availability & booking** (Cal.com / Calendly embed or a simple "booked dates" calendar) | H | M | embed: no | Visitors pick a free slot instead of waiting for a reply. Embed adds a third-party (privacy policy!); alternative: a static `availability.json` the owner edits. |
| F6 | **Private client galleries** (password/link-protected proofing + download) | H | L | yes (or SaaS) | Replaces ad-hoc link sharing. Use Pixieset / Pic-Time / Cloudflare R2 + Workers, or Astro SSR + auth. Highest operational value if delivery is currently via Drive/WeTransfer. |
| F7 | **Gift vouchers / mini-session promotions** page | M | M | payment: yes | "Bon podarunkowy" is a strong seasonal seller (Mother's Day, Christmas). Start as a form-based request, add Stripe/P24 Payment Links later (no custom backend). |
| F8 | **Deposit / online payment links** (Przelewy24, BLIK via Stripe Payment Links) shown after accepting an offer | M | S | no (links) | No code backend needed; just links in the reply e-mail template. |
| F9 | **Offer configurator / price estimator** for reportage (hours, photographers, location → estimated range) | M | M | no | Turns the wide price ranges into a guided estimate and a pre-filled enquiry (reuse N12). |
| F10 | **Contact form v2:** preferred date picker, location, number of people, how you found me, optional file/inspiration link, e-mail confirmation copy to the visitor | M | M | yes for auto-reply | Higher-quality leads, less back-and-forth. Auto-reply needs a function or Web3Forms' autoresponse feature. |
| F11 | **Newsletter / seasonal mini-session waitlist** | M | M | yes (provider) | MailerLite/Buttondown embed; consent checkbox required (RODO). |
| F12 | **Instagram feed block** (latest 6 posts) | L–M | M | yes (API/token) | Instagram's API tokens expire; static curated "best of" grid is lower maintenance than live feed. |
| F13 | **Before/after retouch slider** | L | S | no | Showcases the "wyretuszowane zdjęcia" selling point. |
| F14 | **Video / behind-the-scenes reel** (hero or "O mnie") | M | S–M | no | Use lightweight self-hosted muted loop or a facade for YouTube (privacy-friendly, no autoload). |
| F15 | **Blog / tips** ("What to wear to a portrait session", "Wedding timeline") | M | M | no | Content marketing; cheap with Markdown content collections. |
| F16 | **Multilingual (EN)** for expats / destination weddings | L–M | M | no | Astro i18n routing + `hreflang`. Only if there is demand. |
| F17 | **Admin-friendly content editing** (Decap CMS / Tina / Keystatic on Git) | M | M | git-based | Lets the owner add photos, alts, prices and testimonials without touching code. |
| F18 | **Photo protection layer:** hotlink protection (Cloudflare), downscaled public images, optional watermark on web versions | M | S | Cloudflare | Photos are the product; serve 2000px max with no original files. |

## C. Operational improvements
- **Backups & hosting:** keep originals out of the repo (public folder is 7 MB of web-size images — good); document where RAW/originals live.
- **Monitoring:** UptimeRobot / Cloudflare health check on `/` and a weekly test submission of the form (catches expired keys or exhausted Web3Forms quota).
- **Search presence:** claim Google Business Profile (matches SEO-2), submit sitemap in Search Console + Bing Webmaster, keep NAP (name, address, phone) identical everywhere.
- **Dependency hygiene:** Renovate/Dependabot for Astro/Zod; pin Node version (`.nvmrc`, `engines`).
- **Legal pages:** Regulamin (terms, cancellation, copyright/licence of delivered photos), image-rights clause, cookie/privacy page review once analytics or embeds are added.

## D. Suggested roadmap (value / effort)
1. **Quick conversion boosters (≈ 1 day):** F3 FAQ, F1 testimonials, N11 mobile call bar, N12 prefilled links, F4 process.
2. **Trust and SEO (≈ 2–3 days):** F2 case studies, N1 image pipeline, structured data from SEO-2.
3. **Workflow automation (≈ 3–5 days):** F5 booking, F10 form v2 (+ Option C proxy from `02-form-security.md`), F8 payment links.
4. **Growth (later):** F6 client galleries, F7 vouchers, F11 newsletter, F15 blog, F17 CMS.

## E. Open questions for the owner
- Target city/region(s) — drives SEO-2, F2, F15?
- How are finished photos delivered today (Drive, WeTransfer, other)? Decides priority of F6.
- Is online booking/payment wanted, or is "enquiry → conversation" the preferred flow?
- Are there real client reviews we may publish (written consent)?
- Is an English version or newsletter relevant?
