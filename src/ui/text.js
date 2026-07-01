const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&/\\';

export function scramble(el, finalText, duration = 1000) {
  const len = finalText.length;
  const start = performance.now();
  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const revealed = Math.floor(p * len);
    el.textContent = finalText
      .split('')
      .map((c, i) => (c === ' ' ? ' ' : i < revealed ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
      .join('');
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = finalText;
  }
  requestAnimationFrame(frame);
}

export function typeWriter(el, text, speed = 24) {
  el.textContent = '';
  let i = 0;
  const id = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) clearInterval(id);
  }, speed);
}
