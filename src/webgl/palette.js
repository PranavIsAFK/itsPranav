import * as THREE from 'three';

// Iridescent Void — shared by shaders so JS + GLSL never drift.
export const COLORS = {
  bg: new THREE.Color('#05060a'),
  c1: new THREE.Color('#2de2e6'), // teal
  c2: new THREE.Color('#7b5cff'), // indigo
  c3: new THREE.Color('#ff2e97'), // pink
};
