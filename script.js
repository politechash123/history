// ---------- Hero title: split into animated letters ----------
// Letters are grouped into words so lines only wrap between words on small screens
document.querySelectorAll('.split').forEach((line, li) => {
  const words = line.textContent.trim().split(/\s+/);
  line.textContent = '';
  let i = 0;
  words.forEach((word, wi) => {
    const w = document.createElement('span');
    w.className = 'word';
    [...word].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch;
      s.style.animationDelay = `${0.2 + li * 0.4 + i++ * 0.03}s`;
      w.appendChild(s);
    });
    line.appendChild(w);
    if (wi < words.length - 1) line.appendChild(document.createTextNode(' '));
  });
});

// ---------- Scroll reveal ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      const c = e.target.querySelector('.counter');
      if (c) animateCounter(c);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
if ('IntersectionObserver' in window) {
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
}

// Leaf stagger index
document.querySelectorAll('.leaves path').forEach((p, i) => p.style.setProperty('--i', i));

// ---------- Counter ----------
function animateCounter(el) {
  const target = +el.dataset.target;
  const start = performance.now();
  const dur = 1800;
  const tick = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.round(target * eased);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ---------- Scroll: progress bar, nav, parallax, active link ----------
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
const ruin = document.querySelector('.hero__ruin');
const toTop = document.querySelector('.to-top');
const links = [...document.querySelectorAll('.nav__links a')];
const sections = links.map((a) => document.querySelector(a.getAttribute('href')));

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${(y / max) * 100}%`;
  nav.classList.toggle('scrolled', y > 60);
  toTop.classList.toggle('show', y > innerHeight);
  if (y < innerHeight) ruin.style.transform = `translateX(-50%) translateY(${y * 0.3}px)`;

  let current = -1;
  sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
  links.forEach((a, i) => a.classList.toggle('active', i === current));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Mobile menu ----------
document.getElementById('burger').addEventListener('click', (e) => {
  e.stopPropagation();
  nav.classList.toggle('menu-open');
});
document.addEventListener('click', (e) => { if (!nav.contains(e.target)) nav.classList.remove('menu-open'); });
links.forEach((a) => a.addEventListener('click', () => nav.classList.remove('menu-open')));

// ---------- Flip cards ----------
document.querySelectorAll('.flip').forEach((card) => {
  const toggle = () => card.classList.toggle('flipped');
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});

// ---------- Tabs ----------
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
tabs.forEach((tab) => tab.addEventListener('click', () => {
  tabs.forEach((t) => t.classList.remove('active'));
  panels.forEach((p) => p.classList.remove('active'));
  tab.classList.add('active');
  const panel = document.querySelector(`.panel[data-panel="${tab.dataset.tab}"]`);
  panel.classList.add('active');
  // restart timeline animations
  panel.querySelectorAll('.tl').forEach((el) => { el.style.animation = 'none'; el.offsetHeight; el.style.animation = ''; });
}));

// ---------- Vicious cycle stepper ----------
const nodes = document.querySelectorAll('.cycle__node');
let step = 0;
setInterval(() => {
  nodes.forEach((n, i) => n.classList.toggle('on', i === step));
  step = (step + 1) % nodes.length;
}, 1400);

// ---------- Accordion ----------
document.querySelectorAll('.acc__head').forEach((head) => head.addEventListener('click', () => {
  const acc = head.parentElement;
  const wasOpen = acc.classList.contains('open');
  document.querySelectorAll('.acc').forEach((a) => a.classList.remove('open'));
  if (!wasOpen) acc.classList.add('open');
}));

// ---------- Modal for strategies ----------
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
document.querySelectorAll('[data-open]').forEach((btn) => btn.addEventListener('click', () => {
  const tpl = document.getElementById(btn.dataset.open);
  modalContent.innerHTML = '';
  modalContent.appendChild(tpl.content.cloneNode(true));
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}));
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ---------- Hero dust particles ----------
const canvas = document.getElementById('dust');
const ctx = canvas.getContext('2d');
let W, H, particles;
let lastW = 0;
function resize() {
  // Mobile browsers fire resize when the address bar hides; skip if width didn't change
  if (canvas.offsetWidth === lastW && particles) return;
  lastW = canvas.offsetWidth;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = canvas.width = canvas.offsetWidth * dpr;
  H = canvas.height = canvas.offsetHeight * dpr;
  particles = Array.from({ length: Math.min(90, Math.floor(canvas.offsetWidth / 8)) }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: (Math.random() * 1.8 + 0.4) * dpr,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -(Math.random() * 0.35 + 0.1),
    a: Math.random() * 0.5 + 0.2,
  }));
}
function draw() {
  ctx.clearRect(0, 0, W, H);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
    if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(201,167,124,${p.a})`;
    ctx.fill();
  }
  if (window.scrollY < innerHeight) requestAnimationFrame(draw);
  else setTimeout(() => requestAnimationFrame(draw), 300);
}
addEventListener('resize', resize);
resize();
draw();
