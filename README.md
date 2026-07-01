# PRANAV BISHT // SIGNAL

A WebGL portfolio — the site is a *transmission you decrypt*. Built with Three.js,
GPGPU particle simulation, an fbm nebula shader, cinematic post-processing and
buttery smooth scroll.

## The experience

- **Uplink loader** — particles condense out of noise as the channel goes secure.
- **Crisp iridescent name** over a **GPGPU stardust field** — tens of thousands of
  GPU-simulated particles bloom into a volumetric cloud, react to your cursor as a
  force field, then disperse into the void as you descend.
- **fbm nebula** — a living cloud field drifting behind everything.
- **Cinematic post** — Unreal bloom + chromatic aberration + film grain + vignette
  through an `EffectComposer`, so it reads like film, not a demo.
- **Scroll = descent** — Lenis smooth scroll choreographed with GSAP ScrollTrigger
  flies the camera forward through the field; each section is a "frequency" you lock to.
- **Iridescent Void palette** — near-black with a teal → indigo → pink oil-slick accent.
- Magnetic cursor + buttons, holographic glass dossier cards, HUD overlay, ambient
  Web-Audio transmission with UI blips.

## Projects featured

| Project | Stack | Description |
|---|---|---|
| **Vision Buddy** | AI Vision, React, Web Speech API | Real-time scene description and SOS for visually impaired users |
| **OLAB** | JavaScript, 0/1 Knapsack DP | Truck load optimizer with live DP table visualization |
| **PromptForge** | Next.js 14, Groq (LLaMA 3), TypeScript | Turns any app idea into a complete build kit — prompt, stack, APIs, deploy guide |

## Stack

- **Three.js** r160 — WebGL2, GPUComputationRenderer (GPGPU), EffectComposer postprocessing
- **GSAP** 3 + ScrollTrigger
- **Lenis** smooth scroll
- **Vite** build · **Space Grotesk** / **Space Mono** type
- Web Audio API ambient synthesis

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Deploy

Vercel auto-detects Vite (`vercel.json` included). Connect the repo — it builds and
deploys on every push.
