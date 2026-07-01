import { state } from '../core/state.js';

// Custom cursor + a trail of fading dots. Also feeds pointer state to WebGL.
export function initCursor() {
  const cursor = document.getElementById('cursor');
  const TRAIL = 6;
  const trail = [];
  for (let i = 0; i < TRAIL; i++) {
    const el = document.createElement('div');
    const s = 6 - i * 0.7;
    el.style.cssText = `position:fixed;top:0;left:0;width:${s}px;height:${s}px;border-radius:50%;background:#7b5cff;opacity:${0.4 - i * 0.05};pointer-events:none;z-index:9997;transform:translate(-50%,-50%);mix-blend-mode:screen`;
    document.body.appendChild(el);
    trail.push({ el, x: 0, y: 0 });
  }

  window.addEventListener('pointermove', (e) => {
    state.px = e.clientX;
    state.py = e.clientY;
    state.pointerTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
    state.pointerTarget.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  function follow() {
    let tx = state.px;
    let ty = state.py;
    trail.forEach((t) => {
      t.x += (tx - t.x) * 0.35;
      t.y += (ty - t.y) * 0.35;
      t.el.style.left = t.x + 'px';
      t.el.style.top = t.y + 'px';
      tx = t.x;
      ty = t.y;
    });
    requestAnimationFrame(follow);
  }
  follow();

  const grow = () => cursor.classList.add('big');
  const shrink = () => cursor.classList.remove('big');
  document.querySelectorAll('a, button, .holo-card, .connect-link, #audio-btn, .modal-link, .modal-close').forEach((el) => {
    el.addEventListener('mouseenter', grow);
    el.addEventListener('mouseleave', shrink);
  });
}
