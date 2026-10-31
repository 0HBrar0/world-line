import type { ReactNode } from 'react';
import { worldLineById } from '../../data/selectors';
import { Beat, Bundle, Cross, DANGER, DIM, Draw, Fade, Flow, Fly, GEL, GOLD, Hole, INK, Knot, Label, Memory, MEMORY_NEW, MEMORY_OLD, Meter, Microwave, NIXIE, Note, Person, Phone, PINK, SKY, Spin, Tag, Thread, TimeAxis, Tv, VIOLET } from './scene';

// One component per canon step, keyed by mechanic id and steps[].order. Each frame shows one idea in
// plain pictures: labels are diagram words or words from that step's caption, and numbers come from canon.json.

type Frame = () => ReactNode;

const value = (id: string) => worldLineById(id)?.divergence ?? null;
const AFTER_FIRST = 'wl-alpha-0571024';
const AFTER_LOTTERY = 'wl-alpha-0571015';
const BETA_LINE = 'wl-beta-1130205';

const Cube = ({ x, y, size, color = PINK }: { x: number; y: number; size: number; color?: string }) => (
  <g transform={`translate(${x - size / 2} ${y - size / 2})`}>
    <rect width={size} height={size} rx={size * 0.16} fill={color} fillOpacity="0.2" stroke={color} strokeWidth="3" />
    <path d={`M${size * 0.28} ${size * 0.36} H${size * 0.72} M${size * 0.28} ${size * 0.64} H${size * 0.72}`} stroke={color} strokeWidth="3" strokeLinecap="round" />
  </g>
);

/** Rows of people whose memories are rewritten in turn, with one who keeps theirs. */
function Rewrite({ keeper, keeperLabel, shield }: { keeper: string; keeperLabel: string; shield?: boolean }) {
  return (
    <>
      {[100, 220, 340].map((x, i) => (
        <g key={x}>
          <Person x={x} y={150} />
          <Memory x={x} y={204} colors={MEMORY_OLD} />
          <Beat at={0.7 + i * 0.5} from={{ opacity: 0, scaleX: 0.3 }}>
            <Memory x={x} y={204} colors={MEMORY_NEW} />
          </Beat>
        </g>
      ))}
      <Beat at={0.7}>
        <Tag x={220} y={270} color={SKY}>
          memories rewritten
        </Tag>
      </Beat>
      {shield && <circle cx="515" cy="165" r="88" fill={NIXIE} fillOpacity="0.07" stroke={NIXIE} strokeDasharray="10 8" strokeWidth="2.5" />}
      <Person x={515} y={150} color={NIXIE} />
      <Memory x={515} y={204} colors={MEMORY_OLD} />
      <Beat at={2.3}>
        <Tag x={515} y={288} color={NIXIE}>
          {keeperLabel}
        </Tag>
      </Beat>
      <Label x={515} y={70} color={NIXIE}>
        {keeper}
      </Label>
    </>
  );
}

