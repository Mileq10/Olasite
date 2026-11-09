import { PACKAGE_OPTIONS, REPORTAGE } from '../lib/contact-schema.js';

export function initOffer() {
  const tematykaSelect = document.getElementById('tematyka');
  const pakietSelect = document.getElementById('pakiet');
  if (!tematykaSelect || !pakietSelect) return;
  if (tematykaSelect.dataset.bound === '1') return { updatePakietOptions };
  tematykaSelect.dataset.bound = '1';

  function updatePakietOptions() {
    const tematyka = tematykaSelect.value;
    pakietSelect.classList.remove('is-prefilled');

    if (!tematyka) {
      pakietSelect.innerHTML = '<option value="" disabled selected>Najpierw wybierz tematykę</option>';
      pakietSelect.disabled = true;
      return;
    }

    pakietSelect.disabled = false;
    if (REPORTAGE.includes(tematyka)) {
      pakietSelect.innerHTML = '<option value="indywidualna" selected>Wycena indywidualna</option>';
      return;
    }

    pakietSelect.innerHTML =
      '<option value="" disabled selected>Wybierz pakiet</option>' +
      PACKAGE_OPTIONS.map((option) => `<option value="${option.value}">${option.label}</option>`).join('');
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
    document.getElementById('error-tematyka')?.setAttribute('hidden', '');
    document.getElementById('error-pakiet')?.setAttribute('hidden', '');
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
      if (head && offerMedia.matches) head.setAttribute('aria-expanded', 'false');
    });
  }

  function syncOfferAria() {
    offerCategories.forEach(function (category) {
      const head = category.querySelector('.offer-category-head');
      if (!head) return;
      if (!offerMedia.matches) {
        category.classList.remove('is-open');
        head.removeAttribute('aria-expanded');
      } else if (!category.classList.contains('is-open')) {
        head.setAttribute('aria-expanded', 'false');
      } else {
        head.setAttribute('aria-expanded', 'true');
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

  offerMedia.addEventListener('change', syncOfferAria);
  syncOfferAria();

  const params = new URLSearchParams(window.location.search);
  const requestedTopic = params.get('tematyka');
  if (requestedTopic) fillForm(requestedTopic, params.get('pakiet'));

  return { updatePakietOptions };
}
