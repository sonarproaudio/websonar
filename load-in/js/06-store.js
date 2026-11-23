'use strict';

/* =====================================================================
   6. PROGRESO GUARDADO
   ===================================================================== */
const Store = (() => {
  let data = { stars: [], mute: false };
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s && Array.isArray(s.stars)) data = s; } catch (e) {}
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) {} };
  return {
    stars: i => data.stars[i] || 0,
    setStars(i, n) { data.stars[i] = Math.max(data.stars[i] || 0, n); persist(); },
    get mute() { return !!data.mute; }, set mute(v) { data.mute = v; persist(); },
    get seenTutorial() { return !!data.seen; }, set seenTutorial(v) { data.seen = v; persist(); },
    get bestStreak() { return data.best || 0; }, setBestStreak(n) { if (n > (data.best || 0)) { data.best = n; persist(); } },
    get lastName() { return data.lastName || ''; }, set lastName(v) { data.lastName = v; persist(); },
    get scores() { return Array.isArray(data.scores) ? data.scores : []; },
    /* ¿esta racha entra al top 10? */
    qualifies(score) { const l = this.scores; return score > 0 && (l.length < 10 || score > l[l.length - 1].score); },
    /* agrega una marca y devuelve su posición (0-based) en el top 10, o -1 si no entró */
    addScore(name, score) {
      const entry = { name, score, at: Date.now() };
      const l = this.scores.slice(); l.push(entry);
      l.sort((a, b) => b.score - a.score || a.at - b.at);
      data.scores = l.slice(0, 10); persist();
      return data.scores.indexOf(entry);
    },
    done() { let n = 0; while (n < LEVEL_COUNT && data.stars[n] > 0) n++; return n; },
    total: () => data.stars.reduce((a, b) => a + (b || 0), 0)
  };
})();
Sound.muted = Store.mute;
