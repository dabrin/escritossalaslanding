import { chapters, escriboSobre, frags, links } from '../data/content.js';

const root = document.documentElement;
const $ = (id) => document.getElementById(id);
const sections = [...document.querySelectorAll('[data-chapter]')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cl = (v) => Math.max(0, Math.min(1, v));

// ── Scroll: capítulo activo, revelado, parallax, progreso ──
const words = { i: 0, now: $('wordNow'), line: $('wordLine'), count: $('wordCount'), items: [...$('wordList').children] };
let activeChapter = -1;
let raf = 0;

const isProse = (t) => Math.max(...t.split('\n').map((l) => l.length)) > 90;
const restart = (el) => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; };

function setWord(i) {
  words.i = i;
  words.now.textContent = escriboSobre.words[i];
  words.line.textContent = escriboSobre.lines[i];
  words.line.classList.toggle('just', isProse(escriboSobre.lines[i]));
  words.line.scrollTop = 0;
  words.count.textContent = `0${i + 1} / 05`;
  words.items.forEach((li, n) => { li.style.opacity = n === i ? 1 : 0.4; });
  restart(words.now); restart(words.line);
}

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
  const wp = cl(-w.top / (w.height - vh));
  const wi = Math.min(4, Math.floor(wp * 5));
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
