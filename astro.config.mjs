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
      filter: (page) =>
        !page.includes('polityka-prywatnosci.html') && !page.endsWith('/galeria/')
    })
  ],
  redirects: {
    '/polityka-prywatnosci.html': '/polityka-prywatnosci'
  }
});
