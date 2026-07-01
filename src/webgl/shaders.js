// ═══════════════════════════════════════════════════════════════
// SHADERS  ·  SIGNAL
// ═══════════════════════════════════════════════════════════════

// Ashima simplex noise + curl, shared by the GPGPU velocity pass.
const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
    + i.y+vec4(0.0,i1.y,i2.y,1.0))
    + i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 curlNoise(vec3 p){
  const float e=0.1;
  vec3 dx=vec3(e,0.0,0.0);
  vec3 dy=vec3(0.0,e,0.0);
  vec3 dz=vec3(0.0,0.0,e);
  float x=snoise(p+dy.zxy)-snoise(p-dy.zxy)-snoise(p+dz.yzx)+snoise(p-dz.yzx);
  float y=snoise(p+dz.yzx)-snoise(p-dz.yzx)-snoise(p+dx)+snoise(p-dx);
  float z=snoise(p+dx)-snoise(p-dx)-snoise(p+dy.zxy)+snoise(p-dy.zxy);
  return normalize(vec3(x,y,z)/(2.0*e)+1e-5);
}
`;

// ── GPGPU: position integration ──
export const gpgpuPosition = /* glsl */ `
uniform float dt;
void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D( texturePosition, uv );
  vec4 vel = texture2D( textureVelocity, uv );
  pos.xyz += vel.xyz * dt;
  gl_FragColor = pos;
}
`;

// ── GPGPU: velocity (spring-to-target + curl wander + cursor force) ──
export const gpgpuVelocity = /* glsl */ `
${SIMPLEX}
uniform sampler2D uTarget;
uniform float uTime;
uniform vec3  uMouse;
uniform float uDispersion;
uniform float dt;
void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D( texturePosition, uv ).xyz;
  vec3 vel = texture2D( textureVelocity, uv ).xyz;
  vec3 tgt = texture2D( uTarget, uv ).xyz;

  // spring back to the resting cloud (relaxes as we disperse)
  float springK = mix(5.0, 0.5, uDispersion);
  vel += (tgt - pos) * springK * dt;

  // curl-noise wandering (grows as we disperse into the void)
  vec3 cn = curlNoise(pos * 0.16 + uTime * 0.04);
  vel += cn * mix(0.9, 4.6, uDispersion) * dt;

  // cursor force field
  vec3 d = pos - uMouse;
  float dist = length(d);
  float f = smoothstep(3.0, 0.0, dist);
  vel += normalize(d + 1e-4) * f * 9.0 * dt;

  vel *= 0.90;
  gl_FragColor = vec4(vel, 1.0);
}
`;

// ── Particle render ──
export const particleVert = /* glsl */ `
uniform sampler2D uPosition;
uniform float uSize;
uniform float uDpr;
attribute vec2 ref;
attribute float aSeed;
varying float vSeed;
varying float vDist;
void main(){
  vec3 pos = texture2D( uPosition, ref ).xyz;
  vec4 mv = modelViewMatrix * vec4( pos, 1.0 );
  gl_Position = projectionMatrix * mv;
  float size = uSize * (0.35 + aSeed * 0.9);
  gl_PointSize = clamp( size * uDpr * (16.0 / max(-mv.z, 1.0)), 0.0, 38.0 );
  vSeed = aSeed;
  vDist = -mv.z;
}
`;

export const particleFrag = /* glsl */ `
precision highp float;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
varying float vSeed;
varying float vDist;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a = pow(a, 1.5);
  vec3 col = mix(uC1, uC2, smoothstep(0.0, 0.55, vSeed));
  col = mix(col, uC3, smoothstep(0.5, 1.0, vSeed));
  col += (1.0 - d) * 0.35;            // hot core
  float fade = clamp(16.0 / vDist, 0.12, 1.0);
  gl_FragColor = vec4(col, a * fade);
}
`;

// ── fbm nebula background ──
export const nebulaVert = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const nebulaFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uMouse;
uniform float uScroll;
uniform vec2  uRes;
uniform vec3  uC1;
uniform vec3  uC2;
uniform vec3  uC3;

float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v=0.0, amp=0.55; mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<6;i++){ v+=amp*vnoise(p); p=m*p; amp*=0.5; }
  return v;
}
void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  p += uMouse * 0.06;
  float t = uTime * 0.03;

  vec2 q = p * 1.6;
  q.y += uScroll * 0.5;
  float n = fbm(q + vec2(t, -t*0.6));
  float n2 = fbm(q * 2.1 + vec2(-t*0.8, t) + n);

  // base near-black with a faint blue undertone
  vec3 col = vec3(0.018, 0.022, 0.038);

  // three drifting iridescent clouds
  float c1 = smoothstep(0.45, 0.95, fbm(q*0.7 + vec2(t*1.4, 0.0)));
  float c2 = smoothstep(0.5, 1.0, n2);
  float c3 = smoothstep(0.55, 1.05, fbm(q*1.1 - vec2(0.0, t)));
  col += uC2 * c1 * 0.20;
  col += uC1 * c2 * 0.14;
  col += uC3 * c3 * 0.12;

  // soft central energy + radial falloff
  float r = length(p);
  col += uC1 * smoothstep(0.9, 0.0, r) * 0.04;
  col *= smoothstep(1.5, 0.2, r);

  // faint star dust
  float stars = step(0.9975, hash(floor(uv * uRes * 0.5)));
  col += stars * 0.45;

  gl_FragColor = vec4(col, 1.0);
}
`;

// ── Final pass: chromatic aberration + grain + vignette ──
export const finalFrag = /* glsl */ `
precision highp float;
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uAberration;
uniform float uGrain;
varying vec2 vUv;
float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
void main(){
  vec2 uv = vUv;
  vec2 dir = uv - 0.5;
  float dd = dot(dir, dir);
  float amt = uAberration * (0.0016 + dd * 0.012);
  vec2 off = dir * amt;
  float r = texture2D(tDiffuse, uv + off).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - off).b;
  vec3 col = vec3(r, g, b);
  // animated film grain
  float gr = hash(uv * vec2(1280.0, 720.0) + fract(uTime));
  col += (gr - 0.5) * uGrain;
  // vignette
  col *= smoothstep(1.3, 0.35, length(dir) * 1.35);
  gl_FragColor = vec4(col, 1.0);
}
`;
