import { WEB3FORMS_ACCESS_KEY, WEB3FORMS_ENDPOINT } from '../lib/form-config.js';
import { contactSchema, formatPhoneMask, phoneDigits } from '../lib/contact-schema.js';

export function initHomePage() {
  const tematykaSelect = document.getElementById('tematyka');
  const pakietSelect = document.getElementById('pakiet');
  if (!tematykaSelect || !pakietSelect) return;

  const reportageKeys = ['slubne', 'komunie', 'eventy', 'sport'];
  const fieldNames = ['tematyka', 'pakiet', 'email', 'telefon', 'wiadomosc'];

  function updatePakietOptions() {
    const tematyka = tematykaSelect.value;
    pakietSelect.classList.remove('is-prefilled');

    if (!tematyka) {
      pakietSelect.innerHTML = '<option value="" disabled selected>Najpierw wybierz tematykę</option>';
      pakietSelect.disabled = true;
      return;
    }

    pakietSelect.disabled = false;
    const isReportage = reportageKeys.indexOf(tematyka) !== -1;
    if (isReportage) {
      pakietSelect.innerHTML = '<option value="indywidualna" selected>Wycena indywidualna</option>';
    } else {
      pakietSelect.innerHTML =
        '<option value="" disabled selected>Wybierz pakiet</option>' +
        '<option value="mini">Pakiet Mini</option>' +
        '<option value="standard">Pakiet Standard</option>' +
        '<option value="premium">Pakiet Premium</option>';
    }
  }

  tematykaSelect.addEventListener('change', updatePakietOptions);
  updatePakietOptions();

  function fillForm(tematyka, pakiet) {
    if (!tematyka) return;
    tematykaSelect.value = tematyka;
    updatePakietOptions();
    if (pakiet && pakietSelect.querySelector('option[value="' + pakiet + '"]')) {
      pakietSelect.value = pakiet;
    }
    tematykaSelect.classList.add('is-prefilled');
    pakietSelect.classList.add('is-prefilled');
    clearFieldError('tematyka');
    clearFieldError('pakiet');
  }

  document.querySelectorAll('.js-fill-form').forEach(function (button) {
    button.addEventListener('click', function () {
      fillForm(button.getAttribute('data-tematyka'), button.getAttribute('data-pakiet'));
    });
  });

  const offerMedia = window.matchMedia('(max-width: 900px)');
  const offerCategories = document.querySelectorAll('.offer-category');

  function closeOfferCategories() {
    offerCategories.forEach(function (category) {
      category.classList.remove('is-open');
      const head = category.querySelector('.offer-category-head');
      if (head) head.setAttribute('aria-expanded', 'false');
    });
  }

  function syncOfferAria() {
    offerCategories.forEach(function (category) {
      const head = category.querySelector('.offer-category-head');
      if (!head) return;
      if (!offerMedia.matches) {
        category.classList.remove('is-open');
        head.setAttribute('aria-expanded', 'true');
      } else if (!category.classList.contains('is-open')) {
        head.setAttribute('aria-expanded', 'false');
      }
    });
  }

  offerCategories.forEach(function (category) {
    const head = category.querySelector('.offer-category-head');
    if (!head) return;
    head.addEventListener('click', function () {
      if (!offerMedia.matches) return;
      const isOpen = category.classList.contains('is-open');
      closeOfferCategories();
      if (!isOpen) {
        category.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  if (typeof offerMedia.addEventListener === 'function') {
    offerMedia.addEventListener('change', syncOfferAria);
  } else if (typeof offerMedia.addListener === 'function') {
    offerMedia.addListener(syncOfferAria);
  }
  syncOfferAria();

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
    control?.classList.remove('is-invalid');
    control?.removeAttribute('aria-invalid');
    if (err) {
      err.hidden = true;
      err.textContent = '';
    }
  }

  function clearAllFieldErrors() {
    fieldNames.forEach(clearFieldError);
  }

  function setFieldError(name, message) {
    const wrap = fieldWrap(name);
    const control = fieldControl(name);
    const err = document.getElementById('error-' + name);
    wrap?.classList.add('is-invalid');
    control?.classList.add('is-invalid');
    control?.setAttribute('aria-invalid', 'true');
    if (err) {
      err.hidden = false;
      err.textContent = message;
    }
  }

  const telefonInput = document.getElementById('telefon');
  telefonInput.addEventListener('input', function () {
    telefonInput.value = formatPhoneMask(telefonInput.value);
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

  document.getElementById('contact-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const success = document.getElementById('form-success');
    const errorBox = document.getElementById('form-error');
    const submitBtn = document.getElementById('form-submit');
    success.hidden = true;
    errorBox.hidden = true;
    clearAllFieldErrors();

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
      const issues = parsed.error.issues || [];
      const seen = {};
      issues.forEach(function (issue) {
        const name = issue.path?.[0];
        if (!name || seen[name]) return;
        seen[name] = true;
        setFieldError(String(name), issue.message);
      });
      const first = fieldControl(Object.keys(seen)[0]);
      first?.focus();
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
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        event.target.reset();
        tematykaSelect.classList.remove('is-prefilled');
        pakietSelect.classList.remove('is-prefilled');
        updatePakietOptions();
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
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      event.target.reset();
      tematykaSelect.classList.remove('is-prefilled');
      pakietSelect.classList.remove('is-prefilled');
      updatePakietOptions();
    } catch (err) {
      errorBox.textContent = err.message || 'Nie udało się wysłać formularza.';
      errorBox.hidden = false;
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });
}
