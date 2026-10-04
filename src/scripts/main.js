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
const adv = $('adv');
if (adv) {
  const PER = 12;
  const items = [...adv.children];
  const more = $('advMore');
  let libro = 'todos', open = false;
  const matches = () => items.filter((li) => libro === 'todos' || li.dataset.libro === libro);
  function renderAdv() {
    const m = matches();
    items.forEach((li) => { li.hidden = true; });
    m.forEach((li, i) => { li.hidden = !open && i >= PER; });
    more.hidden = open || m.length <= PER;
  }
  more.addEventListener('click', () => { open = true; renderAdv(); });
  const chips = $('advChips');
  if (chips) chips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    libro = b.dataset.libro; open = false;
    [...chips.children].forEach((c) => c.classList.toggle('is-on', c === b));
    renderAdv();
  });
  renderAdv();

  // Visor
  const lb = $('lb'), lbImg = $('lbImg');
  let list = [], li = 0;
  const showLb = () => {
    const b = list[li].querySelector('button');
    lbImg.src = b.dataset.full; lbImg.alt = b.dataset.alt;
    $('lbCount').textContent = `${li + 1} / ${list.length}`;
    restart(lbImg);
  };
  const stepLb = (d) => { li = (li + d + list.length) % list.length; showLb(); };
  const closeLb = () => { lb.hidden = true; lbImg.removeAttribute('src'); root.removeAttribute('data-lock'); };
  adv.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-full]'); if (!b) return;
    list = matches(); li = list.indexOf(b.closest('li'));
    lb.hidden = false; root.setAttribute('data-lock', ''); showLb(); $('lbClose').focus();
  });
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
}