const dmail: Frame[] = [
  () => (
    <>
      <Phone x={56} y={100} lit />
      <Tag x={87} y={258} color={NIXIE}>
        call
      </Tag>
      <Draw d="M 130 156 H 190" at={0.3} dur={0.5} />
      <Beat at={0.8} from={{ opacity: 0, scale: 0.7 }}>
        <rect x="200" y="118" width="76" height="76" rx="16" fill="#3b2410" stroke={NIXIE} strokeWidth="2" />
        <text x="238" y="172" textAnchor="middle" fill={NIXIE} fontSize="44" fontFamily="var(--font-mono)">
          #
        </text>
        <Tag x={238} y={258} color={NIXIE}>
          press #
        </Tag>
      </Beat>
      <Draw d="M 286 156 H 372" at={1.4} dur={0.5} />
      <Microwave x={384} y={97} />
      <Beat at={1.9}>
        <Microwave x={384} y={97} timer="00:00" />
        <Tag x={479} y={258} color={NIXIE}>
          enter a time
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <rect x="40" y="26" width="410" height="312" rx="14" fill="#0c0f20" stroke={DIM} strokeWidth="2" />
      <line x1="40" x2="450" y1="180" y2="180" stroke={DIM} strokeWidth="3" />
      <Label x={60} y={60} anchor="start">
        upstairs
      </Label>
      <Label x={60} y={214} anchor="start">
        downstairs
      </Label>
      <Microwave x={60} y={72} />
      <Tv x={258} y={208} on />
      <Beat at={0.8}>
        <Flow d="M 343 208 C 343 150, 320 130, 254 130" />
        <Microwave x={60} y={72} on />
      </Beat>
      <Tag x={548} y={264} color={SKY}>
        must be on
      </Tag>
      <Beat at={1.2}>
        <Tag x={548} y={130} color={NIXIE}>
          feeds the effect
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Hole x={320} y={180} r={70} />
      <Note x={100} y={92} />
      <Draw d="M 148 96 C 230 96, 260 130, 310 170 C 370 130, 420 96, 490 96" at={0.3} dur={1.3} />
      <Beat at={1.5}>
        <Note x={540} y={92} />
        <Tag x={530} y={150} color={NIXIE}>
          data slips through
        </Tag>
      </Beat>
      <path d="M 66 244 C 84 300, 138 300, 152 256 C 130 276, 92 276, 76 240 Z" fill={GOLD} />
      <Draw d="M 168 276 C 230 276, 260 230, 310 192 C 370 230, 420 276, 480 276" color={GOLD} at={1.9} dur={1.3} />
      <Beat at={3.1}>
        <ellipse cx="540" cy="276" rx="52" ry="22" fill={GEL} />
        <Tag x={490} y={326} color={GEL}>
          solid things turn to gel
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        const piece = Math.floor(i / 4);
        const end = 70 + i * 36 + piece * 28;
        return (
          <Fly key={i} at={0.9 + piece * 0.3} dx={(i * 38 - i * 36 - piece * 28) + 0} dy={-120}>
            <rect x={end} y="190" width="32" height="46" rx="6" fill={NIXIE} />
          </Fly>
        );
      })}
      {[0, 1, 2].map((p) => (
        <Beat key={p} at={1.5 + p * 0.3}>
          <rect x={60 + p * 172} y="178" width="162" height="70" rx="12" fill="none" stroke={NIXIE} strokeWidth="2" />
          <Label x={141 + p * 172} y={280}>{`piece ${p + 1}`}</Label>
        </Beat>
      ))}
      <Label x={70} y={52} anchor="start">
        your text
      </Label>
      <Fade at={2.2} to={0.14}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={70 + (12 + i) * 38} y="70" width="32" height="46" rx="6" fill={DANGER} />
        ))}
      </Fade>
      <Beat at={2.6}>
        <Tag x={500} y={146} color={DANGER}>
          extra text is lost
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <TimeAxis y={230} ticks={8} />
      <Beat at={2.5}>
        <Tag x={356} y={120} color={NIXIE}>
          one-hour steps
        </Tag>
      </Beat>
      {[1, 2, 3, 4].map((i) => {
        const x = 580 - (i * 520) / 7;
        return (
          <Beat key={i} at={0.2 + i * 0.42} from={{ opacity: 0 }}>
            <path d={`M ${x + 74} 222 Q ${x + 37} 176, ${x} 222`} fill="none" stroke={NIXIE} strokeWidth="2.5" strokeDasharray="4 6" />
          </Beat>
        );
      })}
      <Fly at={0.2} dur={1.9} dx={297}>
        <Note x={283} y={186} />
      </Fly>
    </>
  ),
  () => (
    <>
      <Meter y={18} value={value(AFTER_FIRST)} />
      <Thread d="M 40 240 H 240" />
      <Fade at={1.6} to={0.28}>
        <Thread d="M 240 240 H 600" color={DIM} />
      </Fade>
      <Beat at={2}>
        <Label x={590} y={276} anchor="end" color={DIM}>
          old history
        </Label>
      </Beat>
      <Fly at={0} dur={0.8} dx={200} dy={-110}>
        <Note x={240} y={200} />
      </Fly>
      <circle cx="240" cy="240" r="9" fill={NIXIE} />
      <Beat at={0.8}>
        <Tag x={200} y={290} color={NIXIE}>
          a past decision changes
        </Tag>
      </Beat>
      <Draw d="M 240 240 C 340 240, 380 130, 600 130" color={NIXIE} width={4} at={1.2} dur={1.2} />
      <Beat at={2.2}>
        <Tag x={500} y={90} color={NIXIE}>
          history rebuilt
        </Tag>
      </Beat>
    </>
  ),
  () => <Rewrite keeper="Okabe" keeperLabel="unchanged" />,
];

