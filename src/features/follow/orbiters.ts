import * as THREE from 'three';
import type { OddityId } from './oddities';

// Things around Earth, all built from plain shapes: a space station, small satellites, and (a prototype)
// household objects that float up off the planet and fade out in space. None of it carries story content.

const STATION_SPAN = 0.46;
const SATELLITE_SPAN = 0.14;
const SATELLITES = 6;
const DRIFTER_SIZE = 0.27;
const DRIFT_LIFE_S = [16, 24];
const FADE_FROM = 0.68;
const GROW_S = 2;
const PICK_PX = 34;
const SPARKS = 900;
const ROCKET_HEIGHT = 0.62;
const ROCKET_LIFE_S = 24;
const ROCKET_FIRST_MS = 16000;
const ROCKET_GAP_S = [40, 75];
const ROCKET_SLOWED = 0.12;
const CAMP_SIZE = 0.55;
const ELON_BACK_MS = 20000;
/** Seconds between objects leaving Earth. */
export const DRIFT_GAP_S = { rare: 14, normal: 7, lots: 3 } as const;
export type DriftPace = keyof typeof DRIFT_GAP_S;

const metal = (color: string, emissive = 0.12) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: emissive, roughness: 0.45, metalness: 0.5, flatShading: true });
const PANEL = '#26477e';

function box(x: number, y: number, z: number, material: THREE.Material, at: [number, number, number] = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(x, y, z), material);
  mesh.position.set(...at);
  return mesh;
}

function tube(radius: number, length: number, material: THREE.Material, at: [number, number, number] = [0, 0, 0], tip = radius) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(tip, radius, length, 10), material);
  mesh.position.set(...at);
  return mesh;
}

/** A long truss with pairs of solar wings and a row of crew modules across its middle, one unit wide. */
function station() {
  const group = new THREE.Group();
  const truss = metal('#c9ccd4');
  const hull = metal('#eef0f4', 0.2);
  const wing = new THREE.MeshStandardMaterial({ color: PANEL, emissive: '#c88a2c', emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.7, side: THREE.DoubleSide });
  group.add(box(1, 0.035, 0.035, truss));
  [-0.46, -0.34, 0.34, 0.46].forEach((x) => {
    [-1, 1].forEach((side) => {
      group.add(box(0.09, 0.008, 0.3, wing, [x, 0, side * 0.19]));
    });
  });
  [-0.2, 0.2].forEach((x) => group.add(box(0.1, 0.008, 0.12, truss, [x, -0.06, 0])));
  const modules = new THREE.Group();
  [[0, 0.44, 0.055], [0.3, 0.2, 0.05], [-0.28, 0.2, 0.05]].forEach(([z, length, radius]) => {
    const part = tube(radius, length, hull);
    part.rotation.x = Math.PI / 2;
    part.position.set(0, 0.05, z);
    modules.add(part);
  });
  group.add(modules, box(0.26, 0.09, 0.09, hull, [0, 0.05, 0]));
  return group;
}

function satellite(tint: string) {
  const group = new THREE.Group();
  const wing = new THREE.MeshStandardMaterial({ color: PANEL, emissive: '#3f78d0', emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.7, side: THREE.DoubleSide });
  group.add(box(0.26, 0.26, 0.34, metal(tint, 0.2)));
  [-1, 1].forEach((side) => group.add(box(0.36, 0.01, 0.2, wing, [side * 0.31, 0, 0])));
  const dish = tube(0.15, 0.1, metal('#eef0f4'), [0, -0.2, 0], 0.03);
  group.add(dish);
  return group;
}

const soft = (color: string) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.22, roughness: 0.6, metalness: 0.1, transparent: true });

function lamp() {
  const group = new THREE.Group();
  const stand = soft('#6d5b49');
  group.add(tube(0.3, 0.06, stand, [0, -0.72, 0]), tube(0.035, 1.3, stand, [0, -0.06, 0]));
  const shade = tube(0.42, 0.42, soft('#f6d48a'), [0, 0.68, 0], 0.22);
  (shade.material as THREE.MeshStandardMaterial).emissiveIntensity = 1;
  group.add(shade);
  return group;
}

