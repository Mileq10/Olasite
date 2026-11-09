import { WEB3FORMS_ACCESS_KEY, WEB3FORMS_ENDPOINT } from '../lib/form-config.js';
import { applyPhoneMask, contactSchema, phoneDigits } from '../lib/contact-schema.js';
import { scrollIntoView } from './motion.js';

const fieldNames = ['tematyka', 'pakiet', 'email', 'telefon', 'wiadomosc'];
const MIN_FILL_MS = 3000;
const COOLDOWN_MS = 45000;
const COOLDOWN_KEY = 'ons-contact-sent-at';
const SUBMIT_LABEL = 'Wyślij zapytanie';

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

function readCooldownRemaining() {
  try {
    const sentAt = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    if (!sentAt) return 0;
    return Math.max(0, COOLDOWN_MS - (Date.now() - sentAt));
  } catch {
    return 0;
  }
}

function rememberSend() {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    /* prywatny tryb bez storage */
  }
}

export function initContactForm(offer) {
  const form = document.getElementById('contact-form');
  const tematykaSelect = document.getElementById('tematyka');
  const pakietSelect = document.getElementById('pakiet');
  const telefonInput = document.getElementById('telefon');
  if (!form || !tematykaSelect || !pakietSelect || !telefonInput) return;
  if (form.dataset.bound === '1') return;
  form.dataset.bound = '1';

  const openedAt = Date.now();
  const contactEmail = form.dataset.contactEmail || '';
  const contactPhone = form.dataset.contactPhone || '';
  const contactPhoneLabel = form.dataset.contactPhoneLabel || contactPhone;
  const turnstileSiteKey = form.dataset.turnstileSitekey || '';
  let turnstileWidgetId = null;
  let cooldownTimer = 0;

  function resetForm() {
    form.reset();
    tematykaSelect.classList.remove('is-prefilled');
    pakietSelect.classList.remove('is-prefilled');
    fieldNames.forEach(clearFieldError);
    clearErrorSummary();
    offer?.updatePakietOptions();
  }

  function clearErrorSummary() {
    const box = document.getElementById('form-error-summary');
    if (!box) return;
    box.hidden = true;
    box.replaceChildren();
  }

  function showErrorSummary(messages) {
    const box = document.getElementById('form-error-summary');
    if (!box || !messages.length) return;
    const title = document.createElement('p');
    title.textContent = 'Popraw pola oznaczone poniżej:';
    const list = document.createElement('ul');
    messages.forEach(function (message) {
      const item = document.createElement('li');
      item.textContent = message;
      list.append(item);
    });
    box.replaceChildren(title, list);
    box.hidden = false;
    box.focus();
  }

  function showTextError(message) {
    const errorBox = document.getElementById('form-error');
    if (!errorBox) return;
    errorBox.replaceChildren(document.createTextNode(message));
    errorBox.hidden = false;
    scrollIntoView(errorBox);
  }

  function showSendFailure(detail) {
    console.error(detail);
    const errorBox = document.getElementById('form-error');
    if (!errorBox) return;
    errorBox.replaceChildren(document.createTextNode('Nie udało się wysłać wiadomości. Napisz na '));
    if (contactEmail) {
      const mail = document.createElement('a');
      mail.href = 'mailto:' + contactEmail;
      mail.textContent = contactEmail;
      errorBox.append(mail);
    }
    errorBox.append(document.createTextNode(' albo zadzwoń pod '));
    if (contactPhone) {
      const tel = document.createElement('a');
      tel.href = 'tel:' + contactPhone;
      tel.textContent = contactPhoneLabel;
      errorBox.append(tel);
    }
    errorBox.append(document.createTextNode('.'));
    errorBox.hidden = false;
    scrollIntoView(errorBox);
  }

  function applyCooldown() {
    const submitBtn = document.getElementById('form-submit');
    if (!submitBtn) return;
    window.clearTimeout(cooldownTimer);
    const left = readCooldownRemaining();
    if (left > 0) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Poczekaj ' + Math.ceil(left / 1000) + ' s';
      cooldownTimer = window.setTimeout(applyCooldown, 1000);
      return;
    }
    submitBtn.disabled = false;
    submitBtn.textContent = SUBMIT_LABEL;
  }

  function mountTurnstile() {
    const slot = document.getElementById('turnstile-slot');
    if (!turnstileSiteKey || !slot) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = function () {
      if (!window.turnstile) return;
      turnstileWidgetId = window.turnstile.render(slot, {
        sitekey: turnstileSiteKey,
        theme: 'dark'
      });
    };
    document.head.appendChild(script);
  }

  function turnstileToken() {
    if (!turnstileSiteKey) return '';
    return document.querySelector('[name="cf-turnstile-response"]')?.value || '';
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
    clearErrorSummary();
    fieldNames.forEach(clearFieldError);

    const emailInput = document.getElementById('email');
    const honeypot = (document.querySelector('[name="fax_number"]')?.value || '').trim();
    if (honeypot) {
      fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'Zapytanie ze strony',
          from_name: 'Formularz — Obiektyw na Szczęście',
          email: 'bot@example.com',
          message: 'botcheck',
          botcheck: honeypot
        })
      }).catch(function (err) {
        console.error(err);
      });
      success.hidden = false;
      scrollIntoView(success);
      resetForm();
      rememberSend();
      applyCooldown();
      return;
    }
    if (Date.now() - openedAt < MIN_FILL_MS) {
      showTextError('Formularz otworzył się przed chwilą. Odczekaj chwilę i wyślij ponownie.');
      return;
    }
    if (readCooldownRemaining() > 0) {
      applyCooldown();
      showTextError('Chwilę temu wysłano już zapytanie. Spróbuj ponownie za moment albo zadzwoń.');
      return;
    }
    const parsed = contactSchema.safeParse({
      tematyka: tematykaSelect.value,
      pakiet: pakietSelect.disabled ? '' : pakietSelect.value,
      email: (emailInput?.value || '').trim(),
      telefon: telefonInput.value,
      wiadomosc: document.querySelector('[name="wiadomosc"]').value
    });

    if (!parsed.success) {
      const seen = {};
      const messages = [];
      (parsed.error.issues || []).forEach(function (issue) {
        const name = issue.path?.[0];
        if (!name || seen[name]) return;
        seen[name] = true;
        messages.push(issue.message);
        setFieldError(String(name), issue.message);
      });
      showErrorSummary(messages);
      return;
    }

    if (turnstileSiteKey && !turnstileToken()) {
      showTextError('Potwierdź, że nie jesteś robotem, i spróbuj ponownie.');
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
    submitBtn.textContent = 'Wysyłanie…';
    try {
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
          telefon: payload.telefon || 'nie podano',
          botcheck: '',
          ...(turnstileToken() ? { 'cf-turnstile-response': turnstileToken() } : {})
        })
      });
      const result = await response.json();
      if (!response.ok || (result.success !== true && result.success !== 'true')) {
        console.error(result);
        showSendFailure(result);
        if (turnstileWidgetId != null && window.turnstile) window.turnstile.reset(turnstileWidgetId);
        return;
      }
      success.hidden = false;
      scrollIntoView(success);
      resetForm();
      rememberSend();
      if (turnstileWidgetId != null && window.turnstile) window.turnstile.reset(turnstileWidgetId);
    } catch (err) {
      showSendFailure(err);
      if (turnstileWidgetId != null && window.turnstile) window.turnstile.reset(turnstileWidgetId);
    } finally {
      applyCooldown();
    }
  });

  mountTurnstile();
  applyCooldown();
}
