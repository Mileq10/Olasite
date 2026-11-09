export const faqs = [
  {
    question: 'Jakie sesje fotografujesz?',
    answer:
      'Sesje portretowe, sesje biznesowe oraz reportaże: ślubne, komunie, eventy i sport.'
  },
  {
    question: 'Ile kosztuje sesja portretowa?',
    answer:
      'Mini 400 zł (godzina i 15 wyretuszowanych zdjęć), Standard 750 zł, Premium 1200 zł. Pełny zakres jest w ofercie.'
  },
  {
    question: 'Ile kosztuje sesja biznesowa?',
    answer: 'Mini 450 zł, Standard 850 zł, Premium 1400 zł. Liczba zdjęć i czas sesji zależą od pakietu.'
  },
  {
    question: 'Jak wyceniasz reportaż?',
    answer:
      'Podane widełki to nie stały cennik: ślubne 2800–8500 zł, komunie 800–2000 zł, eventy 700–2500 zł, sport 600–2200 zł. Ostateczna kwota zależy od godzin, liczby fotografów, lokalizacji i zakresu. Po rozmowie dostajesz konkretną ofertę.'
  },
  {
    question: 'Co otrzymuję po sesji?',
    answer:
      'Wybrane, wyretuszowane zdjęcia i galerię online. Przy reportażu ślubnym jest też galeria dla gości. Liczba kadrów wynika z pakietu albo z ustalonego zakresu.'
  },
  {
    question: 'Czy telefon jest wymagany?',
    answer: 'Nie. Do odpowiedzi wystarczy adres e-mail. Numer podajesz tylko wtedy, gdy tak jest wygodniej.'
  },
  {
    question: 'Jak umówić termin?',
    answer:
      'Napisz przez formularz albo zadzwoń. W wiadomości wystarczy rodzaj sesji i termin, który Ci pasuje — odezwę się z propozycją.'
  }
];

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}
