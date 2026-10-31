import * as THREE from 'three';
import { MARS_TASKS, type MarsTaskId } from './oddities';

// A low-poly camp on the top of Mars, built to be flown down to and watched. One suited figure with jointed
// limbs does one job at a time; every prop and move is plain geometry driven by a looping clock.
// Units: he is about 0.85 tall, standing at the origin and facing +x, with the camera looking in from +z.

/** The camp is scaled so the planet's radius is this many units, and the ground falls away from the origin. */
const PLANET = 1 / 0.55;
const ground = (x: number, z: number) => Math.sqrt(Math.max(PLANET ** 2 - x * x - z * z, 0)) - PLANET;

const clay = (color: string, emissive = 0.14) => {
  const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: emissive, roughness: 0.78, metalness: 0.05, flatShading: true });
  // A flat-shaded face too small to measure gives a bad pixel, and the bloom pass would spread it into a black blob.
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', 'if (!(dot(outgoingLight, vec3(1.0)) >= 0.0)) outgoingLight = vec3(0.0);\n#include <opaque_fragment>');
  };
  return material;
};
const fading = (color: string) => {
  const material = clay(color);
  material.transparent = true;
  return material;
};

function block(x: number, y: number, z: number, material: THREE.Material, at: [number, number, number] = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(x, y, z), material);
  mesh.position.set(...at);
  return mesh;
}

function rod(radius: number, length: number, material: THREE.Material, at: [number, number, number] = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 7), material);
  mesh.position.set(...at);
  return mesh;
}

function rock(size: number, material: THREE.Material, at: [number, number, number]) {
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), material);
  mesh.position.set(...at);
  mesh.rotation.set(size * 40, size * 90, 0);
  return mesh;
}

function painted(paint: (c: CanvasRenderingContext2D) => void, width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext('2d')!);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const banknotes = () =>
  painted(
    (c) => {
      c.fillStyle = '#62a665';
      c.fillRect(0, 0, 128, 64);
      c.strokeStyle = '#2f6238';
      c.lineWidth = 5;
      c.strokeRect(5, 5, 118, 54);
      c.fillStyle = '#e7dfc4';
      c.fillRect(52, 0, 24, 64);
      c.fillStyle = '#2f6238';
      c.font = 'bold 34px sans-serif';
      c.textAlign = 'center';
      c.fillText('$', 64, 44);
    },
    128,
    64,
  );

const dollarSign = () =>
  painted(
    (c) => {
      c.fillStyle = '#4e3518';
      c.font = 'bold 54px sans-serif';
      c.textAlign = 'center';
      c.fillText('$', 32, 50);
    },
    64,
    64,
  );

const CAR_CYCLE_S = 18;
const CAR_SLOPE = 0.56;
const TV_FRAME_MS = 80;

/** How far through its hop the car is, from the clock: resting most of the time, then up, a hover, and back down. */
function carHop(seconds: number) {
  const k = (seconds % CAR_CYCLE_S) / CAR_CYCLE_S;
  const rise = THREE.MathUtils.smoothstep(k, 0.58, 0.7);
  const fall = THREE.MathUtils.smoothstep(k, 0.84, 0.96);
  const height = rise * (1 - fall);
  const burn = THREE.MathUtils.smoothstep(k, 0.54, 0.58) * (1 - THREE.MathUtils.smoothstep(k, 0.96, 0.99));
  return { height: height + (height > 0.9 ? Math.sin(seconds * 3) * 0.03 : 0), burn };
}

