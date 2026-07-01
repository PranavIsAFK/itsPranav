import 'lenis/dist/lenis.css';
import './styles/main.css';
import gsap from 'gsap';
import { World } from './webgl/World.js';
import { initCursor } from './ui/cursor.js';
import { initHUD } from './ui/hud.js';
import { initMagnetic } from './ui/magnetic.js';
import { initProjects } from './ui/projects.js';
import { runLoader } from './ui/loader.js';
import { initScroll } from './scroll/scroll.js';
import { initAudio } from './audio/audio.js';
import { scramble } from './ui/text.js';

function heroIntro() {
  const eyebrow = document.getElementById('hero-eyebrow');
  const name = document.getElementById('hero-name');
  const sub = document.getElementById('hero-sub');
  const tag = document.getElementById('hero-tag');
  const hint = document.getElementById('scroll-hint');

  gsap.set([eyebrow, name, sub, tag, hint], { opacity: 0, y: 16 });
  gsap.to(eyebrow, { opacity: 0.75, y: 0, duration: 0.6, delay: 0.1, ease: 'power2.out' });
  gsap.to(name, {
    opacity: 1, y: 0, duration: 0.8, delay: 0.25, ease: 'power3.out',
    onComplete: () => {
      scramble(name, 'PRANAV BISHT', 850);
      name.classList.add('glitch');
      setTimeout(() => name.classList.remove('glitch'), 900);
    },
  });
  gsap.to(sub, {
    opacity: 1, y: 0, duration: 0.7, delay: 0.95, ease: 'power2.out',
    onComplete: () => scramble(sub, 'Ideas, engineered into reality', 650),
  });
  gsap.to(tag, { opacity: 1, y: 0, duration: 0.7, delay: 1.3, ease: 'power2.out' });
  gsap.to(hint, { opacity: 0.55, y: 0, duration: 0.7, delay: 1.6, ease: 'power2.out' });
}

function boot() {
  const canvas = document.getElementById('webgl');
  let world = null;
  try {
    world = new World(canvas);
    world.start();
  } catch (err) {
    console.error('[WebGL unavailable]', err);
    document.body.classList.add('no-webgl');
  }

  const audio = initAudio();

  initProjects({
    onDecrypt: () => {
      world?.pulseAberration(6);
      audio.blip(660);
    },
  });

  initCursor();
  initHUD();
  initMagnetic();
  initScroll(world);

  runLoader(() => heroIntro());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
