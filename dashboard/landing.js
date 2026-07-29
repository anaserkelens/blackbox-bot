// Public landing page: mobile menu, scroll reveal, footer year.
(() => {
  // --- Mobile menu ---
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('site-nav');

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // --- Footer year ---
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // --- Scroll reveal (no-JS keeps everything visible) ---
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('[data-reveal]');
  document.body.classList.add('reveal-ready');

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  items.forEach((el) => io.observe(el));
})();