/** A low white supercar: long nose, teardrop cabin and a clean tail, with rocket pods at the back and lift jets underneath. */
function roadster() {
  const car = new THREE.Group();
  const flying = new THREE.Group();
  car.add(flying);
  const body = new THREE.Shape();
  body.moveTo(-0.76, 0.12);
  body.lineTo(0.76, 0.12);
  body.quadraticCurveTo(0.84, 0.13, 0.84, 0.17);
  body.quadraticCurveTo(0.6, 0.25, 0.3, 0.3);
  body.quadraticCurveTo(0.08, 0.45, -0.16, 0.45);
  body.quadraticCurveTo(-0.5, 0.42, -0.78, 0.29);
  body.quadraticCurveTo(-0.8, 0.2, -0.76, 0.12);
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(body, { depth: 0.5, curveSegments: 5, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.04, bevelSegments: 2 }), clay('#f2f2ef', 0.22));
  hull.position.z = -0.25;
  const cabin = new THREE.Shape();
  cabin.moveTo(0.29, 0.305);
  cabin.quadraticCurveTo(0.08, 0.452, -0.16, 0.455);
  cabin.quadraticCurveTo(-0.34, 0.44, -0.46, 0.385);
  cabin.lineTo(-0.2, 0.31);
  cabin.closePath();
  const glass = new THREE.Mesh(new THREE.ExtrudeGeometry(cabin, { depth: 0.44, curveSegments: 5, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: '#141a22', roughness: 0.18, metalness: 0.6, flatShading: true }));
  glass.position.z = -0.22;
  const sideWindow = new THREE.Mesh(new THREE.ExtrudeGeometry(cabin, { depth: 0.6, curveSegments: 5, bevelEnabled: false }), glass.material);
  sideWindow.scale.set(0.8, 0.97, 1);
  sideWindow.position.set(-0.02, 0.02, -0.3);
  const black = clay('#1e1d20', 0.06);
  const steel = clay('#c4c8d0', 0.24);
  const lamp = new THREE.MeshBasicMaterial({ color: '#eaf4ff', toneMapped: false });
  const tail = new THREE.MeshBasicMaterial({ color: '#ff2a2a', toneMapped: false });
  flying.add(hull, glass, sideWindow, block(0.012, 0.02, 0.56, tail, [-0.81, 0.26, 0]), block(0.09, 0.016, 0.12, lamp, [0.76, 0.17, 0.2]), block(0.09, 0.016, 0.12, lamp, [0.76, 0.17, -0.2]), block(0.16, 0.03, 0.42, black, [0.78, 0.125, 0]));
  [-0.47, 0.5].forEach((x) => {
    [-0.285, 0.285].forEach((z) => {
      const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 12), black);
      arch.rotation.x = Math.PI / 2;
      arch.position.set(x, 0.135, z * 1.02);
      const tyre = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.12, 12), black);
      tyre.rotation.x = Math.PI / 2;
      tyre.position.set(x, 0.135, z);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.125, 5), steel);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(x, 0.135, z);
      flying.add(arch, tyre, rim);
    });
  });

  const fire = (length: number, width: number, color: string) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(width, length, 8, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }));
    cone.position.y = -length / 2;
    cone.rotation.x = Math.PI;
    return cone;
  };
  const jets: THREE.Group[] = [];
  const jet = (x: number, y: number, z: number, length: number, sideways: boolean) => {
    const pod = rod(0.055, 0.1, steel, [x, y, z]);
    const flame = new THREE.Group();
    flame.position.set(x, y - 0.05, z);
    flame.add(fire(length, 0.05, '#ff6a14'), fire(length * 0.6, 0.026, '#ffe9b0'));
    if (sideways) {
      pod.rotation.z = Math.PI / 2;
      flame.position.set(x - 0.05, y, z);
      flame.rotation.z = -Math.PI / 2;
    }
    flying.add(pod, flame);
    jets.push(flame);
  };
  [[-0.5, -0.2], [-0.5, 0.2], [0.5, -0.2], [0.5, 0.2]].forEach(([x, z]) => jet(x, 0.08, z, 0.42, false));
  [-0.09, 0.09].forEach((z) => jet(-0.84, 0.2, z, 0.62, true));

  return {
    car,
    fly(now: number) {
      const { height, burn } = carHop(now / 1000);
      // It parks on the slope, so it climbs straight up the screen and levels out as it goes.
      flying.position.set(height * 0.75, height * 0.7, 0);
      flying.rotation.z = -CAR_SLOPE * height + Math.sin(height * Math.PI) * 0.1;
      jets.forEach((flame, i) => {
        flame.visible = burn > 0.02;
        flame.scale.setScalar(Math.max(burn, 0.02) * (1 + Math.sin(now * 0.05 + i) * 0.16));
      });
    },
  };
}