const timeLeap: Frame[] = [
  () => (
    <>
      <Person x={130} y={200} color={INK} scale={1.5} />
      <path d="M 96 134 A 36 36 0 0 1 164 134" fill="none" stroke={PINK} strokeWidth="7" strokeLinecap="round" />
      {[0, 1, 2].map((i) => (
        <Draw key={i} d={`M 170 ${130 + i * 10} C 260 ${90 + i * 36}, 320 ${190 - i * 20}, 412 ${150 + i * 10}`} color={PINK} width={2.5} at={0.3 + i * 0.12} dur={1.2} />
      ))}
      <Beat at={0.2}>
        <Tag x={290} y={72} color={PINK}>
          memories
        </Tag>
      </Beat>
      <Beat at={1.5} from={{ opacity: 0, scale: 0.7 }}>
        <Cube x={480} y={160} size={110} />
        <Tag x={480} y={254} color={PINK}>
          data
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Cube x={92} y={170} size={100} />
      <Draw d="M 150 170 H 206" color={PINK} at={0.2} dur={0.5} />
      <Hole x={320} y={170} r={92} color={SKY} />
      <Label x={320} y={46} color={SKY}>
        hacked collider
      </Label>
      <Draw d="M 434 170 H 500" color={PINK} at={1.2} dur={0.5} />
      <Beat at={1.7} from={{ opacity: 0, scale: 0.4 }}>
        <Cube x={540} y={170} size={30} />
        <Tag x={530} y={232} color={PINK}>
          D-Mail size
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <TimeAxis y={250} from={60} />
      <Phone x={200} y={146} scale={0.72} lit />
      <Label x={222} y={294}>
        own phone
      </Label>
      <Draw d="M 222 74 H 580" color={PINK} width={2.5} at={0.2} dur={0.6} />
      <path d="M 222 66 V 84 M 580 66 V 84" stroke={PINK} strokeWidth="2.5" />
      <Beat at={0.6}>
        <Tag x={400} y={40} color={PINK}>
          up to this far back
        </Tag>
      </Beat>
      <Fly at={1} dur={1.4} dx={300}>
        <Cube x={280} y={198} size={28} />
      </Fly>
    </>
  ),
  () => (
    <>
      <Person x={180} y={210} color={INK} scale={1.5} />
      <Beat at={0.2}>
        <Phone x={214} y={92} scale={0.62} lit />
      </Beat>
      <Tag x={180} y={300} color={INK}>
        past self answers
      </Tag>
      <Cube x={530} y={150} size={34} />
      {[0, 1, 2].map((i) => (
        <Draw key={i} d={`M 508 ${140 + i * 10} C 420 ${90 + i * 40}, 300 ${180 - i * 30}, 216 ${136 + i * 8}`} color={PINK} width={2.5} at={0.8 + i * 0.12} dur={1.3} />
      ))}
      <Beat at={2} from={{ opacity: 0 }}>
        <circle cx="180" cy="150" r="44" fill={PINK} opacity="0.35" />
        <Tag x={440} y={270} color={PINK}>
          memories written in
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Meter y={22} value={value(AFTER_FIRST)} />
      <Label x={320} y={92}>
        reading stays the same
      </Label>
      <TimeAxis y={230} from={60} />
      <Draw d="M 572 222 C 480 120, 320 120, 240 222" color={PINK} at={0.3} dur={1.2} />
      <Beat at={1}>
        <Tag x={410} y={190} color={PINK}>
          the leap
        </Tag>
      </Beat>
      <circle cx="240" cy="230" r="8" fill={PINK} />
      <Beat at={2}>
        <path d="M 240 230 C 300 230, 330 310, 430 320" fill="none" stroke={NIXIE} strokeWidth="3" strokeDasharray="7 7" />
        <Label x={440} y={326} anchor="start" color={NIXIE}>
          what they do next can
        </Label>
      </Beat>
    </>
  ),
];

