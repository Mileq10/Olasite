(function () {
  const header = document.getElementById('site-header');
  if (!header) return;

  const toggle = header.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const backdrop = header.querySelector('.nav-backdrop');
  function isNarrow() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  function headerGap() {
    return isNarrow() ? 12 : 20;
  }

  function headerHeight() {
    return Math.ceil(header.getBoundingClientRect().height);
  }

  function updateHeaderOffset() {
    document.documentElement.style.setProperty('--header-h', headerHeight() + 'px');
  }

  function setOpen(open) {
    header.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    }
    if (backdrop) backdrop.hidden = !open;
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('is-open'));
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', function () {
      setOpen(false);
    });
  }

  if (nav) {
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setOpen(false);
      });
    });
  }

  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setOpen(false);
  });

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function sameDocument(url) {
    const here = location.pathname.replace(/\/index\.html$/i, '/').replace(/\/+$/, '') || '/';
    const there = url.pathname.replace(/\/index\.html$/i, '/').replace(/\/+$/, '') || '/';
    return url.origin === location.origin && here === there;
  }

  function isTopTarget(id, link) {
    return id === 'home' || id === 'top' || (link && link.classList.contains('logo'));
  }

  function scrollToTop(behavior) {
    const mode = isNarrow() ? 'auto' : (behavior || 'smooth');
    window.scrollTo({ top: 0, behavior: mode });
  }

  function targetTop(focus) {
    updateHeaderOffset();
    return Math.max(0, window.scrollY + focus.getBoundingClientRect().top - headerHeight() - headerGap());
  }

  function scrollToId(id, behavior) {
    const target = document.getElementById(id);
    if (!target) return false;
    const focus = target.querySelector('.section-title, h1, h2') || target;
    const mode = isNarrow() ? 'auto' : (behavior || 'smooth');
    window.scrollTo({ top: targetTop(focus), behavior: mode });
    window.setTimeout(function () {
      const corrected = targetTop(focus);
      if (Math.abs(corrected - window.scrollY) > 3) {
        window.scrollTo({ top: corrected, behavior: 'auto' });
      }
    }, isNarrow() ? 80 : 420);
    return true;
  }

  function scrollToHash(hash, behavior) {
    const id = String(hash || '').replace(/^#/, '');
    if (!id) return false;
    if (id === 'home' || id === 'top') {
      scrollToTop(behavior);
      return true;
    }
    return scrollToId(id, behavior);
  }

  document.addEventListener('click', function (event) {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const href = link.getAttribute('href');
    if (!href || href === '#' || href.charAt(0) === '?') return;

    const url = new URL(link.href, location.href);

    if (link.classList.contains('logo')) {
      event.preventDefault();
      setOpen(false);
      if (!sameDocument(url)) {
        window.location.href = '/';
        return;
      }
      if (history.pushState) {
        history.pushState(null, '', location.pathname + location.search);
      }
      scrollToTop('smooth');
      return;
    }

    if (!url.hash || !sameDocument(url)) return;

    const id = url.hash.slice(1);
    if (!document.getElementById(id) && !isTopTarget(id, link)) return;

    event.preventDefault();
    setOpen(false);
    if (isTopTarget(id, link)) {
      if (history.pushState) {
        history.pushState(null, '', location.pathname + location.search);
      }
      scrollToTop('smooth');
      return;
    }
    if (history.pushState) {
      history.pushState(null, '', url.hash);
    } else {
      location.hash = url.hash;
    }
    scrollToId(id, 'smooth');
  });

  window.addEventListener('hashchange', function () {
    scrollToHash(location.hash, 'smooth');
  });

  window.addEventListener('resize', updateHeaderOffset);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateHeaderOffset);
  }

  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(updateHeaderOffset).observe(header);
  }

  updateHeaderOffset();

  if (location.hash) {
    scrollToHash(location.hash, 'auto');
    window.addEventListener('load', function () {
      scrollToHash(location.hash, 'auto');
    });
  }
})();
