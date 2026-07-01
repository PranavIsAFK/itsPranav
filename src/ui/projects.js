import gsap from 'gsap';
import { PROJECTS, CARDS } from '../data/content.js';
import { scramble } from './text.js';

// Build the project cards, wire holographic tilt + the decrypt modal.
export function initProjects({ onDecrypt } = {}) {
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = CARDS.map(
    (c, i) => `
    <article class="holo-card" data-project="${c.key}">
      <span class="card-index">${String(i + 1).padStart(2, '0')} / ${String(CARDS.length).padStart(2, '0')}</span>
      <span class="card-tag">${c.tag}</span>
      <h3 class="card-title">${c.title}</h3>
      <p class="card-desc">${c.desc}</p>
      <div class="card-stack">${c.chips.map((x) => `<span class="stack-chip">${x}</span>`).join('')}</div>
      <span class="card-cta">▸ DECRYPT FILE <span class="blink">_</span></span>
    </article>`
  ).join('');

  const cards = [...grid.querySelectorAll('.holo-card')];

  // holographic tilt
  cards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width;
      const cy = (e.clientY - r.top) / r.height;
      gsap.to(card, {
        rotateX: (cy - 0.5) * -14,
        rotateY: (cx - 0.5) * 14,
        transformPerspective: 700,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
    card.addEventListener('pointerleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1,0.5)' });
    });
  });

  // ── modal ──
  const overlay = document.getElementById('modal');
  const panel = overlay.querySelector('.modal-panel');
  const closeBtn = overlay.querySelector('.modal-close');
  const flash = document.getElementById('glitch-flash');
  const $ = (id) => document.getElementById(id);

  function open(key) {
    const p = PROJECTS[key];
    if (!p) return;
    $('modal-fname').textContent = p.title.replace(/\s+/g, '_') + '.sig';
    $('modal-tag').textContent = p.tag;
    $('modal-subtitle').textContent = p.subtitle;
    $('modal-problem').textContent = p.problem;
    $('modal-solution').textContent = p.solution;

    const ul = $('modal-features');
    ul.innerHTML = '';
    p.features.forEach((f, i) => {
      const li = document.createElement('li');
      li.textContent = f;
      li.style.transitionDelay = 0.25 + i * 0.09 + 's';
      ul.appendChild(li);
    });

    const st = $('modal-stack');
    st.innerHTML = '';
    p.stack.forEach((s) => {
      const c = document.createElement('span');
      c.className = 'stack-chip';
      c.textContent = s;
      st.appendChild(c);
    });

    const link = $('modal-link');
    link.href = p.link;
    link.innerHTML = `${p.linkLabel} <span>→</span>`;

    panel.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    void panel.offsetWidth;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');

    flash.classList.remove('flash');
    void flash.offsetWidth;
    flash.classList.add('flash');
    onDecrypt?.();

    const title = $('modal-title');
    title.textContent = p.title;
    scramble(title, p.title, 650);
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cards.forEach((card) => card.addEventListener('click', () => open(card.dataset.project)));
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}
