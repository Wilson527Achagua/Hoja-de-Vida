/* =========================================================
   main.js – Interactividad de la hoja de vida web
   Un solo archivo para todas las páginas: cada función revisa
   si los elementos que necesita existen antes de actuar.
   ========================================================= */
'use strict';

const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// localStorage puede fallar (navegación privada o archivos abiertos desde el disco)
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* sin persistencia */ } }
};

/* ---------- 1. Tema claro / oscuro ---------- */
function initTheme() {
  const btn = $('#themeToggle');
  const root = document.documentElement;

  const apply = (theme) => {
    root.dataset.theme = theme;
    if (!btn) return;
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro');
  };

  const saved = storage.get('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(saved || (prefersDark ? 'dark' : 'light'));

  btn?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    storage.set('theme', next);
  });
}

/* ---------- 2. Menú en celulares ---------- */
function initMenu() {
  const toggle = $('#navToggle');
  const list = $('#navList');
  if (!toggle || !list) return;

  const setOpen = (open) => {
    list.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    toggle.textContent = open ? '✕' : '☰';
  };

  toggle.addEventListener('click', () => setOpen(!list.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

/* ---------- 3. Encabezado y botón "volver arriba" ---------- */
function initScroll() {
  const header = $('#header');
  const toTop = $('#toTop');

  const onScroll = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 8);
    toTop?.classList.toggle('is-visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- 4. Aparición al hacer scroll + contadores + barras ---------- */
function animateCounter(el) {
  const target = Number(el.dataset.counter);
  if (reduceMotion) { el.textContent = target; return; }
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / 1000, 1);
    el.textContent = Math.round(target * p);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initReveal() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible', 'is-filled');      // .is-filled llena las barras de habilidades
      $$('[data-counter]', el).forEach(animateCounter);
      obs.unobserve(el);
    });
  }, { threshold: 0.15 });

  $$('.reveal, .skill').forEach((el) => observer.observe(el));
}

/* ---------- 5. Texto que se escribe solo (inicio) ---------- */
function initRotator() {
  const el = $('#rotator');
  if (!el || reduceMotion) return;

  const phrases = [
    'técnico de soporte.',
    'futuro ingeniero de sistemas.',
    'usuario de Linux y Windows.',
    'desarrollador web en formación.'
  ];
  let phrase = 0;
  let char = phrases[0].length;
  let deleting = true;

  const tick = () => {
    const text = phrases[phrase];
    char += deleting ? -1 : 1;
    el.textContent = text.slice(0, char);

    let delay = deleting ? 40 : 80;
    if (!deleting && char === text.length) { deleting = true; delay = 2200; }
    else if (deleting && char === 0) {
      deleting = false;
      phrase = (phrase + 1) % phrases.length;
      delay = 300;
    }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 2200);
}

/* ---------- 6. Avatar: ojos que siguen el cursor y saludo al hacer clic ---------- */
function initAvatar() {
  const avatar = $('#avatar');
  if (!avatar) return;
  const svg = $('svg', avatar);
  const pupils = $$('.avatar__pupil', avatar);
  const bubble = $('#avatarBubble');
  const mouth = $('#mouth');
  const origins = pupils.map((p) => ({ x: +p.getAttribute('cx'), y: +p.getAttribute('cy') }));

  window.addEventListener('mousemove', (e) => {
    const box = svg.getBoundingClientRect();
    const scale = 400 / box.width;               // de píxeles de pantalla a unidades del SVG
    pupils.forEach((pupil, i) => {
      const dx = (e.clientX - box.left) * scale - origins[i].x;
      const dy = (e.clientY - box.top) * scale - origins[i].y;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(7, Math.hypot(dx, dy) / 25);
      pupil.setAttribute('cx', origins[i].x + Math.cos(angle) * dist);
      pupil.setAttribute('cy', origins[i].y + Math.sin(angle) * dist);
    });
  });

  const messages = ['¡Hola! 👋', '¿Necesitas soporte? 🛠️', '¡Contrátame! 😄', 'Linux > todo 🐧'];
  let index = 0;
  let timer;
  svg.addEventListener('click', () => {
    bubble.textContent = messages[index];
    index = (index + 1) % messages.length;
    bubble.classList.add('is-visible');
    mouth.setAttribute('d', 'M172 238 Q200 280 228 238 Z');   // boca abierta
    clearTimeout(timer);
    timer = setTimeout(() => {
      bubble.classList.remove('is-visible');
      mouth.setAttribute('d', 'M172 240 Q200 262 228 240');
    }, 1800);
  });
}

