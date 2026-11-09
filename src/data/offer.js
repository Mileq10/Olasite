export const offerCategories = [
  {
    id: 'offer-portret',
    label: 'Portret',
    title: 'Sesja portretowa',
    packages: [
      {
        name: 'Mini',
        priceLabel: '400 zł',
        price: 400,
        items: ['1 godzina zdjęć', '15 wyretuszowanych zdjęć', '1 lokalizacja', 'Galeria online'],
        tematyka: 'portretowa',
        pakiet: 'mini',
        ctaLong: 'Zapytaj o ten pakiet',
        ctaShort: 'Wybierz'
      },
      {
        name: 'Standard',
        priceLabel: '750 zł',
        price: 750,
        featured: true,
        badge: 'Najczęściej wybierany',
        items: ['2 godziny zdjęć', '40 wyretuszowanych zdjęć', 'Do 2 lokalizacji', 'Konsultacja stylizacji'],
        tematyka: 'portretowa',
        pakiet: 'standard',
        ctaLong: 'Zapytaj o ten pakiet',
        ctaShort: 'Wybierz'
      },
      {
        name: 'Premium',
        priceLabel: '1200 zł',
        price: 1200,
        items: ['3 godziny zdjęć', '80 wyretuszowanych zdjęć', 'Kilka aranżacji', 'Priorytetowa edycja'],
        tematyka: 'portretowa',
        pakiet: 'premium',
        ctaLong: 'Zapytaj o ten pakiet',
        ctaShort: 'Wybierz'
      }
    ]
  },
  {
    id: 'offer-biznes',
    label: 'Biznes',
    title: 'Sesja biznesowa',
    packages: [
      {
        name: 'Mini',
        priceLabel: '450 zł',
        price: 450,
        items: ['1 godzina zdjęć', '10 zdjęć do LinkedIn / strony', '1 tło lub lokalizacja', 'Wersje kolor i czarno-białe'],
        tematyka: 'biznesowa',
        pakiet: 'mini',
        ctaLong: 'Zapytaj o ten pakiet',
        ctaShort: 'Wybierz'
      },
      {
        name: 'Standard',
        priceLabel: '850 zł',
        price: 850,
        featured: true,
        badge: 'Najczęściej wybierany',
        items: ['2 godziny zdjęć', '30 zdjęć indywidualnych lub zespołowych', '2 aranżacje', 'Pliki do druku i social mediów'],
        tematyka: 'biznesowa',
        pakiet: 'standard',
        ctaLong: 'Zapytaj o ten pakiet',
        ctaShort: 'Wybierz'
      },
      {
        name: 'Premium',
        priceLabel: '1400 zł',
        price: 1400,
        items: ['3 godziny zdjęć', '60 zdjęć marki / zespołu', 'Kilka lokalizacji', 'Konsultacja wizerunkowa'],
        tematyka: 'biznesowa',
        pakiet: 'premium',
        ctaLong: 'Zapytaj o ten pakiet',
        ctaShort: 'Wybierz'
      }
    ]
  },
  {
    id: 'offer-reportaz',
    label: 'Reportaże',
    title: 'Reportaże z wydarzeń',
    ranges: true,
    disclaimer:
      'Podane kwoty to orientacyjne widełki, a nie stały cennik. Ostateczna wycena jest zawsze indywidualna i zależy od podkategorii, liczby godzin, liczby fotografów, lokalizacji oraz zakresu zdjęć. Po krótkiej rozmowie przygotuję konkretną ofertę.',
    packages: [
      {
        name: 'Ślubne',
        priceLabel: '2800–8500 zł',
        priceFrom: 2800,
        priceTo: 8500,
        note: 'Widełki cenowe',
        items: ['Przygotowania, ceremonia, wesele', 'Zakres ustalany indywidualnie', 'Galeria online dla gości'],
        tematyka: 'slubne',
        pakiet: 'indywidualna',
        ctaLong: 'Zapytaj o wycenę',
        ctaShort: 'Wycena'
      },
      {
        name: 'Komunie',
        priceLabel: '800–2000 zł',
        priceFrom: 800,
        priceTo: 2000,
        featured: true,
        badge: 'Popularne',
        note: 'Widełki cenowe',
        items: ['Uroczystość i przyjęcie', 'Zdjęcia rodzinne i reportaż', 'Czas trwania do uzgodnienia'],
        tematyka: 'komunie',
        pakiet: 'indywidualna',
        ctaLong: 'Zapytaj o wycenę',
        ctaShort: 'Wycena'
      },
      {
        name: 'Eventy',
        priceLabel: '700–2500 zł',
        priceFrom: 700,
        priceTo: 2500,
        note: 'Widełki cenowe',
        items: ['Konferencje, imprezy, gale', 'Cena zależy od długości wydarzenia', 'Zdjęcia do publikacji'],
        tematyka: 'eventy',
        pakiet: 'indywidualna',
        ctaLong: 'Zapytaj o wycenę',
        ctaShort: 'Wycena'
      },
      {
        name: 'Sport',
        priceLabel: '600–2200 zł',
        priceFrom: 600,
        priceTo: 2200,
        note: 'Widełki cenowe',
        items: ['Zawody, mecze, relacje', 'Cena zależy od miejsca i czasu', 'Kadry do mediów i social mediów'],
        tematyka: 'sport',
        pakiet: 'indywidualna',
        ctaLong: 'Zapytaj o wycenę',
        ctaShort: 'Wycena'
      }
    ]
  }
];

export const PRICE_RANGE = '600–8500 PLN';

export function offerCatalogJsonLd(pageUrl) {
  return {
    '@type': 'OfferCatalog',
    name: 'Oferta fotograficzna',
    itemListElement: offerCategories.flatMap((category) =>
      category.packages.map((pkg) => {
        const offer = {
          '@type': 'Offer',
          name: `${category.title} — ${pkg.name}`,
          priceCurrency: 'PLN',
          description: pkg.items.join(', '),
          url: pageUrl
        };
        if (pkg.price) offer.price = String(pkg.price);
        if (pkg.priceFrom) {
          offer.priceSpecification = {
            '@type': 'PriceSpecification',
            minPrice: pkg.priceFrom,
            maxPrice: pkg.priceTo,
            priceCurrency: 'PLN'
          };
        }
        return offer;
      })
    )
  };
}
