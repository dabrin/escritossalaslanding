import { chapters, escriboSobre, frags, links } from '../data/content.js';

const root = document.documentElement;
const $ = (id) => document.getElementById(id);
const sections = [...document.querySelectorAll('[data-chapter]')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cl = (v) => Math.max(0, Math.min(1, v));

// ── Scroll: capítulo activo, revelado, parallax, progreso ──
const words = { i: 0, now: $('wordNow'), line: $('wordLine'), count: $('wordCount'), items: [...$('wordList').querySelectorAll('button')] };
let activeChapter = -1;
let raf = 0;

const isProse = (t) => Math.max(...t.split('\n').map((l) => l.length)) > 90;
const restart = (el) => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; };

const wordChars = (t) => [...t].map((c, k) => `<span class="ch" style="--i:${k}">${c}</span>`).join('');
let swapTimer = 0;

function applyWord(i) {
  words.now.innerHTML = wordChars(escriboSobre.words[i]);
  words.now.setAttribute('aria-label', escriboSobre.words[i]);
  words.line.textContent = escriboSobre.lines[i];
  words.line.classList.toggle('just', isProse(escriboSobre.lines[i]));
  words.line.scrollTop = 0;
}

// Cambio de palabra: lo anterior sale suave y la nueva entra letra por letra
function setWord(i) {
  words.i = i;
  words.count.textContent = `0${i + 1} / 05`;
  words.items.forEach((b, n) => {
    b.classList.toggle('is-on', n === i);
    if (n === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  });
  clearTimeout(swapTimer);
  if (reduce) { applyWord(i); return; }
  [words.now, words.line].forEach((el) => { el.classList.remove('is-in'); el.classList.add('is-out'); });
  swapTimer = setTimeout(() => {
    applyWord(i);
    [words.now, words.line].forEach((el) => el.classList.remove('is-out'));
    void words.now.offsetWidth;
    [words.now, words.line].forEach((el) => el.classList.add('is-in'));
  }, 240);
}

// Tocar una palabra salta a su tramo de la sección (el salto es instantáneo; la transición lo suaviza)
function goWord(i) {
  const sec = document.querySelector('.words');
  const y = sec.offsetTop + (sec.offsetHeight - innerHeight) * ((i + 0.5) / escriboSobre.words.length);
  scrollTo({ top: y, behavior: 'instant' });
}
$('wordList').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) goWord(+b.dataset.i);
});
words.now.addEventListener('click', () => goWord((words.i + 1) % escriboSobre.words.length));

function update() {
  raf = 0;
  const vh = innerHeight;
  const rects = sections.map((s) => s.getBoundingClientRect());

  let active = 0;
  rects.forEach((r, i) => { if (r.top < vh * 0.55) active = i; });
  if (active !== activeChapter) {
    activeChapter = active;
    const [bg, fg, label] = chapters[active];
    root.style.setProperty('--bg', bg);
    root.style.setProperty('--fg', fg);
    $('chapter').textContent = label;
  }

  sections.forEach((s, i) => {
    const top = rects[i].top;
    s.style.setProperty('--rev', cl((vh * 0.8 - top) / (vh * 0.5)).toFixed(3));
    if (reduce) return;
    if (i === 0) {
      s.style.setProperty('--pa', (Math.min(0, top) * -0.12).toFixed(1));
      return;
    }
    const pa = s.dataset.pa, pb = s.dataset.pb;
    const px = (k) => Math.max(-140, Math.min(140, top * k)).toFixed(1);
    if (pa) s.style.setProperty('--pa', px(+pa));
    if (pb) s.style.setProperty('--pb', px(+pb));
  });

  const w = rects[1];
  const wp = cl(-w.top / Math.max(1, w.height - vh));
  const wi = Math.min(escriboSobre.lines.length - 1, Math.floor(wp * 5)) || 0;
  if (wi !== words.i) setWord(wi);

  const prog = cl(scrollY / (root.scrollHeight - vh));
  $('progress').style.transform = `scaleX(${prog.toFixed(4)})`;
}

const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule);
update();

// ── Menú ──
const menu = $('menu'), menuBtn = $('menuBtn');
function toggleMenu(open) {
  menu.hidden = !open;
  menuBtn.textContent = open ? 'Cerrar' : 'Menú';
  menuBtn.setAttribute('aria-expanded', String(open));
  root.toggleAttribute('data-menu', open);
  root.toggleAttribute('data-lock', open);
}
menuBtn.addEventListener('click', () => toggleMenu(menu.hidden));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) toggleMenu(false); });

// ── Modal "Leer fragmento" ──
const frag = $('frag'), fragText = $('fragText');
let book = null, fi = 0;

function fontSize(len) {
  return len > 300 ? 'clamp(18px,2.1vw,28px)' : len > 160 ? 'clamp(22px,2.8vw,40px)' : len > 110 ? 'clamp(28px,4.2vw,60px)' : 'clamp(34px,5.6vw,80px)';
}

function render() {
  const b = frags[book], line = b.lines[fi];
  fragText.textContent = line;
  fragText.style.fontSize = fontSize(line.length);
  const prose = isProse(line);
  fragText.classList.toggle('just', prose);
  fragText.style.maxWidth = prose || line.length > 200 ? '40ch' : '20ch';
  $('fragCount').textContent = `${fi + 1} / ${b.lines.length}`;
  $('fragBody').scrollTop = 0;
  restart(fragText);
}