/* ---------- 7. Cinta de habilidades sin cortes ---------- */
function initMarquee() {
  const track = $('#marqueeTrack');
  if (!track) return;
  // Se duplica el contenido para que la animación se repita sin saltos
  $$('span', track).forEach((span) => {
    const copy = span.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    track.append(copy);
  });
}

/* ---------- 8. "Ver más / Ver menos" (experiencia) ---------- */
function initToggles() {
  $$('[data-toggle]').forEach((btn) => {
    const target = document.getElementById(btn.dataset.toggle);
    btn.addEventListener('click', () => {
      const open = target.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Ver menos' : 'Ver más';
    });
  });
}

/* ---------- 9. Anillo de progreso (formación) ---------- */
function initRing() {
  const ring = $('#ring');
  if (!ring) return;
  const length = 2 * Math.PI * Number(ring.getAttribute('r'));
  const progress = Number(ring.dataset.progress) / 100;
  ring.style.strokeDasharray = length;
  ring.style.strokeDashoffset = length;
  // Se anima cuando el anillo entra en pantalla
  new IntersectionObserver(([entry], obs) => {
    if (!entry.isIntersecting) return;
    ring.style.strokeDashoffset = length * (1 - progress);
    obs.disconnect();
  }).observe(ring);
}

/* ---------- 10. Filtro de proyectos ---------- */
function initFilters() {
  const buttons = $$('[data-filter]');
  const projects = $$('.project');
  const empty = $('#emptyMsg');
  const status = $('#filterStatus');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

      let visible = 0;
      projects.forEach((p) => {
        const show = filter === 'todos' || p.dataset.category === filter;
        p.hidden = !show;                  // cambia la propiedad de visualización
        if (show) { visible += 1; p.classList.add('is-visible'); }
      });

      empty.hidden = visible > 0;
      status.textContent = `${visible} proyectos mostrados`;
    });
  });
}

/* ---------- 11. Botones para imprimir o guardar en PDF ---------- */
function initPrint() {
  $$('[data-print]').forEach((btn) => btn.addEventListener('click', () => window.print()));
}

/* ---------- 12. Formulario de contacto ---------- */
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const messages = {
    nombre: 'Escribe tu nombre (mínimo 3 letras).',
    correo: 'Escribe un correo válido, por ejemplo nombre@empresa.com.',
    motivo: 'Elige el motivo de tu mensaje.',
    mensaje: 'El mensaje debe tener al menos 10 caracteres.'
  };

  const validate = (field) => {
    const group = field.closest('.form__group');
    const ok = field.checkValidity();
    group.classList.toggle('is-invalid', !ok);
    $('.form__error', group).textContent = ok ? '' : (messages[field.name] || 'Revisa este campo.');
    return ok;
  };

  const fields = $$('input, select, textarea', form);
  fields.forEach((f) => {
    f.addEventListener('blur', () => validate(f));
    f.addEventListener('input', () => {
      if (f.closest('.form__group').classList.contains('is-invalid')) validate(f);
    });
  });

  // Contador de caracteres del mensaje
  const textarea = $('#mensaje');
  const counter = $('#counter');
  textarea.addEventListener('input', () => {
    counter.textContent = `${textarea.value.length} / ${textarea.maxLength}`;
  });

  form.addEventListener('submit', (e) => {
    const valid = fields.map(validate).every(Boolean);
    if (!valid) {
      e.preventDefault();                                  // detiene el envío
      fields.find((f) => !f.checkValidity())?.focus();
    }
    // Si todo es válido, el navegador envía el formulario por GET a gracias.html
  });
}

/* ---------- 13. Página de gracias: leer los datos enviados por GET ---------- */
function initThanks() {
  const body = $('#summaryBody');
  if (!body) return;

  const params = new URLSearchParams(window.location.search);
  const nombre = params.get('nombre');
  if (!nombre) return;

  $('#thanksTitle').textContent = `¡Gracias, ${nombre.split(' ')[0]}!`;

  const labels = { nombre: 'Nombre', correo: 'Correo', empresa: 'Empresa', motivo: 'Motivo', mensaje: 'Mensaje' };
  Object.entries(labels).forEach(([key, label]) => {
    const value = params.get(key);
    if (!value) return;
    const row = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = label;
    const td = document.createElement('td');
    td.textContent = value;                 // textContent evita inyectar HTML
    row.append(th, td);
    body.append(row);
  });
  $('#summary').hidden = false;
}

/* ---------- Arranque ---------- */
document.documentElement.classList.remove('no-js');
initTheme();
initMenu();
initScroll();
initReveal();
initRotator();
initAvatar();
initMarquee();
initToggles();
initRing();
initFilters();
initPrint();
initContactForm();
initThanks();
$('#year') && ($('#year').textContent = new Date().getFullYear());