const readingSteiner: Frame[] = [
  () => (
    <>
      <Label x={60} y={92} anchor="start">
        old line
      </Label>
      <Thread d="M 40 120 H 320" />
      <Fade at={1.5} to={0.18}>
        <Thread d="M 320 120 H 600" color={DIM} />
      </Fade>
      <Fly at={0} dur={0.8} dy={-60}>
        <Note x={320} y={78} />
      </Fly>
      <Draw d="M 320 124 C 320 200, 340 240, 400 250" color={NIXIE} width={4} at={0.8} dur={0.8} />
      <Draw d="M 400 250 H 600" color={SKY} width={4} at={1.5} dur={0.8} />
      <Beat at={2}>
        <Tag x={500} y={296} color={SKY}>
          new line
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <g>
        <path d="M 70 240 V 130 L 130 90 L 190 130 V 240 Z" fill={NIXIE} />
        <Person x={320} y={190} color={NIXIE} />
        <Memory x={500} y={160} colors={MEMORY_OLD} width={130} />
      </g>
      <Beat at={0.6} from={{ opacity: 0 }}>
        <path d="M 70 240 V 130 L 130 90 L 190 130 V 240 Z" fill={SKY} />
      </Beat>
      <Beat at={1.2} from={{ opacity: 0 }}>
        <Person x={320} y={190} color={SKY} />
      </Beat>
      <Beat at={1.8} from={{ opacity: 0 }}>
        <Memory x={500} y={160} colors={MEMORY_NEW} width={130} />
      </Beat>
      <Label x={130} y={276}>
        places
      </Label>
      <Label x={320} y={276}>
        people
      </Label>
      <Label x={500} y={276}>
        memories
      </Label>
      <Beat at={2.3}>
        <Tag x={320} y={44} color={SKY}>
          all become the new line's
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <rect x="30" y="50" width="240" height="270" rx="18" fill="#2b1c10" fillOpacity="0.6" />
      <rect x="370" y="50" width="240" height="270" rx="18" fill="#10283a" fillOpacity="0.7" />
      <Label x={150} y={84}>
        old line
      </Label>
      <Label x={490} y={84}>
        new line
      </Label>
      <Person x={150} y={180} color={NIXIE} />
      <Memory x={150} y={236} colors={MEMORY_OLD} width={130} />
      <Person x={490} y={180} color={SKY} />
      <Memory x={490} y={236} colors={MEMORY_NEW} width={130} />
      <Fly at={0.6} dur={1.4} dx={-340}>
        <Memory x={490} y={236} colors={MEMORY_OLD} width={130} />
      </Fly>
      <Beat at={2.1}>
        <Tag x={320} y={290} color={NIXIE}>
          copied over
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <g style={{ filter: 'grayscale(1) blur(1.5px)' }}>
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={40 + (i % 6) * 95} y={30 + Math.floor(i / 6) * 76} width="85" height="66" rx="10" fill={[NIXIE, SKY, GEL, PINK, GOLD, VIOLET][(i * 5 + (i >> 2)) % 6]} opacity="0.5" />
        ))}
      </g>
      <Spin x={320} y={170} dur={7}>
        <circle r="118" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeDasharray="34 18" />
        <circle r="92" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="14 12" />
      </Spin>
      <circle cx="320" cy="170" r="78" fill="#0a0c18" fillOpacity="0.85" />
      <Person x={320} y={184} color={NIXIE} />
    </>
  ),
  () => (
    <>
      {[
        { x: 112, lines: ['changes', 'too small'] },
        { x: 320, lines: ['physical time', 'travellers'] },
        { x: 528, lines: ['time leaps'] },
      ].map(({ x, lines }, i) => (
        <Beat key={x} at={i * 0.4}>
          <rect x={x - 96} y="50" width="192" height="256" rx="20" fill="#121633" stroke={DIM} />
          {i === 0 && <path d={`M ${x - 62} 130 H ${x + 62}`} stroke={SKY} strokeWidth="3" />}
          {i === 0 && <circle cx={x + 4} cy="130" r="6" fill={SKY} />}
          {i === 1 && <Person x={x} y={136} color={SKY} scale={0.9} />}
          {i === 2 && <Draw d={`M ${x + 56} 150 C ${x + 20} 80, ${x - 20} 80, ${x - 56} 150`} color={PINK} at={0.8} />}
          {lines.map((line, n) => (
            <Label key={line} x={x} y={208 + n * 25}>
              {line}
            </Label>
          ))}
          <Cross x={x} y={270} />
        </Beat>
      ))}
    </>
  ),
  () => (
    <>
      <Person x={180} y={232} />
      <Person x={460} y={232} />
      {[180, 460].map((x, i) => (
        <Beat key={x} at={0.5 + i * 0.7} from={{ opacity: 0, scale: 0.6 }}>
          <circle cx={x + 66} cy={134} r="9" fill={DIM} />
          <rect x={x - 66} y="46" width="172" height="74" rx="30" fill="#1a1f42" stroke={DIM} />
          <g opacity="0.55">
            <Memory x={x + 20} y={72} colors={MEMORY_OLD} width={110} />
          </g>
        </Beat>
      ))}
      <Tag x={180} y={318} color={NIXIE}>
        deja vu
      </Tag>
      <Tag x={460} y={318} color={NIXIE}>
        dreams
      </Tag>
    </>
  ),
];

