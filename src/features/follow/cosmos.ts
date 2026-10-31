import * as THREE from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// The world around the line. Everything here is decoration, built from numbers only, so it cannot carry story content.
// True path tracing is far too slow to stay smooth, so its look is computed directly: sunlight, terminators,
// ring and planet shadows are solved per pixel with ray tests, and the nebula is painted once at start.

const ADDITIVE = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;
const RAY_LUMA_FLOOR = 2.2;

const NOISE = /* glsl */ `
  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p, int octaves) {
    float sum = 0.0; float amp = 0.5;
    for (int i = 0; i < octaves; i++) { sum += amp * noise(p); p = p * 2.03 + 11.0; amp *= 0.5; }
    return sum;
  }
`;

const FINISH = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

function paintSky(renderer: THREE.WebGLRenderer) {
  const target = new THREE.WebGLCubeRenderTarget(1024, { type: THREE.HalfFloatType, generateMipmaps: false });
  const sky = new THREE.Scene();
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: `varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec3 vDir;
      ${NOISE}
      void main() {
        vec3 d = normalize(vDir);
        vec3 warp = vec3(fbm(d * 2.1, 4), fbm(d * 2.1 + 7.0, 4), fbm(d * 2.1 + 13.0, 4));
        float clouds = fbm(d * 2.6 + warp * 2.4, 6);
        float wisps = fbm(d * 6.5 - warp * 3.0, 6);
        float lanes = smoothstep(0.34, 0.62, fbm(d * 3.4 + warp * 1.6 + 21.0, 5));
        vec3 color = vec3(0.006, 0.008, 0.02);
        color += vec3(0.05, 0.10, 0.34) * smoothstep(0.3, 0.72, clouds);
        color += vec3(0.30, 0.06, 0.34) * smoothstep(0.42, 0.78, clouds + warp.x * 0.25);
        color += vec3(0.46, 0.18, 0.06) * smoothstep(0.5, 0.82, wisps + warp.y * 0.2) * smoothstep(0.35, 0.7, clouds);
        color += vec3(0.04, 0.26, 0.28) * smoothstep(0.5, 0.8, warp.z + wisps * 0.3);
        color *= (1.0 - 0.85 * lanes) * 0.2;
        gl_FragColor = vec4(color, 1.0);
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 24), material);
  sky.add(dome);
  new THREE.CubeCamera(0.1, 10, target).update(renderer, sky);
  dome.geometry.dispose();
  material.dispose();
  return target;
}

interface PlanetSpec {
  at: THREE.Vector3;
  radius: number;
  kind: 'gas' | 'rock' | 'ice';
  colors: [string, string, string];
  air: string;
  ring?: boolean;
}

function makePlanet(spec: PlanetSpec, sun: THREE.Vector3, seed: number) {
  const group = new THREE.Group();
  group.position.copy(spec.at);
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.42 + seed * 0.13, 0, -0.3 + seed * 0.2));
  const ringInner = spec.radius * 1.45;
  const ringOuter = spec.radius * 2.45;
  const ringNormal = new THREE.Vector3(0, 1, 0).applyQuaternion(tilt);

  const surface = new THREE.ShaderMaterial({
    uniforms: {
      sun: { value: sun },
      center: { value: spec.at },
      radius: { value: spec.radius },
      seed: { value: seed * 17.3 },
      spin: { value: 0 },
      gas: { value: spec.kind === 'gas' ? 1 : 0 },
      ice: { value: spec.kind === 'ice' ? 1 : 0 },
      low: { value: new THREE.Color(spec.colors[0]) },
      mid: { value: new THREE.Color(spec.colors[1]) },
      high: { value: new THREE.Color(spec.colors[2]) },
      air: { value: new THREE.Color(spec.air) },
      ringNormal: { value: ringNormal },
      ringInner: { value: spec.ring ? ringInner : 0 },
      ringOuter: { value: spec.ring ? ringOuter : 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vLocal; varying vec3 vWorld; varying vec3 vNormal2;
      void main() {
        vLocal = position; vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz;
        vNormal2 = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 sun, center, low, mid, high, air, ringNormal;
      uniform float radius, seed, spin, gas, ice, ringInner, ringOuter;
      varying vec3 vLocal; varying vec3 vWorld; varying vec3 vNormal2;
      ${NOISE}
      void main() {
        vec3 n = normalize(vLocal);
        float c = cos(spin), s = sin(spin);
        vec3 p = vec3(c * n.x + s * n.z, n.y, -s * n.x + c * n.z);
        float warp = fbm(p * 3.0 + seed, 4);
        float h;
        if (gas > 0.5) h = 0.5 + 0.5 * sin(p.y * 9.0 + warp * 6.0 + 3.0 * fbm(vec3(p.x * 1.5, p.y * 9.0, p.z * 1.5) + seed, 4));
        else h = fbm(p * 2.4 + warp * 1.6 + seed, 5);
        vec3 albedo = mix(low, mid, smoothstep(0.25, 0.55, h));
        albedo = mix(albedo, high, smoothstep(0.55, 0.8, h));
        if (ice > 0.5) albedo = mix(albedo, vec3(0.92, 0.96, 1.0), smoothstep(0.62, 0.9, abs(p.y) + warp * 0.3));

        vec3 N = normalize(vNormal2);
        vec3 L = normalize(sun - vWorld);
        vec3 V = normalize(cameraPosition - vWorld);
        float sunlit = max(dot(N, L), 0.0);

        // A ray toward the sun: does it cross the ring before it escapes?
        if (ringOuter > 0.0) {
          float t = dot(center - vWorld, ringNormal) / dot(L, ringNormal);
          if (t > 0.0) {
            float r = length(vWorld + L * t - center);
            float inRing = smoothstep(ringInner, ringInner * 1.04, r) * (1.0 - smoothstep(ringOuter * 0.96, ringOuter, r));
            sunlit *= 1.0 - 0.72 * inRing * (0.55 + 0.45 * sin(r / radius * 26.0));
          }
        }

        vec3 H = normalize(L + V);
        float shine = pow(max(dot(N, H), 0.0), 48.0) * (1.0 - smoothstep(0.3, 0.5, h)) * 0.5;
        float rim = pow(1.0 - max(dot(N, V), 0.0), 3.4);
        vec3 bounce = albedo * air * 0.035 * (0.5 + 0.5 * dot(N, -L));
        vec3 color = albedo * sunlit * vec3(1.9, 1.75, 1.55) + bounce + shine * sunlit * vec3(1.0, 0.95, 0.85);
        color += air * rim * (0.08 + 1.6 * smoothstep(-0.18, 0.5, dot(N, L)));
        gl_FragColor = vec4(color, 1.0);
        ${FINISH}
      }`,
  });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(spec.radius, 72, 54), surface);
  group.add(globe);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(spec.radius * 1.12, 48, 36),
    new THREE.ShaderMaterial({
      ...ADDITIVE,
      side: THREE.BackSide,
      uniforms: { sun: { value: sun }, air: { value: new THREE.Color(spec.air) } },
      vertexShader: `varying vec3 vN; varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 sun, air; varying vec3 vN; varying vec3 vW;
        void main() {
          vec3 V = normalize(cameraPosition - vW);
          float edge = pow(max(dot(normalize(vN), V), 0.0), 4.5);
          float lit = smoothstep(-0.35, 0.6, dot(-normalize(vN), normalize(sun - vW)));
          gl_FragColor = vec4(air * edge * lit * 1.3, 1.0);
          ${FINISH}
        }`,
    }),
  );
  group.add(halo);

  if (spec.ring) {
    const band = new THREE.Mesh(
      new THREE.RingGeometry(ringInner, ringOuter, 128, 1),
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        uniforms: { sun: { value: sun }, center: { value: spec.at }, radius: { value: spec.radius }, inner: { value: ringInner }, outer: { value: ringOuter }, tint: { value: new THREE.Color(spec.colors[2]) } },
        vertexShader: `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: /* glsl */ `
          uniform vec3 sun, center, tint; uniform float radius, inner, outer; varying vec3 vW;
          ${NOISE}
          void main() {
            float r = length(vW - center);
            float across = (r - inner) / (outer - inner);
            float dust = fbm(vec3(across * 18.0, 1.0, 2.0), 5);
            float alpha = smoothstep(0.2, 0.72, dust) * smoothstep(0.0, 0.05, across) * (1.0 - smoothstep(0.92, 1.0, across));
            // A ray toward the sun: the planet casts a true round shadow across the ring.
            vec3 L = normalize(sun - vW);
            vec3 toCenter = center - vW;
            float along = dot(toCenter, L);
            float miss = length(toCenter - L * along);
            float lit = along < 0.0 ? 1.0 : smoothstep(radius * 0.97, radius * 1.03, miss);
            vec3 color = tint * (0.04 + 1.7 * lit);
            gl_FragColor = vec4(color, alpha * 0.82);
            ${FINISH}
          }`,
      }),
    );
    band.quaternion.copy(tilt).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)));
    group.add(band);
  }

  return { group, surface };
}

function asteroidField(entity: boolean, points: THREE.Vector3[], random: () => number) {
  const shape = new THREE.IcosahedronGeometry(1, 1);
  const position = shape.getAttribute('position');
  for (let i = 0; i < position.count; i += 1) {
    const stretch = 0.72 + 0.5 * Math.abs(Math.sin(position.getX(i) * 7.1 + position.getY(i) * 5.3 + position.getZ(i) * 3.7));
    position.setXYZ(i, position.getX(i) * stretch, position.getY(i) * stretch, position.getZ(i) * stretch);
  }
  shape.computeVertexNormals();
  const count = entity ? 520 : 420;
  const rocks = new THREE.InstancedMesh(shape, new THREE.MeshStandardMaterial({ color: '#8b8690', roughness: 0.88, metalness: 0.08, flatShading: true }), count);
  const place = new THREE.Object3D();
  for (let i = 0; i < count; i += 1) {
    if (entity) {
      const angle = random() * Math.PI * 2;
      const reach = 1120 + random() * 220;
      place.position.set(Math.cos(angle) * reach, (random() - 0.5) * 46, Math.sin(angle) * reach);
      place.scale.setScalar(1.5 + random() ** 3 * 8);
    } else {
      const anchor = points[Math.floor(random() * points.length)];
      const side = random() < 0.5 ? -1 : 1;
      place.position.set(anchor.x + side * (34 + random() * 170), anchor.y + (random() - 0.5) * 90, anchor.z + (random() - 0.5) * 60);
      place.scale.setScalar(0.25 + random() ** 3 * 3.4);
    }
    place.rotation.set(random() * 6, random() * 6, random() * 6);
    place.updateMatrix();
    rocks.setMatrixAt(i, place.matrix);
  }
  rocks.frustumCulled = false;
  return rocks;
}

const rayShader = {
  uniforms: { tDiffuse: { value: null }, sunAt: { value: new THREE.Vector2(0.5, 0.5) }, strength: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform vec2 sunAt; uniform float strength; varying vec2 vUv;
    const int STEPS = 26;
    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      if (strength < 0.003) { gl_FragColor = base; return; }
      vec2 stepBy = (vUv - sunAt) * 0.9 / float(STEPS);
      float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
      vec2 uv = vUv - stepBy * jitter;
      float weight = 1.0;
      vec3 light = vec3(0.0);
      for (int i = 0; i < STEPS; i++) {
        uv -= stepBy;
        vec3 c = texture2D(tDiffuse, uv).rgb;
        light += min(c, vec3(4.0)) * step(${RAY_LUMA_FLOOR}, dot(c, vec3(0.3, 0.6, 0.1))) * weight;
        weight *= 0.94;
      }
      gl_FragColor = vec4(base.rgb + light / float(STEPS) * strength, base.a);
    }`,
};

export interface Cosmos {
  rays: ShaderPass;
  update: (now: number, camera: THREE.Camera) => void;
  dispose: () => void;
}

export function createCosmos(renderer: THREE.WebGLRenderer, scene: THREE.Scene, points: THREE.Vector3[], entity: boolean, random: () => number): Cosmos {
  const sky = paintSky(renderer);
  scene.background = sky.texture;

  const end = points[points.length - 1];
  const sun = entity ? new THREE.Vector3(0, 40, -40) : new THREE.Vector3(520, 40, end.z - 1100);

  const glow = document.createElement('canvas');
  glow.width = glow.height = 256;
  const paint = glow.getContext('2d')!;
  const fade = paint.createRadialGradient(128, 128, 0, 128, 128, 128);
  [[0, 'rgba(255,255,255,1)'], [0.1, 'rgba(255,255,255,0.8)'], [0.3, 'rgba(255,255,255,0.18)'], [1, 'rgba(255,255,255,0)']].forEach(([at, color]) => fade.addColorStop(at as number, color as string));
  paint.fillStyle = fade;
  paint.fillRect(0, 0, 256, 256);
  const glowTexture = new THREE.CanvasTexture(glow);

  const star = new THREE.Group();
  star.position.copy(sun);
  const size = entity ? 240 : 380;
  const flare = (x: number, y: number, tint: THREE.Color) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: tint, toneMapped: false, ...ADDITIVE }));
    sprite.scale.set(x, y, 1);
    star.add(sprite);
  };
  flare(size, size, new THREE.Color(5, 4, 2.8));
  flare(size * 3.2, size * 3.2, new THREE.Color(0.16, 0.1, 0.05));
  flare(size * 6, size * 0.06, new THREE.Color(0.7, 0.6, 0.65));
  scene.add(star);

  const sunlight = new THREE.PointLight('#ffe6c8', 1.7, 0, 0);
  sunlight.position.copy(sun);
  scene.add(sunlight, new THREE.AmbientLight('#46506e', 1.1));

  const specs: PlanetSpec[] = entity
    ? [
        { at: new THREE.Vector3(-640, 110, -620), radius: 92, kind: 'gas', colors: ['#9a5a34', '#d8a468', '#f0dcb4'], air: '#ffb070', ring: true },
        { at: new THREE.Vector3(660, -70, -560), radius: 58, kind: 'rock', colors: ['#1c4a6a', '#2e7a5a', '#c9b48a'], air: '#58a8ff' },
        { at: new THREE.Vector3(1060, 260, -900), radius: 128, kind: 'ice', colors: ['#3a5a8a', '#7fb0d0', '#d8ecf4'], air: '#7fd0ff' },
        { at: new THREE.Vector3(-1060, -30, -240), radius: 74, kind: 'rock', colors: ['#5a2a24', '#a4502e', '#d89a68'], air: '#ff8050' },
        { at: new THREE.Vector3(130, 250, -1020), radius: 44, kind: 'gas', colors: ['#3e2a6a', '#8050b0', '#d0a8e0'], air: '#b080ff' },
      ]
    : Array.from({ length: 7 }, (_, k) => {
        const radius = 22 + random() * 46;
        const side = k % 2 ? 1 : -1;
        const palette: Array<Pick<PlanetSpec, 'kind' | 'colors' | 'air'>> = [
          { kind: 'gas', colors: ['#9a5a34', '#d8a468', '#f0dcb4'], air: '#ffb070' },
          { kind: 'rock', colors: ['#1c4a6a', '#2e7a5a', '#c9b48a'], air: '#58a8ff' },
          { kind: 'ice', colors: ['#3a5a8a', '#7fb0d0', '#d8ecf4'], air: '#7fd0ff' },
          { kind: 'rock', colors: ['#5a2a24', '#a4502e', '#d89a68'], air: '#ff8050' },
          { kind: 'gas', colors: ['#3e2a6a', '#8050b0', '#d0a8e0'], air: '#b080ff' },
        ];
        return {
          at: new THREE.Vector3(side * (radius * (k % 3 === 0 ? 2.6 : 1) + 64 + random() * 120), -30 + random() * 90, end.z * ((k + 0.7) / 7) - 40),
          radius,
          ring: k % 3 === 0,
          ...palette[k % palette.length],
        };
      });
  const worlds = specs.map((spec, i) => makePlanet(spec, sun, i * 0.37 + 0.2));
  worlds.forEach((w) => scene.add(w.group));

  const rocks = asteroidField(entity, points, random);
  scene.add(rocks);

  const rays = new ShaderPass(rayShader);
  const probe = new THREE.Vector3();

  return {
    rays,
    update(now, camera) {
      worlds.forEach((w, i) => {
        w.surface.uniforms.spin.value = now * 0.00004 * (i % 2 ? 1 : -0.7);
      });
      if (entity) rocks.rotation.y = now * 0.000006;
      probe.copy(sun).project(camera);
      const x = probe.x * 0.5 + 0.5;
      const y = probe.y * 0.5 + 0.5;
      const away = Math.max(Math.abs(x - 0.5), Math.abs(y - 0.5));
      rays.uniforms.sunAt.value.set(x, y);
      rays.uniforms.strength.value = probe.z < 1 ? (entity ? 0.7 : 1.1) * (1 - THREE.MathUtils.smoothstep(away, 0.5, 1.15)) : 0;
    },
    dispose() {
      sky.dispose();
      glowTexture.dispose();
      rays.dispose();
    },
  };
}
