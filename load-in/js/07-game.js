'use strict';

/* =====================================================================
   7. JUEGO
   ===================================================================== */
const $ = s => document.querySelector(s);
const el = { play: $('#play'), board: $('#board'), door: $('#door'), doorWrap: $('#doorWrap'), truck: $('#truck'), hint: $('#hint'),
  scene: $('#scene'), timer: $('#timer'), count: $('#cnt'), name: $('#bname'), tab: $('#btab'), trayLabel: $('#traylbl'), modal: $('#modal') };
const fmtTime = s => { s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

const Game = (() => {
  /* Estado del nivel */
  let level = null, pieces = [], order = [];
  let cell = 40, board = { x: 0, y: 0 }, tray = { x: 0, y: 0, w: 0, h: 0 };
  let occupied = new Map(), ghosts = [], drag = null;
  let locked = true, startedAt = 0, elapsed = 0, limit = 0, ticker = null, timers = [], run = 0;
  let hintsLeft = 0, hintsUsed = 0;
  let endless = false, streak = 0, endlessSeed = 1;   // modo sin fin

  /* ---------- utilidades ---------- */
  const later = (fn, ms) => { const id = run; timers.push(setTimeout(() => { if (id === run) fn(); }, ms)); };
  const key = (x, y) => x + ',' + y;
  const setRot = (p, rot) => Object.assign(p, { rot }, rotatedCells(p.type, rot));
  const restartAnim = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };
  const isDragging = p => drag && drag.moved && drag.p === p;

  function stop() { run++; timers.forEach(clearTimeout); timers = []; clearInterval(ticker); ticker = null; locked = true; drag = null; }

  /* ---------- arranque ---------- */
  function start(index) { endless = false; begin(generateLevel(index)); }                 // campaña
  function startEndless() { endless = true; streak = 0; endlessSeed = (Date.now() & 0x7fffffff) || 1; nextEndless(); }  // modo sin fin
  function nextEndless() { begin(generateEndless(streak, endlessSeed)); }

  /* Monta y corre una caja (campaña o sin fin) */
  function begin(lv) {
    stop(); Sound.unlock(); UI.show('game');
    level = lv; occupied = new Map(); elapsed = 0;
    limit = timeLimitFor(level.layout.length); hintsLeft = HINTS_PER_LEVEL; hintsUsed = 0; updateHints();
    if (endless) { $('#hLvl').textContent = 'SIN FIN'; $('#hEv').textContent = 'Racha ' + streak + (Store.bestStreak ? ' · Mejor ' + Store.bestStreak : ''); }
    else { $('#hLvl').textContent = 'NIVEL ' + (level.index + 1); $('#hEv').textContent = level.name; }
    el.timer.textContent = fmtTime(limit); el.timer.classList.remove('low');
    el.scene.classList.remove('party'); el.hint.classList.remove('on'); showName(null);
    el.play.querySelectorAll('.piece,.ghost').forEach(n => n.remove()); ghosts = [];

    const randomRot = endless ? streak >= 1 : level.index + 1 >= RANDOM_ROTATION_FROM;
    const rrng = mulberry32((endless ? endlessSeed + level.index * 2654435761 : level.index * 2654435761 + 17) | 0 || 1);
    pieces = level.layout.map((sol, id) => {
      const p = { id, type: sol.type, sol, placed: null, waiting: false, x: 0, y: 0, s: 1 };
      setRot(p, randomRot ? Math.floor(rrng() * 4) : sol.rot);
      p.el = document.createElement('div'); p.el.className = 'piece hide'; p.el.dataset.id = id; el.play.appendChild(p.el);
      return p;
    });
    order = pieces.slice();
    for (let k = order.length - 1; k > 0; k--) { const j = Math.floor(rrng() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }

    el.door.style.transition = 'none'; el.door.classList.remove('up'); void el.door.offsetWidth; el.door.style.transition = '';
    layout(true); updateCount();

    // Llega el camión → sube la cortina → aparece el equipo
    el.truck.className = 'truck'; void el.truck.offsetWidth; el.truck.classList.add('in', 'rolling'); Sound.engine(1.4);
    later(() => el.truck.classList.remove('rolling'), 1450);
    later(() => { el.door.classList.add('up'); Sound.door(); }, 1550);
    later(() => {
      order.forEach((p, k) => later(() => { p.el.classList.remove('hide'); p.el.classList.add('pop'); }, k * 40));
      locked = false; startedAt = performance.now(); ticker = setInterval(tick, 250);
      if (endless && streak === 0) say('Carga cajas sin parar. ¡Haz tu mejor racha!');
      else if (!endless && level.index === 0) { say('Arrastra el equipo y llena la caja sin huecos'); later(() => order[0] && order[0].el.classList.add('cue'), order.length * 40 + 150); }
      else if (!endless && level.index + 1 === RANDOM_ROTATION_FROM) say('Toca una pieza para girarla si no cabe');
    }, 2050);
  }
  function say(text) { el.hint.textContent = text; el.hint.classList.add('on'); }
  /* El reloj va hacia atrás; al llegar a cero se pierde el nivel */
  function tick() {
    elapsed = (performance.now() - startedAt) / 1000;
    const left = Math.max(0, limit - elapsed);
    el.timer.textContent = fmtTime(Math.ceil(left)); el.timer.classList.toggle('low', left <= 20);
    if (left <= 0) lose();
  }
  function updateHints() { $('#hintN').textContent = hintsLeft; $('#bHint').classList.toggle('off', hintsLeft <= 0); }
  function updateCount() { el.count.textContent = pieces.filter(p => p.placed).length + '/' + pieces.length; }
  function showName(p) { el.name.textContent = p ? PIECES[p.type].name : 'Caja del camión'; el.name.classList.toggle('hot', !!p); }

  /* ---------- acomodo en pantalla ---------- */
  /* Reparte en filas una lista de piezas; devuelve la altura que ocupan */
  function packTray(list, tc, apply) {
    const gap = Math.max(8, tc * .5), rows = []; let row = [], rw = 0;
    list.forEach(p => {
      const w = p.w * tc;
      if (row.length && rw + gap + w > tray.w) { rows.push({ row, rw }); row = []; rw = 0; }
      rw += (row.length ? gap : 0) + w; row.push(p);
    });
    if (row.length) rows.push({ row, rw });
    let H = 0; rows.forEach(r => { r.h = Math.max(...r.row.map(p => p.h * tc)); H += r.h; }); H += gap * Math.max(0, rows.length - 1);
    if (apply) {
      let y = tray.y + Math.max(0, (tray.h - H) / 2);
      rows.forEach(r => { let x = tray.x + (tray.w - r.rw) / 2; r.row.forEach(p => { p.x = x; p.y = y + (r.h - p.h * tc) / 2; p.s = tc / cell; x += p.w * tc + gap; }); y += r.h + gap; });
    }
    return H;
  }
  /* Acomoda la bandeja: achica las piezas hasta el mínimo y, si aún no caben, las últimas esperan turno */
  function flowTray() {
    const pending = order.filter(p => !p.placed && !isDragging(p));
    let shown = pending.slice(), tc = Math.min(cell * .7, 26);
    while (tc > MIN_TRAY_CELL && packTray(shown, tc, false) > tray.h) tc -= 1;
    while (shown.length > 1 && packTray(shown, tc, false) > tray.h) shown.pop();
    packTray(shown, tc, true);
    pending.forEach(p => { p.waiting = !shown.includes(p); if (p.waiting) { p.x = tray.x + tray.w / 2 - p.w * tc / 2; p.y = tray.y + tray.h - p.h * tc; p.s = tc / cell; } });
    const left = pending.length - shown.length;
    el.trayLabel.textContent = left ? 'Equipo por cargar · faltan ' + left + ' más' : 'Equipo por cargar';
  }
  function layout(redraw) {
    if (!level) return;
    const r = el.play.getBoundingClientRect(), PW = r.width, PH = r.height;
    if (PW < 10 || PH < 10) return;
    const trayMin = Math.max(150, PH * .32);          // zona reservada abajo para la bandeja de equipo
    const boardAreaH = PH - trayMin, pad = 18;        // zona de arriba donde vive la caja
    cell = Math.floor(Math.max(16, Math.min((PW - pad * 2) / level.cols, (boardAreaH - 44) / level.rows, 104)));  // sin tope chico: la caja crece y queda proporcional
    const bw = level.cols * cell, bh = level.rows * cell;
    board = { x: Math.round((PW - bw) / 2), y: Math.max(30, Math.round((boardAreaH - bh) / 2) + 6) };  // centrada vertical en su zona
    const box = { left: board.x + 'px', top: board.y + 'px', width: bw + 'px', height: bh + 'px' };
    Object.assign(el.board.style, box, { backgroundSize: cell + 'px ' + cell + 'px' });
    Object.assign(el.doorWrap.style, box);
    Object.assign(el.tab.style, { left: board.x + 'px', top: Math.max(4, board.y - 24) + 'px', width: bw + 'px' });
    const ty = board.y + bh + 14; el.trayLabel.style.top = ty + 'px';
    tray = { x: 12, y: ty + 24, w: PW - 24, h: Math.max(60, PH - ty - 34) };
    el.hint.style.top = (board.y + Math.max(4, bh - 52)) + 'px';
    pieces.forEach(p => { if (p.placed) { p.x = board.x + p.placed.x * cell; p.y = board.y + p.placed.y * cell; p.s = 1; } });
    flowTray(); pieces.forEach(p => render(p, redraw));
  }
  function render(p, redraw) {
    const n = p.el, sig = p.rot + ':' + cell;
    if (redraw || n._sig !== sig) { n.style.width = p.w * cell + 'px'; n.style.height = p.h * cell + 'px'; n.innerHTML = pieceSVG(p); n._sig = sig; }
    n.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) scale(${p.s.toFixed(3)})`;
    n.style.setProperty('--s', p.s.toFixed(3));
    n.classList.toggle('placed', !!p.placed);
    n.classList.toggle('wait', !p.placed && !!p.waiting);
  }
  const renderAll = () => pieces.forEach(p => { if (!isDragging(p)) render(p); });
  const refresh = () => { flowTray(); renderAll(); updateCount(); };

  /* ---------- reglas de la caja ---------- */
  const inBox = (x, y) => x >= 0 && y >= 0 && x < level.cols && y < level.rows;
  const fits = (p, gx, gy) => p.cells.every(c => inBox(gx + c[0], gy + c[1]) && !occupied.has(key(gx + c[0], gy + c[1])));
  function mark(p, on) { p.cells.forEach(c => { const k = key(p.placed.x + c[0], p.placed.y + c[1]); if (on) occupied.set(k, p.id); else occupied.delete(k); }); }
  function lift(p) { if (p.placed) { mark(p, false); p.placed = null; } }
  function drop(p, gx, gy) { p.placed = { x: gx, y: gy }; mark(p, true); p.x = board.x + gx * cell; p.y = board.y + gy * cell; p.s = 1; }
  /* Cuadro de la caja más cercano a donde está la pieza y si cabe ahí */
  function snap(p) {
    const gx = Math.round((p.x - board.x) / cell), gy = Math.round((p.y - board.y) / cell), m = cell * .4;
    const near = p.x + p.w * cell > board.x - m && p.x < board.x + level.cols * cell + m && p.y + p.h * cell > board.y - m && p.y < board.y + level.rows * cell + m;
    return { gx, gy, near, ok: near && fits(p, gx, gy) };
  }

  /* ---------- sombra verde/roja de dónde cae la pieza ---------- */
  function showGhost(p, gx, gy, ok) {
    while (ghosts.length < p.cells.length) { const g = document.createElement('div'); g.className = 'ghost'; el.play.insertBefore(g, el.doorWrap); ghosts.push(g); }
    ghosts.forEach((g, i) => {
      const c = p.cells[i];
      if (!c || !inBox(gx + c[0], gy + c[1])) { g.style.display = 'none'; return; }
      g.className = 'ghost ' + (ok ? 'ok' : 'bad');
      Object.assign(g.style, { display: 'block', left: board.x + (gx + c[0]) * cell + 1.5 + 'px', top: board.y + (gy + c[1]) * cell + 1.5 + 'px', width: cell - 3 + 'px', height: cell - 3 + 'px' });
    });
  }
  const hideGhost = () => ghosts.forEach(g => { g.style.display = 'none'; });

  /* ---------- control táctil: arrastrar, y tocar para girar ---------- */
  function onDown(e) {
    if (locked || drag) return;
    const node = e.target.closest('.piece'); if (!node) return;
    e.preventDefault();
    const p = pieces[+node.dataset.id], r = el.play.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    drag = { p, pid: e.pointerId, sx: px, sy: py, gx: (px - p.x) / p.s, gy: (py - p.y) / p.s, moved: false, touch: e.pointerType !== 'mouse' };
    showName(p);
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    const r = el.play.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, p = drag.p;
    if (!drag.moved) {
      if (Math.hypot(px - drag.sx, py - drag.sy) < 7) return;
      drag.moved = true; lift(p); p.waiting = false; p.s = 1; p.el.classList.add('drag'); p.el.classList.remove('placed', 'pop', 'cue');
      pieces.forEach(q => q.el.classList.remove('cue'));
      drag.gx = Math.min(Math.max(drag.gx, p.w * cell * .2), p.w * cell * .8); drag.gy = Math.min(Math.max(drag.gy, p.h * cell * .2), p.h * cell * .8);
      el.hint.classList.remove('on'); Sound.pick(); refresh();
    }
    p.x = px - drag.gx; p.y = py - drag.gy - (drag.touch ? Math.max(46, p.h * cell * .5 + 18) : 0);   // en táctil la pieza va arriba del dedo
    p.el.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) scale(1)`;
    const s = snap(p); if (s.near) showGhost(p, s.gx, s.gy, s.ok); else hideGhost();
  }
  function onUp(e, cancelled) {
    if (!drag || (e && e.pointerId !== drag.pid)) return;
    const d = drag, p = d.p; drag = null; hideGhost(); showName(null);
    if (!d.moved) { if (!cancelled) rotate(p); return; }
    p.el.classList.remove('drag');
    const s = cancelled ? { ok: false } : snap(p);
    if (s.ok) { drop(p, s.gx, s.gy); Sound.place(); buzz(12); } else if (s.near) Sound.bad();
    refresh(); checkWin();
  }
  /* Gira 90°. Si ya está en la caja, busca que siga cabiendo cerca; si no cabe, no gira. */
  function rotate(p) {
    if (locked) return;
    const before = p.rot, shape = JSON.stringify(p.cells), was = p.placed ? { ...p.placed } : null;
    if (was) lift(p);
    setRot(p, (before + 1) % 4);
    if (JSON.stringify(p.cells) === shape) {                      // el sub (cuadro) no cambia al girar
      setRot(p, before); if (was) drop(p, was.x, was.y); restartAnim(p.el, 'shake'); return;
    }
    if (was) {
      const NEAR = [[0, 0], [-1, 0], [0, -1], [1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1], [-2, 0], [0, -2], [2, 0], [0, 2]];
      const spot = NEAR.find(o => fits(p, was.x + o[0], was.y + o[1]));
      if (!spot) { setRot(p, before); drop(p, was.x, was.y); Sound.bad(); restartAnim(p.el, 'shake'); return; }
      drop(p, was.x + spot[0], was.y + spot[1]);
    }
    el.hint.classList.remove('on'); Sound.rotate(); flowTray(); renderAll(); restartAnim(p.el, 'pop');
  }
  function reset() {
    if (locked || !level) return;
    pieces.forEach(lift); occupied.clear(); refresh(); Sound.rotate();
  }

  /* ---------- pista: acomoda una pieza en su lugar correcto ---------- */
  const solutionKeys = p => rotatedCells(p.type, p.sol.rot).cells.map(c => key(p.sol.x + c[0], p.sol.y + c[1]));
  const isRight = p => !!p.placed && p.cells.length === 4 && (keys => p.cells.every(c => keys.includes(key(p.placed.x + c[0], p.placed.y + c[1]))))(solutionKeys(p));
  function hint() {
    if (locked || !level || drag || hintsLeft <= 0) return;
    // Si otra pieza igual ya ocupa el lugar de ésta, se intercambian sus lugares (son equivalentes)
    pieces.forEach(p => {
      if (isRight(p)) return;
      const keys = solutionKeys(p), q = pieces[occupied.get(keys[0])];
      if (q && q !== p && q.type === p.type && !isRight(q) && q.cells.every(c => keys.includes(key(q.placed.x + c[0], q.placed.y + c[1])))) [p.sol, q.sol] = [q.sol, p.sol];
    });
    const wrong = pieces.filter(p => !isRight(p));
    if (!wrong.length) return;
    const free = p => solutionKeys(p).every(k => !occupied.has(k));
    const p = wrong.find(q => !q.placed && free(q)) || wrong.find(q => !q.placed) || wrong[0];
    lift(p);
    solutionKeys(p).forEach(k => { if (occupied.has(k)) lift(pieces[occupied.get(k)]); });   // lo que estorbe regresa a la bandeja
    setRot(p, p.sol.rot); drop(p, p.sol.x, p.sol.y); p.waiting = false;
    hintsLeft--; hintsUsed++; updateHints();
    el.hint.classList.remove('on'); Sound.place(); buzz(12);
    refresh(); render(p, true); restartAnim(p.el, 'hinted'); checkWin();
  }

  /* ---------- se acabó el tiempo ---------- */
  function lose() {
    if (locked || !level) return;
    locked = true; clearInterval(ticker); ticker = null;
    if (drag) { drag.p.el.classList.remove('drag'); drag = null; hideGhost(); showName(null); refresh(); }
    const i = level.index;
    Sound.bad(); buzz([60, 40, 60]);
    later(() => { el.door.classList.remove('up'); Sound.door(); }, 300);
    later(() => { el.truck.classList.remove('in'); el.truck.classList.add('out', 'rolling'); Sound.engine(1.3); }, 1000);
    const finalStreak = streak;
    later(() => endless ? UI.showEndlessOver(finalStreak) : UI.showLose(i), 2100);
  }

  /* ---------- caja terminada ---------- */
  function checkWin() {
    if (!level || locked || pieces.some(p => !p.placed)) return;
    locked = true; clearInterval(ticker); ticker = null; tick();
    Sound.win(); buzz([20, 40, 30]); el.scene.classList.add('party');
    later(() => { el.door.classList.remove('up'); Sound.door(); }, endless ? 400 : 450);
    later(() => { el.truck.classList.remove('in'); el.truck.classList.add('out', 'rolling'); Sound.horn(); Sound.engine(1.3); }, endless ? 1050 : 1150);
    if (endless) {                                   // sin fin: suma racha y arranca la siguiente caja
      streak++; Store.setBestStreak(streak);
      later(nextEndless, 2000);
      return;
    }
    const stars = Math.max(1, starsFor(elapsed, pieces.length) - Math.ceil(hintsUsed / 2)), i = level.index, time = elapsed, name = level.name;
    Store.setStars(i, stars);
    later(() => UI.showWin(i, stars, time, name), 2300);
  }

  /* ---------- eventos ---------- */
  el.play.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', e => onUp(e, false));
  window.addEventListener('pointercancel', e => onUp(e, true));
  window.addEventListener('resize', () => { if ($('#game').classList.contains('on')) layout(true); });

  return { start, startEndless, stop, reset, hint, get level() { return level; }, get isEndless() { return endless; }, get streak() { return streak; },
    /* solo para pruebas automáticas */
    _debug: { expire() { startedAt = performance.now() - limit * 1000; tick(); }, isRight, get pieces() { return pieces; }, get board() { return board; }, get cell() { return cell; },
      solve() { pieces.forEach(lift); pieces.forEach(p => { setRot(p, p.sol.rot); drop(p, p.sol.x, p.sol.y); }); pieces.forEach(p => render(p, true)); refresh(); checkWin(); } } };
})();