const attractorField: Frame[] = [
  () => (
    <>
      <Bundle y={104} color={SKY} end={600} />
      <Bundle y={256} color={VIOLET} end={600} at={0.5} />
      <Beat at={1.5}>
        <Label x={320} y={32}>
          A picture for the idea, not literal
        </Label>
        <Tag x={500} y={150} color={SKY}>
          one field
        </Tag>
        <Tag x={500} y={302} color={VIOLET}>
          another field
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Bundle y={96} color={SKY} />
      <Bundle y={264} color={VIOLET} />
      <Beat at={1.1} from={{ opacity: 0, scale: 0.5 }}>
        <Knot x={506} y={96} color={SKY} />
        <Knot x={506} y={264} color={VIOLET} />
      </Beat>
      <Beat at={1.5}>
        <Label x={552} y={102} anchor="start" color={SKY}>
          Alpha
        </Label>
        <Label x={552} y={270} anchor="start" color={VIOLET}>
          Beta
        </Label>
        <Tag x={500} y={180} color={INK}>
          a fixed outcome
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <g opacity="0.45">
        <Bundle y={190} color={SKY} end={510} spread={20} at={0} />
      </g>
      <Knot x={530} y={190} color={SKY} />
      <Draw d="M 40 120 C 170 40, 300 300, 500 192" color={NIXIE} at={0.6} dur={1.2} />
      <Draw d="M 40 200 C 200 330, 340 60, 500 190" color={GOLD} at={1.9} dur={1.2} />
      <Draw d="M 40 270 C 160 200, 340 300, 500 188" color={PINK} at={3.2} dur={1.2} />
      <Beat at={1.8}>
        <Tag x={190} y={36} color={NIXIE}>
          different time or method
        </Tag>
      </Beat>
      <Beat at={4.2}>
        <Tag x={530} y={260} color={SKY}>
          same outcome
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Bundle y={74} color={VIOLET} end={600} count={7} spread={9} />
      <Bundle y={286} color={SKY} end={600} count={7} spread={9} />
      <path d="M 30 180 H 610" stroke={NIXIE} strokeWidth="2.5" strokeDasharray="9 8" />
      <Label x={40} y={168} anchor="start" color={NIXIE} size={17}>
        the edge of the field
      </Label>
      <Draw d="M 90 286 C 130 215, 170 215, 210 286" color={DANGER} at={0.9} dur={0.8} />
      <Draw d="M 240 286 C 340 280, 360 90, 470 76" color={NIXIE} width={5} at={1.9} dur={1.2} />
      <Beat at={3}>
        <Tag x={510} y={134} color={NIXIE}>
          crossed
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Bundle y={78} color={VIOLET} end={480} count={7} spread={9} />
      <Bundle y={282} color={SKY} end={480} count={7} spread={9} />
      <Knot x={500} y={78} color={VIOLET} />
      <Knot x={500} y={282} color={SKY} />
      <Draw d="M 34 180 H 590" color={GOLD} width={5} at={0.8} dur={1.6} />
      <Beat at={2.3} from={{ opacity: 0, scale: 0.5 }}>
        <circle cx="596" cy="180" r="24" fill={GOLD} opacity="0.2" />
        <circle cx="596" cy="180" r="10" fill={GOLD} />
        <Tag x={480} y={144} color={GOLD}>
          Steins Gate
        </Tag>
      </Beat>
    </>
  ),
];

