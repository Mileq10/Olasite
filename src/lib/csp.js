const shared = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self' https://challenges.cloudflare.com",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self' https://api.web3forms.com https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com"
].join('; ');

export const CSP_META = shared;
export const CSP_HEADER = `${shared}; frame-ancestors 'none'`;
