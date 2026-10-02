# Contact form: security and privacy analysis

Flow today: browser (`home.js`) → Zod validation (client only) → `fetch` JSON POST to `https://api.web3forms.com/submit` with the access key in the payload → Web3Forms e-mails the owner. There is **no server of our own**; the site is static.

Overall risk: **low–medium.** Nothing here can compromise the site or visitors (no stored data, no server code, output is rendered with `textContent`). The real risks are **spam / quota abuse** and **RODO (GDPR) compliance gaps**, both fixable cheaply.

## 1. Findings

| ID | Sev | Finding | Detail |
|----|-----|---------|--------|
| SEC-1 | H | **Access key is public and unrestricted.** `form-config.js` ships `WEB3FORMS_ACCESS_KEY` in the JS bundle and in git. This is by design for Web3Forms (keys are public), but anyone can POST to the endpoint with it directly — bypassing every client check — and burn the monthly quota or flood the inbox with spam. | Restrict by domain (`obiektywnaszczescie.pl`) in the Web3Forms dashboard if the plan allows; enable their spam filters; rotate the key once the domain is restricted (the old one is in git history forever). |
| SEC-2 | H | **All validation is client-side.** Zod runs only in the browser. A direct POST can send any `tematyka`/`pakiet`, 10 MB messages, malformed e-mail, etc. Web3Forms does not enforce our schema. | Cannot be fully fixed on a static site. Mitigate with SEC-1/3/4, or put a tiny proxy (Cloudflare Worker / Netlify Function) in front that re-validates with the same Zod schema and holds the key as a secret (see option C below). |
| SEC-3 | H | **Honeypot is client-side only and not wired to Web3Forms.** The field is named `botcheck` (Web3Forms' native honeypot name), but its value is never put in the JSON payload; `home.js` instead fakes a success and returns. A bot POSTing straight to the API never sees it, so the server-side protection is effectively off. | Send `botcheck` in the payload (Web3Forms then silently drops filled submissions) in addition to the client short-circuit. |
| SEC-4 | H | **No CAPTCHA / bot challenge, no rate limit, no time trap.** Web3Forms supports hCaptcha and Cloudflare Turnstile. | Add Turnstile (free, privacy-friendlier, invisible mode) or hCaptcha; add a minimum fill-time check (reject submit < ~3 s after load) and a client-side cooldown (disable for 30–60 s after a send, `localStorage`). |
| SEC-5 | M | **Privacy policy omits the processor.** Form data goes to Web3Forms (US-based processor) and Google Fonts leaks visitors' IPs to Google. Neither is named; the policy states "no tracking tools". Needs: processor name, third-country transfer note, DPA/SCC reference. | Update `polityka-prywatnosci.astro`; self-host fonts (also a perf win) so no third-party request happens on page load. |
| SEC-6 | M | **Controller is not identified.** "Administratorem danych jest Obiektyw na Szczęście" — art. 13 RODO requires identity and contact details (name or company, address, e-mail). No contact e-mail is given for data requests, only a phone number. | Add legal name / sole-trader name, address (or at least an e-mail) for RODO requests. |
| SEC-7 | M | **Consent wording is inconsistent.** Policy says legal basis is *consent given by clicking "Wyślij zapytanie"* AND art. 6(1)(b); the form says "akceptujesz regulamin" but **no regulamin exists**. Clicking a submit button is a weak consent mechanism; also, replying to an enquiry is typically covered by 6(1)(b)/(f) without consent. | Remove "regulamin" or publish one; simplify basis to 6(1)(b)+(f); add retention period in concrete terms (e.g. 12 months after last contact). |
| SEC-8 | M | **No security headers / CSP.** GitHub Pages cannot set response headers. Without CSP, an XSS (none known) would be unconstrained; clickjacking protection is absent. | Add `<meta http-equiv="Content-Security-Policy">` (default-src 'self'; connect-src api.web3forms.com; img/font sources) — or front the site with Cloudflare to set real headers (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`). Note `<meta>` CSP cannot do `frame-ancestors`. |
| SEC-9 | M | **Server error message is shown verbatim** (`result.message` → `textContent`). Safe from XSS, but leaks vendor wording to visitors and can be confusing (e.g. quota-exceeded). | Show a fixed friendly message ("Nie udało się wysłać — napisz na <e-mail> lub zadzwoń"); log details to console only. |
| SEC-10 | M | **No fallback channel on failure.** If Web3Forms is down or quota is hit, the lead is lost; the visitor only sees a generic error. | Show direct `mailto:` / phone in the error box and keep the typed message in the form (currently preserved — good; keep it that way). |
| SEC-11 | L | `email` is passed as both `email` and `replyto`. Input is JSON-encoded so classic header injection (CRLF) is not possible through this transport, and Zod `.email()` rejects whitespace; still, add `.trim().toLowerCase()` and a max length on all fields in the server-side proxy. | schema |
| SEC-12 | L | The honeypot success path (fake "sent") is good anti-bot practice but gives a real user with a password-manager auto-fill a false positive: their message is dropped silently. | Use `inert` wrapper and `autocomplete="off"`; unusual field name (not `botcheck`) client-side if keeping a separate trap. |
| SEC-13 | L | Message content is not checked for link-spam (typical bot payloads are URLs). | Optional rule: reject > 2 URLs in `wiadomosc`. |
| SEC-14 | L | No `Content-Type`/length limits server-side beyond Zod `max(2000)` (client). `telefon` is `z.string()` unbounded (client `maxlength=11` only). | Add `.max()` to `telefon`/`pakiet` in the shared schema. |
| SEC-15 | L | Public e-mail address in the footer plain text can be scraped. Low impact for a business. | Optional: obfuscate or keep only the form. |

### What is already fine
- No cookies, no analytics, no tracking; no user data stored on our side.
- User input is only ever written with `textContent` (no `innerHTML` with user data); `innerHTML` in `home.js` uses constant strings.
- JSON body, `Accept: application/json`, HTTPS only.
- Honeypot present, submit button disabled during send (prevents double-click duplicates).
- Zod schema checks enumerations (tematyka/pakiet cross-validated), e-mail format, lengths.

## 2. Options to harden (pick one tier)

**A. Stay static, harden Web3Forms (1–2 h, recommended first step).**
Domain-restrict + rotate key (SEC-1), send `botcheck` (SEC-3), enable Turnstile/hCaptcha in Web3Forms (SEC-4), time trap + cooldown, friendly error + mailto fallback (SEC-9/10), meta CSP (SEC-8), fix privacy docs (SEC-5/6/7).

**B. Same as A + Cloudflare in front (≈ +1 h, free).**
Proxy the domain through Cloudflare: real security headers, WAF/bot-fight mode, rate-limiting rule on the page, free DDoS protection, and a cache for images.

**C. Own endpoint (Cloudflare Worker / Netlify Function, ≈ 0.5–1 day).**
Form posts to `/api/contact`; the function verifies the Turnstile token, re-validates with the shared Zod schema (import the same `contact-schema.js`), rate-limits per IP (KV / Turnstile), then forwards to Web3Forms/Resend/SMTP with the key kept as a secret env var. Fixes SEC-1, 2, 3, 4, 9, 11, 14 at the root and removes the key from git.

Recommendation: **A now, B soon, C if spam actually appears or the form starts producing paid leads.**

## 3. Verification checklist (after fixes)
- [ ] `curl` direct POST with the key from a non-allowed origin is rejected.
- [ ] POST with filled `botcheck` is dropped; no e-mail arrives.
- [ ] POST with invalid `tematyka`/oversize message is rejected (option C) or filtered.
- [ ] Turnstile token required; replay of an old token fails.
- [ ] CSP produces no console violations on `/`, `/galeria/*`, `/polityka-prywatnosci`.
- [ ] Privacy policy names Web3Forms, controller identity, retention, and (if used) Cloudflare.
- [ ] Failure state shows phone / mailto and keeps user input.
