(function () {
  'use strict';
  var sections = document.querySelectorAll('[data-line-reveal]');
  if (!sections.length) return;
  function play(sec) {
    sec.classList.add('lr-on');
    var items = sec.querySelectorAll('[data-lr]');
    var last = 0;
    items.forEach(function (el) { last = Math.max(last, parseFloat(el.style.getPropertyValue('--i')) || 0); });
    setTimeout(function () { sec.classList.add('lr-done'); }, (last * 0.5 + 1.6) * 1000);
  }
  if (!('IntersectionObserver' in window)) { sections.forEach(play); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { play(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });
  sections.forEach(function (s) { io.observe(s); });
})();