const divergenceMeter: Frame[] = [
  () => (
    <>
      <Meter y={112} value={value(AFTER_FIRST)} size="lg" />
      <Draw d="M 232 200 V 214 H 478 V 200" color={NIXIE} width={3} at={0.9} dur={0.8} />
      <Beat at={1.5}>
        <Tag x={355} y={250} color={NIXIE}>
          six decimal places
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Meter y={52} value={value(AFTER_FIRST)} size="lg" />
      <Draw d="M 320 138 V 190 M 304 176 L 320 192 L 336 176" color={INK} at={0.7} dur={0.7} />
      <Beat at={1.2}>
        <Meter y={214} value={value(AFTER_LOTTERY)} size="lg" />
      </Beat>
      <Beat at={0.9}>
        <Tag x={470} y={164} color={INK}>
          world line shifts
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Person x={150} y={218} color={NIXIE} />
      <rect x="22" y="28" width="256" height="128" rx="28" fill="#1a1f42" stroke={NIXIE} />
      <Meter x={150} y={42} value={value(AFTER_FIRST)} />
      <Meter x={150} y={98} value={value(AFTER_LOTTERY)} />
      <Tag x={150} y={286} color={NIXIE}>
        Okabe sees both
      </Tag>
      <Person x={490} y={218} />
      <rect x="362" y="56" width="256" height="72" rx="28" fill="#1a1f42" stroke={DIM} />
      <Meter x={490} y={70} value={value(AFTER_LOTTERY)} />
      <Tag x={490} y={286} color={INK}>
        everyone else: one
      </Tag>
    </>
  ),
  () => (
    <>
      <Meter x={166} y={132} value={value(AFTER_FIRST)} />
      <Meter x={474} y={132} value={value(BETA_LINE)} />
      <Beat at={0.6}>
        <rect x="72" y="124" width="30" height="50" rx="8" fill="none" stroke={SKY} strokeWidth="3" />
        <Tag x={166} y={220} color={SKY}>
          Alpha
        </Tag>
      </Beat>
      <Beat at={1.4}>
        <rect x="380" y="124" width="30" height="50" rx="8" fill="none" stroke={VIOLET} strokeWidth="3" />
        <Tag x={474} y={220} color={VIOLET}>
          Beta
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Meter y={118} value=" .------" size="lg" />
      <Beat at={0.6}>
        <rect x="156" y="112" width="52" height="78" rx="12" fill="none" stroke={GOLD} strokeWidth="3" strokeDasharray="7 6" />
        <Tag x={182} y={236} color={GOLD}>
          first digit blank
        </Tag>
      </Beat>
      <Beat at={1.5}>
        <rect x="492" y="112" width="48" height="78" rx="12" fill="none" stroke={DANGER} strokeWidth="3" strokeDasharray="7 6" />
        <Cross x={516} y={151} size={13} />
        <Tag x={470} y={76} color={DANGER}>
          past the sixth decimal
        </Tag>
      </Beat>
    </>
  ),
];

