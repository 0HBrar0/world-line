import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// The catastrophe, drawn over the finished picture: a hole with a burning edge tears outward from the blast,
// the sky around it shatters, and everything inside is simply gone.

const ruptureShader = {
  uniforms: { tDiffuse: { value: null }, center: { value: [0.5, 0.5] }, radius: { value: 0 }, time: { value: 0 }, flash: { value: 0 }, aspect: { value: 1.7 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform vec2 center; uniform float radius, time, flash, aspect; varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }
    void main() {
      vec2 toHere = (vUv - center) * vec2(aspect, 1.0);
      float away = length(toHere);
      float angle = atan(toHere.y, toHere.x);
      float edge = radius * (0.72 + 0.56 * noise(vec2(angle * 2.6 + 4.0, time * 0.5)) + 0.1 * noise(vec2(angle * 11.0, time)));
      float gap = away - edge;

      // Shards: square cells near the edge slip outward by their own amount.
      vec2 cell = floor(vUv * vec2(aspect, 1.0) * 11.0 + noise(vUv * 7.0) * 1.6);
      float shard = hash(cell);
      float loose = smoothstep(0.34, 0.0, gap);
      vec2 slip = normalize(toHere + 0.0001) * loose * shard * 0.07 * step(0.001, radius);
      float split = loose * 0.012;
      vec3 scene = vec3(texture2D(tDiffuse, vUv - slip + split).r, texture2D(tDiffuse, vUv - slip).g, texture2D(tDiffuse, vUv - slip - split).b);
      scene *= 1.0 - loose * shard * 0.6;

      float gone = smoothstep(0.012, -0.012, gap);
      float streak = noise(vec2(angle * 42.0, away * 5.0 - time * 1.5)) * noise(vec2(angle * 9.0 + 3.0, away * 14.0 - time));
      vec3 void_ = vec3(0.016, 0.0, 0.002) + vec3(2.6, 0.34, 0.06) * smoothstep(0.42, 0.7, streak) * smoothstep(0.0, 0.3, gap + 0.3);
      vec3 color = mix(scene, void_, gone);
      color += vec3(9.0, 2.6, 0.5) * exp(-abs(gap) * 34.0) * step(0.001, radius);
      color += vec3(1.4, 0.3, 0.06) * exp(-max(gap, 0.0) * 5.0) * step(0.001, radius) * (1.0 - gone);
      gl_FragColor = vec4(color + vec3(flash * 6.0, flash * 5.0, flash * 4.0), 1.0);
    }`,
};

export function createRupture() {
  const pass = new ShaderPass(ruptureShader);
  pass.enabled = false;
  return pass;
}
