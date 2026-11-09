# Obiektyw na Szczęście

Statyczna strona Astro (portret, sesje biznesowe, reportaż). Formularz idzie do Web3Forms.

## Uruchomienie

```bash
npm install
npm run dev
npm test
npm run lint
npm run check
npm run build
```

## Zdjęcia

Pliki galerii leżą w `public/zdjecia/portfolio/<folder>/`. Opisy konkretnych kadrów dopisuje się w `src/data/photo-alts.js`. Bez wpisu strona używa bezpiecznego opisu z nazwą kategorii i numerem kadru.

Foldery `eventy` i `sport` nie są podpięte pod żadną podstronę, więc ich pliki zostały usunięte. Okładka reportaży zostaje w `public/zdjecia/portfolio/wydarzenia/okladka.jpg`.

Ceny pakietów zmieniasz w `src/data/offer.js`. Ta sama lista zasila karty oferty i dane strukturalne.

## Publikacja

Strona jest statyczna i idzie na Vercel (`obiektywnaszczescie.pl`). `npm run build` składa katalog `dist/`. Osobnego wdrożenia na GitHub Pages nie ma, żeby nie powstał drugi adres obok Vercel.

## Kontakt i SEO

- Rok w stopce bierze się z momentu budowy (`new Date().getFullYear()`), nie z zegara przeglądarki.
- Numer telefonu w `src/lib/site.js` jest tym z briefu. Nie został podmieniony — potwierdź, że `+48 500 100 200` jest właściwy.
- JSON-LD nie podaje miasta ani adresu, bo strona ich nie publikuje.
- Grafika udostępniania to `public/og.jpg` (1200×630).

## Formularz

Klucz Web3Forms jest w `src/lib/form-config.js` i w paczce JavaScript. Tak działa ta usługa, więc w panelu Web3Forms ogranicz domenę do `obiektywnaszczescie.pl`, włącz filtr spamu, a potem wklej nowy klucz. Stary zostaje w historii gita.

Cloudflare Turnstile w Web3Forms wymaga planu Pro. Site key wstawiasz w `TURNSTILE_SITE_KEY`, a sekret w panelu Web3Forms. Puste pole zostawia formularz bez widgetu.

Po udanym wysłaniu przycisk czeka 45 sekund. Wiadomość wysłana szybciej niż 3 sekundy od otwarcia strony jest odrzucana. Błąd wysyłki nie kasuje wpisanej treści i podaje e-mail oraz telefon.

Link do konkretnego pakietu: `/?tematyka=portretowa&pakiet=standard#kontakt`.