const timeMachine: Frame[] = [
  () => (
    <>
      <rect x="196" y="60" width="248" height="240" rx="100" fill="url(#fill-body)" stroke={INK} strokeOpacity="0.4" strokeWidth="2" />
      <Hole x={320} y={180} r={68} color={SKY} />
      <Beat at={0.4}>
        <Tag x={100} y={90} color={INK}>
          gravity fields
        </Tag>
        <Draw d="M 140 112 L 224 150" color={INK} width={2} at={0.5} dur={0.5} />
      </Beat>
      <Beat at={0.9}>
        <Tag x={550} y={90} color={INK}>
          coordinates
        </Tag>
        <Draw d="M 510 112 L 416 150" color={INK} width={2} at={1} dur={0.5} />
      </Beat>
      <Beat at={1.5}>
        <Tag x={320} y={330} color={SKY}>
          Kerr black holes
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <rect x="130" y="110" width="340" height="130" rx="22" fill="url(#fill-body)" stroke={INK} strokeOpacity="0.4" strokeWidth="2" />
      <rect x="470" y="150" width="20" height="50" rx="6" fill={DIM} />
      {[0, 1, 2, 3].map((i) => (
        <Fade key={i} at={i > 1 ? 1.8 - (i - 2) * 0.9 : 99} to={i > 1 ? 0.12 : 1}>
          <rect x={146 + i * 78} y="126" width="68" height="98" rx="10" fill={GEL} />
        </Fade>
      ))}
      <Beat at={0.9}>
        <Tag x={300} y={60} color={GEL}>
          each trip uses fuel
        </Tag>
      </Beat>
      <Beat at={2.4}>
        <Tag x={300} y={294} color={DANGER}>
          unused for a year, it stops
        </Tag>
      </Beat>
    </>
  ),
  () => <Rewrite keeper="traveller" keeperLabel="not reconstructed" shield />,
  () => (
    <>
      <Meter x={260} y={32} value={value('wl-beta-1130205')} />
      <Draw d="M 380 56 C 440 66, 440 136, 380 146" color={SKY} at={0.5} dur={0.7} />
      <Beat at={0.9}>
        <Meter x={260} y={132} value={value('wl-beta-1130209')} />
        <Tag x={496} y={100} color={SKY}>
          trip
        </Tag>
      </Beat>
      <Draw d="M 380 156 C 440 166, 440 236, 380 246" color={SKY} at={1.5} dur={0.7} />
      <Beat at={1.9}>
        <Meter x={260} y={232} value={value('wl-beta-1130212')} />
        <Tag x={496} y={200} color={SKY}>
          trip
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <TimeAxis y={200} from={60} to={580} />
      <rect x="290" y="122" width="100" height="44" rx="22" fill="url(#fill-body)" stroke={INK} strokeOpacity="0.5" />
      <Draw d="M 282 144 H 110 M 130 126 L 110 144 L 130 162" color={SKY} width={5} at={0.4} dur={0.9} />
      <Beat at={1}>
        <Tag x={190} y={92} color={SKY}>
          further into the past
        </Tag>
      </Beat>
      <Beat at={1.5}>
        <path d="M 398 144 H 540 M 520 126 L 540 144 L 520 162" fill="none" stroke={DIM} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <Cross x={470} y={144} />
        <Tag x={470} y={92} color={DANGER}>
          one-way
        </Tag>
      </Beat>
    </>
  ),
];

export const STORYBOARDS: Record<string, Frame[]> = {
  dmail,
  time_leap: timeLeap,
  reading_steiner: readingSteiner,
  attractor_field: attractorField,
  divergence_meter: divergenceMeter,
  time_machine: timeMachine,
};

/** The frame that best sums up each mechanic, for its tile on the index page. */
export const PREVIEW_STEP: Record<string, number> = {
  dmail: 2,
  time_leap: 1,
  reading_steiner: 2,
  attractor_field: 0,
  divergence_meter: 0,
  time_machine: 0,
};
