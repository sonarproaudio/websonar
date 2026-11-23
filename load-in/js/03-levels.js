'use strict';

/* =====================================================================
   3. GENERADOR DE NIVELES
      Llena la caja exacta con piezas al azar, así todo nivel tiene solución.
      Usa semilla fija: cada nivel sale igual siempre.
   ===================================================================== */
const TYPES = Object.keys(PIECES);

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Devuelve [{type, rot, x, y}] que cubre toda la caja, o null si no encontró */
function tileGrid(cols, rows, rng) {
  const grid = new Int8Array(cols * rows).fill(-1), placed = [], used = {};
  const cap = Math.ceil(cols * rows / 28) + 1;       // máximo de cada tipo, para que salgan variadas
  let budget = 6000;                                  // si se atora, se reintenta con otra semilla
  const cellFree = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && grid[y * cols + x] === -1;

  function fill() {
    const i = grid.indexOf(-1);
    if (i < 0) return true;
    if (--budget < 0) return false;
    const x = i % cols, y = (i / cols) | 0, options = [];
    for (const type of TYPES) {
      if ((used[type] || 0) >= cap) continue;
      for (let rot = 0; rot < 4; rot++) options.push({ type, rot, key: rng() });
    }
    options.sort((a, b) => a.key - b.key);
    for (const o of options) {
      const { cells } = rotatedCells(o.type, o.rot);
      // el primer cuadro de la pieza (arriba a la izquierda) cae en el primer hueco
      const first = cells.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0])[0];
      const ox = x - first[0], oy = y - first[1];
      if (!cells.every(c => cellFree(ox + c[0], oy + c[1]))) continue;
      cells.forEach(c => { grid[(oy + c[1]) * cols + ox + c[0]] = placed.length; });
      placed.push({ type: o.type, rot: o.rot, x: ox, y: oy }); used[o.type] = (used[o.type] || 0) + 1;
      if (fill()) return true;
      placed.pop(); used[o.type]--;
      cells.forEach(c => { grid[(oy + c[1]) * cols + ox + c[0]] = -1; });
    }
    return false;
  }
  return fill() ? placed : null;
}

function generateLevel(index) {
  const lvl = index + 1, [cols, rows] = gridFor(lvl);
  let layout = null;
  for (let attempt = 0; attempt < 400 && !layout; attempt++) layout = tileGrid(cols, rows, mulberry32(lvl * 7919 + attempt * 104729 + 17));
  return { index, cols, rows, name: EVENTS[index], layout: layout || [] };
}

/* Modo infinito: la caja crece ronda a ronda y luego se queda en el máximo.
   La semilla cambia por sesión (seed) para que cada racha salga distinta. */
const ENDLESS_SIZES = [[4, 4], [4, 6], [6, 6], [6, 8], [8, 8], [8, 10], [10, 10]];
function generateEndless(streak, seed) {
  const [cols, rows] = ENDLESS_SIZES[Math.min(streak, ENDLESS_SIZES.length - 1)];
  let layout = null;
  for (let attempt = 0; attempt < 400 && !layout; attempt++) layout = tileGrid(cols, rows, mulberry32((seed + streak * 911 + attempt * 104729) | 0 || 1));
  return { index: streak, cols, rows, name: 'Práctica', layout: layout || [] };
}
