(() => {
  "use strict";

  const body = document.body;
  const story = document.querySelector(".moonlight-reveal");
  const photo = document.querySelector(".moonlight-photo");
  const cloudUpper = document.querySelector(".cloud-flow-upper");
  const cloudLower = document.querySelector(".cloud-flow-lower");
  const cloudFront = document.querySelector(".cloud-flow-front");
  const campaignBackground = document.querySelector(".campaign-background");
  const campaignLight = document.querySelector(".campaign-light");
  const scrollLabel = document.querySelector(".scroll-label");
  const title = document.querySelector(".reveal-title");
  const caption = document.querySelector(".reveal-caption");
  const ending = document.querySelector(".reveal-ending");
  const progressBar = document.querySelector(".scroll-progress span");
  const storyTrack = document.querySelector(".story-track div");
  const footerLabel = document.querySelector(".chapter-label");
  const footerCount = document.querySelector(".chapter-count");
  const finalSuite = document.querySelector(".pearl-suite-final");
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
      label: "01 · Moonlit clouds",
      title: "A sky in motion",
      copy: "A full moon rests above a lake of reflected light."
    },
    {
      at: 0.22,
      label: "02 · Clouds in motion",
      title: "Silver light shifts",
      copy: "Clouds drift past the moon and open the night."
    },
    {
      at: 0.46,
      label: "03 · A pearl appears",
      title: "A glint through the clouds",
      copy: "A pearl catches the first silver light."
    },
    {
      at: 0.78,
      label: "04 · The reveal",
      title: "Grace, held in light",
      copy: "A pearl necklace and matching earrings."
    }
  ];

  const stageEl = document.querySelector(".moonlight-stage");
  let storyTopCache = null;
  const getStoryTop = () => {
    if (storyTopCache === null) {
      const header = document.querySelector(".header");
      storyTopCache = story.getBoundingClientRect().top + (window.scrollY || 0) - (header ? header.offsetHeight : 0);
    }
    return storyTopCache;
  };
  const invalidateLayout = () => { storyTopCache = null; };
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

  const render = () => {
    frameRequested = false;
    if (!story) return;

    const storyHeight = story.offsetHeight - stageEl.clientHeight;
    const storyTop = getStoryTop();
    const progress = clamp((pageScroll - storyTop) / Math.max(1, storyHeight));
    const photoFade = range(progress, 0.65, 0.84);
    const titleFade = 1 - range(progress, 0.16, 0.25);
    const captionIn = range(progress, 0.22, 0.29) * (1 - range(progress, 0.84, 0.93));
    const finalIn = range(progress, 0.41, 0.68);
    const endingIn = range(progress, 0.78, 0.89);
    const lightIn = range(progress, 0.48, 0.82);
    const cloudExit = 1 - range(progress, 0.58, 0.78);
    const cloudPass = range(progress, 0.31, 0.46) * (1 - range(progress, 0.63, 0.78));
    const travel = reducedMotion ? 0 : progress;

    photo.style.opacity = String(1 - photoFade);
    photo.querySelector("img").style.transform = `scale(${1.015 + travel * 0.025})`;
    cloudUpper.style.opacity = String(0.22 * cloudExit);
    cloudLower.style.opacity = String(0.14 * cloudExit);
    cloudUpper.style.transform = `translate3d(${-travel * 8}vw, ${travel * 0.22}vh, 0)`;
    cloudLower.style.transform = `translate3d(${-travel * 10}vw, ${travel * 0.38}vh, 0)`;
    cloudFront.style.opacity = String(cloudPass * 0.38);
    cloudFront.style.transform = `translate3d(${-travel * 12}vw, ${travel * 0.26}vh, 0)`;
    campaignBackground.style.opacity = String(range(progress, 0.60, 0.82));
    campaignLight.style.opacity = String(lightIn * 0.68);

    title.style.opacity = String(titleFade);
    title.style.transform = `translate3d(0, ${-travel * 18}px, 0)`;
    caption.style.opacity = String(captionIn);
    caption.style.transform = `translate3d(0, ${(1 - captionIn) * 16}px, 0)`;
    ending.style.opacity = String(endingIn);
    ending.style.transform = `translate3d(0, ${(1 - endingIn) * 12}px, 0)`;
    scrollLabel.style.opacity = String(1 - endingIn);
    storyTrack.style.transform = `scaleY(${progress})`;
    progressBar.style.transform = `scaleX(${maxPageScroll ? pageScroll / maxPageScroll : 0})`;
    setChapter(progress);

    finalSuite.style.opacity = String(finalIn);
    finalSuite.style.transform = `scale(${0.97 + finalIn * 0.03})`;
  };

  let target = window.scrollY || 0, easing = false, lastTime = 0;
  const ease = now => {
    const dt = lastTime ? now - lastTime : 16.7;
    lastTime = now;
    pageScroll = reducedMotion ? target : window.AnokhiSmooth.step(pageScroll, target, dt);
    if (Math.abs(target - pageScroll) < 0.3) {
      pageScroll = target; easing = false; lastTime = 0; render(); return;
    }
    render();
    window.requestAnimationFrame(ease);
  };
  const measure = () => {
    target = window.scrollY || window.pageYOffset || 0;
    maxPageScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (!easing) { easing = true; window.requestAnimationFrame(ease); }
  };

  const menuButton = document.querySelector(".mobile-menu-button");
  const mobileNav = document.querySelector("#moonlight-mobile-nav");
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

  const settleAssets = async () => {
    const imageSources = [
      "assets/moonlight-cloud-panorama.webp",
      "assets/moonlight-cloud-motion-upper.webp",
      "assets/moonlight-cloud-motion-lower.webp",
      "assets/pearl-suite.webp",
    ];
    const decoded = imageSources.map(src => new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
      if (image.complete) resolve(image.naturalWidth > 0);
    }));
    await Promise.race([
      Promise.allSettled(decoded),
      new Promise(resolve => window.setTimeout(resolve, 7000))
    ]);
  };

  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", () => { invalidateLayout(); pageScroll = window.scrollY || 0; measure(); }, { passive: true });
  window.addEventListener("load", async () => {
    await settleAssets();
    invalidateLayout();
    pageScroll = window.scrollY || 0;
    measure();
    body.classList.remove("is-loading");
    window.setTimeout(() => {
      document.querySelector(".page-loader")?.classList.add("is-done");
    }, reducedMotion ? 30 : 220);
  }, { once: true });

  pageScroll = window.scrollY || 0;
  measure();
})();
