import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { gpgpuPosition, gpgpuVelocity, particleVert, particleFrag } from './shaders.js';
import { COLORS } from './palette.js';
import { clamp } from '../core/state.js';

// GPGPU ambient stardust field: springs into a volumetric cloud,
// reacts to the cursor as a force field, disperses on scroll.
export class Particles {
  constructor(renderer, size = 256) {
    this.WIDTH = size;
    this.count = size * size;
    this.renderer = renderer;
    this.failed = false;
    this._initGPU();
    this._initPoints();
  }

  _initGPU() {
    const W = this.WIDTH;
    const gpu = new GPUComputationRenderer(W, W, this.renderer);
    this.gpu = gpu;

    const pos0 = gpu.createTexture();
    const vel0 = gpu.createTexture();
    const target = gpu.createTexture();
    this._fillInitial(pos0, vel0, target);
    this.targetTexture = target;

    const posVar = gpu.addVariable('texturePosition', gpgpuPosition, pos0);
    const velVar = gpu.addVariable('textureVelocity', gpgpuVelocity, vel0);
    gpu.setVariableDependencies(posVar, [posVar, velVar]);
    gpu.setVariableDependencies(velVar, [posVar, velVar]);

    posVar.material.uniforms.dt = { value: 0 };
    velVar.material.uniforms.dt = { value: 0 };
    velVar.material.uniforms.uTime = { value: 0 };
    velVar.material.uniforms.uMouse = { value: new THREE.Vector3(999, 999, 999) };
    velVar.material.uniforms.uDispersion = { value: 0 };
    velVar.material.uniforms.uTarget = { value: target };

    this.posVar = posVar;
    this.velVar = velVar;

    const err = gpu.init();
    if (err) {
      console.error('[GPGPU]', err);
      this.failed = true;
    }
  }

  _fillInitial(posTex, velTex, targetTex) {
    const pos = posTex.image.data;
    const vel = velTex.image.data;
    const tgt = targetTex.image.data;

    for (let i = 0; i < this.count; i++) {
      const k = i * 4;
      // resting target: a wide, slightly flattened volumetric cloud
      const tx = (Math.random() - 0.5) * 40;
      const ty = (Math.random() - 0.5) * 22;
      const tz = (Math.random() - 0.5) * 28 - 4;
      tgt[k] = tx;
      tgt[k + 1] = ty;
      tgt[k + 2] = tz;
      tgt[k + 3] = 1;

      // start collapsed toward center → blooms outward into the cloud
      pos[k] = tx * 0.12 + (Math.random() - 0.5) * 0.6;
      pos[k + 1] = ty * 0.12 + (Math.random() - 0.5) * 0.6;
      pos[k + 2] = tz * 0.12 + (Math.random() - 0.5) * 0.6;
      pos[k + 3] = 1;

      vel[k] = vel[k + 1] = vel[k + 2] = 0;
      vel[k + 3] = 1;
    }
  }

  _initPoints() {
    const W = this.WIDTH;
    const count = this.count;
    const refs = new Float32Array(count * 2);
    const seeds = new Float32Array(count);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      refs[i * 2] = (i % W) / W;
      refs[i * 2 + 1] = Math.floor(i / W) / W;
      seeds[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('ref', new THREE.BufferAttribute(refs, 2));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: particleVert,
      fragmentShader: particleFrag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPosition: { value: null },
        uSize: { value: 1.3 },
        uDpr: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uC1: { value: COLORS.c1 },
        uC2: { value: COLORS.c2 },
        uC3: { value: COLORS.c3 },
      },
    });

    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    if (this.failed) this.points.visible = false; // no GPGPU → hide, don't show garbage
  }

  setDpr(dpr) {
    this.material.uniforms.uDpr.value = dpr;
  }

  update(dt, worldMouse, state) {
    if (this.failed) return;
    const cdt = clamp(dt, 0.001, 0.033);
    this.posVar.material.uniforms.dt.value = cdt;
    this.velVar.material.uniforms.dt.value = cdt;
    this.velVar.material.uniforms.uTime.value = state.time;
    this.velVar.material.uniforms.uDispersion.value = state.dispersion;
    if (worldMouse) this.velVar.material.uniforms.uMouse.value.copy(worldMouse);

    this.gpu.compute();
    this.material.uniforms.uPosition.value =
      this.gpu.getCurrentRenderTarget(this.posVar).texture;
  }
}
