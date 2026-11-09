export const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY;
export const WEB3FORMS_ENDPOINT = process.env.WEB3FORMS_ENDPOINT;

// Klucz Web3Forms jest publiczny z założenia. W panelu ogranicz domenę do
// obiektywnaszczescie.pl, włącz filtr spamu, a potem wstaw tutaj nowy klucz.
// Turnstile w Web3Forms jest funkcją planu Pro: wklej site key z Cloudflare
// i sekret w panelu Web3Forms. Puste pole wyłącza widget, formularz działa dalej.
export const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY;
