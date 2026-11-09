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

test('email is trimmed and lowercased, and extra links are rejected', () => {
  const ok = contactSchema.safeParse({
    tematyka: 'portretowa',
    pakiet: 'standard',
    email: '  Jan@Example.com  ',
    telefon: '',
    wiadomosc: 'Termin: https://example.com i www.example.org.'
  });
  assert.equal(ok.success, true);
  assert.equal(ok.data.email, 'jan@example.com');

  const links = contactSchema.safeParse({
    tematyka: 'portretowa',
    pakiet: 'standard',
    email: 'jan@example.com',
    telefon: '',
    wiadomosc: 'https://a.example https://b.example www.c.example'
  });
  assert.equal(links.success, false);
  assert.match(links.error.issues.map((issue) => issue.message).join(' '), /dwa linki/);
});

test('telefon and pakiet reject oversized values', () => {
  const phone = contactSchema.safeParse({
    tematyka: 'portretowa',
    pakiet: 'standard',
    email: 'jan@example.com',
    telefon: '1'.repeat(21),
    wiadomosc: 'Termin w czerwcu.'
  });
  assert.equal(phone.success, false);

  const pack = contactSchema.safeParse({
    tematyka: 'portretowa',
    pakiet: 'x'.repeat(33),
    email: 'jan@example.com',
    telefon: '',
    wiadomosc: 'Termin w czerwcu.'
  });
  assert.equal(pack.success, false);
});