function openFrag(i) {
  book = i; fi = 0;
  const b = frags[i];
  frag.style.setProperty('--fbg', b.bg);
  frag.style.setProperty('--ffg', b.fg);
  $('fragTitle').textContent = b.title;
  $('fragBuy').href = links.buy[i];
  frag.hidden = false;
  root.setAttribute('data-lock', '');
  render();
  $('fragClose').focus();
}
function closeFrag() {
  frag.hidden = true;
  book = null;
  if (menu.hidden) root.removeAttribute('data-lock');
}
function step(d) {
  const n = frags[book].lines.length;
  fi = (fi + d + n) % n;
  render();
}

document.querySelectorAll('[data-frag]').forEach((a) =>
  a.addEventListener('click', (e) => { e.preventDefault(); openFrag(+a.dataset.frag); })
);
$('fragClose').addEventListener('click', closeFrag);
$('fragPrev').addEventListener('click', () => step(-1));
$('fragNext').addEventListener('click', () => step(1));
$('fragBody').addEventListener('click', () => step(1));

addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (!frag.hidden) closeFrag(); else if (!menu.hidden) toggleMenu(false); }
  if (frag.hidden) return;
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});

let sx = 0, sy = 0;
frag.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
frag.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
});

// ── Carrusel "La viajera" ──
const car = $('car');
const items = [...car.children];
const step1 = () => items[1].offsetLeft - items[0].offsetLeft;
$('carPrev').addEventListener('click', () => car.scrollBy({ left: -step1(), behavior: 'smooth' }));
$('carNext').addEventListener('click', () => car.scrollBy({ left: step1(), behavior: 'smooth' }));
car.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); car.scrollBy({ left: step1(), behavior: 'smooth' }); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); car.scrollBy({ left: -step1(), behavior: 'smooth' }); }
});
car.addEventListener('scroll', () => {
  const i = Math.min(items.length - 1, Math.round(car.scrollLeft / step1()));
  $('carCount').textContent = `${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
}, { passive: true });

// ── Galería "Mi libro aventurero" ──
import { mensajes } from '../data/mensajes.js';

const PER = 12;
const books = [...document.querySelectorAll('.advbook')];
const lb = $('lb'), lbImg = $('lbImg');
let list = [], li = 0;

function setBook(book, open) {
  const head = book.querySelector('.advbook__head');
  head.setAttribute('aria-expanded', String(open));
  book.querySelector('.advbook__panel').hidden = !open;
  book.classList.toggle('is-open', open);
}

books.forEach((book) => {
  const items = [...book.querySelectorAll('.adv__item')];
  const more = book.querySelector('.adv__more');
  let shown = PER;
  const render = () => {
    items.forEach((el, i) => { el.hidden = i >= shown; });
    more.hidden = shown >= items.length;
  };
  book.querySelector('.advbook__head').addEventListener('click', () => {
    const open = book.querySelector('.advbook__head').getAttribute('aria-expanded') !== 'true';
    books.forEach((b) => setBook(b, false));
    setBook(book, open);
    if (open) setTimeout(() => book.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), 60);
  });
  more.addEventListener('click', () => { shown += PER; render(); });
  render();

  // Mensajes de lectores, de uno en uno
  const box = book.querySelector('.msgs');
  if (box) {
    const msgs = mensajes[book.dataset.book];
    let mi = 0;
    const text = box.querySelector('.msgs__text');
    const draw = () => {
      text.textContent = msgs[mi];
      box.querySelector('.msgs__count').textContent = `${mi + 1} / ${msgs.length}`;
      restart(text);
    };
    const go = (d) => { mi = (mi + d + msgs.length) % msgs.length; draw(); };
    box.querySelector('.msgs__prev').addEventListener('click', () => go(-1));
    box.querySelector('.msgs__next').addEventListener('click', () => go(1));
  }

  // Visor de fotos (recorre todas las fotos de ese libro)
  book.querySelector('.adv').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-full]'); if (!b) return;
    list = items; li = items.indexOf(b.closest('li'));
    lb.hidden = false; root.setAttribute('data-lock', ''); showLb(); $('lbClose').focus();
  });
});

function showLb() {
  const b = list[li].querySelector('button');
  lbImg.src = b.dataset.full; lbImg.alt = b.dataset.alt;
  $('lbCount').textContent = `${li + 1} / ${list.length}`;
  restart(lbImg);
}
const stepLb = (d) => { li = (li + d + list.length) % list.length; showLb(); };
const closeLb = () => { lb.hidden = true; lbImg.removeAttribute('src'); root.removeAttribute('data-lock'); };
$('lbClose').addEventListener('click', closeLb);
$('lbPrev').addEventListener('click', () => stepLb(-1));
$('lbNext').addEventListener('click', () => stepLb(1));
addEventListener('keydown', (e) => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowRight') stepLb(1);
  if (e.key === 'ArrowLeft') stepLb(-1);
});
let lx = 0, ly = 0;
lb.addEventListener('touchstart', (e) => { lx = e.touches[0].clientX; ly = e.touches[0].clientY; }, { passive: true });
lb.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - lx, dy = e.changedTouches[0].clientY - ly;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) stepLb(dx < 0 ? 1 : -1);
});