/** A fat old television on the ground. Its picture is a live feed of the same car, drawn from the same clock. */
function television() {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 220;
  const c = canvas.getContext('2d')!;
  const picture = new THREE.CanvasTexture(canvas);
  picture.colorSpace = THREE.SRGBColorSpace;
  const draw = (now: number) => {
    const seconds = now / 1000;
    const { height, burn } = carHop(seconds);
    const sky = c.createLinearGradient(0, 0, 0, 220);
    sky.addColorStop(0, '#0d0a20');
    sky.addColorStop(1, '#4b2346');
    c.fillStyle = sky;
    c.fillRect(0, 0, 320, 220);
    c.fillStyle = '#fff';
    for (let i = 0; i < 44; i += 1) c.fillRect((i * 149 + seconds * 6) % 320, (i * 83) % 150, 1.5, 1.5);
    c.fillStyle = '#b04e2a';
    c.beginPath();
    c.ellipse(160, 300, 300, 120, 0, 0, Math.PI * 2);
    c.fill();
    const y = 166 - height * 96;
    const x = 160;
    if (burn > 0.02) {
      const flicker = burn * (1 + Math.sin(now * 0.05) * 0.18);
      c.fillStyle = '#ff7a24';
      c.beginPath();
      c.moveTo(x - 72, y - 13);
      c.lineTo(x - 72 - 74 * flicker, y - 6);
      c.lineTo(x - 72, y);
      [-40, 40].forEach((at) => {
        c.moveTo(at + x - 8, y + 12);
        c.lineTo(at + x, y + 12 + 44 * flicker);
        c.lineTo(at + x + 8, y + 12);
      });
      c.fill();
    }
    c.fillStyle = '#f4f4f1';
    c.beginPath();
    c.moveTo(x - 72, y + 6);
    c.lineTo(x + 80, y + 6);
    c.quadraticCurveTo(x + 86, y - 2, x + 62, y - 9);
    c.quadraticCurveTo(x + 40, y - 14, x + 22, y - 17);
    c.quadraticCurveTo(x + 2, y - 34, x - 18, y - 34);
    c.quadraticCurveTo(x - 50, y - 30, x - 74, y - 14);
    c.quadraticCurveTo(x - 76, y - 4, x - 72, y + 6);
    c.fill();
    c.fillStyle = '#141a22';
    c.beginPath();
    c.moveTo(x + 16, y - 18);
    c.quadraticCurveTo(x, y - 31, x - 18, y - 31);
    c.quadraticCurveTo(x - 34, y - 29, x - 44, y - 23);
    c.lineTo(x - 20, y - 16);
    c.fill();
    c.fillStyle = '#ff2a2a';
    c.fillRect(x - 75, y - 11, 3, 8);
    [-44, 48].forEach((at) => {
      c.fillStyle = '#1b1a1e';
      c.beginPath();
      c.arc(x + at, y + 6, 13, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#c4c8d0';
      c.beginPath();
      c.arc(x + at, y + 6, 7, 0, Math.PI * 2);
      c.fill();
    });
    c.fillStyle = 'rgba(0,0,0,0.2)';
    for (let line = 0; line < 220; line += 4) c.fillRect(0, line, 320, 1.5);
    if (Math.floor(seconds) % 2 === 0) {
      c.fillStyle = '#ff3b30';
      c.beginPath();
      c.arc(20, 20, 6, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = '#fff';
    c.font = 'bold 15px monospace';
    c.fillText('LIVE', 32, 25);
    picture.needsUpdate = true;
  };
  draw(0);

  const tv = new THREE.Group();
  const shell = clay('#3a2c22');
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.38), new THREE.MeshBasicMaterial({ map: picture }));
  screen.position.set(-0.04, 0.3, 0.073);
  tv.add(block(0.72, 0.5, 0.14, shell, [0, 0.3, 0]), screen);
  [0.34, 0.46].forEach((y) => {
    const knob = rod(0.022, 0.03, clay('#c8b890'), [0.3, y - 0.14, 0.075]);
    knob.rotation.x = Math.PI / 2;
    tv.add(knob);
  });
  [-0.5, 0.5].forEach((lean) => {
    const aerial = rod(0.007, 0.34, clay('#bfc3cc'), [lean * 0.28, 0.69, 0]);
    aerial.rotation.z = -lean;
    tv.add(aerial);
    tv.add(block(0.05, 0.05, 0.1, shell, [lean * 0.8, 0.03, 0]));
  });
  return { tv, draw };
}

function spaceman() {
  const suit = clay('#f1efe9', 0.18);
  const dark = clay('#2c2a2e');
  const man = new THREE.Group();
  // Three-quarters on to the camera, so the visor can be seen.
  man.rotation.y = 1.15;
  const body = new THREE.Group();
  body.position.y = 0.3;
  man.add(body);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.12, 0.34, 8), suit);
  torso.position.y = 0.17;
  const helmet = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), suit);
  helmet.position.y = 0.45;
  const gold = new THREE.Color('#e0a93f');
  const fogged = new THREE.Color('#e6e4dc');
  const glass = new THREE.MeshStandardMaterial({ color: gold.clone(), roughness: 0.25, metalness: 0.55, emissive: '#6e4a12', emissiveIntensity: 0.35, flatShading: true });
  const visor = new THREE.Mesh(new THREE.IcosahedronGeometry(0.096, 1), glass);
  visor.position.set(0, 0.455, 0.055);
  body.add(torso, helmet, visor, block(0.2, 0.26, 0.1, clay('#8d8a90'), [0, 0.19, -0.16]), block(0.07, 0.05, 0.012, clay('#d24a3a', 0.3), [0.05, 0.24, 0.126]));

  const limb = (x: number, y: number, parent: THREE.Group, radius: number, length: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    pivot.add(rod(radius, length, suit, [0, -length / 2, 0]));
    parent.add(pivot);
    return pivot;
  };
  const armL = limb(-0.17, 0.3, body, 0.04, 0.28);
  const armR = limb(0.17, 0.3, body, 0.04, 0.28);
  const legL = limb(-0.07, 0.02, body, 0.055, 0.3);
  const legR = limb(0.07, 0.02, body, 0.055, 0.3);
  [legL, legR].forEach((leg) => leg.add(block(0.1, 0.05, 0.17, dark, [0, -0.3, 0.035])));
  const hand = new THREE.Group();
  hand.position.y = -0.3;
  armR.add(hand);
  [armL, armR].forEach((arm) => {
    const glove = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 0), clay('#c8c4bc'));
    glove.position.y = -0.3;
    arm.add(glove);
  });

  const stand = () => {
    body.position.set(0, 0.3, 0);
    body.rotation.set(0, 0, 0);
    armL.rotation.set(0.08, 0, 0.08);
    armR.rotation.set(0.08, 0, -0.08);
    legL.rotation.set(0, 0, 0);
    legR.rotation.set(0, 0, 0);
    glass.color.copy(gold);
  };
  return { man, body, armL, armR, legL, legR, hand, stand, fog: (amount: number) => glass.color.lerpColors(gold, fogged, amount) };
}

