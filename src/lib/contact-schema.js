import { z } from 'zod';

export const TEMATYKA = ['portretowa', 'biznesowa', 'slubne', 'komunie', 'eventy', 'sport'];
export const REPORTAGE = ['slubne', 'komunie', 'eventy', 'sport'];
export const SESSION_PACKAGES = ['mini', 'standard', 'premium'];

export const contactSchema = z
  .object({
    tematyka: z.enum(TEMATYKA, { error: 'Wybierz tematykę zdjęć.' }),
    pakiet: z.string().trim().min(1, { error: 'Wybierz pakiet.' }),
    email: z
      .email({ error: 'Podaj poprawny adres e-mail.' })
      .max(120, { error: 'E-mail może mieć maksymalnie 120 znaków.' }),
    telefon: z.string(),
    wiadomosc: z
      .string()
      .trim()
      .min(1, { error: 'Napisz krótką wiadomość.' })
      .max(2000, { error: 'Wiadomość może mieć maksymalnie 2000 znaków.' })
  })
  .check((ctx) => {
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
