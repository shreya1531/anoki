(() => {
  'use strict';

  const body = document.body;
  const story = document.querySelector('.temple-reveal');
  const templePhoto = document.querySelector('.temple-photo');
  const title = document.querySelector('.reveal-title');
  const caption = document.querySelector('.reveal-caption');
  const footerLabel = document.querySelector('.chapter-label');
  const footerCount = document.querySelector('.chapter-count');
  const progressBar = document.querySelector('.scroll-progress span');
  const storyTrack = document.querySelector('.story-track div');
  const finalNecklace = document.querySelector('.final-necklace');
  const campaignLight = document.querySelector('.campaign-light');
  const pieces = [...document.querySelectorAll('.assembly-piece')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smooth = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const range = (value, start, end) => smooth((value - start) / (end - start));

  const chapters = [
    { at: 0, label: '01 · Temple', title: 'Carved by time', copy: 'South Indian temple artistry begins the story.' },
    { at: 0.34, label: '02 · Inspiration', title: 'Architecture, reimagined', copy: 'Carved forms become a silhouette in gold.' },
    { at: 0.56, label: '03 · Assembly', title: 'Form, piece by piece', copy: 'Temple motifs gather into an heirloom.' },
    { at: 0.78, label: '04 · The reveal', title: 'A treasure to keep', copy: 'Antique gold, ruby and pearl, brought together.' }
  ];

  const motion = [
    { name: 'left-chain', start: 0.43, end: 0.57 },
    { name: 'right-chain', start: 0.47, end: 0.61 },
    { name: 'left-panel', start: 0.56, end: 0.70 },
    { name: 'right-panel', start: 0.60, end: 0.74 },
    { name: 'pendant', start: 0.68, end: 0.83 }
  ];

  let currentChapter = -1;
  let frameRequested = false;
  let pageScroll = 0;
  let maxPageScroll = 1;

  body.classList.add('js-ready');

  const setChapter = progress => {
    let next = 0;
    chapters.forEach((chapter, index) => {
      if (progress >= chapter.at) next = index;
    });
    if (next === currentChapter) return;
    currentChapter = next;
    const chapter = chapters[next];
    caption.querySelector('.eyebrow').textContent = chapter.label;
    caption.querySelector('h2').textContent = chapter.title;
    caption.querySelector('p').textContent = chapter.copy;
    footerLabel.textContent = chapter.label;
    footerCount.textContent = `0${next + 1} / 04`;
  };

  const scaledCssValue = (element, property, factor) => {
    const value = getComputedStyle(element).getPropertyValue(property).trim();
    const match = value.match(/^(-?(?:\d+\.?\d*|\.\d+))(.*)$/);
    if (!match) return '0';
    return `${Number(match[1]) * factor}${match[2]}`;
  };

  let storyTopCache = null;
  const getStoryTop = () => {
    if (storyTopCache === null) storyTopCache = story.getBoundingClientRect().top + (window.scrollY || 0) - document.querySelector(".header").offsetHeight;
    return storyTopCache;
  };
  const render = () => {
    frameRequested = false;
    if (!story) return;

    const viewportHeight = window.innerHeight || 1;
    const stageHeight = story.querySelector(".reveal-stage").clientHeight;
    const storyHeight = story.offsetHeight - stageHeight;
    const storyTop = getStoryTop();
    const progress = clamp((pageScroll - storyTop) / Math.max(1, storyHeight));
    const templeFade = range(progress, 0.24, 0.39);
    const titleFade = 1 - range(progress, 0.06, 0.13);
    const captionIn = range(progress, 0.15, 0.21) * (1 - range(progress, 0.85, 0.9));
    const finalIn = range(progress, 0.91, 0.97);
    const lightIn = range(progress, 0.37, 0.85);

    templePhoto.style.opacity = String(1 - templeFade);
    templePhoto.style.transform = `scale(${1.025 + progress * 0.018})`;
    title.style.visibility = progress > 0.15 ? "hidden" : "visible";
    title.style.opacity = String(titleFade * (1 - range(progress, 0.13, 0.15)));
    title.style.transform = `translate3d(0, ${-progress * 18}px, 0)`;
    caption.style.opacity = String(captionIn);
    caption.style.transform = `translate3d(0, ${(1 - captionIn) * 16}px, 0)`;
    finalNecklace.style.opacity = String(finalIn);
    const ending = document.querySelector(".reveal-ending");
    if (ending) { ending.style.opacity = String(finalIn); ending.style.visibility = finalIn > 0.01 ? "visible" : "hidden"; }
    finalNecklace.style.transform = `translateY(${(1 - finalIn) * 1.5}%)`;
    campaignLight.style.opacity = String(lightIn * 0.82);
    storyTrack.style.transform = `scaleY(${progress})`;
    progressBar.style.transform = `scaleX(${maxPageScroll ? pageScroll / maxPageScroll : 0})`;
    setChapter(progress);

    pieces.forEach(piece => {
      const spec = motion.find(item => item.name === piece.dataset.piece);
      if (!spec) return;
      const assembled = reducedMotion
        ? (progress >= spec.start ? 1 : 0)
        : range(progress, spec.start, spec.end);
      const visible = reducedMotion
        ? assembled * (progress < 0.96 ? 1 : 0)
        : Math.min(1, assembled * 1.55) * (1 - finalIn);
      piece.style.opacity = String(visible);
      piece.style.transform = reducedMotion
        ? 'translate3d(0, 0, 0) rotate(0deg) scale(1)'
        : `translate3d(${scaledCssValue(piece, '--from-x', 1 - assembled)}, ${scaledCssValue(piece, '--from-y', 1 - assembled)}, 0) rotate(${scaledCssValue(piece, '--from-rotation', 1 - assembled)}) scale(${0.82 + assembled * 0.18})`;
    });
  };

  let target = window.scrollY || 0, easing = false, lastTime = 0;
  const ease = now => {
    const dt = lastTime ? now - lastTime : 16.7;
    lastTime = now;
    pageScroll = reducedMotion ? target : window.AnokhiSmooth.step(pageScroll, target, dt);
    if (Math.abs(target - pageScroll) < 0.3) { pageScroll = target; easing = false; lastTime = 0; render(); return; }
    render();
    window.requestAnimationFrame(ease);
  };
  const measure = () => {
    target = window.scrollY || window.pageYOffset || 0;
    maxPageScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (!easing) { easing = true; window.requestAnimationFrame(ease); }
  };

  const menuButton = document.querySelector('.mobile-menu-button');
  const mobileNav = document.querySelector('#temple-mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileNav.classList.toggle('is-open', open);
      mobileNav.setAttribute('aria-hidden', String(!open));
    });
    mobileNav.addEventListener('click', event => {
      if (!event.target.closest('a')) return;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      mobileNav.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', () => { storyTopCache = null; pageScroll = window.scrollY || 0; measure(); }, { passive: true });
  window.addEventListener('load', () => {
    storyTopCache = null; pageScroll = window.scrollY || 0;
    measure();
  }, { once: true });

  pageScroll = window.scrollY || 0;
  measure();
})();
