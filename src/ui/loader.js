import gsap from 'gsap';
import { scramble } from './text.js';

const LINES = [
  'ESTABLISHING UPLINK…',
  'DECRYPTING SIGNAL…',
  'LOADING PARTICLE CORE…',
  'SYNCING NEURAL GRID…',
  'CHANNEL SECURE.',
];

export function runLoader(onComplete) {
  const loader = document.getElementById('loader');
  const textEl = document.getElementById('loader-text');
  const bar = document.getElementById('loader-bar');
  const pct = document.getElementById('loader-pct');
  const nameEl = document.getElementById('loader-name');

  let line = 0;
  textEl.textContent = LINES[0];
  const lineTimer = setInterval(() => {
    line++;
    if (line < LINES.length) textEl.textContent = LINES[line];
    else clearInterval(lineTimer);
  }, 360);

  let progress = 0;
  const barTimer = setInterval(() => {
    progress = Math.min(progress + Math.random() * 9 + 4, 100);
    bar.style.width = progress + '%';
    pct.textContent = String(Math.floor(progress)).padStart(2, '0') + '%';
    if (progress >= 100) {
      clearInterval(barTimer);
      clearInterval(lineTimer);
      textEl.textContent = 'CHANNEL SECURE.';
      gsap.to(nameEl, { opacity: 1, duration: 0.4 });
      scramble(nameEl, 'PRANAV BISHT', 850);
      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0,
          duration: 1,
          delay: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            onComplete?.();
          },
        });
      }, 1100);
    }
  }, 90);
}
