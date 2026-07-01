import * as THREE from 'three';
import { nebulaVert, nebulaFrag } from './shaders.js';
import { COLORS } from './palette.js';

// Fullscreen fbm nebula that sits behind everything,
// independent of the camera (drawn first, depth off).
export class Nebula {
  constructor() {
    this.uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uC1: { value: COLORS.c1 },
      uC2: { value: COLORS.c2 },
      uC3: { value: COLORS.c3 },
    };
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: nebulaVert,
      fragmentShader: nebulaFrag,
      uniforms: this.uniforms,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1;
  }

  resize(w, h) {
    this.uniforms.uRes.value.set(w, h);
  }

  update(state) {
    this.uniforms.uTime.value = state.time;
    this.uniforms.uMouse.value.set(state.pointer.x, state.pointer.y);
    this.uniforms.uScroll.value = state.scroll;
  }
}
