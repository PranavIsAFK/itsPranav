// Ambient "transmission" drone + UI blips via Web Audio API.
export function initAudio() {
  const btn = document.getElementById('audio-btn');
  let ctx = null;
  let master = null;
  let nodes = [];
  let playing = false;

  function ensureCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);
  }

  function start() {
    ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 6;
    filter.connect(master);

    // slow filter sweep
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 380;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    nodes.push(lfo);

    // harmonic drone bed
    [[55, 0.5], [82.5, 0.32], [110, 0.26], [164.8, 0.14], [220, 0.08]].forEach(([f, g], i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      osc.detune.value = (Math.random() - 0.5) * 8;
      gain.gain.value = g;
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      nodes.push(osc);
    });

    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.5);
    playing = true;
  }

  function stop() {
    if (!ctx) return;
    master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    const dead = nodes;
    nodes = [];
    setTimeout(() => dead.forEach((n) => { try { n.stop(); } catch (e) {} }), 700);
    playing = false;
  }

  btn.addEventListener('click', () => {
    if (playing) {
      stop();
      btn.textContent = '♪';
      btn.style.color = '';
      btn.style.boxShadow = '';
    } else {
      start();
      btn.textContent = '♬';
      btn.style.color = '#fff';
      btn.style.boxShadow = '0 0 16px rgba(45,226,230,.6)';
    }
  });

  function blip(freq = 880) {
    if (!playing || !ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    g.gain.value = 0.0;
    osc.connect(g);
    g.connect(master);
    const t = ctx.currentTime;
    g.gain.linearRampToValueAtTime(0.04, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  return { blip };
}
