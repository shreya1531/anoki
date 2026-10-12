(() => {
  "use strict";

  const body = document.body;
  const story = document.querySelector(".rose-reveal");
  const rosePhoto = document.querySelector(".rose-photo");
  const campaignBackground = document.querySelector(".campaign-background");
  const campaignLight = document.querySelector(".campaign-light");
  const title = document.querySelector(".reveal-title");
  const caption = document.querySelector(".reveal-caption");
  const ending = document.querySelector(".reveal-ending");
  const progressBar = document.querySelector(".scroll-progress span");
  const storyTrack = document.querySelector(".story-track div");
  const footerLabel = document.querySelector(".chapter-label");
  const footerCount = document.querySelector(".chapter-count");
  const petals = [...document.querySelectorAll(".rose-petal")];
  const pieces = [...document.querySelectorAll(".assembly-piece")];
  const finalSuite = document.querySelector(".ruby-suite-final");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smooth = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const range = (value, start, end) => smooth((value - start) / (end - start));

  const chapters = [
    {
      at: 0,
      label: "01 · The rose",
      title: "A bloom in velvet",
      copy: "Deep crimson petals hold the first light of the story."
    },
    {
      at: 0.23,
      label: "02 · Unfurling",
      title: "Petals find their light",
      copy: "A rose loosens into a graceful drift of living colour."
    },
    {
      at: 0.48,
      label: "03 · The setting",
      title: "A jewel takes shape",
      copy: "Ruby and white-stone details gather, one by one."
    },
    {
      at: 0.78,
      label: "04 · The reveal",
      title: "Love, made radiant",
      copy: "A matching ruby suite, composed to be treasured."
    }
  ];

  const petalMotion = [
    { homeX: -0.07, homeY: -0.035, driftX: -0.24, driftY: -0.19, rotation: -98, scale: 1.02 },
    { homeX: 0.045, homeY: -0.075, driftX: 0.22, driftY: -0.21, rotation: 74, scale: 0.92 },
    { homeX: 0.085, homeY: 0.015, driftX: 0.31, driftY: -0.035, rotation: 112, scale: 1.08 },
    { homeX: -0.09, homeY: 0.035, driftX: -0.29, driftY: 0.09, rotation: -78, scale: 0.94 },
    { homeX: 0.015, homeY: 0.07, driftX: 0.11, driftY: 0.24, rotation: 82, scale: 1.04 },
    { homeX: -0.01, homeY: -0.005, driftX: -0.09, driftY: -0.29, rotation: -126, scale: 0.88 }
  ];

  const assemblyMotion = [
    { name: "left-chain", start: 0.43, end: 0.61 },
    { name: "right-chain", start: 0.47, end: 0.65 },
    { name: "pendant", start: 0.59, end: 0.77 },
    { name: "left-earring", start: 0.72, end: 0.82 },
    { name: "right-earring", start: 0.74, end: 0.84 }
  ];

  let currentChapter = -1;
  let frameRequested = false;
  let pageScroll = 0;
  let maxPageScroll = 1;

  const setChapter = progress => {
    let next = 0;
    chapters.forEach((chapter, index) => {
      if (progress >= chapter.at) next = index;
    });
    if (next === currentChapter || !caption) return;

    currentChapter = next;
    const chapter = chapters[next];
    caption.querySelector(".eyebrow").textContent = chapter.label;
    caption.querySelector("h2").textContent = chapter.title;
    caption.querySelector("p").textContent = chapter.copy;
    if (footerLabel) footerLabel.textContent = chapter.label;
    if (footerCount) footerCount.textContent = `0${next + 1} / 04`;
  };

  const scaledCssValue = (element, property, factor) => {
    const value = getComputedStyle(element).getPropertyValue(property).trim();
    const match = value.match(/^(-?(?:\d+\.?\d*|\.\d+))(.*)$/);
    if (!match) return "0";
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
    const revealStageHeight = story.querySelector(".reveal-stage").clientHeight;
    const storyHeight = story.offsetHeight - revealStageHeight;
    const storyTop = getStoryTop();
    const progress = clamp((pageScroll - storyTop) / Math.max(1, storyHeight));
    const roseFade = range(progress, 0.22, 0.43);
    const captionIn = range(progress, 0.15, 0.21) * (1 - range(progress, 0.85, 0.9));
    const finalIn = range(progress, 0.91, 0.97);
    const lightIn = range(progress, 0.38, 0.82);
    const petalIn = range(progress, 0.17, 0.27);
    const petalOut = 1 - range(progress, 0.46, 0.56);
    const petalSpread = range(progress, 0.22, 0.52);
    const stageWidth = story.querySelector(".reveal-stage").clientWidth || 1;
    const stageHeight = story.querySelector(".reveal-stage").clientHeight || 1;

    rosePhoto.style.opacity = String(1 - roseFade);
    rosePhoto.querySelector("img").style.transform = `scale(${1.035 + progress * 0.045})`;
    campaignBackground.style.opacity = String(range(progress, 0.35, 0.7));
    campaignLight.style.opacity = String(lightIn * 0.82);

    title.style.visibility = progress > 0.15 ? "hidden" : "visible";
    title.style.opacity = String(1 - range(progress, 0.05, 0.13));
    title.style.transform = `translate3d(0, ${-progress * 16}px, 0)`;
    caption.style.opacity = String(captionIn);
    caption.style.transform = `translate3d(0, ${(1 - captionIn) * 15}px, 0)`;
    ending.style.opacity = String(finalIn);
    ending.style.visibility = finalIn > 0.01 ? "visible" : "hidden";
    ending.style.transform = `translate3d(0, ${(1 - finalIn) * 12}px, 0)`;
    storyTrack.style.transform = `scaleY(${progress})`;
    progressBar.style.transform = `scaleX(${maxPageScroll ? pageScroll / maxPageScroll : 0})`;
    setChapter(progress);

    petals.forEach((petal, index) => {
      const spec = petalMotion[index];
      if (!spec) return;
      const movement = reducedMotion ? (progress >= 0.25 ? 1 : 0) : petalSpread;
      const visible = reducedMotion
        ? (progress >= 0.18 && progress < 0.56 ? 0.85 : 0)
        : petalIn * petalOut;
      const x = spec.driftX * stageWidth * movement;
      const y = spec.driftY * stageHeight * movement;
      const rotation = spec.rotation * movement;
      const scale = spec.scale * (1 - movement * 0.13);
      petal.style.left = `${50 + spec.homeX * 100}%`;
      petal.style.top = `${48 + spec.homeY * 100}%`;
      petal.style.opacity = String(visible);
      petal.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) rotate(${rotation}deg) scale(${scale})`;
    });

    pieces.forEach(piece => {
      const spec = assemblyMotion.find(item => item.name === piece.dataset.piece);
      if (!spec) return;
      const assembled = reducedMotion
        ? (progress >= spec.start ? 1 : 0)
        : range(progress, spec.start, spec.end);
      const visible = reducedMotion
        ? assembled * (progress < 0.97 ? 1 : 0)
        : Math.min(1, assembled * 1.5) * (1 - finalIn);
      piece.style.opacity = String(visible);
      piece.style.transform = reducedMotion
        ? "translate3d(0, 0, 0) rotate(0deg) scale(1)"
        : `translate3d(${scaledCssValue(piece, "--from-x", 1 - assembled)}, ${scaledCssValue(piece, "--from-y", 1 - assembled)}, 0) rotate(${scaledCssValue(piece, "--from-rotation", 1 - assembled)}) scale(${0.84 + assembled * 0.16})`;
    });

    finalSuite.style.opacity = String(finalIn);
    finalSuite.style.transform = `translateY(${(1 - finalIn) * 1.4}%) scale(${0.985 + finalIn * 0.015})`;
  };

  const measure = () => {
    target = window.scrollY || window.pageYOffset || 0;
    maxPageScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (!easing) { easing = true; window.requestAnimationFrame(ease); }
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

  const menuButton = document.querySelector(".mobile-menu-button");
  const mobileNav = document.querySelector("#rose-mobile-nav");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileNav.classList.toggle("is-open", open);
      mobileNav.setAttribute("aria-hidden", String(!open));
    });
    mobileNav.addEventListener("click", event => {
      if (!event.target.closest("a")) return;
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open menu");
      mobileNav.classList.remove("is-open");
      mobileNav.setAttribute("aria-hidden", "true");
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  });

  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", () => { storyTopCache = null; pageScroll = window.scrollY || 0; measure(); });
  window.addEventListener("load", () => {
    storyTopCache = null; pageScroll = window.scrollY || 0;
    measure();
    window.setTimeout(() => {
      document.querySelector(".page-loader")?.classList.add("is-done");
      body.classList.remove("is-loading");
    }, reducedMotion ? 30 : 500);
  }, { once: true });

  measure();
})();
