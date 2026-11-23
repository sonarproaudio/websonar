'use strict';

/* =====================================================================
   2. CATÁLOGO DE PIEZAS (las 7 del Tetris, cada una de 4 cuadros)
   Cada pieza: nombre, cuadros que ocupa en su posición base y su dibujo.
   U = unidades de dibujo por cuadro.
   ===================================================================== */
const U = 20;
const K = { body: '#17181c', dark: '#0b0c0e', edge: '#9aa1ab', mid: '#3a3e46', alu: '#e4e8ec', aluD: '#aab2bb', steel: '#5d636c' };

function trussArt(x, y, W, H) {
  const step = H * 0.375, top = y + H * 0.2, bot = y + H * 0.8;
  let zig = `M${x + 2.5} ${bot}`, up = true;
  for (let px = x + 2.5 + step; px < x + W - 2.4; px += step) { zig += `L${px.toFixed(1)} ${up ? top : bot}`; up = !up; }
  zig += `L${x + W - 2.5} ${up ? top : bot}`;
  const ch = H * 0.17, chord = cy => `<rect x="${x + 1}" y="${cy}" width="${W - 2}" height="${ch}" rx="${ch / 3}" fill="${K.alu}" stroke="${K.steel}" stroke-width="${H * .04}"/>`;
  const plate = px => `<rect x="${px}" y="${y + H * .1}" width="${H * .13}" height="${H * .8}" fill="${K.aluD}" stroke="${K.steel}" stroke-width="${H * .03}"/>`;
  return `<rect x="${x + 1}" y="${y + H * .1}" width="${W - 2}" height="${H * .8}" rx="1" fill="#23272d" opacity=".3"/>` +
    `<path d="${zig}" fill="none" stroke="${K.steel}" stroke-width="${H * .14}" stroke-linejoin="round"/>` +
    `<path d="${zig}" fill="none" stroke="#d5dbe1" stroke-width="${H * .075}" stroke-linejoin="round"/>` +
    chord(y + H * .1) + chord(y + H * .9 - ch) + plate(x + 1) + plate(x + W - 1 - H * .13);
}
const caster = (cx, cy) => `<rect x="${cx - 2.5}" y="${cy - 3.5}" width="5" height="1.6" fill="${K.edge}"/><circle cx="${cx}" cy="${cy}" r="2.5" fill="#141518" stroke="${K.edge}" stroke-width=".8"/>`;

function headArt(x, y) {           // una cabeza móvil en un cuadro
  return `<g transform="translate(${x} ${y})">
    <rect x="3.5" y="14" width="13" height="4.6" rx="1.2" fill="${K.body}" stroke="${K.edge}" stroke-width=".9"/><rect x="8" y="15.5" width="4" height="1.6" fill="#27b4ff"/>
    <rect x="3.8" y="5" width="2.4" height="9.6" rx="1" fill="#24272d" stroke="${K.edge}" stroke-width=".6"/><rect x="13.8" y="5" width="2.4" height="9.6" rx="1" fill="#24272d" stroke="${K.edge}" stroke-width=".6"/>
    <rect x="6" y="1.4" width="8" height="11.4" rx="3" fill="${K.body}" stroke="${K.edge}" stroke-width=".9"/>
    <circle cx="10" cy="5.6" r="2.9" fill="#1d2731" stroke="${K.edge}" stroke-width=".8"/><circle cx="9.1" cy="4.7" r=".9" fill="#9fd8ff"/></g>`;
}
function blinderArt(x, y) {        // un blinder de 2 focos en un cuadro
  return `<g transform="translate(${x} ${y})">
    <path d="M4 14.4v2.6h12v-2.6" fill="none" stroke="${K.edge}" stroke-width="1.2"/><rect x="8.5" y="17" width="3" height="1.8" fill="${K.edge}"/>
    <rect x="1.5" y="3.8" width="17" height="10.8" rx="1.5" fill="${K.body}" stroke="${K.edge}" stroke-width="1.2"/>
    ${[6, 14].map(cx => `<circle cx="${cx}" cy="9.2" r="3.5" fill="#ffcf5c" stroke="#7a5a12" stroke-width=".8"/><circle cx="${cx}" cy="9.2" r="1.4" fill="#fff6d6"/>`).join('')}</g>`;
}
function deckArt(x, y) {            // tarima/peldaño de escenario que llena un cuadro (para la escalera S)
  return `<g transform="translate(${x} ${y})">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#cfd5db" stroke="${K.steel}" stroke-width="1"/>
    <rect x="1" y="1" width="18" height="5" rx="2" fill="#e4e8ec"/>
    <path d="M3.5 10H16.5M3.5 13.5H16.5" stroke="#8b929c" stroke-width="1" fill="none"/>
    <rect x="3" y="16.6" width="2.6" height="2.4" fill="${K.body}"/><rect x="14.4" y="16.6" width="2.6" height="2.4" fill="${K.body}"/></g>`;
}
function arrayBox(x, y) {           // caja de line array que llena un cuadro (para L/J)
  return `<g transform="translate(${x} ${y})">
    <rect x="1.5" y="2" width="17" height="16" rx="1.5" fill="${K.body}" stroke="${K.edge}" stroke-width="1"/>
    <rect x="3.5" y="4" width="13" height="12" rx="1" fill="#0e0f12" stroke="#2f333a" stroke-width=".6"/>
    <circle cx="7" cy="10" r="3.1" fill="${K.body}" stroke="${K.mid}" stroke-width=".8"/><circle cx="7" cy="10" r="1.1" fill="#24272d"/>
    <rect x="11.2" y="5.6" width="4.6" height="8.8" rx="1" fill="${K.body}" stroke="${K.mid}" stroke-width=".7"/>
    <rect x="2.3" y="8" width="1.3" height="4" fill="${K.aluD}"/><rect x="16.4" y="8" width="1.3" height="4" fill="${K.aluD}"/></g>`;
}