type Rig = ReturnType<typeof spaceman>;
interface Job {
  props: THREE.Group;
  tools: THREE.Object3D[];
  stands: [number, number];
  play: (t: number) => void;
}

const smooth = (from: number, to: number, x: number) => THREE.MathUtils.smoothstep(x, from, to);

function idleJob(rig: Rig): Job {
  const props = new THREE.Group();
  props.add(block(0.32, 0.22, 0.3, clay('#b98a4e'), [0.5, 0.09, 0]));
  const hammer = new THREE.Group();
  hammer.add(rod(0.016, 0.24, clay('#7a5a34'), [0, -0.12, 0]), block(0.09, 0.07, 0.15, clay('#bfc3cc'), [0, -0.24, 0]));
  rig.hand.add(hammer);
  return { props, tools: [hammer], stands: [0, -0.15], play: (t) => void (rig.armR.rotation.x = -1.75 + Math.abs(Math.sin(t * 3.4)) * 0.95) };
}

function digJob(rig: Rig, cash: THREE.Texture): Job {
  const CYCLE = 2.4;
  const props = new THREE.Group();
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.26, 9), new THREE.MeshBasicMaterial({ color: '#1c0a07' }));
  hole.rotation.x = -Math.PI / 2;
  hole.position.set(0.52, ground(0.52, 0) + 0.015, 0);
  hole.rotation.y = -0.28;
  hole.rotation.order = 'YXZ';
  const soil = clay('#7f3219');
  const mound = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.24, 7), soil);
  mound.position.set(0.88, ground(0.88, 0.42) + 0.06, 0.42);
  props.add(hole, mound);
  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2;
    const x = 0.52 + Math.cos(angle) * 0.28;
    const z = Math.sin(angle) * 0.28;
    props.add(rock(0.045, soil, [x, ground(x, z) + 0.02, z]));
  }
  const clods = Array.from({ length: 7 }, () => {
    const clod = rock(0.03, soil, [0, 0, 0]);
    props.add(clod);
    return clod;
  });
  const sign = new THREE.MeshBasicMaterial({ map: cash, transparent: true, depthWrite: false });
  const bags = [0, 1].map(() => {
    const bag = new THREE.Group();
    const sack = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 1), clay('#b5905a'));
    sack.scale.set(1, 1.05, 0.9);
    sack.position.y = 0.13;
    const neck = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.1, 6), clay('#8f6d3c'));
    neck.position.y = 0.29;
    neck.rotation.x = Math.PI;
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), sign);
    mark.position.set(0, 0.13, 0.142);
    bag.add(sack, neck, mark);
    props.add(bag);
    return bag;
  });
  const shovel = new THREE.Group();
  shovel.add(rod(0.016, 0.66, clay('#9a7a4c'), [0, -0.3, 0]), block(0.17, 0.2, 0.03, clay('#b8bcc4'), [0, -0.68, 0]));
  rig.hand.add(shovel);
  return {
    props,
    tools: [shovel],
    stands: [-0.12, -0.17],
    play(t) {
      const c = (t % CYCLE) / CYCLE;
      const stab = c < 0.45 ? smooth(0, 0.45, c) : 1 - smooth(0.5, 1, c);
      rig.armR.rotation.x = -1.95 + stab * 1.4;
      rig.armL.rotation.x = -1.8 + stab * 1.3;
      rig.body.rotation.x = 0.04 + stab * 0.3;
      rig.body.position.y = 0.3 - stab * 0.03;
      mound.scale.setScalar(0.7 + ((t % 26) / 26) * 0.7);
      clods.forEach((clod, i) => {
        const k = ((c + 1 - i * 0.025 - 0.55) % 1) / 0.4;
        clod.visible = k < 1;
        clod.position.set(THREE.MathUtils.lerp(0.5, 0.88, k), -0.04 + 4 * k * (1 - k) * 0.62, THREE.MathUtils.lerp(0, 0.42, k));
        clod.rotation.x = k * 9;
      });
      bags.forEach((bag, i) => {
        const k = ((t + i * 3.5) % 7) / 7;
        const hop = smooth(0.42, 0.78, k);
        bag.position.set(THREE.MathUtils.lerp(0.34, 0.52, hop), ground(0.45, THREE.MathUtils.lerp(-0.62, 0, hop)) + Math.sin(hop * Math.PI) * 0.34 + Math.abs(Math.sin(k * 34)) * 0.03 * (1 - hop), THREE.MathUtils.lerp(-0.62, 0, hop));
        const sink = smooth(0.78, 0.9, k);
        bag.position.y -= sink * 0.3;
        // A scale of exactly zero would poison the bloom pass with bad normals.
        const size = smooth(0, 0.08, k) * (1 - sink);
        bag.visible = size > 0.08;
        bag.scale.setScalar(Math.max(size, 0.01));
        bag.rotation.z = hop * 0.9;
      });
    },
  };
}

