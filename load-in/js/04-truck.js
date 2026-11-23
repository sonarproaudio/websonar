'use strict';

/* =====================================================================
   4. CAMIÓN (doble cabina)
   ===================================================================== */
function truckSVG() {
  const wheel = cx => `<g class="wheel" style="transform-origin:${cx}px 123px">
    <circle cx="${cx}" cy="123" r="17" fill="#141518"/><circle cx="${cx}" cy="123" r="10" fill="#d3d8de"/><circle cx="${cx}" cy="123" r="3.2" fill="#7b828c"/>
    ${[0, 1, 2, 3, 4, 5].map(i => { const t = i * Math.PI / 3; return `<circle cx="${(cx + 6.6 * Math.cos(t)).toFixed(1)}" cy="${(123 + 6.6 * Math.sin(t)).toFixed(1)}" r="1.2" fill="#5d636c"/>`; }).join('')}
    <rect x="${cx - 1}" y="107" width="2" height="4" fill="#3a3e46"/></g>`;
  const logo = (x, y, w, h) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 650 370" color="#111"><use href="#logo"/></svg>`;
  return `<svg viewBox="0 0 360 142" role="img" aria-label="Camión SONAR">
  <g class="body">
    <rect x="12" y="104" width="300" height="8" fill="#17181c"/>
    <rect x="92" y="108" width="40" height="13" rx="3" fill="#2a2d35"/>
    <!-- caja larga, como el camión real -->
    <rect x="8" y="16" width="204" height="90" rx="2" fill="#f6f7f8" stroke="#aeb5bd" stroke-width="1.5"/>
    <rect x="8" y="16" width="204" height="7" fill="#b9c0c7"/><rect x="8" y="100" width="204" height="6" fill="#b9c0c7"/><rect x="8" y="16" width="5" height="90" fill="#c7cdd3"/>
    <path d="M210 16 H240 Q250 16 250 26 V50 H210 Z" fill="#c7cdd3" stroke="#9aa1ab" stroke-width="1.2"/>
    <rect x="217" y="24" width="26" height="20" rx="2" fill="#eceef0"/>
    ${logo(51, 28, 118, 67)}
    <!-- doble cabina corta: 2 puertas del mismo tamaño por lado -->
    <path d="M212 52 H284 Q290 52 294 60 L301 80 H338 Q347 82 349 96 V112 H212 Z" fill="#f6f7f8" stroke="#aeb5bd" stroke-width="1.5"/>
    <rect x="218" y="58" width="28" height="22" rx="2" fill="#1d2731"/>
    <path d="M254 58 H281 Q285 58 287 63 L293 80 H254 Z" fill="#1d2731"/>
    <line x1="250" y1="54" x2="250" y2="111" stroke="#c3c8ce" stroke-width="1.2"/><line x1="215" y1="54" x2="215" y2="111" stroke="#c3c8ce" stroke-width="1.2"/>
    <line x1="297" y1="80" x2="297" y2="111" stroke="#c3c8ce" stroke-width="1.2"/>
    <rect x="240" y="86" width="7" height="2.4" rx="1" fill="#17181c"/><rect x="254" y="86" width="7" height="2.4" rx="1" fill="#17181c"/>
    ${logo(263, 85, 32, 18)}
    <rect x="291" y="60" width="3.4" height="15" rx="1" fill="#17181c"/>
    ${[218, 232, 246, 260, 274].map(x => `<rect x="${x}" y="48" width="6" height="4" rx="1.5" fill="#ffb020"/>`).join('')}
    <rect x="339" y="86" width="10" height="20" rx="1.5" fill="#1c1e23"/><rect x="329" y="88" width="8" height="5" rx="2" fill="#ffe9a8"/>
    <rect x="216" y="110" width="80" height="13" rx="2" fill="#1c1e23"/><rect x="220" y="113" width="72" height="2" fill="#4a4f58"/><rect x="220" y="118" width="72" height="2" fill="#4a4f58"/>
    <rect x="302" y="110" width="50" height="8" rx="2" fill="#1c1e23"/>
  </g>
  ${wheel(58)}${wheel(324)}
  </svg>`;
}
