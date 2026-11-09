export function scrollBehavior(preferred = 'smooth') {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  if (reduce || narrow) return 'auto';
  return preferred;
}

export function scrollIntoView(element) {
  element?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
}

export function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nodes = document.querySelectorAll('[data-reveal]:not(.reveal)');
  if (!nodes.length) return;
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );
  nodes.forEach(function (node) {
    node.classList.add('reveal');
    observer.observe(node);
  });
}
