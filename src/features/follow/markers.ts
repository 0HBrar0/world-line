import * as THREE from 'three';
import type { Mechanism } from '../../data/schema';
import type { SpaceStop } from './spaceStops';

// Story points as small solid objects rather than glows, so they stay readable in front of bright light.
// The shape says how the world changed there: a paper dart for a D-Mail, a gate for the time machine,
// shards for an erasure, and a plain crystal for a moment where nothing jumped.

const CALM_COLOR = '#ffcf9a';
const HOVER_GROW = 1.9;
const CURRENT_GROW = 1.55;
const MOON_COUNT = 3;

function dart() {
  const nose = [0, 0, -1.7];
  const left = [-1.15, 0.05, 1];
  const right = [1.15, 0.05, 1];
  const tail = [0, 0.16, 0.8];
  const keel = [0, -0.5, 0.8];
  const faces = [nose, left, tail, nose, tail, right, nose, keel, left, nose, right, keel];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(faces.flat(), 3));
  geometry.computeVertexNormals();
  return geometry;
}

function shards() {
  const piece = new THREE.TetrahedronGeometry(1, 0);
  const copies = [[0.9, 0.6, 0.2, 0.62, 0.4], [-0.75, -0.4, 0.5, 0.78, 2.1], [0.1, -0.9, -0.7, 0.5, 4.2]];
  const positions = copies.flatMap(([x, y, z, size, turn]) => {
    const part = piece.clone();
    part.rotateY(turn).rotateX(turn * 0.7).scale(size, size, size).translate(x, y, z);
    return Array.from(part.getAttribute('position').array);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function crystal() {
  const geometry = new THREE.OctahedronGeometry(1, 0);
  geometry.scale(0.72, 1.3, 0.72);
  return geometry;
}

export interface Markers {
  items: THREE.Group[];
  update: (now: number, dt: number, index: number, hovered: number | null) => void;
  arrive: (index: number) => void;
}

export function createMarkers(scene: THREE.Scene, stops: SpaceStop[], points: THREE.Vector3[], size: number, shade: THREE.Texture): Markers {
  const shapes: Record<'calm' | Mechanism, THREE.BufferGeometry> = {
    calm: crystal(),
    dmail: dart(),
    dmail_cancellation: dart(),
    time_machine: new THREE.TorusGeometry(1.15, 0.24, 12, 40),
    database_erasure: shards(),
    other: new THREE.IcosahedronGeometry(1, 0),
  };
  const orbitShape = new THREE.TorusGeometry(1.95, 0.025, 6, 64);
  const backing = new THREE.SpriteMaterial({ map: shade, color: '#000000', opacity: 0.72, transparent: true, depthWrite: false });
  const punches = stops.map(() => 0);

  const items = stops.map((stop, i) => {
    const color = new THREE.Color(stop.jumpColor ?? CALM_COLOR);
    const item = new THREE.Group();
    item.position.copy(points[i]);
    item.rotation.y = i * 1.7;

    const dark = new THREE.Sprite(backing);
    dark.scale.setScalar(6.4);
    item.add(dark);

    const body = new THREE.Mesh(
      shapes[stop.jumpKind ?? 'calm'],
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.35, flatShading: true, side: THREE.DoubleSide }),
    );
    item.add(body);

    const orbit = new THREE.Mesh(orbitShape, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }));
    orbit.rotation.x = 1.15 + (i % 5) * 0.14;
    item.add(orbit);

    item.scale.setScalar(size);
    scene.add(item);
    return item;
  });

  // Small moons that keep company with whichever point is current.
  const moons = new THREE.Group();
  const moonShape = new THREE.SphereGeometry(0.14, 12, 10);
  for (let i = 0; i < MOON_COUNT; i += 1) {
    const moon = new THREE.Mesh(moonShape, new THREE.MeshBasicMaterial({ color: '#fff4e0' }));
    const angle = (i / MOON_COUNT) * Math.PI * 2;
    moon.position.set(Math.cos(angle) * 2.5, Math.sin(angle * 2) * 0.5, Math.sin(angle) * 2.5);
    moons.add(moon);
  }
  scene.add(moons);

  return {
    items,
    update(now, dt, index, hovered) {
      const seconds = Math.min(dt, 50) / 1000;
      items.forEach((item, i) => {
        const pointing = i === hovered;
        const current = i === index;
        item.rotation.y += seconds * (pointing ? 3.2 : current ? 1 : 0.35);
        item.position.y = points[i].y + Math.sin(now * 0.0011 + i * 1.3) * 0.16 * size;
        punches[i] *= Math.exp(-seconds * 4);
        const target = size * (1 + punches[i]) * (pointing ? HOVER_GROW : current ? CURRENT_GROW : 1);
        item.scale.setScalar(THREE.MathUtils.lerp(item.scale.x, target, Math.min(1, seconds * 12)));
        const body = item.children[1] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
        body.material.emissiveIntensity = pointing ? 1.5 : current ? 1.1 : i < index ? 0.65 : 0.22;
      });
      const home = items[Math.min(index, items.length - 1)];
      moons.position.copy(home.position);
      moons.scale.copy(home.scale);
      moons.rotation.y = now * 0.0012;
      moons.rotation.x = Math.sin(now * 0.0004) * 0.4;
    },
    arrive(index) {
      if (index in punches) punches[index] = 0.9;
    },
  };
}
