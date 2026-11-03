export function scrollBehavior(preferred = 'smooth') {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  if (reduce || narrow) return 'auto';
  return preferred;
}

export function scrollIntoView(element) {
  element?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
}
