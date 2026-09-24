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

    const payload = {
      tematyka: tematykaSelect.value,
      pakiet: pakietSelect.value,
      telefon: digits ? '+48' + digits : '',
      wiadomosc: document.querySelector('[name="wiadomosc"]').value.trim(),
      rodo: document.querySelector('[name="rodo"]').checked
    };

    submitBtn.disabled = true;
    try {
      const lines = [
        'Nowe zapytanie ze strony Obiektyw na Szczęście',
        '',
        'Tematyka: ' + payload.tematyka,
        'Pakiet: ' + payload.pakiet,
        'Telefon: ' + (payload.telefon || 'nie podano'),
        '',
        'Wiadomość:',
        payload.wiadomosc
      ].join('\n');

      const response = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent('obiektywna.szczescie@gmail.com'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'Zapytanie ze strony: ' + payload.tematyka,
          message: lines,
          tematyka: payload.tematyka,
          pakiet: payload.pakiet,
          telefon: payload.telefon || 'nie podano',
          _template: 'box'
        })
      });
      const result = await response.json();
      if (!response.ok || (result.success !== true && result.success !== 'true')) {
        throw new Error(result.message || 'Nie udało się wysłać formularza.');
      }
      success.hidden = false;
      event.target.reset();
      tematykaSelect.classList.remove('is-prefilled');
      pakietSelect.classList.remove('is-prefilled');
      updatePakietOptions();
    } catch (err) {
      errorBox.textContent = err.message || 'Nie udało się wysłać formularza.';
      errorBox.hidden = false;
    } finally {
      submitBtn.disabled = false;
    }
  });
}
