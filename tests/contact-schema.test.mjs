import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPhoneMask, contactSchema, formatPhoneMask } from '../src/lib/contact-schema.js';

test('formatPhoneMask groups digits by three', () => {
  assert.equal(formatPhoneMask('123456789'), '123 456 789');
  assert.equal(formatPhoneMask('12a34'), '123 4');
  assert.equal(formatPhoneMask('123456789012'), '123 456 789');
});

test('applyPhoneMask keeps the caret after the typed digit', () => {
  const next = applyPhoneMask('1234', 4);
  assert.equal(next.value, '123 4');
  assert.equal(next.caret, 5);
});

test('contactSchema accepts a session inquiry and rejects a short phone', () => {
  const ok = contactSchema.safeParse({
    tematyka: 'portretowa',
    pakiet: 'standard',
    email: 'jan@example.com',
    telefon: '123 456 789',
    wiadomosc: 'Termin w czerwcu.'
  });
  assert.equal(ok.success, true);

  const bad = contactSchema.safeParse({
    tematyka: 'portretowa',
    pakiet: 'standard',
    email: 'jan@example.com',
    telefon: '12',
    wiadomosc: 'Termin w czerwcu.'
  });
  assert.equal(bad.success, false);
  assert.match(bad.error.issues[0].message, /9 cyfr/);
});

test('reportage requires the individual package', () => {
  const bad = contactSchema.safeParse({
    tematyka: 'slubne',
    pakiet: 'mini',
    email: 'jan@example.com',
    telefon: '',
    wiadomosc: 'Proszę o wycenę.'
  });
  assert.equal(bad.success, false);
});
