(() => {
  'use strict';

  const story = document.querySelector('.reveal-story');
  const stage = document.querySelector('.reveal-stage');
  const canvas = document.querySelector('.reveal-canvas');
  if (!story || !stage || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const title = document.querySelector('.reveal-title');
  const caption = document.querySelector('.reveal-caption');
  const ending = document.querySelector('.reveal-ending');
  const footerLabel = document.querySelector('.chapter-label');
  const footerCount = document.querySelector('.chapter-count');
  const track = document.querySelector('.story-track div');
  const progressBar = document.querySelector('.scroll-progress span');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const range = (p, a, b) => { const t = clamp((p - a) / (b - a)); return t * t * (3 - 2 * t); };

  const chapters = [
    { at: 0.14, label: '01 · Sketch', title: 'The first line', copy: 'Every icon begins as one confident shape.' },
    { at: 0.31, label: '02 · Inspiration', title: 'Nature sets the rhythm', copy: 'A feather’s elegant curves become a silhouette.' },
    { at: 0.45, label: '03 · Design', title: 'Drawn in gold', copy: 'Sculptural lines, refined until they feel effortless.' },
    { at: 0.58, label: '04 · The setting', title: 'A jewel takes shape', copy: 'Sculptural gold and luminous gemstone details.' },
    { at: 0.72, label: '05 · The gemstones', title: 'Colour, kept', copy: 'Deep emerald stones carry the feather’s eye.' },
    { at: 0.82, label: '06 · The finish', title: 'Made to be worn', copy: 'Polished by hand, with light caught in every curve.' }
  ];
  const TOTAL = chapters.length + 1;

  /* ---------- images ---------- */
  const feather = new Image();
  const jewel = new Image();
  feather.decoding = jewel.decoding = 'async';
  feather.src = 'assets/peacock-feather-BdwX2r3y.png';
  jewel.src = 'assets/mayura-necklace-C9_xoB61.png';

  // Gold "sketch" version of an image: a thin outline plus a faint wash inside the silhouette.
  const buildSketch = img => {
    const w = img.naturalWidth, h = img.naturalHeight;
    const sil = document.createElement('canvas');
    sil.width = w; sil.height = h;
    const s = sil.getContext('2d');
    s.drawImage(img, 0, 0);
    s.globalCompositeOperation = 'source-in';
    s.fillStyle = '#e4c79a';
    s.fillRect(0, 0, w, h);

    const out = document.createElement('canvas');
    out.width = w; out.height = h;
    const o = out.getContext('2d');
    const t = Math.max(2, Math.round(w / 300));
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * Math.PI * 2;
      o.drawImage(sil, Math.cos(ang) * t, Math.sin(ang) * t);
    }
    o.globalCompositeOperation = 'destination-out';
    o.drawImage(sil, 0, 0);
    o.globalCompositeOperation = 'source-over';
    o.globalAlpha = 0.16;
    o.drawImage(sil, 0, 0);
    return out;
  };
  let featherSketch = null, jewelSketch = null;
  const prepare = () => {
    if (feather.complete && feather.naturalWidth && !featherSketch) featherSketch = buildSketch(feather);
    if (jewel.complete && jewel.naturalWidth && !jewelSketch) jewelSketch = buildSketch(jewel);
  };

  /* ---------- layout ---------- */
  // Where the artwork lives inside the stage. Wide screens keep it to the right of the text column;
  // narrow screens centre it beneath the headline.
  const placement = (w, h) => {
    if (w >= 900) return { cx: w * 0.64, cy: h * 0.5, bw: w * 0.4, bh: h * 0.86 };
    if (w >= 640) return { cx: w * 0.62, cy: h * 0.52, bw: w * 0.5, bh: h * 0.8 };
    return { cx: w * 0.5, cy: h * 0.485, bw: w * 0.8, bh: h * 0.44 };
  };

  const drawArt = (src, alpha, p, wipe) => {
    if (!src || alpha <= 0.002) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    const iw = src.naturalWidth || src.width, ih = src.naturalHeight || src.height;
    const a = placement(w, h);
    const scale = Math.min(a.bw / iw, a.bh / ih);
    const dw = iw * scale, dh = ih * scale;
    const lift = reduced ? 0 : (0.5 - p) * 14;
    const x = a.cx - dw / 2, y = a.cy - dh / 2 + lift;
    ctx.save();
    if (wipe !== undefined && wipe < 1) {
      ctx.beginPath();
      ctx.rect(x - 4, y - 4, dw + 8, (dh + 8) * wipe);
      ctx.clip();
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(src, x, y, dw, dh);
    ctx.restore();
  };

  const glow = alpha => {
    if (alpha <= 0.002) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    const a = placement(w, h);
    const r = Math.min(a.bw, a.bh) * 0.62;
    const g = ctx.createRadialGradient(a.cx, a.cy, 0, a.cx, a.cy, r);
    g.addColorStop(0, `rgba(216,178,120,${0.2 * alpha})`);
    g.addColorStop(0.55, `rgba(150,100,70,${0.07 * alpha})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };

  /* ---------- state ---------- */
  let chapterIndex = -2;
  let target = scrollY, current = scrollY, running = false, topCache = null;

  const setChapter = i => {
    if (i === chapterIndex) return;
    chapterIndex = i;
    const c = chapters[Math.max(0, i)];
    caption.querySelector('.eyebrow').textContent = c.label;
    caption.querySelector('h2').textContent = c.title;
    caption.querySelector('p').textContent = c.copy;
    if (footerLabel) footerLabel.textContent = c.label;
    if (footerCount) footerCount.textContent = `0${Math.max(1, i + 1)} / 0${TOTAL}`;
  };

  const render = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    prepare();

    if (topCache === null) { const header = document.querySelector('.header'); topCache = story.getBoundingClientRect().top + scrollY - (header ? header.offsetHeight : 0); }
    const top = topCache;
    const p = clamp((current - top) / Math.max(1, story.offsetHeight - h));

    // artwork: feather -> gold sketch -> necklace sketch -> finished necklace
    const featherColour = 1 - range(p, 0.14, 0.27);
    const featherLine = range(p, 0.14, 0.27) * (1 - range(p, 0.31, 0.46));
    const jewelLine = range(p, 0.31, 0.46) * (1 - range(p, 0.5, 0.62));
    const jewelFill = range(p, 0.48, 0.66);
    glow(range(p, 0.62, 0.8));
    drawArt(feather, featherColour, p);
    drawArt(featherSketch, featherLine, p);
    drawArt(jewelSketch, jewelLine, p);
    drawArt(jewel, jewelFill, p, range(p, 0.48, 0.66));

    // copy: title, then chapter captions, then the closing line (never together)
    title.style.opacity = String(1 - range(p, 0.05, 0.13));
    title.style.visibility = p > 0.14 ? 'hidden' : 'visible';
    title.style.transform = `translate3d(0, ${-p * 20}px, 0)`;

    let ci = 0;
    chapters.forEach((c, i) => { if (p >= c.at) ci = i; });
    setChapter(ci);
    const capIn = range(p, 0.14, 0.2) * (1 - range(p, 0.87, 0.91));
    caption.style.opacity = String(capIn);
    caption.style.visibility = capIn < 0.01 ? 'hidden' : 'visible';
    caption.style.transform = `translate3d(0, ${(1 - capIn) * 14}px, 0)`;

    const endIn = range(p, 0.92, 0.98);
    ending.style.opacity = String(endIn);
    ending.style.visibility = endIn < 0.01 ? 'hidden' : 'visible';
    ending.style.transform = `translate3d(0, ${(1 - endIn) * 12}px, 0)`;
    if (endIn > 0.5) {
      if (footerCount) footerCount.textContent = `0${TOTAL} / 0${TOTAL}`;
      if (footerLabel) footerLabel.textContent = '07 · The reveal';
    } else if (chapterIndex >= 0 && footerLabel && footerLabel.textContent.startsWith('07')) {
      chapterIndex = -2; setChapter(ci);
    }

    if (track) track.style.transform = `scaleY(${p})`;
    if (progressBar) {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      progressBar.style.transform = `scaleX(${clamp(current / max)})`;
    }
  };

  // Frame-rate independent easing so the artwork glides identically on every screen.
  let last = 0;
  const tick = now => {
    const dt = last ? now - last : 16.7; last = now;
    current = reduced ? target : window.AnokhiSmooth.step(current, target, dt);
    if (Math.abs(target - current) < 0.3) { current = target; running = false; last = 0; render(); return; }
    render();
    requestAnimationFrame(tick);
  };
  const onScroll = () => {
    target = scrollY;
    if (!running) { running = true; requestAnimationFrame(tick); }
  };
  const jump = () => { topCache = null; current = target = scrollY; render(); };

  feather.onload = jewel.onload = jump;
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', jump, { passive: true });
  addEventListener('load', jump, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(jump);
  jump();
})();
