'use strict';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const CONTACT_EMAIL      = 'sonarpro@sonarproaudio.com';
const WHATSAPP_NUMBER    = '12096031081';
const GALLERY_REPO       = 'sonarproaudio/websonar';

const NAVBAR_SCROLL_THRESHOLD = 55;
const CAROUSEL_AUTOPLAY_IMG   = 5000;
const CAROUSEL_AUTOPLAY_VID   = 6000;
const COUNTER_DURATION_MS     = 1800;
const SWIPE_THRESHOLD_PX      = 50;

// ── DATA ─────────────────────────────────────────────────────────────────────
const STATIC_PHOTOS = Array.from({ length: 15 }, (_, i) => ({
  type: 'photo',
  url:  `img/galeria${i + 1}.jpeg`,
  title: 'Sonar Pro Audio'
}));

const VID_ITEMS = [
  {
    type:   'video',
    url:    'video/stockton_deorro.mp4',
    poster: 'video/stockton_thumb.jpg',
    title:  'Sonar Stockton — Deorro'
  },
  {
    type:   'video',
    url:    'video/IMG_2118.mp4',
    poster: 'video/thumb_2118.jpg',
    title:  'Sonar Pro Audio'
  },
  {
    type:   'video',
    url:    'video/IMG_2119.mp4',
    poster: 'video/thumb_2119.jpg',
    title:  'Sonar Pro Audio'
  }
];

// ── LOADER ───────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 500);
});

// ── NAV SCROLL ───────────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > NAVBAR_SCROLL_THRESHOLD);
}, { passive: true });

// ── MOBILE MENU ──────────────────────────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

function closeMobileMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

document.querySelectorAll('[data-close-menu]').forEach(el => {
  el.addEventListener('click', closeMobileMenu);
});

// ── COUNTER ANIMATION ────────────────────────────────────────────────────────
function animateCount(el, target) {
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / COUNTER_DURATION_MS, 1);
    const current  = Math.floor(progress * target);
    el.textContent = (target >= 1000 ? current.toLocaleString() : current) + '+';
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = (target >= 1000 ? target.toLocaleString() : target) + '+';
    }
  }
  requestAnimationFrame(step);
}

// ── SCROLL REVEAL + COUNTERS ─────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    const counter = entry.target.matches('[data-count]')
      ? entry.target
      : entry.target.querySelector('[data-count]');
    if (counter && !counter.dataset.animated) {
      counter.dataset.animated = '1';
      animateCount(counter, parseInt(counter.dataset.count, 10));
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .stat-item').forEach(el => revealObserver.observe(el));

// ── CAROUSEL FACTORY ─────────────────────────────────────────────────────────
function createCarousel({ trackId, dotsId, counterId, autoplayMs }) {
  let items  = [];
  let index  = 0;
  let timer  = null;

  function go(n) {
    index = ((n % items.length) + items.length) % items.length;
    document.getElementById(trackId).style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll(`#${dotsId} .carousel-dot`).forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    document.getElementById(counterId).textContent = `${index + 1} / ${items.length}`;
  }

  function move(dir) {
    go(index + dir);
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), autoplayMs);
  }

  function build(newItems, onSlideClick) {
    items = newItems;
    const track  = document.getElementById(trackId);
    const dotsEl = document.getElementById(dotsId);
    track.innerHTML  = '';
    dotsEl.innerHTML = '';

    items.forEach((item, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.addEventListener('click', () => onSlideClick(i, items));

      const overlay = document.createElement('div');
      overlay.className = 'carousel-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      if (item.type === 'video') {
        const video    = document.createElement('video');
        video.src      = item.url;
        video.muted    = true;
        video.setAttribute('preload', 'none');
        if (item.poster) video.poster = item.poster;
        const playIcon = document.createElement('div');
        playIcon.className = 'carousel-play';
        playIcon.setAttribute('aria-hidden', 'true');
        playIcon.textContent = '▶';
        slide.append(video, overlay, playIcon);
      } else {
        const img    = document.createElement('img');
        img.src      = item.url;
        img.alt      = item.title || 'Sonar Pro Audio';
        img.loading  = i < 3 ? 'eager' : 'lazy';
        slide.append(img, overlay);
      }

      track.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => go(i));
      dotsEl.appendChild(dot);
    });

    go(0);
    resetTimer();

    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > SWIPE_THRESHOLD_PX) move(delta > 0 ? 1 : -1);
    });
  }

  return { build, move };
}

