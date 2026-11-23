'use strict';

/* =====================================================================
   1. CONFIGURACIÓN
   ===================================================================== */
const LEVEL_COUNT = 30;
const SAVE_KEY = 'sonar-loadin-v3';
const RANDOM_ROTATION_FROM = 4;     // desde este nivel las piezas llegan giradas al azar (se introduce aparte del salto de tamaño)

const EVENTS = [
  'Fiesta de patio', 'Cumpleaños', 'Bautizo', 'XV años', 'Boda en el rancho', 'Kermés',
  'Baile del pueblo', 'Graduación', 'Posada', 'Jaripeo', 'Rodeo', 'Fiestas patrias',
  'Feria del condado', 'Coronación', 'Palenque', 'Carnaval', 'Expo ganadera', 'Concierto en la plaza',
  'Baile masivo', 'Festival del pueblo', 'Lienzo charro', 'Arena', 'Feria estatal', 'Teatro',
  'Auditorio', 'Gira: primera fecha', 'Festival de banda', 'Plaza de toros', 'Estadio', 'Gran final'
];

/* Tamaño de la caja: [desde qué nivel, columnas, filas].
   El total (cols*filas) es múltiplo de 4 porque cada pieza ocupa 4 cuadros.
   Progresión suave: 4×4 → 4×6 → 6×6 → 6×8 → 8×8 → 8×10 → 10×10 (7 pasos, sin brincos grandes). */
const GRIDS = [
  [1, 4, 4],    // 4 piezas  · aprender a arrastrar
  [3, 4, 6],    // 6 piezas  · caja un poco más grande
  [7, 6, 6],    // 9 piezas
  [12, 6, 8],   // 12 piezas
  [17, 8, 8],   // 16 piezas
  [22, 8, 10],  // 20 piezas
  [27, 10, 10]  // 25 piezas · final de gira
];
function gridFor(lvl) {
  let g = GRIDS[0];
  for (const row of GRIDS) if (lvl >= row[0]) g = row;
  return [g[1], g[2]];
}
const HINTS_PER_LEVEL = 3;           // pistas por nivel; 1-2 pistas bajan 1★, 3 bajan 2★
const timeLimitFor = n => n * 30 + 45;   // segundos para cargar n piezas; si se acaban, se pierde el nivel
const MIN_TRAY_CELL = 15;            // tamaño mínimo de un cuadro en la bandeja; lo que no quepa espera su turno
/* Estrellas según el tiempo (segundos) y el número de piezas */
const starsFor = (secs, n) => secs <= n * 12 + 15 ? 3 : secs <= n * 25 + 30 ? 2 : 1;
