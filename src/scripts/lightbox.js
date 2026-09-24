export function initLightbox(root = document) {
  const grid = root.querySelector('[data-lightbox]');
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll('[data-index]'));
  if (!items.length) return;

  items.forEach((item) => {
    const img = item.querySelector('img');
    if (!img) return;
    const mark = function () {
      if (img.naturalWidth > img.naturalHeight) item.classList.add('is-landscape');
      else item.classList.remove('is-landscape');
    };
    if (img.complete && img.naturalWidth) mark();
    else img.addEventListener('load', mark);
  });

  const overlay = root.querySelector('.lightbox');
  const image = overlay?.querySelector('.lightbox-image');
  const closeBtn = overlay?.querySelector('.lightbox-close');
  const prevBtn = overlay?.querySelector('.lightbox-prev');
  const nextBtn = overlay?.querySelector('.lightbox-next');
  const counter = overlay?.querySelector('.lightbox-counter');
  if (!overlay || !image) return;

  const sources = items.map((item) => {
    const img = item.querySelector('img');
    return { src: img?.currentSrc || img?.src || '', alt: img?.alt || '' };
  });

  let current = 0;
  let lastFocused = null;
  let touchStartX = 0;

  function preload(index) {
    const photo = sources[index];
    if (!photo?.src) return;
    const preloadImg = new Image();
    preloadImg.src = photo.src;
  }

  function show(index) {
    current = (index + sources.length) % sources.length;
    const photo = sources[current];
    image.src = photo.src;
    image.alt = photo.alt;
    if (counter) counter.textContent = `${current + 1} / ${sources.length}`;
    const many = sources.length > 1;
    if (prevBtn) prevBtn.hidden = !many;
    if (nextBtn) nextBtn.hidden = !many;
    preload((current + 1) % sources.length);
    preload((current - 1 + sources.length) % sources.length);
  }

  function open(index) {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('lightbox-open');
    show(index);
    closeBtn?.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.classList.remove('lightbox-open');
    image.removeAttribute('src');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function next() {
    show(current + 1);
  }

  function prev() {
    show(current - 1);
  }

  items.forEach((item) => {
    item.addEventListener('click', function () {
      open(Number(item.getAttribute('data-index')) || 0);
    });
  });

  closeBtn?.addEventListener('click', close);
  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) close();
  });

  document.addEventListener('keydown', function (event) {
    if (overlay.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    }
  });

  overlay.addEventListener(
    'touchstart',
    function (event) {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );

  overlay.addEventListener(
    'touchend',
    function (event) {
      const dx = event.changedTouches[0].clientX - touchStartX;
      if (dx > 60) prev();
      else if (dx < -60) next();
    },
    { passive: true }
  );
}
