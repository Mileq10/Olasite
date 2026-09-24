import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Docelowy adres strony (canonical + sitemap). Zmień, gdy będzie domena / GitHub Pages.
export default defineConfig({
  site: 'https://obiektywnaszczescie.pl',
  output: 'static',
  server: {
    host: true,
    port: 4321
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname.replace(/\/+$/, '') || '/';
        return pathname !== '/polityka-prywatnosci.html' && pathname !== '/galeria';
      }
    })
  ],
  redirects: {
    '/polityka-prywatnosci.html': '/polityka-prywatnosci',
    '/galeria/eventy': '/galeria/eventy-sport',
    '/galeria/sport': '/galeria/eventy-sport'
  }
});
