import { state } from '../core/state.js';

export function initHUD() {
  const clock = document.getElementById('hud-clock');
  const coords = document.getElementById('hud-coords');
  const depth = document.getElementById('hud-scroll');
  const p2 = (n) => String(n).padStart(2, '0');
  const p3 = (n) => String(Math.max(0, Math.round(n))).padStart(3, '0');

  setInterval(() => {
    const d = new Date();
    clock.textContent = `${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
  }, 1000);

  function frame() {
    coords.textContent = `X+${p3(state.px)} Y+${p3(state.py)}`;
    depth.textContent = `DEPTH ${p2(Math.round(state.scroll * 100))}%`;
    requestAnimationFrame(frame);
  }
  frame();
}
