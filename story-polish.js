(() => {
  'use strict';
  /* Keeps the sticky reveal stage exactly below the real header height on every screen size. */
  const root = document.documentElement;
  const sync = () => {
    const header = document.querySelector('.header');
    if (header) root.style.setProperty('--story-header-h', header.offsetHeight + 'px');
  };
  sync();
  addEventListener('resize', sync, { passive: true });
  addEventListener('orientationchange', sync);
  addEventListener('load', sync, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
})();