function bluntJob(rig: Rig, glow: THREE.Texture): Job {
  const CYCLE = 12;
  const props = new THREE.Group();
  props.add(block(0.34, 0.27, 0.34, clay('#b98a4e'), [0, 0.135, 0]));
  const sheet = block(0.27, 0.012, 0.15, clay('#efe6cf', 0.3), [0.42, 0.46, 0]);
  props.add(sheet);
  const joint = new THREE.Group();
  const paper = rod(0.026, 0.2, clay('#a8743e'));
  paper.position.y = -0.1;
  const ember = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), new THREE.MeshBasicMaterial({ color: '#ff7a2e', toneMapped: false }));
  ember.position.y = -0.21;
  joint.add(paper, ember);
  joint.rotation.x = -0.5;
  rig.hand.add(joint);
  const puffs = Array.from({ length: 7 }, () => {
    const puff = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#d9d6d0', transparent: true, depthWrite: false }));
    props.add(puff);
    return puff;
  });
  return {
    props,
    tools: [joint],
    stands: [-0.04, 0],
    play(t) {
      const k = (t % CYCLE) / CYCLE;
      const rolled = smooth(0.05, 0.36, k);
      const lit = k > 0.44;
      rig.body.position.y = 0.33;
      rig.legL.rotation.x = -1.45;
      rig.legR.rotation.x = -1.45;
      if (k < 0.4) {
        const rub = Math.sin(t * 9) * 0.14;
        rig.armR.rotation.x = -1.42 + rub;
        rig.armL.rotation.x = -1.42 - rub;
        rig.armR.rotation.z = -0.3;
        rig.armL.rotation.z = 0.3;
      } else {
        const puff = Math.max(0, Math.sin(t * 1.5));
        rig.armR.rotation.x = -1.2 - puff ** 3 * 1;
        rig.armR.rotation.z = -0.1 - puff ** 3 * 0.55;
        rig.armL.rotation.x = 0.1;
      }
      sheet.visible = k < 0.4;
      sheet.scale.set(1, 1 + rolled * 2, 1 - rolled * 0.84);
      joint.visible = k >= 0.4;
      ember.visible = lit;
      if (lit) ember.scale.setScalar(0.8 + Math.sin(t * 8) * 0.3);
      rig.fog(smooth(0.55, 0.9, k) * (1 - smooth(0.97, 1, k)));
      puffs.forEach((puff, i) => {
        const p = (t * 0.32 + i / puffs.length) % 1;
        puff.visible = lit;
        puff.position.set(0.32 + p * 0.3, 0.72 + p * 0.85, Math.sin(p * 7 + i) * 0.1);
        puff.scale.setScalar(0.1 + p * 0.42);
        (puff.material as THREE.SpriteMaterial).opacity = (1 - p) * 0.55 * smooth(0, 0.08, p);
      });
    },
  };
}

