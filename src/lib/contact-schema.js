import { z } from 'zod';

export const TEMATYKA = ['portretowa', 'biznesowa', 'slubne', 'komunie', 'eventy', 'sport'];
export const REPORTAGE = ['slubne', 'komunie', 'eventy', 'sport'];
export const SESSION_PACKAGES = ['mini', 'standard', 'premium'];

export const FORM_TOPICS = [
  { value: 'portretowa', label: 'Sesja portretowa' },
  { value: 'biznesowa', label: 'Sesja biznesowa' },
  { value: 'slubne', label: 'Ślubne', group: 'Reportaże z wydarzeń' },
  { value: 'komunie', label: 'Komunijne', group: 'Reportaże z wydarzeń' },
  { value: 'eventy', label: 'Eventy', group: 'Reportaże z wydarzeń' },
  { value: 'sport', label: 'Sport', group: 'Reportaże z wydarzeń' }
];

export const PACKAGE_OPTIONS = [
  { value: 'mini', label: 'Pakiet Mini' },
  { value: 'standard', label: 'Pakiet Standard' },
  { value: 'premium', label: 'Pakiet Premium' }
];

function linkCount(value) {
  const matches = String(value || '').match(/https?:\/\/[^\s]+|www\.[^\s]+/gi);
  return matches ? matches.length : 0;
}

export const contactSchema = z
  .object({
    tematyka: z.enum(TEMATYKA, { error: 'Wybierz tematykę zdjęć.' }),
    pakiet: z
      .string()
      .trim()
      .min(1, { error: 'Wybierz pakiet.' })
      .max(32, { error: 'Wybierz pakiet.' }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(120, { error: 'E-mail może mieć maksymalnie 120 znaków.' })
      .check(z.email({ error: 'Podaj poprawny adres e-mail.' })),
    telefon: z.string().max(20, { error: 'Podaj 9 cyfr (np. 123 123 123) albo zostaw to pole puste.' }),
    wiadomosc: z
      .string()
      .trim()
      .min(1, { error: 'Napisz krótką wiadomość.' })
      .max(2000, { error: 'Wiadomość może mieć maksymalnie 2000 znaków.' })
  })
  .check((ctx) => {
    if (linkCount(ctx.value.wiadomosc) > 2) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.wiadomosc,
        path: ['wiadomosc'],
        message: 'W wiadomości mogą być najwyżej dwa linki.'
      });
    }

    const digits = String(ctx.value.telefon || '').replace(/\D/g, '');
    if (digits.length > 0 && digits.length !== 9) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.telefon,
        path: ['telefon'],
        message: 'Podaj 9 cyfr (np. 123 123 123) albo zostaw to pole puste.'
      });
    }

    const tematyka = ctx.value.tematyka;
    const pakiet = ctx.value.pakiet;
    const isReportage = REPORTAGE.includes(tematyka);
    if (isReportage && pakiet !== 'indywidualna') {
      ctx.issues.push({
        code: 'custom',
        input: pakiet,
        path: ['pakiet'],
        message: 'Dla reportażu wybierz wycenę indywidualną.'
      });
    }
    if (!isReportage && !SESSION_PACKAGES.includes(pakiet)) {
      ctx.issues.push({
        code: 'custom',
        input: pakiet,
        path: ['pakiet'],
        message: 'Wybierz pakiet Mini, Standard albo Premium.'
      });
    }
  });

export function formatPhoneMask(value) {
  const digits = String(value || '')
    .replace(/\D/g, '')
    .slice(0, 9);
  const chunks = [];
  if (digits.length > 0) chunks.push(digits.slice(0, 3));
  if (digits.length > 3) chunks.push(digits.slice(3, 6));
  if (digits.length > 6) chunks.push(digits.slice(6, 9));
  return chunks.join(' ');
}

export function phoneDigits(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 9);
}

export function applyPhoneMask(value, selectionStart) {
  const raw = String(value || '');
  const start = selectionStart == null ? raw.length : selectionStart;
  const digitsBefore = raw.slice(0, start).replace(/\D/g, '').length;
  const masked = formatPhoneMask(raw);
  if (!digitsBefore) return { value: masked, caret: 0 };
  let seen = 0;
  for (let i = 0; i < masked.length; i++) {
    if (/\d/.test(masked[i])) seen += 1;
    if (seen === digitsBefore) return { value: masked, caret: i + 1 };
  }
  return { value: masked, caret: masked.length };
}
