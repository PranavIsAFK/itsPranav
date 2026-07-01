import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Nebula } from './Nebula.js';
import { Particles } from './Particles.js';
import { finalFrag } from './shaders.js';
import { COLORS } from './palette.js';
import { state, lerp } from '../core/state.js';

const finalVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

export class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.worldMouse = new THREE.Vector3(999, 999, 999);
    this._plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this._ray = new THREE.Raycaster();
    this._aberrationPulse = 0;

    this._fpsSamples = [];
    this._guarded = false;

    this._initRenderer();
    this._initScene();
    this._initPost();
    this._bindResize();
  }

  _initRenderer() {
    const r = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    r.setPixelRatio(state.dpr);
    r.setSize(state.width, state.height);
    r.setClearColor(COLORS.bg, 1);
    this.renderer = r;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, state.width / state.height, 0.1, 200);
    this.camera.position.set(0, 0, 9);

    this.nebula = new Nebula();
    this.nebula.resize(state.width, state.height);
    this.scene.add(this.nebula.mesh);

    // lighter particle grid on small screens
    const size = state.width < 720 ? 128 : 256;
    this.particles = new Particles(this.renderer, size);
    this.scene.add(this.particles.points);
  }

  _initPost() {
    const composer = new EffectComposer(this.renderer);
    composer.setPixelRatio(state.dpr);
    composer.setSize(state.width, state.height);
    composer.addPass(new RenderPass(this.scene, this.camera));

    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(state.width, state.height),
      0.7,   // strength
      0.6,   // radius
      0.6    // threshold — only bright particle cores bloom (no full-frame wash)
    );
    composer.addPass(this.bloom);

    this.finalPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uAberration: { value: state.reducedMotion ? 0.3 : 0.5 },
        uGrain: { value: state.reducedMotion ? 0.015 : 0.035 },
      },
      vertexShader: finalVert,
      fragmentShader: finalFrag,
    });
    composer.addPass(this.finalPass);
    this.composer = composer;
  }

  _bindResize() {
    window.addEventListener('resize', () => {
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      this.camera.aspect = state.width / state.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(state.width, state.height);
      this.composer.setSize(state.width, state.height);
      this.bloom.setSize(state.width, state.height);
      this.nebula.resize(state.width, state.height);
    });
  }

  // brief chromatic-aberration spike (modal open, section locks)
  pulseAberration(amount = 5) {
    this._aberrationPulse = amount;
  }

  _updateWorldMouse() {
    this._ray.setFromCamera({ x: state.pointer.x, y: state.pointer.y }, this.camera);
    const hit = this._ray.ray.intersectPlane(this._plane, this.worldMouse);
    if (!hit) this.worldMouse.set(999, 999, 999);
  }

  _updateCamera(dt) {
    const s = state.scroll;
    const tz = lerp(9, -9, s); // travel forward through the field
    const tx = state.pointer.x * 1.1 + Math.sin(s * 6.2831) * 0.5;
    const ty = -state.pointer.y * 0.7 + s * 1.4;
    const k = 1 - Math.pow(0.001, dt); // frame-rate independent smoothing
    this.camera.position.x = lerp(this.camera.position.x, tx, k);
    this.camera.position.y = lerp(this.camera.position.y, ty, k);
    this.camera.position.z = lerp(this.camera.position.z, tz, k);
    this.camera.lookAt(this.camera.position.x * 0.25, this.camera.position.y * 0.25, this.camera.position.z - 6);
  }

  _guard(dt) {
    if (this._guarded) return;
    this._fpsSamples.push(dt);
    if (this._fpsSamples.length > 90) {
      const avg = this._fpsSamples.reduce((a, b) => a + b, 0) / this._fpsSamples.length;
      this._fpsSamples.length = 0;
      if (avg > 1 / 38) {
        this._guarded = true;
        const dpr = Math.max(1, state.dpr - 0.5);
        state.dpr = dpr;
        this.renderer.setPixelRatio(dpr);
        this.composer.setPixelRatio(dpr);
        this.bloom.strength = 0.5;
        this.finalPass.uniforms.uGrain.value *= 0.6;
        this.particles.setDpr(dpr);
      }
    }
  }

  start() {
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.05);
      state.time = this.clock.getElapsedTime();

      // smooth pointer + scroll
      const ks = 1 - Math.pow(0.0001, dt);
      state.pointer.x = lerp(state.pointer.x, state.pointerTarget.x, ks);
      state.pointer.y = lerp(state.pointer.y, state.pointerTarget.y, ks);
      state.scroll = lerp(state.scroll, state.scrollTarget, 1 - Math.pow(0.0005, dt));
      state.dispersion = Math.max(0, Math.min(1, (state.scroll - 0.02) / 0.2));

      this._updateWorldMouse();
      this._updateCamera(dt);

      this.nebula.update(state);
      this.particles.update(dt, this.worldMouse, state);

      this._aberrationPulse = lerp(this._aberrationPulse, 0, 1 - Math.pow(0.01, dt));
      const baseAb = state.reducedMotion ? 0.3 : 0.5;
      this.finalPass.uniforms.uTime.value = state.time;
      this.finalPass.uniforms.uAberration.value = baseAb + this._aberrationPulse;

      this.composer.render();
      this._guard(dt);
    };
    loop();
  }
}
