'use strict';

/* =====================================================================
   5. SONIDO
   ===================================================================== */
const Sound = (() => {
  let ctx = null, muted = false;
  function ready() {
    if (muted) return null;
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; } catch (e) { return null; }
  }
  function tone(freq, dur, type, vol, at, slideTo) {
    const a = ready(); if (!a) return;
    try {
      const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (at || 0);
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .12, t + .012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .03);
    } catch (e) {}
  }
  return {
    unlock: ready,
    get muted() { return muted; }, set muted(v) { muted = v; },
    pick: () => tone(520, .06, 'triangle', .07),
    place: () => { tone(150, .12, 'sine', .22, 0, 70); tone(900, .03, 'square', .03); },
    rotate: () => tone(700, .05, 'triangle', .07, 0, 950),
    bad: () => tone(130, .16, 'sawtooth', .06, 0, 90),
    door: () => tone(90, .5, 'sawtooth', .05, 0, 60),
    engine: d => { tone(62, d, 'sawtooth', .07, 0, 48); tone(93, d, 'square', .025, 0, 70); },
    horn: () => { [0, .4].forEach(at => { tone(311, .32, 'square', .05, at); tone(392, .32, 'square', .05, at); }); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .22, 'triangle', .11, i * .09))
  };
})();
function buzz(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {} }
