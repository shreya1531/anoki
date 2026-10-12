'use strict';
/* Vanilla port of the "Squeeze" carousel: one wide open panel, the rest squeezed into
   slats on the right. Stepping slides the strip along; hovering widens a column. */
(function () {
  const SHARES = [-0.06, 0.61, 0.3, 0.15];
  const STRETCHED = [0, 0.71, 0.4, 0.25];
  const SQUEEZED = [-0.12, 0.59, 0.28, 0.13];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const px = v => (typeof v === 'number' ? v + 'px' : v);

  window.createSqueezeCarousel = function (root, options) {
    const o = Object.assign({
      slides: [], defaultIndex: 0, height: 'clamp(150px, 34cqi, 420px)', slatWidth: 8,
      slatGap: 8, gap: 'clamp(8px, 1.6cqi, 16px)', radius: 2, duration: 1000,
      hoverGrow: true, label: 'Featured', onIndexChange: null, onOpen: null
    }, options);
    const slides = o.slides, count = slides.length;
    if (!count) return null;
    const wrap = i => ((i % count) + count) % count;
    const slats = clamp(count - 4, 1, 3);
    const visible = 4 + slats;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ms = () => (motion.matches ? 0 : o.duration);
    const slat = px(o.slatWidth);

    let seed = 0, column = 0, slid = 0, still = false, hover = -1, lastOpen = -1, timers = [], forward = true;
    let cards = Array.from({ length: visible }, (_, p) => ({ key: seed++, slide: wrap(o.defaultIndex + p), el: null }));

    root.classList.add('sq');
    root.style.setProperty('--sq-h', px(o.height));
    root.style.setProperty('--sq-gap', px(o.gap));
    root.style.setProperty('--sq-slat-gap', px(o.slatGap));
    root.style.setProperty('--sq-radius', px(o.radius));
    root.style.setProperty('--sq-hero', 'calc(var(--sq-h) * 16 / 9)');
    root.style.setProperty('--sq-room', `calc(100cqi - var(--sq-hero) - ${slats} * var(--sq-slat-gap) - 3 * var(--sq-gap) - ${slats} * ${slat})`);
    root.innerHTML = '';
    const viewport = document.createElement('div');
    viewport.className = 'sq-viewport';
    const strip = document.createElement('div');
    strip.className = 'sq-strip';
    strip.setAttribute('role', 'tablist');
    strip.setAttribute('aria-orientation', 'horizontal');
    strip.setAttribute('aria-label', o.label);
    viewport.appendChild(strip);
    root.appendChild(viewport);

    const open = () => (cards[-column] ? cards[-column].slide : o.defaultIndex);

    function shareOf(col) {
      const grow = o.hoverGrow && hover >= 0 && hover <= 3 && !motion.matches;
      if (!grow) return SHARES[col];
      return hover === col ? STRETCHED[col] : SQUEEZED[col];
    }
    function widthOf(col) {
      if (col < 0 || col > 3) return slat;
      if (col === 0) return `calc(var(--sq-hero) + var(--sq-room) * ${shareOf(0)})`;
      return `calc(var(--sq-room) * ${shareOf(col)})`;
    }

    function build(card) {
      const s = slides[card.slide];
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'sq-card';
      el.setAttribute('role', 'tab');
      el.setAttribute('aria-label', s.title);
      const img = document.createElement('img');
      img.src = s.image; img.alt = s.imageAlt || ''; img.draggable = false; img.decoding = 'async';
      el.appendChild(img);
      const cap = document.createElement('span');
      cap.className = 'sq-overlay';
      cap.setAttribute('aria-hidden', 'true');
      cap.innerHTML = `<b>${s.number || ''}</b><i>${s.title}</i><em>${s.category || ''}</em>`;
      el.appendChild(cap);
      el.addEventListener('mousemove', () => { if (o.hoverGrow) { const c = cards.findIndex(k => k.el === el) + column; if (hover !== c) { hover = c; render(); } } });
      el.addEventListener('click', () => {
        const c = cards.findIndex(k => k.el === el) + column;
        if (c > 0) step(c); else if (o.onOpen) o.onOpen(card.slide);
      });
      card.el = el;
      return el;
    }

    function render() {
      // reconcile DOM order without detaching nodes that are already in place
      cards.forEach((card, place) => {
        const el = card.el || build(card);
        if (strip.children[place] !== el) strip.insertBefore(el, strip.children[place] || null);
      });
      while (strip.children.length > cards.length) strip.lastElementChild.remove();
      const dur = still ? '0s' : 'var(--sq-ms)';
      root.style.setProperty('--sq-ms', ms() + 'ms');
      strip.style.transform = `translateX(calc(${slid} * (${slat} + var(--sq-gap))))`;
      strip.style.transition = still ? 'none' : 'transform var(--sq-ms) var(--sq-ease)';
      cards.forEach((card, place) => {
        const col = place + column, front = col === 0, el = card.el, w = widthOf(col);
        el.style.width = w;
        el.style.marginLeft = place === 0 ? '0' : col < 4 ? 'var(--sq-gap)' : 'var(--sq-slat-gap)';
        el.style.borderRadius = `min(var(--sq-radius), calc(${w} / 2))`;
        el.style.transitionDuration = dur;
        el.setAttribute('aria-selected', String(front));
        el.tabIndex = front ? 0 : -1;
        el.classList.toggle('is-front', front);
      });
      const now = open();
      if (now !== lastOpen) { lastOpen = now; if (o.onIndexChange) o.onIndexChange(now); }
    }

    function settle() {
      const hadFocus = strip.contains(document.activeElement);
      cards = forward ? cards.slice(-visible) : cards.slice(0, visible);
      column = 0; slid = 0; still = true;
      render();
      if (hadFocus && strip.children[0]) strip.children[0].focus({ preventScroll: true });
      requestAnimationFrame(() => { still = false; render(); });
    }

    function step(by) {
      if (count < 2 || by === 0) return;
      timers.forEach(clearTimeout); timers = [];
      forward = by > 0;
      if (by > 0) {
        const last = cards[cards.length - 1].slide;
        for (let k = 0; k < by; k++) cards.push({ key: seed++, slide: wrap(last + 1 + k), el: null });
        column -= by; slid -= by;
        render();
      } else {
        const first = cards[0].slide, n = -by;
        const add = Array.from({ length: n }, (_, k) => ({ key: seed++, slide: wrap(first - (n - k)), el: null }));
        cards = add.concat(cards);
        slid += by; still = true;
        render();
        void strip.offsetWidth; // commit the jump before easing home
        still = false; slid = 0;
        render();
      }
      timers.push(setTimeout(settle, ms() + 20));
    }

    function go(to) {
      const here = open();
      if (to === here) return;
      const f = wrap(to - here);
      step(f <= count / 2 ? f : f - count);
    }

    strip.addEventListener('keydown', e => {
      const by = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!by) return;
      e.preventDefault();
      step(by);
    });
    root.addEventListener('mouseleave', () => { if (hover !== -1) { hover = -1; render(); } });
    motion.addEventListener('change', render);

    render();
    return { next: () => step(1), prev: () => step(-1), go, get index() { return open(); } };
  };
})();
