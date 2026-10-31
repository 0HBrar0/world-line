import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MechIconGroup } from '../../components/MechIcon';
import { worldLineById } from '../../data/selectors';
import { Crossed, Crt, DayTiles, Figure, GEL, GOLD, INK, Knot, Label, LOOP, Meter, Microwave, moving, NIXIE, Packet, Phone, PINK, Ring, Rope, SKY, Tape, type SceneProps } from './scene';

// One component per canon step, keyed by mechanic id and steps[].order. Storyboards are from
// docs/visual-concept.md section 5. Numbers on stage are read from canon.json, never typed here.

const value = (id: string) => worldLineById(id)?.divergence ?? null;
const AFTER_FIRST = 'wl-alpha-0571024';
const AFTER_LOTTERY = 'wl-alpha-0571015';

const TAPE_OLD = ['#ff8a1f', '#ff8a1f', '#e6c84a', '#ff8a1f', '#e6c84a'];
const TAPE_NEW = ['#7aa7ff', '#7fd1ae', '#7aa7ff', '#7fd1ae', '#7aa7ff'];

const dmail: Array<(p: SceneProps) => ReactNode> = [
  ({ reduce }) => (
    <>
      <Phone x={120} y={120} lit reduce={reduce} />
      <motion.path d="M 170 156 H 260" stroke={NIXIE} strokeWidth="2" strokeDasharray="6 5" {...moving(reduce, { strokeDashoffset: -33 }, LOOP(1))} />
      <Microwave x={270} y={110} timer="00:00" />
      <g transform="translate(450 120)">
        {['#', '0', '1', '2'].map((d, i) => (
          <g key={d} transform={`translate(${(i % 2) * 44} ${Math.floor(i / 2) * 44})`}>
            <rect width="38" height="38" rx="5" fill={d === '#' ? '#3a2a18' : '#1a2027'} stroke={d === '#' ? NIXIE : '#4a5763'} />
            <text x="19" y="25" textAnchor="middle" fill={NIXIE} fontSize="17" fontFamily="var(--font-mono)">
              {d}
            </text>
          </g>
        ))}
      </g>
    </>
  ),
  ({ reduce }) => (
    <>
      <line x1="60" x2="580" y1="178" y2="178" stroke="#4a5763" strokeWidth="3" />
      <Label x={70} y={40} anchor="start">
        Lab
      </Label>
      <Label x={70} y={210} anchor="start">
        Shop below
      </Label>
      <Microwave x={260} y={70} />
      <Crt x={265} y={210} on reduce={reduce} />
      <motion.path d="M 330 210 V 160" stroke={NIXIE} strokeWidth="3" strokeDasharray="7 6" {...moving(reduce, { strokeDashoffset: -39 }, LOOP(1.2))} />
    </>
  ),
  ({ reduce }) => (
    <>
      <Ring x={320} y={150} r={60} reduce={reduce} />
      <motion.g {...moving(reduce, { x: [0, 150], scaleY: [1, 1, 0.45], opacity: [1, 1, 1] }, { duration: 2.2, repeat: Infinity, repeatDelay: 1 })}>
        <path d="M 130 120 C 150 170, 200 170, 215 130 C 195 150, 160 150, 140 118 Z" fill={reduce ? 'none' : GOLD} stroke={GOLD} strokeWidth="2" />
      </motion.g>
      <ellipse cx="500" cy="150" rx="46" ry="20" fill={GEL} opacity="0.85" />
      <g transform="translate(150 250)">
        <MechIconGroup kind="dmail" color={NIXIE} scale={2} />
      </g>
      <motion.path d="M 180 250 H 460" stroke={NIXIE} strokeWidth="2" strokeDasharray="6 6" {...moving(reduce, { strokeDashoffset: -48 }, LOOP(1.4))} />
      <g transform="translate(490 250)">
        <MechIconGroup kind="dmail" color={NIXIE} scale={2} />
      </g>
    </>
  ),
  ({ reduce }) => (
    <>
      {[0, 1, 2].map((i) => (
        <motion.g key={i} {...moving(reduce, { opacity: 1, y: 0 }, { delay: i * 0.3, duration: 0.4 }, { opacity: 0, y: 12 })}>
          <rect x={90 + i * 134} y="130" width="124" height="70" rx="6" fill="#3a2a18" stroke={NIXIE} strokeWidth="2" />
          <Label x={152 + i * 134} y={172} color={NIXIE} size={22}>
            12 B
          </Label>
        </motion.g>
      ))}
      <motion.g opacity={0.25} {...moving(reduce, { opacity: [0.5, 0] }, { duration: 1.6, repeat: Infinity })}>
        <rect x="498" y="130" width="60" height="70" rx="6" fill="none" stroke={INK} strokeDasharray="4 4" />
      </motion.g>
    </>
  ),
  ({ reduce }) => (
    <>
      <DayTiles x={110} y={170} count={8} lit={[2]} />
      <Label x={550} y={150}>
        now
      </Label>
      <motion.g {...moving(reduce, { x: [0, -300] }, { duration: 2, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' })}>
        {[0, 1, 2].map((i) => (
          <Packet key={i} x={500 + i * 24} y={120} />
        ))}
      </motion.g>
    </>
  ),
  ({ reduce }) => (
    <>
      <Meter x={210} y={70} value={value(AFTER_FIRST)} />
      <motion.g {...moving(reduce, { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: 1.6, repeat: Infinity, repeatDelay: 1.4 })}>
        <DayTiles x={110} y={170} count={8} lit={[1, 3, 4, 6]} />
      </motion.g>
      {reduce && <DayTiles x={110} y={230} count={8} lit={[]} />}
    </>
  ),
  ({ reduce }) => (
    <>
      {[130, 250, 370].map((x, i) => (
        <g key={x}>
          <Figure x={x} y={150} />
          <motion.g {...moving(reduce, { opacity: [1, 0, 1] }, { duration: 2.4, repeat: Infinity, delay: i * 0.1 })}>
            <Tape x={x - 44} y={196} colors={TAPE_NEW} width={88} />
          </motion.g>
        </g>
      ))}
      <Figure x={520} y={150} color={NIXIE} />
      <Tape x={476} y={196} colors={TAPE_OLD} width={88} />
    </>
  ),
];

const timeLeap: Array<(p: SceneProps) => ReactNode> = [
  ({ reduce }) => (
    <>
      <Figure x={170} y={190} color={PINK} />
      {[0, 1, 2].map((i) => (
        <motion.path key={i} d={`M 195 ${140 + i * 12} C 280 ${120 + i * 20}, 320 ${170 - i * 10}, 410 ${160}`} fill="none" stroke={PINK} strokeWidth="2" {...moving(reduce, { pathLength: 1 }, { duration: 1.2, delay: i * 0.05 }, { pathLength: 0 })} />
      ))}
      <rect x="420" y="124" width="74" height="74" rx="8" fill="#2b1a26" stroke={PINK} strokeWidth="2.5" />
    </>
  ),
  ({ reduce }) => (
    <>
      <rect x="84" y="134" width="60" height="60" rx="8" fill="#2b1a26" stroke={PINK} strokeWidth="2.5" />
      <path d="M 150 164 H 240" stroke={PINK} strokeWidth="2" strokeDasharray="6 5" />
      <Ring x={320} y={164} r={70} color={SKY} reduce={reduce} />
      <path d="M 400 164 H 480" stroke={PINK} strokeWidth="2" strokeDasharray="6 5" />
      <Packet x={500} y={164} color={PINK} size={14} />
    </>
  ),
  ({ reduce }) => (
    <>
      <DayTiles x={200} y={190} count={5} lit={[2, 3]} />
      <Label x={450} y={170}>
        now
      </Label>
      <motion.g {...moving(reduce, { x: [0, -130] }, { duration: 1.8, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' })}>
        <g transform="translate(430 130)">
          <circle r="16" fill="#2b1a26" stroke={PINK} />
          <MechIconGroup kind="time_leap" color={PINK} scale={1.3} />
        </g>
      </motion.g>
    </>
  ),
  ({ reduce }) => (
    <>
      <Figure x={230} y={190} color={INK} />
      <Phone x={262} y={110} reduce />
      <motion.path d="M 300 110 C 270 80, 250 100, 236 146" fill="none" stroke={PINK} strokeWidth="3" {...moving(reduce, { pathLength: 1 }, { duration: 1.2, repeat: Infinity, repeatDelay: 0.6 }, { pathLength: 0 })} />
      <motion.g {...moving(reduce, { opacity: [1, 0.25] }, { duration: 2, repeat: Infinity, repeatType: 'mirror' })}>
        <Figure x={470} y={190} color={PINK} opacity={0.6} />
      </motion.g>
      <Label x={470} y={250}>
        body stays here
      </Label>
    </>
  ),
  () => (
    <>
      <Meter x={210} y={110} value={value(AFTER_FIRST)} />
      <Label x={320} y={200}>
        The reading does not move during the jump
      </Label>
    </>
  ),
];

const readingSteiner: Array<(p: SceneProps) => ReactNode> = [
  () => <Meter x={210} y={130} value={value(AFTER_FIRST)} />,
  ({ reduce }) => (
    <motion.g {...moving(reduce, { skewX: [0, 6, 0], filter: ['grayscale(0)', 'grayscale(1)', 'grayscale(0)'] }, { duration: 1.2, repeat: Infinity, repeatDelay: 1 })}>
      <DayTiles x={110} y={120} count={8} lit={[1, 2, 5]} />
      <DayTiles x={110} y={180} count={8} lit={[0, 4]} />
    </motion.g>
  ),
  ({ reduce }) => (
    <>
      <rect x="70" y="90" width="200" height="170" rx="8" fill="#1a2027" stroke="#4a5763" />
      <rect x="370" y="90" width="200" height="170" rx="8" fill="#14262a" stroke="#4a5763" />
      <Label x={170} y={80}>
        old line
      </Label>
      <Label x={470} y={80}>
        new line
      </Label>
      <motion.g {...moving(reduce, { x: [0, 300] }, { duration: 1.8, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' })}>
        <Tape x={110} y={165} colors={TAPE_OLD} />
      </motion.g>
    </>
  ),
  ({ reduce }) => (
    <>
      <motion.g style={{ filter: 'grayscale(1)' }} {...moving(reduce, { scale: [1, 1.03, 1], skewX: [0, 6, 0] }, { duration: 1.2, repeat: Infinity, repeatDelay: 0.8 })}>
        <circle cx="320" cy="170" r="110" fill="none" stroke={INK} strokeDasharray="24 12" strokeWidth="4" />
        <circle cx="320" cy="170" r="84" fill="none" stroke={INK} strokeDasharray="10 10" strokeWidth="2" opacity="0.6" />
      </motion.g>
      <Figure x={320} y={190} color={NIXIE} />
    </>
  ),
  () => (
    <>
      <Crossed x={160} y={170}>
        <text x="0" y="8" textAnchor="middle" fill={NIXIE} fontSize="22" fontFamily="var(--font-mono)">
          0.0…
        </text>
      </Crossed>
      <Crossed x={320} y={170}>
        <Figure x={0} y={10} />
      </Crossed>
      <Crossed x={480} y={170}>
        <MechIconGroup kind="time_leap" color={PINK} scale={3} />
      </Crossed>
    </>
  ),
  ({ reduce }) => (
    <>
      {[170, 320, 470].map((x, i) => (
        <g key={x}>
          <Figure x={x} y={190} />
          <motion.g {...moving(reduce, { opacity: [0, 0.35, 0] }, { duration: 3, repeat: Infinity, delay: i * 0.5 })}>
            <Figure x={x + 12} y={182} color={NIXIE} opacity={0.5} />
          </motion.g>
          {reduce && <Figure x={x + 12} y={182} color={NIXIE} opacity={0.2} />}
        </g>
      ))}
    </>
  ),
];

const attractorField: Array<(p: SceneProps) => ReactNode> = [
  ({ reduce }) => (
    <>
      <Rope y={120} color={SKY} reduce={reduce} />
      <Rope y={230} color="#b79cff" reduce={reduce} />
      <Label x={320} y={40}>
        A picture for the idea, not literal
      </Label>
    </>
  ),
  ({ reduce }) => (
    <>
      <Rope y={120} color={SKY} reduce={reduce} />
      <Rope y={230} color="#b79cff" reduce={reduce} />
      <Knot x={490} y={120} color={SKY} label="Alpha" />
      <Knot x={490} y={230} color="#b79cff" label="Beta" />
    </>
  ),
  ({ reduce }) => (
    <>
      <Rope y={170} color={SKY} reduce />
      <Knot x={490} y={170} color={SKY} />
      <motion.path d="M 120 150 C 200 110, 260 210, 330 170 C 380 140, 420 170, 466 170" fill="none" stroke={NIXIE} strokeWidth="3" {...moving(reduce, { pathLength: 1 }, { duration: 1.8, repeat: Infinity, repeatDelay: 0.8 }, { pathLength: 0 })} />
      <motion.g {...moving(reduce, { x: [0, 60] }, { duration: 1.8, repeat: Infinity, repeatDelay: 0.8 })}>
        <rect x="430" y="240" width="74" height="30" rx="4" fill="#1a2027" stroke={INK} />
        <Label x={467} y={260} size={13}>
          +1 day
        </Label>
      </motion.g>
    </>
  ),
  ({ reduce }) => (
    <>
      <Rope y={100} color="#b79cff" reduce />
      <Rope y={250} color={SKY} reduce />
      <line x1="40" x2="600" y1="175" y2="175" stroke={NIXIE} strokeDasharray="7 5" />
      <Label x={596} y={166} anchor="end" color={NIXIE} size={13}>
        1%
      </Label>
      <motion.path d="M 240 250 C 280 200, 320 150, 360 100" fill="none" stroke={NIXIE} strokeWidth="4" {...moving(reduce, { pathLength: 1 }, { duration: 1.2, repeat: Infinity, repeatDelay: 1 }, { pathLength: 0 })} />
    </>
  ),
  ({ reduce }) => (
    <>
      <Rope y={90} color="#b79cff" reduce />
      <Rope y={260} color={SKY} reduce />
      <Knot x={490} y={90} color="#b79cff" />
      <Knot x={490} y={260} color={SKY} />
      <motion.path d="M 40 175 H 600" stroke={GOLD} strokeWidth="4" fill="none" {...moving(reduce, { pathLength: 1 }, { duration: 1.6 }, { pathLength: 0 })} />
    </>
  ),
];

const divergenceMeter: Array<(p: SceneProps) => ReactNode> = [
  () => <Meter x={210} y={130} value={value(AFTER_FIRST)} />,
  () => <Meter x={210} y={130} value={value(AFTER_LOTTERY)} />,
  () => (
    <>
      <Figure x={150} y={140} color={NIXIE} />
      <Meter x={70} y={190} value={value(AFTER_FIRST)} />
      <Meter x={70} y={240} value={value(AFTER_LOTTERY)} />
      <Figure x={480} y={140} />
      <Meter x={380} y={190} value={value(AFTER_LOTTERY)} />
    </>
  ),
  () => (
    <>
      <Meter x={210} y={120} value={value(AFTER_FIRST)} />
      <rect x="206" y="114" width="30" height="46" rx="4" fill="none" stroke={GOLD} strokeWidth="2.5" />
      <Label x={222} y={190} color={GOLD} size={16}>
        Alpha
      </Label>
    </>
  ),
  ({ reduce }) => (
    <>
      <Meter x={210} y={120} value=" .------" />
      <motion.g {...moving(reduce, { opacity: [0, 0.5, 0] }, { duration: 1.1, repeat: Infinity })}>
        <rect x="432" y="122" width="22" height="34" rx="6" fill="none" stroke={NIXIE} strokeDasharray="3 3" />
      </motion.g>
      <Label x={320} y={200}>
        Blank first tube · no seventh digit
      </Label>
    </>
  ),
];

const timeMachine: Array<(p: SceneProps) => ReactNode> = [
  ({ reduce }) => (
    <>
      <rect x="190" y="80" width="260" height="170" rx="60" fill="#12161b" stroke={INK} strokeWidth="3" />
      <Ring x={320} y={165} r={70} color={SKY} reduce={reduce} />
    </>
  ),
  ({ reduce }) => (
    <>
      <rect x="220" y="130" width="200" height="70" rx="8" fill="#12161b" stroke={INK} strokeWidth="3" />
      <rect x="420" y="150" width="12" height="30" fill={INK} />
      {[0, 1, 2, 3].map((i) => (
        <motion.rect key={i} x={230 + i * 46} y="140" width="40" height="50" fill={i < 3 ? GEL : '#1a2027'} stroke={GEL} {...moving(reduce || i !== 2, { opacity: [1, 0.2] }, { duration: 1.2, repeat: Infinity, repeatType: 'mirror' })} />
      ))}
    </>
  ),
  ({ reduce }) => (
    <>
      <motion.g {...moving(reduce, { opacity: [1, 0.3, 1] }, { duration: 2.4, repeat: Infinity })}>
        <DayTiles x={110} y={90} count={8} lit={[1, 4, 6]} />
        <DayTiles x={110} y={240} count={8} lit={[2, 5]} />
      </motion.g>
      <Figure x={320} y={190} color={SKY} />
    </>
  ),
  () => (
    <>
      <Meter x={210} y={70} value={value('wl-beta-1130205')} />
      <Meter x={210} y={130} value={value('wl-beta-1130209')} />
      <Meter x={210} y={190} value={value('wl-beta-1130212')} />
    </>
  ),
  ({ reduce }) => (
    <>
      <motion.path d="M 300 170 H 110 M 130 150 L 110 170 L 130 190" fill="none" stroke={SKY} strokeWidth="6" {...moving(reduce, { pathLength: 1 }, { duration: 1 }, { pathLength: 0 })} />
      <path d="M 340 170 H 530 M 510 150 L 530 170 L 510 190" fill="none" stroke="#4a5763" strokeWidth="6" />
      <path d="M 410 120 L 470 220" stroke="#ff5a6e" strokeWidth="4" />
    </>
  ),
];

export const STORYBOARDS: Record<string, Array<(p: SceneProps) => ReactNode>> = {
  dmail,
  time_leap: timeLeap,
  reading_steiner: readingSteiner,
  attractor_field: attractorField,
  divergence_meter: divergenceMeter,
  time_machine: timeMachine,
};
