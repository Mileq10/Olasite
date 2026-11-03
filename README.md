# Obiektyw na Szczęście

Statyczna strona Astro (portret, sesje biznesowe, reportaż). Formularz idzie do Web3Forms.

## Uruchomienie

```bash
npm install
npm run dev
npm test
npm run build
```

## Zdjęcia

Pliki galerii leżą w `public/zdjecia/portfolio/<folder>/`. Opisy konkretnych kadrów dopisuje się w `src/data/photo-alts.js`. Bez wpisu strona używa bezpiecznego opisu z nazwą kategorii i numerem kadru.

Foldery `eventy` i `sport` nie mają własnych podstron. Zostają na dysku, dopóki nie potwierdzisz, że zdjęcia nie są już potrzebne.

## Kontakt i SEO

- Rok w stopce bierze się z momentu budowy (`new Date().getFullYear()`), nie z zegara przeglądarki.
- Numer telefonu w `src/lib/site.js` jest tym z briefu. Nie został podmieniony — potwierdź, że `+48 500 100 200` jest właściwy.
- JSON-LD nie podaje miasta ani adresu, bo strona ich nie publikuje.
- Grafika udostępniania to `public/og.jpg` (1200×630).
