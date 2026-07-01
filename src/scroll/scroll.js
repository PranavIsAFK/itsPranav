import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from '../core/state.js';
import { scramble, typeWriter } from '../ui/text.js';

const ABOUT_TEXT =
  "3rd-year Computer Science student at SRM Institute of Science and Technology, Kattankulathur. I turn ideas into things people can actually use.";

export function initScroll(world) {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    lerp: state.reducedMotion ? 1 : 0.1,
    smoothWheel: !state.reducedMotion,
  });
  lenis.on('scroll', (e) => {
    state.scrollTarget = e.progress || 0;
    ScrollTrigger.update();
  });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const freqEl = document.getElementById('hud-freq');

  // per-section frequency lock + chromatic pulse
  document.querySelectorAll('.panel').forEach((sec, i) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) {
          state.section = i;
          freqEl.textContent = 'FREQ // ' + (sec.dataset.freq || '—');
          world?.pulseAberration(4);
        }
      },
    });
  });

  // about: typewriter + headline
  ScrollTrigger.create({
    trigger: '#about',
    start: 'top 65%',
    once: true,
    onEnter: () => typeWriter(document.getElementById('about-line1'), ABOUT_TEXT, 20),
  });
  gsap.from('#about-line2', {
    scrollTrigger: { trigger: '#about-line2', start: 'top 80%' },
    opacity: 0,
    y: 40,
    duration: 1,
    ease: 'power3.out',
  });

  // section titles scramble in
  ['#proj-title', '#connect-title'].forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    ScrollTrigger.create({
      trigger: sel,
      start: 'top 80%',
      once: true,
      onEnter: () => scramble(el, el.textContent, 700),
    });
  });

  // cards stagger up
  gsap.from('.holo-card', {
    scrollTrigger: { trigger: '.cards-grid', start: 'top 78%' },
    opacity: 0,
    y: 60,
    rotateX: 12,
    stagger: 0.14,
    duration: 0.9,
    ease: 'power3.out',
  });

  // connect links
  gsap.from('.connect-link', {
    scrollTrigger: { trigger: '#connect', start: 'top 78%' },
    opacity: 0,
    y: 40,
    stagger: 0.12,
    duration: 0.7,
    ease: 'power2.out',
  });

  // re-measure once fonts/layout settle
  window.addEventListener('load', () => ScrollTrigger.refresh());
  setTimeout(() => ScrollTrigger.refresh(), 700);

  return lenis;
}