function garbageBag() {
  const group = new THREE.Group();
  const plastic = soft('#23262e');
  plastic.roughness = 0.3;
  plastic.emissiveIntensity = 0.6;
  const sack = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 9), plastic);
  sack.scale.set(1, 1.15, 0.9);
  group.add(sack, tube(0.09, 0.24, plastic, [0, 0.76, 0], 0.03), tube(0.05, 0.2, plastic, [0, 0.96, 0], 0.2));
  return group;
}

function chair() {
  const group = new THREE.Group();
  const wood = soft('#b4743a');
  group.add(box(0.9, 0.09, 0.9, wood, [0, 0, 0]), box(0.9, 0.9, 0.08, wood, [0, 0.5, -0.41]));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => group.add(box(0.08, 0.8, 0.08, wood, [x * 0.39, -0.44, z * 0.39])));
  return group;
}

function trafficCone() {
  const group = new THREE.Group();
  const orange = soft('#ff6a1f');
  group.add(tube(0.42, 1.2, orange, [0, 0.1, 0], 0.04), box(1, 0.08, 1, orange, [0, -0.5, 0]), tube(0.28, 0.2, soft('#f4f4f4'), [0, 0.12, 0], 0.2));
  return group;
}

function television() {
  const group = new THREE.Group();
  const shell = soft('#4a4038');
  const screen = soft('#7fb0d0');
  screen.emissiveIntensity = 0.7;
  group.add(box(1.3, 1, 0.8, shell), box(1.06, 0.8, 0.04, screen, [0, 0, 0.41]));
  group.add(box(0.03, 0.6, 0.03, shell, [-0.2, 0.76, 0]), box(0.03, 0.6, 0.03, shell, [0.2, 0.76, 0]));
  group.children[2].rotation.z = 0.5;
  group.children[3].rotation.z = -0.5;
  return group;
}

function rubberDuck() {
  const group = new THREE.Group();
  const yellow = soft('#ffd23f');
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 9), yellow);
  body.scale.set(1.25, 0.85, 0.95);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 9), yellow);
  head.position.set(0.48, 0.6, 0);
  group.add(body, head, box(0.3, 0.08, 0.26, soft('#ff8a1f'), [0.9, 0.56, 0]));
  return group;
}

function sofa() {
  const group = new THREE.Group();
  const cloth = soft('#8a3f55');
  group.add(box(1.8, 0.34, 0.8, cloth), box(1.8, 0.7, 0.22, cloth, [0, 0.42, -0.34]));
  [-1, 1].forEach((side) => group.add(box(0.22, 0.54, 0.8, cloth, [side * 0.98, 0.14, 0])));
  return group;
}

function football() {
  const group = new THREE.Group();
  const ball = new THREE.IcosahedronGeometry(0.62, 2);
  const leather = soft('#f2f2f2');
  group.add(new THREE.Mesh(ball, leather));
  const patch = soft('#22242a');
  const corners = new THREE.IcosahedronGeometry(0.6, 0).getAttribute('position');
  for (let i = 0; i < corners.count; i += 7) {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), patch);
    spot.position.fromBufferAttribute(corners, i);
    spot.scale.setScalar(1);
    group.add(spot);
  }
  return group;
}

function rocketBody() {
  const group = new THREE.Group();
  const steel = soft('#dfe3ea');
  const dark = soft('#23262e');
  group.add(tube(0.17, 1.5, steel, [0, 0, 0]), tube(0.17, 0.5, steel, [0, 1, 0], 0.01), tube(0.175, 0.06, dark, [0, 0.42, 0]));
  [0, 1, 2, 3].forEach((i) => {
    const angle = (i * Math.PI) / 2 + 0.6;
    const fin = box(0.03, 0.34, 0.2, dark, [Math.cos(angle) * 0.22, -0.62, Math.sin(angle) * 0.22]);
    fin.rotation.y = -angle + Math.PI / 2;
    group.add(fin);
  });
  group.add(tube(0.14, 0.12, dark, [0, -0.8, 0], 0.08));
  return group;
}

