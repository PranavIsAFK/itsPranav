import gsap from 'gsap';

// Elements physically pull toward the cursor, then spring back.
export function initMagnetic(selector = '#audio-btn, .connect-icon, .modal-link, .modal-close') {
  document.querySelectorAll(selector).forEach((el) => {
    const strength = el.classList.contains('modal-link') ? 0.32 : 0.45;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' });
    });
  });
}