function stackJob(rig: Rig, notes: THREE.Texture): Job {
  const CYCLE = 12;
  const LAYERS = 11;
  const props = new THREE.Group();
  const layers = Array.from({ length: LAYERS }, (_, i) => {
    const material = new THREE.MeshStandardMaterial({ map: notes, transparent: true, roughness: 0.8, emissive: '#2f6238', emissiveIntensity: 0.25, flatShading: true });
    const layer = block(0.42, 0.065, 0.24, material);
    props.add(layer);
    return { layer, material, drift: i * 0.61 };
  });
  const bundle = block(0.2, 0.05, 0.12, new THREE.MeshStandardMaterial({ map: notes, roughness: 0.8 }));
  bundle.position.y = -0.03;
  rig.hand.add(bundle);
  return {
    props,
    tools: [bundle],
    stands: [-0.08, -0.15],
    play(t) {
      const k = (t % CYCLE) / CYCLE;
      const gust = smooth(0.62, 0.86, k);
      const blown = smooth(0.58, 0.64, k);
      rig.armR.rotation.x = -1.2 - Math.abs(Math.sin(t * 2.4)) * 0.7 * (1 - blown) - blown * 1.2;
      rig.armL.rotation.x = 0.1 - blown * 2.4;
      rig.body.position.y = 0.3 + blown * Math.abs(Math.sin(t * 7)) * 0.05;
      layers.forEach(({ layer, material, drift }, i) => {
        const placed = smooth(i / (LAYERS + 1), (i + 0.6) / (LAYERS + 1), k / 0.58);
        const gone = THREE.MathUtils.clamp(gust * 1.5 - (LAYERS - 1 - i) * 0.05, 0, 1);
        layer.visible = placed > 0.01;
        layer.position.set(0.56 + gone * (1.8 + drift * 0.3), ground(0.56, 0) + 0.036 + i * 0.066 + (1 - placed) * 0.2 + gone * (0.5 + drift * 0.35), Math.sin(drift) * gone * 0.5);
        layer.rotation.set(gone * (3 + drift), gone * 2, gone * (2 + drift));
        material.opacity = 1 - smooth(0.6, 1, gone);
      });
    },
  };
}