/** A very small camp on Mars: a shed, a parked rocket, and a man in a suit hammering at a crate. */
function marsCamp() {
  const group = new THREE.Group();
  const suit = soft('#f2f2f4');
  const dark = soft('#23262e');
  const man = new THREE.Group();
  man.add(tube(0.05, 0.3, suit, [-0.06, 0.15, 0]), tube(0.05, 0.3, suit, [0.06, 0.15, 0]), tube(0.12, 0.36, suit, [0, 0.46, 0]), tube(0.035, 0.32, suit, [-0.16, 0.48, 0]));
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), suit);
  helmet.position.y = 0.74;
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), metal('#d9a53c', 0.5));
  visor.position.set(0, 0.74, 0.05);
  man.add(helmet, visor);
  const arm = new THREE.Group();
  arm.position.set(0.15, 0.62, 0);
  const reach = tube(0.035, 0.32, suit, [0.15, 0, 0]);
  reach.rotation.z = Math.PI / 2;
  arm.add(reach, tube(0.018, 0.3, dark, [0.32, 0.1, 0]), box(0.16, 0.08, 0.08, metal('#c9ccd4'), [0.32, 0.24, 0]));
  man.add(arm);
  group.add(box(0.34, 0.2, 0.3, soft('#b98a4e'), [0.62, 0.1, 0]));
  const shed = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), metal('#c9ccd4', 0.2));
  shed.position.set(-0.62, -0.05, -0.1);
  const ship = rocketBody();
  ship.scale.setScalar(0.62);
  ship.position.set(1, 0.32, -0.2);
  group.add(shed, ship, man);
  return { group, man, arm };
}

const MAKERS: Array<[Exclude<OddityId, 'rocket' | 'elon'>, () => THREE.Group]> = [
  ['lamp', lamp],
  ['garbageBag', garbageBag],
  ['chair', chair],
  ['trafficCone', trafficCone],
  ['television', television],
  ['rubberDuck', rubberDuck],
  ['sofa', sofa],
  ['football', football],
];

/** A soft halo and a thin lit shell round an object, shown while it is pointed at. */
function addGlow(shape: THREE.Group, texture: THREE.Texture, color: string) {
  const shell = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const glow = new THREE.Group();
  shape.children.forEach((part) => {
    const mesh = part as THREE.Mesh;
    const hull = new THREE.Mesh(mesh.geometry, shell);
    hull.position.copy(mesh.position);
    hull.quaternion.copy(mesh.quaternion);
    hull.scale.copy(mesh.scale).multiplyScalar(1.34);
    glow.add(hull);
  });
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color, opacity: 0.8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.setScalar(4.4);
  glow.add(halo);
  glow.visible = false;
  shape.add(glow);
  return glow;
}

