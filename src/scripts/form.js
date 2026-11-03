import { WEB3FORMS_ACCESS_KEY, WEB3FORMS_ENDPOINT } from '../lib/form-config.js';
import { applyPhoneMask, contactSchema, phoneDigits } from '../lib/contact-schema.js';
import { scrollIntoView } from './motion.js';

const fieldNames = ['tematyka', 'pakiet', 'email', 'telefon', 'wiadomosc'];

function fieldWrap(name) {
  return document.querySelector('[data-field="' + name + '"]');
}

function fieldControl(name) {
  if (name === 'wiadomosc') return document.querySelector('[name="wiadomosc"]');
  return document.getElementById(name);
}

function clearFieldError(name) {
  const wrap = fieldWrap(name);
  const control = fieldControl(name);
  const err = document.getElementById('error-' + name);
  wrap?.classList.remove('is-invalid');
  control?.removeAttribute('aria-invalid');
  if (err) {
    err.hidden = true;
    err.textContent = '';
  }
}

function setFieldError(name, message) {
  const wrap = fieldWrap(name);
  const control = fieldControl(name);
  const err = document.getElementById('error-' + name);
  wrap?.classList.add('is-invalid');
  control?.setAttribute('aria-invalid', 'true');
  if (err) {
    err.hidden = false;
    err.textContent = message;
  }
}

export function initContactForm(offer) {
  const form = document.getElementById('contact-form');
  const tematykaSelect = document.getElementById('tematyka');
  const pakietSelect = document.getElementById('pakiet');
  const telefonInput = document.getElementById('telefon');
  if (!form || !tematykaSelect || !pakietSelect || !telefonInput) return;

  function resetForm() {
    form.reset();
    tematykaSelect.classList.remove('is-prefilled');
    pakietSelect.classList.remove('is-prefilled');
    fieldNames.forEach(clearFieldError);
    offer?.updatePakietOptions();
  }

  telefonInput.addEventListener('input', function () {
    const next = applyPhoneMask(telefonInput.value, telefonInput.selectionStart);
    telefonInput.value = next.value;
    telefonInput.setSelectionRange(next.caret, next.caret);
    clearFieldError('telefon');
  });

  fieldNames.forEach(function (name) {
    const control = fieldControl(name);
    if (!control || name === 'telefon') return;
    control.addEventListener('input', function () {
      clearFieldError(name);
    });
    control.addEventListener('change', function () {
      clearFieldError(name);
    });
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const success = document.getElementById('form-success');
    const errorBox = document.getElementById('form-error');
    const submitBtn = document.getElementById('form-submit');
    success.hidden = true;
    errorBox.hidden = true;
    fieldNames.forEach(clearFieldError);

    const emailInput = document.getElementById('email');
    const honeypot = (document.querySelector('[name="botcheck"]')?.value || '').trim();
    const parsed = contactSchema.safeParse({
      tematyka: tematykaSelect.value,
      pakiet: pakietSelect.disabled ? '' : pakietSelect.value,
      email: (emailInput?.value || '').trim(),
      telefon: telefonInput.value,
      wiadomosc: document.querySelector('[name="wiadomosc"]').value
    });

    if (!parsed.success) {
      const seen = {};
      (parsed.error.issues || []).forEach(function (issue) {
        const name = issue.path?.[0];
        if (!name || seen[name]) return;
        seen[name] = true;
        setFieldError(String(name), issue.message);
      });
      fieldControl(Object.keys(seen)[0])?.focus();
      return;
    }

    const digits = phoneDigits(parsed.data.telefon);
    const payload = {
      tematyka: parsed.data.tematyka,
      pakiet: parsed.data.pakiet,
      email: parsed.data.email,
      telefon: digits ? '+48' + digits : '',
      wiadomosc: parsed.data.wiadomosc
    };

    submitBtn.disabled = true;
    const submitLabel = submitBtn.textContent;
    submitBtn.textContent = 'Wysyłanie…';
    try {
      if (honeypot) {
        success.hidden = false;
        scrollIntoView(success);
        resetForm();
        return;
      }

      const lines = [
        'Nowe zapytanie ze strony Obiektyw na Szczęście',
        '',
        'Tematyka: ' + payload.tematyka,
        'Pakiet: ' + payload.pakiet,
        'E-mail: ' + payload.email,
        'Telefon: ' + (payload.telefon || 'nie podano'),
        '',
        'Wiadomość:',
        payload.wiadomosc
      ].join('\n');

      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'Zapytanie ze strony: ' + payload.tematyka,
          from_name: 'Formularz — Obiektyw na Szczęście',
          email: payload.email,
          replyto: payload.email,
          message: lines,
          tematyka: payload.tematyka,
          pakiet: payload.pakiet,
          telefon: payload.telefon || 'nie podano'
        })
      });
      const result = await response.json();
      if (!response.ok || (result.success !== true && result.success !== 'true')) {
        throw new Error(result.message || 'Nie udało się wysłać formularza.');
      }
      success.hidden = false;
      scrollIntoView(success);
      resetForm();
    } catch (err) {
      errorBox.textContent = err.message || 'Nie udało się wysłać formularza.';
      errorBox.hidden = false;
      scrollIntoView(errorBox);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });
}
