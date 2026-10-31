import * as THREE from 'three';

// Things around Earth, all built from plain shapes: a space station, small satellites, and (a prototype)
// household objects that float up off the planet and fade out in space. None of it carries story content.

const STATION_SPAN = 0.46;
const SATELLITE_SPAN = 0.14;
const SATELLITES = 6;
const DRIFTER_SIZE = 0.27;
const DRIFT_LIFE_S = [16, 24];
const FADE_FROM = 0.68;
const GROW_S = 2;
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

const MAKERS = [lamp, garbageBag, chair, trafficCone, television, rubberDuck, sofa];

interface Drifter {
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
}

export interface Orbiters {
  update: (now: number, dt: number, camera: THREE.Camera) => void;
  configure: (prefs: OrbiterPrefs) => void;
}

export function createOrbiters(scene: THREE.Scene, center: THREE.Vector3, radius: number, random: () => number): Orbiters {
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

  const waiting: Drifter[] = MAKERS.map((make) => {
    const shape = make();
    const materials: THREE.MeshStandardMaterial[] = [];
    shape.traverse((part) => {
      const mesh = part as THREE.Mesh;
      if (mesh.isMesh) materials.push(mesh.material as THREE.MeshStandardMaterial);
    });
    shape.visible = false;
    scene.add(shape);
    return { shape, materials, born: 0, life: 0, from: new THREE.Vector3(), heading: new THREE.Vector3(), spin: new THREE.Vector3() };
  });
  const flying: Drifter[] = [];
  const toCamera = new THREE.Vector3();
  const probe = new THREE.Vector3();
  const spot = new THREE.Vector3();
  const size = radius * DRIFTER_SIZE;

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
        probe.copy(center).project(camera);
        if (probe.z < 1 && Math.abs(probe.x) < 1.25 && Math.abs(probe.y) < 1.25) launch(now, camera);
      }

      const seconds = Math.min(dt, 50) / 1000;
      for (let i = flying.length - 1; i >= 0; i -= 1) {
        const drifter = flying[i];
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
    configure(prefs) {
      fleet.visible = prefs.satellites;
      if (prefs.drifters && !drifting) nextAt = 0;
      drifting = prefs.drifters;
      gap = DRIFT_GAP_S[prefs.driftPace];
    },
  };
}