/** One shared pool of glowing specks, for exhaust and small explosions. */
function createSparks(scene: THREE.Scene, texture: THREE.Texture, size: number) {
  const positions = new Float32Array(SPARKS * 3);
  const colors = new Float32Array(SPARKS * 3);
  const speeds = new Float32Array(SPARKS * 3);
  const lives = new Float32Array(SPARKS);
  const spans = new Float32Array(SPARKS).fill(1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size, map: texture, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  points.frustumCulled = false;
  scene.add(points);
  let cursor = 0;
  const hot = new THREE.Color();
  return {
    emit(at: THREE.Vector3, velocity: THREE.Vector3, span: number) {
      const i = cursor;
      cursor = (cursor + 1) % SPARKS;
      positions.set([at.x, at.y, at.z], i * 3);
      speeds.set([velocity.x, velocity.y, velocity.z], i * 3);
      lives[i] = span;
      spans[i] = span;
    },
    update(seconds: number) {
      for (let i = 0; i < SPARKS; i += 1) {
        if (lives[i] <= 0) continue;
        lives[i] -= seconds;
        const left = Math.max(lives[i] / spans[i], 0);
        for (let axis = 0; axis < 3; axis += 1) positions[i * 3 + axis] += speeds[i * 3 + axis] * seconds;
        // White, then orange, then a dull red that fades out.
        hot.setRGB(Math.min(1.6, left * 3), left * left * 1.5, left * left * left * 1.2);
        hot.toArray(colors, i * 3);
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    },
  };
}

export interface Oddity {
  id: OddityId;
}

interface Drifter extends Oddity {
  glow: THREE.Group;
  shape: THREE.Group;
  materials: THREE.MeshStandardMaterial[];
  born: number;
  life: number;
  from: THREE.Vector3;
  heading: THREE.Vector3;
  spin: THREE.Vector3;
}

export interface OrbiterPrefs {
  satellites: boolean;
  drifters: boolean;
  driftPace: DriftPace;
  rocket: boolean;
}

export interface Orbiters {
  update: (now: number, dt: number, camera: THREE.Camera) => void;
  configure: (prefs: OrbiterPrefs) => void;
  pickAt: (x: number, y: number, rect: DOMRect, camera: THREE.Camera) => Oddity | null;
  highlight: (thing: Oddity | null) => void;
  hold: (thing: Oddity | null) => void;
  /** Blows a thing up. Returns where, if it was the rocket, because that one ends the world. */
  destroy: (thing: Oddity) => THREE.Vector3 | null;
  launchRocket: () => void;
  /** Where an object is, for local tests. */
  positionOf: (id: 'drifter' | 'rocket' | 'mars') => THREE.Vector3 | null;
  /** Mars on screen, if the pointer is over it. */
  marsAt: (x: number, y: number, rect: DOMRect, camera: THREE.Camera) => { x: number; y: number; r: number } | null;
}

export function createOrbiters(scene: THREE.Scene, center: THREE.Vector3, radius: number, random: () => number, glowTexture: THREE.Texture, mars?: { at: THREE.Vector3; radius: number }): Orbiters {
  const home = new THREE.Group();
  home.position.copy(center);
  scene.add(home);

  const orbiting: Array<{ item: THREE.Group; reach: number; speed: number; phase: number; plane: THREE.Euler }> = [];
  const place = (item: THREE.Group, span: number, reach: number, speed: number, plane: THREE.Euler) => {
    item.scale.setScalar(span);
    home.add(item);
    orbiting.push({ item, reach, speed, phase: random() * Math.PI * 2, plane });
  };

  const fleet = new THREE.Group();
  home.add(fleet);
  place(station(), radius * STATION_SPAN * 1.8, radius * 1.34, 0.00016, new THREE.Euler(0.5, 0, 0.35));
  for (let i = 0; i < SATELLITES; i += 1) {
    const tint = ['#d9b45a', '#c9ccd4', '#e0e4ea'][i % 3];
    place(satellite(tint), radius * SATELLITE_SPAN * 1.8, radius * (1.5 + random() * 0.65), 0.00009 + random() * 0.00012, new THREE.Euler((random() - 0.5) * 2.4, random() * 3, (random() - 0.5) * 1.6));
  }
  orbiting.forEach(({ item }) => fleet.add(item));

  const waiting: Drifter[] = MAKERS.map(([id, make]) => {
    const shape = make();
    const materials: THREE.MeshStandardMaterial[] = [];
    shape.traverse((part) => {
      const mesh = part as THREE.Mesh;
      if (mesh.isMesh) materials.push(mesh.material as THREE.MeshStandardMaterial);
    });
    const glow = addGlow(shape, glowTexture, '#ffc27a');
    shape.visible = false;
    scene.add(shape);
    return { id, glow, shape, materials, born: 0, life: 0, from: new THREE.Vector3(), heading: new THREE.Vector3(), spin: new THREE.Vector3() };
  });
  const flying: Drifter[] = [];
  const toCamera = new THREE.Vector3();
  const probe = new THREE.Vector3();
  const spot = new THREE.Vector3();
  const size = radius * DRIFTER_SIZE;

  const sparks = createSparks(scene, glowTexture, radius * 0.17);
  const rocketShape = rocketBody();
  const rocketParts: THREE.MeshStandardMaterial[] = [];
  rocketShape.traverse((part) => {
    const mesh = part as THREE.Mesh;
    if (mesh.isMesh) rocketParts.push(mesh.material as THREE.MeshStandardMaterial);
  });
  const rocketGlow = addGlow(rocketShape, glowTexture, '#ff5a4a');
  const flame = new THREE.Group();
  const fire = (width: number, color: string) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(width, 1, 12, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }));
    cone.rotation.x = Math.PI;
    cone.position.y = -0.5;
    flame.add(cone);
  };
  fire(0.27, '#ff6a14');
  fire(0.15, '#ffe9b0');
  flame.position.y = -0.84;
  rocketShape.add(flame);
  rocketShape.scale.setScalar(radius * ROCKET_HEIGHT);
  rocketShape.visible = false;
  scene.add(rocketShape);
  const rocket = { id: 'rocket' as const, flying: false, clock: 0 };
  let rocketsOn = true;
  let nextRocketAt = ROCKET_FIRST_MS;
  let hovered: Oddity | null = null;
  let held: Oddity | null = null;
  let lastNow = 0;
  const launchPad = new THREE.Vector3();
  const drift = new THREE.Vector3();
  const backward = new THREE.Vector3();
  const nozzle = new THREE.Vector3();

  const elon = { id: 'elon' as const };
  const camp = mars ? marsCamp() : null;
  const campGlow = camp ? addGlow(camp.man, glowTexture, '#ffc27a') : null;
  const elonAt = new THREE.Vector3();
  let elonBackAt = 0;
  if (camp && mars) {
    // He stands near the top edge of the planet, leaning toward the viewer, so he is always in silhouette.
    const up = new THREE.Vector3().sub(mars.at).normalize().multiplyScalar(0.45).add(new THREE.Vector3(0, 1, 0)).normalize();
    camp.group.position.copy(mars.at).addScaledVector(up, mars.radius * 0.995);
    camp.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
    camp.group.scale.setScalar(mars.radius * CAMP_SIZE);
    scene.add(camp.group);
    camp.group.updateMatrixWorld(true);
    camp.man.getWorldPosition(elonAt);
    elonAt.addScaledVector(up, mars.radius * CAMP_SIZE * 0.4);
  }

  const launchRocket = () => {
    if (rocket.flying) return;
    rocket.flying = true;
    rocket.clock = 0;
    launchPad.set((Math.random() - 0.5) * 0.5, 1, (Math.random() - 0.5) * 0.5).normalize();
    rocketShape.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), launchPad);
    rocketShape.position.copy(center).addScaledVector(launchPad, radius);
    rocketShape.visible = true;
    rocketParts.forEach((material) => {
      material.opacity = 1;
    });
  };

  const burst = (at: THREE.Vector3, count: number, speed: number, span: number) => {
    for (let i = 0; i < count; i += 1) {
      drift.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed * (0.3 + Math.random()));
      sparks.emit(at, drift, span * (0.5 + Math.random() * 0.8));
    }
  };

  const onScreen = (camera: THREE.Camera) => {
    probe.copy(center).project(camera);
    return probe.z < 1 && Math.abs(probe.x) < 1.25 && Math.abs(probe.y) < 1.25;
  };

  let drifting = true;
  let gap: number = DRIFT_GAP_S.normal;
  let nextAt = 2500;

  const launch = (now: number, camera: THREE.Camera) => {
    const pick = Math.floor(Math.random() * waiting.length);
    const [drifter] = waiting.splice(pick, 1);
    if (!drifter) return;
    // Favour the side facing the viewer, so the object is seen leaving instead of hiding behind the planet.
    toCamera.copy(camera.position).sub(center).normalize();
    const out = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().addScaledVector(toCamera, 0.55).normalize();
    drifter.from.copy(center).addScaledVector(out, radius);
    drifter.heading.copy(out).multiplyScalar(radius * (0.13 + Math.random() * 0.07));
    drifter.spin.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(1.1);
    drifter.life = DRIFT_LIFE_S[0] + Math.random() * (DRIFT_LIFE_S[1] - DRIFT_LIFE_S[0]);
    drifter.born = now;
    drifter.shape.visible = true;
    drifter.shape.position.copy(drifter.from);
    drifter.shape.scale.setScalar(0.001);
    flying.push(drifter);
  };

  return {
    update(now, dt, camera) {
      if (fleet.visible) {
        orbiting.forEach(({ item, reach, speed, phase, plane }) => {
          const angle = now * speed + phase;
          item.position.set(Math.cos(angle) * reach, 0, Math.sin(angle) * reach).applyEuler(plane);
          item.lookAt(center);
        });
      }

      if (drifting && now > nextAt) {
        nextAt = now + gap * 1000 * (0.7 + Math.random() * 0.6);
        if (onScreen(camera)) launch(now, camera);
      }
      lastNow = now;

      const seconds = Math.min(dt, 50) / 1000;
      if (rocketsOn && !rocket.flying && now > nextRocketAt) {
        nextRocketAt = now + (ROCKET_GAP_S[0] + Math.random() * (ROCKET_GAP_S[1] - ROCKET_GAP_S[0])) * 1000;
        if (onScreen(camera)) launchRocket();
      }
      if (rocket.flying) {
        const aimed = hovered === rocket || held === rocket;
        rocket.clock += seconds * (aimed ? ROCKET_SLOWED : 1);
        const t = rocket.clock;
        const climb = radius * (0.06 * t + 0.021 * t * t);
        rocketShape.position.copy(center).addScaledVector(launchPad, radius + climb);
        rocketGlow.visible = aimed;
        const shrink = THREE.MathUtils.clamp((ROCKET_LIFE_S - t) / 6, 0, 1);
        rocketShape.scale.setScalar(radius * ROCKET_HEIGHT * shrink);
        flame.scale.set(1 + Math.sin(now * 0.05) * 0.14, 1.7 + Math.sin(now * 0.073) * 0.45, 1 + Math.cos(now * 0.06) * 0.14);
        nozzle.copy(rocketShape.position).addScaledVector(launchPad, -radius * ROCKET_HEIGHT * 0.92 * shrink);
        for (let i = 0; i < 7; i += 1) {
          backward.copy(launchPad).multiplyScalar(-radius * (0.5 + Math.random() * 0.5));
          backward.x += (Math.random() - 0.5) * radius * 0.2;
          backward.z += (Math.random() - 0.5) * radius * 0.2;
          sparks.emit(nozzle, backward, 0.8 + Math.random() * 1.2);
        }
        if (t >= ROCKET_LIFE_S) {
          rocket.flying = false;
          rocketShape.visible = false;
        }
      }
      if (camp) {
        if (!camp.man.visible && now > elonBackAt) camp.man.visible = true;
        const aimed = hovered === elon || held === elon;
        campGlow!.visible = aimed;
        if (!aimed) camp.arm.rotation.z = -0.5 + Math.abs(Math.sin(now * 0.0035)) * 1.1;
      }
      sparks.update(seconds);
      for (let i = flying.length - 1; i >= 0; i -= 1) {
        const drifter = flying[i];
        const aimed = hovered === drifter || held === drifter;
        drifter.glow.visible = aimed;
        // Pointed-at objects wait, so they can be read and clicked.
        if (aimed) drifter.born += dt;
        const age = (now - drifter.born) / 1000;
        const t = age / drifter.life;
        if (t >= 1) {
          drifter.shape.visible = false;
          flying.splice(i, 1);
          waiting.push(drifter);
          continue;
        }
        drifter.shape.position.copy(spot.copy(drifter.from).addScaledVector(drifter.heading, age));
        drifter.shape.rotation.x += drifter.spin.x * seconds;
        drifter.shape.rotation.y += drifter.spin.y * seconds;
        drifter.shape.rotation.z += drifter.spin.z * seconds;
        const leaving = THREE.MathUtils.clamp((t - FADE_FROM) / (1 - FADE_FROM), 0, 1);
        drifter.shape.scale.setScalar(Math.max(0.001, size * Math.min(1, age / GROW_S) * (1 - leaving * 0.75)));
        drifter.materials.forEach((material) => {
          material.opacity = 1 - leaving;
        });
      }
    },
    pickAt(x, y, rect, camera) {
      let nearest: Oddity | null = null;
      let best = PICK_PX;
      const check = (thing: Oddity, at: THREE.Vector3) => {
        probe.copy(at).project(camera);
        if (Math.abs(probe.z) > 1) return;
        const gap = Math.hypot(((probe.x + 1) / 2) * rect.width + rect.left - x, ((1 - probe.y) / 2) * rect.height + rect.top - y);
        if (gap < best) {
          best = gap;
          nearest = thing;
        }
      };
      flying.forEach((drifter) => check(drifter, drifter.shape.position));
      if (rocket.flying) check(rocket, rocketShape.position);
      if (camp?.group.visible && camp.man.visible) check(elon, elonAt);
      return nearest;
    },
    highlight(thing) {
      hovered = thing;
    },
    hold(thing) {
      held = thing;
    },
    destroy(thing) {
      if (held === thing) held = null;
      if (hovered === thing) hovered = null;
      if (thing === rocket) {
        rocket.flying = false;
        rocketShape.visible = false;
        burst(rocketShape.position, 260, radius * 3, 2.4);
        return rocketShape.position.clone();
      }
      if (thing === elon) {
        // He is back shortly. Nobody is sure how.
        if (camp) camp.man.visible = false;
        elonBackAt = lastNow + ELON_BACK_MS;
        burst(elonAt, 70, radius * 0.7, 1.1);
        return null;
      }
      const at = flying.indexOf(thing as Drifter);
      if (at < 0) return null;
      const [drifter] = flying.splice(at, 1);
      drifter.shape.visible = false;
      drifter.glow.visible = false;
      burst(drifter.shape.position, 70, radius * 1.1, 1.1);
      waiting.push(drifter);
      return null;
    },
    launchRocket,
    marsAt(x, y, rect, camera) {
      if (!mars) return null;
      probe.copy(mars.at).project(camera);
      if (Math.abs(probe.z) > 1) return null;
      const cx = ((probe.x + 1) / 2) * rect.width + rect.left;
      const cy = ((1 - probe.y) / 2) * rect.height + rect.top;
      spot.copy(mars.at).add(drift.setFromMatrixColumn(camera.matrixWorld, 1).multiplyScalar(mars.radius)).project(camera);
      const r = Math.abs(((1 - spot.y) / 2) * rect.height + rect.top - cy);
      return Math.hypot(x - cx, y - cy) <= r ? { x: cx, y: cy, r } : null;
    },
    positionOf(id) {
      if (id === 'rocket') return rocket.flying ? rocketShape.position : null;
      if (id === 'mars') return camp ? elonAt : null;
      return flying[0]?.shape.position ?? null;
    },
    configure(prefs) {
      rocketsOn = prefs.rocket;
      if (rocketsOn && nextRocketAt < lastNow) nextRocketAt = lastNow + ROCKET_FIRST_MS;
      fleet.visible = prefs.satellites;
      if (camp) camp.group.visible = prefs.drifters;
      if (prefs.drifters && !drifting) nextAt = 0;
      drifting = prefs.drifters;
      gap = DRIFT_GAP_S[prefs.driftPace];
    },
  };
}
