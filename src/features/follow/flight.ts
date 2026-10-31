import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type { SpaceStop } from './spaceStops';

const SPACING = 26;
const BASE_FOV = 58;
const SLOW_FRAME_MS = 45;
// The entity's view: its neck stays put and only the head turns.
const ENTITY_SCALE = 7;
const ENTITY_FOV = 42;
const NECK = new THREE.Vector3(0, 430, 1050);
const HEAD_REACH = 140;
const HEAD_PULL = 2.2;
const HEAD_DRAG = 2.4;

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function softTexture(stops: Array<[number, string]>) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([at, color]) => gradient.addColorStop(at, color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;

function starField(count: number, radius: number, size: number, length: number, texture: THREE.Texture, random: () => number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = ['#ffffff', '#ffe2c0', '#bcd4ff', '#ffc9a0'].map((c) => new THREE.Color(c));
  for (let i = 0; i < count; i += 1) {
    positions.set([(random() - 0.5) * radius * 2, (random() - 0.5) * radius * 1.4, 60 - random() * (length + 160)], i * 3);
    palette[Math.floor(random() * palette.length)].toArray(colors, i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ size, map: texture, vertexColors: true, sizeAttenuation: true, ...additive }));
}

/** A tilted spiral of stars: the galaxy the line crosses, seen whole. */
function galaxy(count: number, radius: number, texture: THREE.Texture, random: () => number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const core = new THREE.Color('#ffd9a8');
  const rim = new THREE.Color('#7fa4ff');
  const color = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    const r = radius * random() ** 1.7;
    const reach = r / radius;
    const angle = ((i % 3) * Math.PI * 2) / 3 + reach * 5.5 + (random() - 0.5) * (0.35 + 0.9 * (1 - reach));
    const height = (random() - 0.5) * (30 + 90 * Math.exp(-r / 150));
    positions.set([Math.cos(angle) * r, height, Math.sin(angle) * r], i * 3);
    color.lerpColors(core, rim, Math.min(1, reach * 1.6)).toArray(colors, i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 10, map: texture, vertexColors: true, sizeAttenuation: true, ...additive }));
  points.rotation.z = -0.1;
  return points;
}

/** Streaks around the camera: stretched by warp, invisible at rest. */
function warpStreaks(random: () => number) {
  const count = 500;
  const positions = new Float32Array(count * 6);
  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const r = 6 + random() * 34;
    const z = -random() * 120;
    positions.set([Math.cos(angle) * r, Math.sin(angle) * r, z, Math.cos(angle) * r, Math.sin(angle) * r, z - 1], i * 6);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: '#cfe0ff', opacity: 0, ...additive }));
}

export interface Flight {
  goTo: (index: number) => void;
  dispose: () => void;
}

export type FlightView = 'entity' | 'flight';