function renameJob(rig: Rig): Job {
  const CYCLE = 12;
  const STEP = 0.17;
  const cells: Array<[number, number]> = [];
  for (let i = -3; i <= 3; i += 1) {
    cells.push([i, i]);
    if (i !== 0) cells.push([i, -i]);
  }
  cells.sort((a, b) => b[1] - a[1] || a[0] - b[0]).reverse();
  const props = new THREE.Group();
  const stones = cells.map(([x, y], i) => {
    const material = fading('#d6d1c6');
    const stone = block(0.15, 0.15, 0.15, material);
    props.add(stone);
    return { stone, material, x: 0.3 + x * STEP, y: 0.52 + y * STEP, at: 0.02 + i * 0.043 };
  });
  return {
    props,
    tools: [],
    stands: [-0.42, 0.18],
    play(t) {
      const k = (t % CYCLE) / CYCLE;
      rig.body.position.y = 0.3 + Math.abs(Math.sin(t * 3.4)) * 0.07;
      rig.armR.rotation.x = -2 + Math.sin(t * 3.4) * 0.45;
      rig.armL.rotation.x = -0.3 + Math.sin(t * 3.4) * 0.4;
      stones.forEach(({ stone, material, x, y, at }) => {
        const fall = smooth(at, at + 0.05, k);
        const landed = fall ** 2;
        const bounce = k > at + 0.05 ? Math.max(0, Math.sin(((k - at - 0.05) / 0.025) * Math.PI)) * 0.05 * (k < at + 0.075 ? 1 : 0) : 0;
        stone.visible = k >= at;
        stone.position.set(x, y + (1 - landed) * 3.6 + bounce, -0.34);
        stone.rotation.z = (1 - landed) * 2.2;
        material.opacity = 1 - smooth(0.9, 0.96, k);
      });
    },
  };
}

export function marsCamp(ship: THREE.Group, glow: THREE.Texture) {
  const group = new THREE.Group();
  const rig = spaceman();
  group.add(rig.man);

  const flyer = roadster();
  flyer.car.scale.setScalar(0.62);
  flyer.car.position.set(-1, ground(-1, -0.12) - 0.03, -0.12);
  flyer.car.rotation.set(-0.06, 0, CAR_SLOPE);
  const set = television();
  set.tv.scale.setScalar(0.68);
  set.tv.position.set(-0.2, ground(-0.2, 0.84) - 0.01, 0.84);
  set.tv.rotation.set(0.12, 0.16, 0.1);
  let lastPicture = 0;
  ship.scale.setScalar(0.62);
  ship.position.set(1.05, 0.19, -0.42);
  group.add(flyer.car, set.tv, ship);
  const dust = clay('#6e2c1a');
  [[0.6, 0.02, 0.86, 0.09], [0.95, -0.05, 0.5, 0.06], [-0.2, 0.02, -0.75, 0.1]].forEach(([x, y, z, size]) => group.add(rock(size, dust, [x, y + ground(x, z), z])));

  const cash = dollarSign();
  const notes = banknotes();
  const idle = idleJob(rig);
  const jobs: Record<MarsTaskId, Job> = { dig: digJob(rig, cash), blunt: bluntJob(rig, glow), stack: stackJob(rig, notes), rename: renameJob(rig) };
  const all = [idle, ...MARS_TASKS.map((task) => jobs[task.id])];
  all.forEach((job) => group.add(job.props));

  let current = idle;
  let started = 0;
  const show = (job: Job, now: number) => {
    current = job;
    started = now;
    all.forEach((other) => {
      other.props.visible = other === job;
      other.tools.forEach((tool) => {
        tool.visible = other === job;
      });
    });
    rig.man.position.set(job.stands[0], ground(job.stands[0], job.stands[1]), job.stands[1]);
  };
  show(idle, 0);

  return {
    group,
    man: rig.man,
    body: rig.body,
    setJob(id: MarsTaskId | null, now: number) {
      rig.man.visible = rig.man.visible || id !== null;
      show(id ? jobs[id] : idle, now);
    },
    update(now: number) {
      flyer.fly(now);
      if (current !== idle && now - lastPicture > TV_FRAME_MS) {
        lastPicture = now;
        set.draw(now);
      }
      rig.stand();
      current.play((now - started) / 1000);
    },
  };
}
