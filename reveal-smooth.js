/* Shared helpers that make every scroll reveal feel fluid.
   - Frame-rate independent damping: motion is identical on 60 Hz, 120 Hz and 144 Hz screens.
   - Large images are decoded ahead of time so the first frame of a reveal never stutters. */
(function () {
  'use strict';
  var TAU = 120; // ms: how quickly the reveal catches up with the scrollbar
  window.AnokhiSmooth = {
    tau: TAU,
    step: function (current, target, dt) {
      return current + (target - current) * (1 - Math.exp(-Math.min(dt, 64) / TAU));
    }
  };
  function warm() {
    var imgs = document.querySelectorAll('.reveal-stage img, .moonlight-stage img, .see-stage img, .sea-jewel img');
    imgs.forEach(function (img) {
      if (img.decode) img.decode().catch(function () {});
    });
  }
  if (document.readyState === 'complete') warm(); else window.addEventListener('load', warm, { once: true });
})();