export function createFlight(canvas: HTMLCanvasElement, stops: SpaceStop[], startIndex: number, view: FlightView): Flight {
  const random = seeded(2010);
  const entity = view === 'entity';
  const scale = entity ? ENTITY_SCALE : 1;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#02030a');
  const camera = new THREE.PerspectiveCamera(entity ? ENTITY_FOV : BASE_FOV, 1, 0.1, entity ? 7000 : 900);

  const glow = softTexture([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,255,255,0.75)'], [0.45, 'rgba(255,255,255,0.14)'], [1, 'rgba(255,255,255,0)']]);
  const cloud = softTexture([[0, 'rgba(255,255,255,0.55)'], [0.5, 'rgba(255,255,255,0.16)'], [1, 'rgba(255,255,255,0)']]);

  // The path: forward along z, height from the divergence value, with a slow drift sideways.
  const lastStop = Math.max(stops.length - 1, 1);
  const points = stops.map((s, i) => {
    const height = THREE.MathUtils.clamp((s.value - 0.8) * 34, -30, 30);
    if (!entity) return new THREE.Vector3(Math.sin(i * 0.42) * 15 + Math.cos(i * 0.13) * 9, height, -i * SPACING);
    const t = i / lastStop;
    return new THREE.Vector3((t - 0.5) * 1500, height * 2.4 + Math.sin(i * 0.5) * 26, Math.sin(t * Math.PI * 2.5) * 230 - 120);
  });
  if (points.length === 1) points.push(points[0].clone().add(new THREE.Vector3(0, 0, -SPACING)));
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.4);
  curve.arcLengthDivisions = Math.max(400, points.length * 20);
  const length = curve.getLength();
  const lengths = curve.getLengths(curve.arcLengthDivisions);
  const uOf = (i: number) => {
    const at = Math.round((i / Math.max(points.length - 1, 1)) * curve.arcLengthDivisions);
    return lengths[at] / length;
  };

  const far = points.length * SPACING;
  if (entity) {
    scene.add(galaxy(16000, 1000, glow, random));
    scene.add(starField(3500, 2400, 7, 3000, glow, random));
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloud, color: '#ffc88a', opacity: 0.4, ...additive }));
    core.scale.setScalar(900);
    scene.add(core);
    // Faint neighbouring lines that weave around the one we are watching.
    for (let k = 0; k < 5; k += 1) {
      const woven = points.map((p, i) => p.clone().add(new THREE.Vector3(0, (k - 2) * 34 * Math.sin(i * 0.21 + k), (k - 2) * 42 * Math.cos(i * 0.17 + k))));
      const thread = new THREE.CatmullRomCurve3(woven, false, 'catmullrom', 0.4).getPoints(Math.max(200, points.length * 10));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(thread), new THREE.LineBasicMaterial({ color: '#6f8fe0', opacity: 0.22, ...additive })));
    }
  } else {
    scene.add(starField(5200, 260, 1.5, far, glow, random));
    scene.add(starField(1200, 60, 0.45, far, glow, random));
  }

  stops.forEach((stop, i) => {
    if (i % 2) return;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloud, color: stop.tint, opacity: 0.16 + random() * 0.18, ...additive }));
    const size = (150 + random() * 170) * (entity ? 3 : 1);
    sprite.scale.set(size, size * (0.55 + random() * 0.5), 1);
    sprite.position.copy(points[i]).add(new THREE.Vector3((random() - 0.5) * 170, (random() - 0.5) * 90, -50 - random() * 60).multiplyScalar(entity ? 3 : 1));
    scene.add(sprite);
  });

  const segments = Math.max(200, points.length * 16);
  const tube = new THREE.TubeGeometry(curve, segments, entity ? 1.1 : 0.03, 6, false);
  const ahead = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({ color: '#46506e', ...additive }));
  const trail = new THREE.Mesh(tube.clone(), new THREE.MeshBasicMaterial({ color: entity ? '#ff9a3c' : '#a8622a', ...additive }));
  scene.add(ahead, trail);
  const trailIndexCount = trail.geometry.index!.count;

  const makeSprite = (color: string, size: number) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, ...additive }));
    sprite.scale.setScalar(size);
    return sprite;
  };
  const lights = points.slice(0, stops.length).map((point, i) => {
    const sprite = makeSprite(stops[i].jumpColor ?? '#ffe9d0', (stops[i].jumpColor ? 3.4 : 2.1) * scale);
    sprite.position.copy(point);
    scene.add(sprite);
    return sprite;
  });
  const beacon = makeSprite('#ffd9ae', 7 * scale);
  scene.add(beacon);
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 64), new THREE.MeshBasicMaterial({ color: '#ffffff', opacity: 0, side: THREE.DoubleSide, ...additive }));
  scene.add(shock);
  const streaks = entity ? null : warpStreaks(random);
  if (streaks) camera.add(streaks);
  scene.add(camera);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.6, 0.2);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  let useBloom = true;

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement ?? canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    // On phones the words fill the lower half, so the action sits higher.
    if (w < 768) camera.setViewOffset(w, h, 0, h * 0.26, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  resize();
  const observer = new ResizeObserver(resize);
  if (canvas.parentElement) observer.observe(canvas.parentElement);

  let index = startIndex;
  const trip = { from: uOf(startIndex), to: uOf(startIndex), start: 0, duration: 0, warp: 0, arrived: true };
  let u = trip.from;
  let shockAt = -Infinity;
  let frame = 0;
  let last = performance.now();
  let slow = 0;
  let frames = 0;
  const back = new THREE.Vector3();
  const look = new THREE.Vector3();
  const lookFrom = new THREE.Vector3();
  const gaze = curve.getPointAt(u);
  const headSpeed = new THREE.Vector3();
  const pull = new THREE.Vector3();
  const facing = new THREE.Vector3();
  let focus = 0;

  const arrive = (now: number) => {
    trip.arrived = true;
    const stop = stops[index];
    if (!stop?.jumpColor) return;
    (shock.material as THREE.MeshBasicMaterial).color.set(stop.jumpColor);
    shock.position.copy(points[index]);
    shockAt = now;
  };

  const render = (now: number) => {
    frame = requestAnimationFrame(render);
    if (document.hidden) return;
    const dt = now - last;
    last = now;
    frames += 1;
    if (frames > 10 && useBloom) {
      slow = slow * 0.95 + dt * 0.05;
      // Weak graphics chips drop the glow pass rather than stutter.
      if (frames > 24 && slow > SLOW_FRAME_MS) {
        useBloom = false;
        renderer.setPixelRatio(1);
        resize();
      }
    }

    const p = trip.duration ? Math.min(1, (now - trip.start) / trip.duration) : 1;
    u = THREE.MathUtils.lerp(trip.from, trip.to, easeInOut(p));
    if (p >= 1 && !trip.arrived) arrive(now);
    const surge = Math.sin(Math.PI * p) * trip.warp;

    trail.geometry.setDrawRange(0, Math.floor(trailIndexCount * u / 6) * 6);
    if (entity) {
      // A heavy head on a spring: it lags behind the line, then settles on it with a small overshoot.
      const seconds = Math.min(dt, 50) / 1000;
      look.copy(curve.getPointAt(u));
      pull.copy(look).add(lookFrom.set(Math.sin(now * 0.0007) * 14, Math.cos(now * 0.0005) * 8, 0)).sub(gaze);
      headSpeed.addScaledVector(pull, HEAD_PULL * seconds).addScaledVector(headSpeed, -HEAD_DRAG * seconds);
      gaze.addScaledVector(headSpeed, seconds);
      facing.copy(gaze).sub(NECK).normalize();
      camera.position.copy(NECK).addScaledVector(facing, HEAD_REACH);
      camera.position.y += Math.sin(now * 0.0004) * 6;
      camera.lookAt(gaze);
      camera.rotation.z += Math.sin(now * 0.00013) * 0.015 - headSpeed.x * 0.00014;
      focus += ((trip.arrived ? 1 : 0) - focus) * Math.min(1, seconds * 1.4);
      camera.fov = ENTITY_FOV - focus * 7 + surge * 5;
      beacon.position.copy(look);
    } else {
      const distance = 13 / length;
      const drift = Math.sin(now * 0.00025);
      if (u - distance >= 0) back.copy(curve.getPointAt(u - distance));
      else back.copy(curve.getPointAt(0)).add(new THREE.Vector3(0, 0, (distance - u) * length));
      camera.position.copy(back).add(lookFrom.set(3.5 + drift * 1.4, 4.5 + Math.cos(now * 0.0002) * 0.8, 0));
      look.copy(curve.getPointAt(Math.min(1, u + 0.2 / length)));
      camera.lookAt(look);
      camera.rotation.z += drift * 0.03 + surge * 0.09;
      camera.fov = BASE_FOV + surge * 42;
      beacon.position.copy(points[Math.min(index, points.length - 1)]);
    }
    camera.updateProjectionMatrix();

    if (streaks) {
      streaks.scale.z = 1 + surge * 34;
      streaks.position.z = -6 - ((now * 0.09) % 40);
      (streaks.material as THREE.LineBasicMaterial).opacity = surge * 0.75;
    }

    const pulse = 1 + Math.sin(now * 0.0028) * 0.12;
    beacon.scale.setScalar((trip.arrived ? 4.5 : 2.5) * pulse * scale);

    const age = (now - shockAt) / 1300;
    const material = shock.material as THREE.MeshBasicMaterial;
    material.opacity = age < 1 ? (1 - age) * 0.9 : 0;
    if (age < 1) {
      shock.scale.setScalar((2 + easeInOut(age) * 42) * scale * (entity ? 1.6 : 1));
      shock.lookAt(camera.position);
    }

    lights.forEach((light, i) => {
      (light.material as THREE.SpriteMaterial).opacity = i <= index ? 1 : 0.5;
    });

    if (useBloom) composer.render();
    else renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(render);

  return {
    goTo(next) {
      if (next === index) return;
      const steps = Math.abs(next - index);
      const jump = stops.slice(Math.min(index, next), Math.max(index, next) + 1).some((s) => s.jumpColor);
      index = next;
      trip.from = u;
      trip.to = uOf(next);
      trip.start = performance.now();
      trip.duration = Math.min(4200, (jump ? 2600 : 1500) + steps * 120);
      trip.warp = jump || steps > 3 ? 1 : 0.22;
      trip.arrived = false;
    },
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.traverse((item) => {
        const mesh = item as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as THREE.Material | undefined;
        material?.dispose();
      });
      glow.dispose();
      cloud.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