// ── LIGHTBOX ─────────────────────────────────────────────────────────────────
const lightbox = (() => {
  let items         = [];
  let index         = 0;
  let previousFocus = null;

  const el       = document.getElementById('lightbox');
  const imgEl    = document.getElementById('lb-img');
  const vidEl    = document.getElementById('lb-video');
  const ctrEl    = document.getElementById('lb-counter');
  const closeBtn = document.getElementById('lb-close');

  function show() {
    index = ((index % items.length) + items.length) % items.length;
    const item = items[index];
    imgEl.style.display = 'none';
    vidEl.style.display = 'none';
    vidEl.pause();

    if (item.type === 'video') {
      vidEl.src            = item.url;
      vidEl.style.display  = 'block';
      vidEl.play();
    } else {
      imgEl.src           = item.url;
      imgEl.alt           = item.title || 'Sonar Pro Audio';
      imgEl.style.display = 'block';
    }
    ctrEl.textContent = `${index + 1} / ${items.length}`;
  }

  function open(newItems, i) {
    items         = newItems;
    index         = i;
    previousFocus = document.activeElement;
    show();
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    el.classList.remove('open');
    vidEl.pause();
    vidEl.src            = '';
    document.body.style.overflow = '';
    if (previousFocus) previousFocus.focus();
  }

  function move(dir) {
    index += dir;
    show();
  }

  el.addEventListener('click', e => { if (e.target === el) close(); });
  closeBtn.addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', () => move(-1));
  document.getElementById('lb-next').addEventListener('click', () => move(1));
  document.addEventListener('keydown', e => {
    if (!el.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  move(-1);
    if (e.key === 'ArrowRight') move(1);
  });

  return { open, close, move };
})();

// ── CAROUSELS INIT ───────────────────────────────────────────────────────────
const imgCarousel = createCarousel({
  trackId:   'imgTrack',
  dotsId:    'imgDots',
  counterId: 'imgCounter',
  autoplayMs: CAROUSEL_AUTOPLAY_IMG
});

const vidCarousel = createCarousel({
  trackId:   'vidTrack',
  dotsId:    'vidDots',
  counterId: 'vidCounter',
  autoplayMs: CAROUSEL_AUTOPLAY_VID
});

document.getElementById('imgPrev').addEventListener('click', () => imgCarousel.move(-1));
document.getElementById('imgNext').addEventListener('click', () => imgCarousel.move(1));
document.getElementById('vidPrev').addEventListener('click', () => vidCarousel.move(-1));
document.getElementById('vidNext').addEventListener('click', () => vidCarousel.move(1));

vidCarousel.build(VID_ITEMS, (i, items) => lightbox.open(items, i));

// Build gallery immediately with local photos so the carousel is never empty,
// then silently refresh from GitHub API if it returns a different set.
const onImgClick = (i, items) => lightbox.open(items, i);
imgCarousel.build(STATIC_PHOTOS, onImgClick);

(async function refreshGallery() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GALLERY_REPO}/contents/img`);
    if (!res.ok) return;
    const files = await res.json();
    if (!Array.isArray(files)) return;
    const fetched = files
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f.name) && !/^logo/i.test(f.name) && !/^\d{10,}/.test(f.name))
      .map(f => ({ type: 'photo', url: `img/${f.name}`, title: 'Sonar Pro Audio' }));
    if (fetched.length && fetched.length !== STATIC_PHOTOS.length) {
      imgCarousel.build(fetched, onImgClick);
    }
  } catch (_) {}
}());

// ── CONTACT FORM ─────────────────────────────────────────────────────────────
function showFormError(msg) {
  const notice = document.getElementById('formNotice');
  notice.textContent    = msg;
  notice.style.display  = 'block';
  setTimeout(() => { notice.style.display = 'none'; }, 4000);
}

function getFormData() {
  return {
    name:  document.getElementById('fName').value.trim(),
    phone: document.getElementById('fPhone').value.trim(),
    event: document.getElementById('fEvent').value,
    msg:   document.getElementById('fMsg').value.trim()
  };
}

function validateForm() {
  const { name, event } = getFormData();
  if (!name || !event) {
    showFormError(
      currentLang === 'es'
        ? 'Por favor ingresa tu nombre y tipo de evento.'
        : 'Please enter your name and event type.'
    );
    return false;
  }
  return true;
}

document.getElementById('btnEmail').addEventListener('click', () => {
  if (!validateForm()) return;
  const { name, phone, event, msg } = getFormData();
  const subject = encodeURIComponent(`Cotización — ${event}`);
  const body    = encodeURIComponent(
    `Nombre: ${name}\nTeléfono: ${phone}\nEvento: ${event}\n\nMensaje:\n${msg}`
  );
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

document.getElementById('btnWa').addEventListener('click', () => {
  if (!validateForm()) return;
  const { name, phone, event, msg } = getFormData();
  const text = encodeURIComponent(
    `Hola! Soy ${name}${phone ? ` (${phone})` : ''}.\nEvento: ${event}${msg ? `\n\n${msg}` : ''}`
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener');
});

// ── THEME ─────────────────────────────────────────────────────────────────────
let isDark = localStorage.getItem('theme') !== 'light';

function applyTheme() {
  document.body.classList.toggle('light', !isDark);
  const label = isDark ? '☀️ Claro' : '🌙 Oscuro';
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.textContent = label;
  });
}

document.querySelectorAll('[data-theme-btn]').forEach(btn => {
  btn.addEventListener('click', () => {
    isDark = !isDark;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme();
  });
});

applyTheme();

// ── LANGUAGE ──────────────────────────────────────────────────────────────────
let currentLang = localStorage.getItem('lang') === 'en' ? 'en' : 'es';

const YEAR = new Date().getFullYear();

const T = {
  es: {
    navAbout: 'Nosotros', navServices: 'Servicios', navGallery: 'Galería',
    navVideos: 'Videos',  navQuote: 'Cotizar',

    heroBadge: '#1 en California',
    heroTitle: 'EXCELENCIA<br><span class="gold">EN CADA EVENTO</span>',
    heroDesc:  'Producción profesional de sonido, video e iluminación.<br>Más de 10 años siendo los #1 en California.',
    heroCta1:  '▶ Ver Nuestro Trabajo',
    heroCta2:  'Cotizar Evento',

    stat1: 'Años de Experiencia', stat2: 'Eventos Realizados',
    stat3: 'En California',       stat4: 'Soporte para tu Evento',

    srvTag:   'Lo que hacemos',
    srvTitle: 'Nuestros Servicios',
    srvDesc:  'Equipo profesional de nivel mundial para que tu evento sea perfecto.',
    srv1T: 'Renta de Escenario', srv1D: 'Estructuras profesionales para conciertos, festivales y eventos de gran escala en todo California.',
    srv2T: 'Iluminación',        srv2D: 'Sistemas de luces que transforman cualquier espacio en un espectáculo visual único.',
    srv3T: 'Pantallas LED',      srv3D: 'Pantallas de alta resolución para presentaciones, conciertos y eventos corporativos.',
    srv4T: 'Equipo de Audio',    srv4D: 'Sonido cristalino y potente para cualquier tamaño de evento o recinto.',
    srv5T: 'Consolas DJ',        srv5D: 'Equipo de DJ profesional para fiestas, clubs y eventos privados de todo nivel.',
    srv6T: 'Producción Completa',srv6D: 'Paquetes integrales con todo incluido: sonido, video y luces para eventos perfectos.',

    galTag:   'Nuestro Trabajo',
    galTitle: 'Galería',
    galDesc:  'Momentos capturados de los eventos que hemos hecho posibles en California.',

    vidTag:   'Sonar en Acción',
    vidTitle: 'Videos',
    vidDesc:  'Mira lo que hacemos en cada evento.',

    aboutTag:   'Nuestra Historia',
    aboutTitle: 'Más de 10 años<br><span style="color:var(--gold)">siendo los mejores</span>',
    aboutT1: 'Somos la empresa #1 en producción de sonido, video e iluminación en California. Con más de una década de experiencia, hemos llevado nuestro equipo profesional a cientos de eventos en todo el estado.',
    aboutT2: 'Desde pequeñas reuniones hasta festivales con miles de personas, nuestro compromiso con la excelencia es lo que nos hace únicos y los más solicitados en California.',
    aboutL1: 'Equipo de sonido de nivel mundial',
    aboutL2: 'Técnicos especializados con años de experiencia',
    aboutL3: 'Servicio personalizado para cada evento',
    aboutL4: 'Disponibles en todo California y más',
    aboutBtn: 'Contáctanos →',

    ctaTag:   'Escríbenos',
    ctaTitle: '¿Tienes un Evento?',
    ctaDesc:  'Cuéntanos qué necesitas y te preparamos una cotización sin costo.',
    ctaH3:    'Hablemos',
    ctaP:     'Estamos listos para hacer de tu evento algo que nadie olvidará.',
    locLabel: 'Ubicación',

    fLblName:  'Nombre',           fPhName:  'Tu nombre completo',
    fLblPhone: 'Teléfono',
    fLblEvent: 'Tipo de Evento',
    fLblMsg:   'Mensaje',          fPhMsg:   'Cuéntanos sobre tu evento: fecha, lugar, número de personas...',
    fOpt0: 'Seleccionar...', fOpt1: 'Concierto / Festival', fOpt2: 'Quinceañera',
    fOpt3: 'Boda',           fOpt4: 'Evento Corporativo',  fOpt5: 'Fiesta Privada', fOpt6: 'Otro',
    fBtnEmail: 'Cotización por Email',
    fBtnWa:    'Cotización por WhatsApp',

    ftBrand:    'Los #1 en producción de sonido, video e iluminación en California. Más de 10 años haciendo eventos inolvidables.',
    ftSrvTitle: 'Servicios',
    ftCtTitle:  'Contacto',
    ftCopy:     `© ${YEAR} · California · Todos los derechos reservados`,
  },
  en: {
    navAbout: 'About', navServices: 'Services', navGallery: 'Gallery',
    navVideos: 'Videos', navQuote: 'Quote',

    heroBadge: '#1 in California',
    heroTitle: 'EXCELLENCE<br><span class="gold">IN EVERY EVENT</span>',
    heroDesc:  'Professional sound, video & lighting production.<br>Over 10 years as #1 in California.',
    heroCta1:  '▶ See Our Work',
    heroCta2:  'Get a Quote',

    stat1: 'Years of Experience', stat2: 'Events Done',
    stat3: 'In California',       stat4: 'Event Support',

    srvTag:   'What We Do',
    srvTitle: 'Our Services',
    srvDesc:  'World-class professional equipment for your perfect event.',
    srv1T: 'Stage Rental',     srv1D: 'Professional stage structures for concerts, festivals and large-scale events.',
    srv2T: 'Lighting',         srv2D: 'Light systems that transform any space into a unique visual spectacle.',
    srv3T: 'LED Screens',      srv3D: 'High-resolution screens for presentations and concerts.',
    srv4T: 'Audio Equipment',  srv4D: 'Crystal-clear powerful sound for any size event.',
    srv5T: 'DJ Consoles',      srv5D: 'Professional DJ equipment for parties, clubs and private events.',
    srv6T: 'Full Production',  srv6D: 'All-inclusive packages: sound, video and lighting.',

    galTag:   'Our Work',
    galTitle: 'Gallery',
    galDesc:  'Moments captured from events we have made possible in California.',

    vidTag:   'Sonar in Action',
    vidTitle: 'Videos',
    vidDesc:  'See what we do at every event.',

    aboutTag:   'Our Story',
    aboutTitle: 'Over 10 years<br><span style="color:var(--gold)">being the best</span>',
    aboutT1: 'We are the #1 company in sound, video and lighting production in California. With over a decade of experience, we have brought our professional equipment to hundreds of events across the state.',
    aboutT2: 'From small gatherings to festivals with thousands of people, our commitment to excellence is what makes us unique and the most sought-after in California.',
    aboutL1: 'World-class sound equipment',
    aboutL2: 'Specialized technicians with years of experience',
    aboutL3: 'Personalized service for each event',
    aboutL4: 'Available throughout California and beyond',
    aboutBtn: 'Contact Us →',

    ctaTag:   'Write to Us',
    ctaTitle: 'Have an Event?',
    ctaDesc:  "Tell us what you need and we'll prepare a free quote.",
    ctaH3:    "Let's Talk",
    ctaP:     "We're ready to make your event something no one will forget.",
    locLabel: 'Location',

    fLblName:  'Name',        fPhName:  'Your full name',
    fLblPhone: 'Phone',
    fLblEvent: 'Event Type',
    fLblMsg:   'Message',     fPhMsg:   'Tell us about your event: date, venue, number of guests...',
    fOpt0: 'Select...',  fOpt1: 'Concert / Festival', fOpt2: 'Quinceañera',
    fOpt3: 'Wedding',    fOpt4: 'Corporate Event',    fOpt5: 'Private Party', fOpt6: 'Other',
    fBtnEmail: 'Quote by Email',
    fBtnWa:    'Quote via WhatsApp',

    ftBrand:    '#1 in sound, video & lighting production in California. Over 10 years making unforgettable events.',
    ftSrvTitle: 'Services',
    ftCtTitle:  'Contact',
    ftCopy:     `© ${YEAR} · California · All rights reserved`,
  }
};

function applyLang() {
  const t = T[currentLang];
  document.documentElement.lang = currentLang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  const mobileLinks = document.querySelectorAll('.mob-link');
  ['navAbout', 'navServices', 'navGallery', 'navVideos', 'navQuote'].forEach((key, i) => {
    if (mobileLinks[i] && t[key]) mobileLinks[i].textContent = t[key];
  });

  document.querySelectorAll('#fEvent option[data-i18n]').forEach(opt => {
    const key = opt.getAttribute('data-i18n');
    if (t[key] !== undefined) opt.textContent = t[key];
  });
}

function applyLangUI() {
  const label = currentLang === 'es' ? 'EN' : 'ES';
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.textContent = label;
  });
  applyLang();
}

document.querySelectorAll('[data-lang-btn]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    localStorage.setItem('lang', currentLang);
    applyLangUI();
  });
});

applyLangUI();
