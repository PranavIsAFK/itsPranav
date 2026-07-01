// Shared, mutable app state. UI/scroll modules write; WebGL reads.
export const state = {
  // pointer in normalized device coords (-1..1), smoothed
  pointer: { x: 0, y: 0 },
  pointerTarget: { x: 0, y: 0 },
  // pointer in pixels
  px: 0,
  py: 0,
  // scroll depth 0..1 across the whole document, smoothed
  scroll: 0,
  scrollTarget: 0,
  // current "frequency" / section the camera is locked to (0..n)
  section: 0,
  // global time (seconds)
  time: 0,
  // 0 = field held, 1 = fully dispersed (driven by scroll out of hero)
  dispersion: 0,
  // quality scale (1 = full); FPS guard may lower this
  quality: 1,
  // viewport
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(window.devicePixelRatio || 1, 2),
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
