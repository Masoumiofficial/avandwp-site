import { useEffect } from 'react';

// Scroll-triggered 3D entrance for page sections. The CSS only hides sections when the
// `motion-ok` class is present (set here), so content stays visible without JS or with
// prefers-reduced-motion.
export function useSectionReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;

    const root = document.documentElement;
    root.classList.add('motion-ok');
    const targets = Array.from(document.querySelectorAll<HTMLElement>('main > section:not(.hero), .site-footer'));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    targets.forEach((t) => io.observe(t));

    return () => {
      io.disconnect();
      root.classList.remove('motion-ok');
    };
  }, []);
}
