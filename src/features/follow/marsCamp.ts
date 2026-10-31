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

/** An all-steel wedge of a pickup: one flat folded line over the top, on four chunky wheels. */
function steelTruck() {
  const truck = new THREE.Group();
  const LENGTH_SIDE: Array<[number, number]> = [[-0.72, 0.13], [0.72, 0.13], [0.74, 0.3], [0.66, 0.34], [-0.12, 0.62], [-0.72, 0.36]];
  const side = new THREE.Shape(LENGTH_SIDE.map(([x, y]) => new THREE.Vector2(x, y)));
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(side, { depth: 0.5, bevelEnabled: false }), clay('#b4b8c0', 0.2));
  hull.position.z = -0.25;
  const glass = new THREE.Shape([[0.42, 0.42], [-0.12, 0.6], [-0.44, 0.47], [-0.42, 0.42]].map(([x, y]) => new THREE.Vector2(x, y)));
  const panes = new THREE.Mesh(new THREE.ExtrudeGeometry(glass, { depth: 0.52, bevelEnabled: false }), clay('#20242c', 0.1));
  panes.position.z = -0.26;
  const lamp = block(0.012, 0.018, 0.48, new THREE.MeshBasicMaterial({ color: '#e8f2ff', toneMapped: false }), [0.742, 0.31, 0]);
  truck.add(hull, panes, lamp);
  const tyre = clay('#1e1d20', 0.06);
  [-0.42, 0.42].forEach((x) => {
    [-0.27, 0.27].forEach((z) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.11, 8), tyre);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.14, z);
      truck.add(wheel);
    });
  });
  return truck;
}

/** The painting on the ground: a steel rocket coming down on its flame above a parked truck, all in one brush. */
function paintedCanvas() {
  return painted(
    (c) => {
      const sky = c.createLinearGradient(0, 0, 0, 340);
      sky.addColorStop(0, '#120a24');
      sky.addColorStop(0.55, '#4a2348');
      sky.addColorStop(1, '#e0824a');
      c.fillStyle = sky;
      c.fillRect(0, 0, 512, 360);
      c.fillStyle = '#fff';
      for (let i = 0; i < 70; i += 1) c.fillRect((i * 149) % 512, (i * 83) % 190, i % 7 ? 1.5 : 3, i % 7 ? 1.5 : 3);
      c.fillStyle = '#7fc4ff';
      c.beginPath();
      c.arc(92, 74, 30, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#3f9a6c';
      c.beginPath();
      c.ellipse(84, 68, 13, 9, 0.5, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#a84a26';
      c.beginPath();
      c.moveTo(0, 296);
      c.quadraticCurveTo(170, 256, 300, 288);
      c.quadraticCurveTo(420, 312, 512, 276);
      c.lineTo(512, 360);
      c.lineTo(0, 360);
      c.fill();
      const fire = c.createLinearGradient(0, 214, 0, 296);
      fire.addColorStop(0, '#fff4c8');
      fire.addColorStop(0.5, '#ff9a2e');
      fire.addColorStop(1, 'rgba(255,90,20,0)');
      c.fillStyle = fire;
      c.beginPath();
      c.moveTo(322, 214);
      c.lineTo(366, 214);
      c.lineTo(344, 300);
      c.fill();
      c.fillStyle = '#dfe3ea';
      c.beginPath();
      c.moveTo(344, 26);
      c.quadraticCurveTo(372, 62, 372, 96);
      c.lineTo(372, 214);
      c.lineTo(316, 214);
      c.lineTo(316, 96);
      c.quadraticCurveTo(316, 62, 344, 26);
      c.fill();
      c.fillStyle = '#9aa0aa';
      c.fillRect(356, 96, 16, 118);
      c.fillStyle = '#23262e';
      c.fillRect(316, 124, 56, 6);
      c.beginPath();
      c.moveTo(316, 176);
      c.lineTo(292, 222);
      c.lineTo(316, 214);
      c.moveTo(372, 176);
      c.lineTo(396, 222);
      c.lineTo(372, 214);
      c.fill();
      c.fillStyle = '#c3c7cf';
      c.beginPath();
      c.moveTo(40, 300);
      c.lineTo(46, 262);
      c.lineTo(112, 232);
      c.lineTo(226, 276);
      c.lineTo(232, 300);
      c.fill();
      c.fillStyle = '#20242c';
      c.beginPath();
      c.moveTo(72, 262);
      c.lineTo(112, 244);
      c.lineTo(168, 266);
      c.fill();
      c.beginPath();
      c.arc(78, 302, 15, 0, Math.PI * 2);
      c.arc(194, 302, 15, 0, Math.PI * 2);
      c.fill();
    },
    512,
    360,
  );
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

  const truck = steelTruck();
  truck.scale.setScalar(0.62);
  truck.position.set(-0.66, ground(-0.66, -0.62) - 0.03, -0.62);
  truck.rotation.set(-0.34, 0, 0.36);
  const art = new THREE.Group();
  art.add(block(0.82, 0.05, 0.62, clay('#b08a3c', 0.25)), new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.54), new THREE.MeshBasicMaterial({ map: paintedCanvas() })));
  art.children[1].rotation.x = -Math.PI / 2;
  art.children[1].position.y = 0.027;
  art.scale.setScalar(0.72);
  art.position.set(-0.42, ground(-0.42, 0.74) + 0.09, 0.74);
  art.rotation.set(0.74, 0.1, 0.2);
  ship.scale.setScalar(0.62);
  ship.position.set(1.05, 0.19, -0.42);
  group.add(truck, art, rock(0.09, clay('#6e2c1a'), [-0.42, ground(-0.42, 0.56) + 0.03, 0.56]), ship);
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
      rig.stand();
      current.play((now - started) / 1000);
    },
  };
}
