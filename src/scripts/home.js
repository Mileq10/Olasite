import { WEB3FORMS_ACCESS_KEY, WEB3FORMS_ENDPOINT } from '../lib/form-config.js';

export function initHomePage() {
  const tematykaSelect = document.getElementById('tematyka');
  const pakietSelect = document.getElementById('pakiet');
  if (!tematykaSelect || !pakietSelect) return;

  const reportageKeys = ['slubne', 'komunie', 'eventy', 'sport'];

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

  const telefonInput = document.getElementById('telefon');
  telefonInput.addEventListener('input', function () {
    telefonInput.value = telefonInput.value.replace(/\D/g, '').slice(0, 9);
  });

  document.getElementById('contact-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const success = document.getElementById('form-success');
    const errorBox = document.getElementById('form-error');
    const submitBtn = document.getElementById('form-submit');
    success.hidden = true;
    errorBox.hidden = true;

    const digits = telefonInput.value.replace(/\D/g, '');
    const emailInput = document.getElementById('email');
    const email = (emailInput?.value || '').trim();
    const message = document.querySelector('[name="wiadomosc"]').value.trim();
    const honeypot = (document.querySelector('[name="botcheck"]')?.value || '').trim();
    if (!tematykaSelect.value) {
      errorBox.textContent = 'Najpierw wybierz tematykę zdjęć.';
      errorBox.hidden = false;
      tematykaSelect.focus();
      return;
    }
    if (!pakietSelect.value || pakietSelect.disabled) {
      errorBox.textContent = 'Wybierz pakiet.';
      errorBox.hidden = false;
      pakietSelect.focus();
      return;
    }
    if (digits && digits.length !== 9) {
      errorBox.textContent = 'Podaj 9-cyfrowy numer telefonu albo zostaw to pole puste.';
      errorBox.hidden = false;
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
      errorBox.textContent = 'Podaj poprawny adres e-mail.';
      errorBox.hidden = false;
      emailInput?.focus();
      return;
    }
    if (!message) {
      errorBox.textContent = 'Napisz krótką wiadomość.';
      errorBox.hidden = false;
      return;
    }
    if (message.length > 2000) {
      errorBox.textContent = 'Wiadomość może mieć maksymalnie 2000 znaków.';
      errorBox.hidden = false;
      return;
    }

    const payload = {
      tematyka: tematykaSelect.value,
      pakiet: pakietSelect.value,
      email,
      telefon: digits ? '+48' + digits : '',
      wiadomosc: message,
      rodo: document.querySelector('[name="rodo"]').checked
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
          telefon: payload.telefon || 'nie podano',
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