const PIECES = {
  I: { name: 'Truss lineal', cells: [[0, 0], [1, 0], [2, 0], [3, 0]], draw: () => trussArt(0, 0, 80, 20) },

  O: { name: 'Sub doble 18', cells: [[0, 0], [1, 0], [0, 1], [1, 1]], draw: () =>
    `<rect x="1.2" y="1.2" width="37.6" height="32.2" rx="2.6" fill="${K.body}" stroke="${K.edge}" stroke-width="1.2"/>` +
    `<rect x="4.5" y="4.2" width="31" height="26.2" rx="3" fill="#0e0f12" stroke="#4a4f58"/>` +
    [12.6, 27.4].map(cx => `<circle cx="${cx}" cy="17.3" r="6.8" fill="${K.body}" stroke="${K.mid}" stroke-width="1.2"/><circle cx="${cx}" cy="17.3" r="2.7" fill="#24272d"/>`).join('') +
    `<path d="M6.5 7.6H33.5M6.5 27H33.5" stroke="#2f333a" stroke-width=".8" fill="none"/>` +
    `<rect x="1.9" y="13.3" width="2" height="8" fill="${K.steel}"/><rect x="36.1" y="13.3" width="2" height="8" fill="${K.steel}"/>` + caster(8, 36.9) + caster(32, 36.9) },

  T: { name: 'Cabezas móviles', cells: [[1, 0], [0, 1], [1, 1], [2, 1]], draw: () => headArt(20, 0) + headArt(0, 20) + headArt(20, 20) + headArt(40, 20) },

  L: { name: 'Line array colgado', cells: [[0, 0], [1, 0], [1, 1], [1, 2]], draw: () => trussArt(0, 0, 40, 20) + arrayBox(20, 20) + arrayBox(20, 40) },

  J: { name: 'Line array colgado', cells: [[0, 0], [1, 0], [0, 1], [0, 2]], draw: () => trussArt(0, 0, 40, 20) + arrayBox(0, 20) + arrayBox(0, 40) },

  S: { name: 'Escalera de escenario', cells: [[1, 0], [2, 0], [0, 1], [1, 1]], draw: () => deckArt(20, 0) + deckArt(40, 0) + deckArt(0, 20) + deckArt(20, 20) },

  Z: { name: 'Blinders', cells: [[0, 0], [1, 0], [1, 1], [2, 1]], draw: () => blinderArt(0, 0) + blinderArt(20, 0) + blinderArt(20, 20) + blinderArt(40, 20) }
};

/* Tamaño base (en cuadros) de una pieza */
function baseSize(type) {
  const c = PIECES[type].cells;
  return [Math.max(...c.map(p => p[0])) + 1, Math.max(...c.map(p => p[1])) + 1];
}
/* Cuadros de una pieza girada rot veces 90° a la derecha */
function rotatedCells(type, rot) {
  let cells = PIECES[type].cells.map(c => c.slice()), [w, h] = baseSize(type);
  for (let r = 0; r < rot; r++) { cells = cells.map(c => [h - 1 - c[1], c[0]]); [w, h] = [h, w]; }
  return { cells, w, h };
}
/* Dibujo de una pieza girada: el arte gira junto con los cuadros */
function pieceInner(type, rot) {
  const [w, h] = baseSize(type), W = w * U, H = h * U;
  const tf = ['', `translate(${H} 0) rotate(90)`, `translate(${W} ${H}) rotate(180)`, `translate(0 ${W}) rotate(270)`][rot];
  return tf ? `<g transform="${tf}">${PIECES[type].draw()}</g>` : PIECES[type].draw();
}

/* SVG completo de una pieza: dibujo girado + bisel por cuadro (que se lea como tetromino) + zonas táctiles */
function pieceSVG(p) {
  const hits = p.cells.map(c => `<rect class="hit" x="${c[0] * U}" y="${c[1] * U}" width="${U}" height="${U}" fill="transparent"/>`).join('');
  // contorno tenue de cada cuadro: resalta que la pieza son 4 bloques pegados, sin tapar el detalle del equipo
  const bevel = p.cells.map(c => `<rect x="${c[0] * U + .75}" y="${c[1] * U + .75}" width="${U - 1.5}" height="${U - 1.5}" rx="2.4" fill="none" stroke="rgba(0,0,0,.33)" stroke-width="1.1"/><rect x="${c[0] * U + 1.1}" y="${c[1] * U + 1.1}" width="${U - 2.2}" height="${U - 2.2}" rx="2.1" fill="none" stroke="rgba(255,255,255,.14)" stroke-width=".8"/>`).join('');
  return `<svg viewBox="0 0 ${p.w * U} ${p.h * U}" preserveAspectRatio="none">${pieceInner(p.type, p.rot)}${bevel}${hits}</svg>`;
}
