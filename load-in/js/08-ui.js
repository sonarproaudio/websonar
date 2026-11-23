'use strict';

/* =====================================================================
   8. PANTALLAS (inicio, niveles, ventana de resultado)
   ===================================================================== */
const UI = (() => {
  const screens = { home: $('#home'), levels: $('#levels'), game: $('#game') };
  const ICON_ON = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const ICON_OFF = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/></svg>';

  function show(name) {
    for (const k in screens) screens[k].classList.toggle('on', k === name);
    el.modal.classList.remove('on');
    if (name !== 'game') Game.stop();
    if (name === 'home') drawHome();
    if (name === 'levels') drawLevels();
  }

  /* Tutorial: la primera vez muestra cómo se juega antes de arrancar el nivel */
  let howThen = null;
  const howto = $('#howto');
  function openHow(then) { howThen = then || null; $('#bHowGo').textContent = howThen ? '¡A CARGAR!' : 'ENTENDIDO'; howto.classList.add('on'); }
  function closeHow() { howto.classList.remove('on'); const f = howThen; howThen = null; if (f) f(); }
  function startLevel(i) {
    const go = () => Game.start(i);
    if (Store.seenTutorial) go(); else openHow(go);
  }
  function drawHome() {
    const d = Store.done(), all = d >= LEVEL_COUNT;
    $('#prog').textContent = d === 0 ? LEVEL_COUNT + ' eventos por cargar' : all ? 'Gira completa · ' + Store.total() + '/' + LEVEL_COUNT * 3 + ' ★' : 'Evento ' + (d + 1) + ' de ' + LEVEL_COUNT + ' · ' + Store.total() + ' ★';
    $('#bPlay').textContent = d === 0 || all ? 'JUGAR' : 'CONTINUAR';
    const t = $('#homeTruck'); t.className = 'truck'; void t.offsetWidth; t.classList.add('in', 'rolling'); setTimeout(() => t.classList.remove('rolling'), 1500);
  }
  function drawLevels() {
    const d = Store.done(), grid = $('#lvgrid'); grid.innerHTML = '';
    $('#lvTot').textContent = Store.total() + '/' + LEVEL_COUNT * 3 + ' ★';
    for (let i = 0; i < LEVEL_COUNT; i++) {
      const b = document.createElement('button'), st = Store.stars(i), lock = i > d;
      b.className = 'lv' + (lock ? ' lock' : '') + (i === d ? ' next' : '');
      b.innerHTML = `<span class="num">${lock ? '🔒' : i + 1}</span><span class="st"><b>${'★'.repeat(st)}</b>${'★'.repeat(3 - st)}</span>`;
      b.setAttribute('aria-label', 'Nivel ' + (i + 1) + ': ' + EVENTS[i]);
      if (lock) b.disabled = true; else b.onclick = () => startLevel(i);
      grid.appendChild(b);
    }
    const next = grid.querySelector('.next'); if (next) next.scrollIntoView({ block: 'center' });
  }
  /* Configura un botón del modal: visible/oculto, texto y acción. La acción principal es siempre #bNext (botón grande). */
  function setBtn(sel, visible, label, fn) {
    const b = $(sel); b.style.display = visible ? '' : 'none';
    if (visible) { b.textContent = label; b.onclick = fn; }
  }
  function showWin(index, stars, time, name) {
    const last = index === LEVEL_COUNT - 1;
    $('#mTitle').textContent = last ? '¡GIRA COMPLETA!' : '¡CARGADO!';
    $('#mSub').textContent = last ? 'Los ' + LEVEL_COUNT + ' eventos, cargados' : 'Rumbo a: ' + name;
    $('#mtime').textContent = fmtTime(time);
    document.querySelectorAll('#stars span').forEach((s, k) => { s.classList.remove('on'); void s.offsetWidth; s.classList.toggle('on', k < stars); });
    $('#stars').style.display = ''; $('#nameEntry').hidden = true; $('#ranking').hidden = true;
    setBtn('#bNext', !last, 'SIGUIENTE', () => Game.start(Math.min(index + 1, LEVEL_COUNT - 1)));   // acción principal
    setBtn('#bAgain', true, 'REPETIR', () => Game.start(index));
    setBtn('#bMenu', true, 'NIVELES', () => show('levels'));
    el.modal.classList.add('on');
  }
  function showLose(index) {
    $('#mTitle').textContent = '¡SE ACABÓ EL TIEMPO!';
    $('#mSub').textContent = 'El camión se fue sin el equipo';
    $('#mtime').textContent = 'Nivel ' + (index + 1) + ' · ' + EVENTS[index];
    $('#stars').style.display = 'none'; $('#nameEntry').hidden = true; $('#ranking').hidden = true;
    setBtn('#bNext', true, 'REINTENTAR', () => Game.start(index));     // reintentar = acción principal
    setBtn('#bAgain', false);
    setBtn('#bMenu', true, 'NIVELES', () => show('levels'));
    el.modal.classList.add('on');
  }
  /* ---------- ranking de rachas ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function drawRanking(hi) {
    const list = Store.scores;
    $('#ranking').innerHTML = list.length
      ? list.map((e, i) => `<li class="${i === hi ? 'me' : ''}"><span class="rk">${i + 1}</span><span class="nm">${esc(e.name)}</span><span class="sc">${e.score}</span></li>`).join('')
      : '<li class="empty">Aún no hay marcas. ¡Sé el primero!</li>';
    $('#ranking').hidden = false;
  }
  let pendingScore = 0;
  function showEndlessOver(streak) {
    const best = Store.bestStreak, record = streak > 0 && streak >= best;
    $('#mTitle').textContent = record ? '¡NUEVO RÉCORD!' : 'FIN DE LA RACHA';
    $('#mSub').textContent = 'Cargaste ' + streak + (streak === 1 ? ' caja seguida' : ' cajas seguidas');
    $('#mtime').textContent = 'Mejor racha: ' + best;
    $('#stars').style.display = 'none';
    setBtn('#bNext', true, 'OTRA RACHA', () => Game.startEndless());   // acción principal
    setBtn('#bAgain', false);
    setBtn('#bMenu', true, 'MENÚ', () => show('home'));
    pendingScore = streak;
    if (Store.qualifies(streak)) {                 // entró al top 10 → pedir nombre
      $('#ranking').hidden = true; $('#nameEntry').hidden = false;
      $('#nameInput').value = Store.lastName;
      setTimeout(() => $('#nameInput').focus(), 60);
    } else {                                        // si no, solo mostrar el ranking
      $('#nameEntry').hidden = true; drawRanking(-1);
    }
    el.modal.classList.add('on');
  }
  function saveScore() {
    const name = ($('#nameInput').value.trim() || 'Anónimo').slice(0, 12);
    Store.lastName = name;
    const rank = Store.addScore(name, pendingScore);
    $('#nameEntry').hidden = true; drawRanking(rank);
  }
  function drawSound() { $('#bSnd').innerHTML = Sound.muted ? ICON_OFF : ICON_ON; }

  function init() {
    $('#homeTruck').innerHTML = truckSVG(); el.truck.innerHTML = truckSVG();
    $('#bPlay').onclick = () => { const d = Store.done(); startLevel(d >= LEVEL_COUNT ? 0 : d); };
    $('#bLevels').onclick = () => show('levels');
    $('#bEndless').onclick = () => { const go = () => Game.startEndless(); if (Store.seenTutorial) go(); else openHow(go); };
    $('#bHow').onclick = () => openHow(null);
    $('#bHowGo').onclick = () => { Store.seenTutorial = true; closeHow(); };
    $('#bHome').onclick = () => show('home');
    $('#bBack').onclick = () => show(Game.isEndless ? 'home' : 'levels');
    $('#bReset').onclick = Game.reset;
    $('#bHint').onclick = Game.hint;
    // bNext / bAgain / bMenu: su acción se asigna por pantalla en showWin / showLose / showEndlessOver
    $('#bSaveScore').onclick = saveScore;
    $('#nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') saveScore(); });
    $('#bSnd').onclick = () => { Sound.muted = !Sound.muted; Store.mute = Sound.muted; drawSound(); if (!Sound.muted) Sound.rotate(); };
    document.addEventListener('contextmenu', e => e.preventDefault());
    drawSound(); drawHome();
  }
  return { init, show, showWin, showLose, showEndlessOver };
})();
