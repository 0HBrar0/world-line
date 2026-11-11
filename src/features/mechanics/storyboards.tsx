import type { ReactNode } from 'react';
import { worldLineById } from '../../data/selectors';
import { Arrow, Beat, Cross, DIM, Draw, Fade, Flicker, Flow, GEL, Hole, INK, Knot, Label, Memory, Meter, MeterSeq, Microwave, Move, Note, OCHRE, Packet, PAPER, Person, Phone, RED, RED_SOFT, Rope, ropeThread, SHADE, SLATE, Spin, Tag, Thread, TimeAxis, Tv, Wash } from './scene';

// One component per canon step, keyed by mechanic id and steps[].order. Each frame shows one idea in
// plain pictures: labels are diagram words or words from that step's caption, and numbers come from canon.json.
// Things are shown going where the caption says they go, in the order it says, so the picture can be
// followed without the words.

type Frame = () => ReactNode;

const value = (id: string) => worldLineById(id)?.divergence ?? null;
const OPENING = 'wl-beta-1130426';
const AFTER_FIRST = 'wl-alpha-0571024';
const AFTER_LOTTERY = 'wl-alpha-0571015';
const BETA_LINE = 'wl-beta-1130205';

const Banana = () => <path d="M-40 -14 C-22 40, 30 40, 44 -2 C22 18, -14 18, -30 -18 Z" fill={OCHRE} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />;
const Film = ({ color = RED }: { color?: string }) => <rect x="-10" y="-8" width="20" height="16" fill={color} />;

/** A row of people whose memories are rewritten in turn, beside one who keeps theirs. */
function Rewrite({ keeper, keeperLabel }: { keeper: string; keeperLabel: string }) {
  return (
    <>
      {[100, 220, 340].map((x, i) => (
        <g key={x}>
          <Person x={x} y={150} color={DIM} />
          <Memory x={x} y={204} tone="old" />
          <Beat at={0.7 + i * 0.5} from={{ opacity: 0, scaleX: 0.3 }}>
            <Memory x={x} y={204} tone="new" />
          </Beat>
        </g>
      ))}
      <Beat at={0.7}>
        <Tag x={220} y={274} color={RED}>
          memories rewritten
        </Tag>
      </Beat>
      <line x1="428" x2="428" y1="50" y2="310" stroke={INK} strokeWidth="1.5" strokeDasharray="5 6" />
      <circle cx="515" cy="165" r="86" fill="none" stroke={INK} strokeDasharray="10 8" strokeWidth="2" />
      <Person x={515} y={150} />
      <Memory x={515} y={204} tone="old" />
      <Beat at={2.3}>
        <Tag x={515} y={292}>{keeperLabel}</Tag>
      </Beat>
      <Label x={515} y={64}>
        {keeper}
      </Label>
    </>
  );
}

const dmail: Frame[] = [
  () => (
    <>
      <Phone x={40} y={96} lit />
      <Draw d="M 112 132 q 12 20 0 40" color={RED} width={2.5} at={0.2} dur={0.3} />
      <Draw d="M 123 120 q 22 32 0 64" color={RED} width={2.5} at={0.4} dur={0.3} />
      <Tag x={71} y={252} color={RED}>
        1 call
      </Tag>
      <Phone x={318} y={124} scale={0.6} />
      <Draw d="M 355 166 H 400" width={3} dur={0.3} />
      <Label x={337} y={112} size={14} color={DIM}>
        wired in
      </Label>
      <Microwave x={400} y={96} />
      <Arrow from={[148, 152]} to={[178, 152]} color={RED} at={0.7} dur={0.3} />
      <Beat at={0.9} from={{ opacity: 0, scale: 0.7 }}>
        <rect x="188" y="120" width="64" height="64" fill={PAPER} stroke={INK} strokeWidth="2.5" />
        <text x="220" y="166" textAnchor="middle" fill={INK} fontSize="42" fontFamily="var(--font-mono)">
          #
        </text>
        <Tag x={220} y={252}>2 press #</Tag>
      </Beat>
      <Arrow from={[262, 152]} to={[306, 152]} color={RED} at={1.4} dur={0.3} />
      <Beat at={1.9}>
        <Microwave x={400} y={96} timer="00:00" />
        <Tag x={495} y={252}>3 enter a time</Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <rect x="40" y="26" width="410" height="312" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      <line x1="40" x2="450" y1="184" y2="184" stroke={INK} strokeWidth="2.5" />
      <Label x={54} y={50} anchor="start" size={15} color={DIM}>
        upstairs
      </Label>
      <Label x={54} y={208} anchor="start" size={15} color={DIM}>
        downstairs
      </Label>
      <Microwave x={66} y={58} />
      <Tv x={262} y={214} on={false} />
      <Beat at={0.7} from={{ opacity: 0 }}>
        <Tv x={262} y={214} on />
        <Tag x={545} y={270} color={SLATE}>
          must be on
        </Tag>
      </Beat>
      <Beat at={1.5} from={{ opacity: 0 }}>
        <Flow d="M 347 214 C 347 150, 320 117, 258 117" />
        <Microwave x={66} y={58} on />
      </Beat>
      <Beat at={1.9}>
        <Tag x={545} y={117} color={RED}>
          feeds the effect
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Hole x={320} y={180} r={66} />
      <g opacity="0.3">
        <Note x={90} y={96} />
        <g transform="translate(90 276)">
          <Banana />
        </g>
      </g>
      <Move route={[[90, 96], [240, 112], [318, 176]]} at={0.3} dur={1.1} vanish shrink={0.3}>
        <Note />
      </Move>
      <Move route={[[322, 176], [400, 112], [545, 96]]} at={1.4} dur={1}>
        <Note />
      </Move>
      <Beat at={2.3}>
        <Tag x={520} y={42} color={RED}>
          data slips through
        </Tag>
      </Beat>
      <Move route={[[90, 276], [240, 252], [318, 186]]} at={2.4} dur={1.1} vanish shrink={0.3}>
        <Banana />
      </Move>
      <Move route={[[322, 186], [400, 252], [545, 276]]} at={3.5} dur={1}>
        <ellipse rx="46" ry="19" fill={GEL} stroke={INK} strokeWidth="1.5" />
      </Move>
      <Beat at={4.4}>
        <Tag x={500} y={328} color={GEL}>
          solid things turn to gel
        </Tag>
      </Beat>
    </>
  ),
  () => {
    const cell = 12.5;
    const boxes = [45, 233, 421];
    return (
      <>
        <Label x={45} y={44} anchor="start">
          your text
        </Label>
        {Array.from({ length: 36 }, (_, i) => {
          const piece = Math.floor(i / 12);
          const top = 45 + i * cell;
          return (
            <g key={i}>
              <Fade at={0.8 + piece * 0.5} to={0.12}>
                <rect x={top} y="58" width="10.5" height="24" fill={INK} />
              </Fade>
              <Move route={[[top, 58], [boxes[piece] + 8 + (i % 12) * cell, 196]]} at={0.8 + piece * 0.5} dur={0.8}>
                <rect width="10.5" height="24" fill={INK} />
              </Move>
            </g>
          );
        })}
        {boxes.map((x, p) => (
          <g key={x}>
            <rect x={x} y="186" width="164" height="44" fill="none" stroke={INK} strokeWidth="2" />
            <Beat at={1.6 + p * 0.5}>
              <Label x={x + 82} y={256} size={16}>
                12 bytes
              </Label>
            </Beat>
          </g>
        ))}
        <Draw d="M 45 274 V 284 H 585 V 274" width={2} at={3} dur={0.6} />
        <Beat at={3.3}>
          <Label x={315} y={312}>
            about 36 bytes
          </Label>
        </Beat>
        <Fade at={2.6} to={0.18}>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={45 + (36 + i) * cell} y="58" width="10.5" height="24" fill={RED} />
          ))}
        </Fade>
        <Beat at={2.8}>
          <Tag x={520} y={124} color={RED}>
            extra text is lost
          </Tag>
        </Beat>
      </>
    );
  },
  () => {
    const at = (i: number): [number, number] => [580 - (i * 520) / 7, 190];
    return (
      <>
        <TimeAxis y={236} ticks={8} />
        {[1, 2, 3, 4].map((i) => (
          <Beat key={i} at={0.3 + (i - 1) * 0.65} from={{ opacity: 0 }}>
            <path d={`M ${at(i - 1)[0]} 226 Q ${(at(i - 1)[0] + at(i)[0]) / 2} 196, ${at(i)[0]} 226`} fill="none" stroke={RED} strokeWidth="2.5" strokeDasharray="4 6" />
          </Beat>
        ))}
        <Move route={[at(0), at(1), at(1), at(2), at(2), at(3), at(3), at(4)]} at={0.3} dur={2.6}>
          <Note />
        </Move>
        <Beat at={3}>
          <Tag x={356} y={112} color={RED}>
            one-hour steps
          </Tag>
        </Beat>
      </>
    );
  },
  () => (
    <>
      <MeterSeq y={14} values={[value(OPENING), value(AFTER_FIRST)]} at={1.5} />
      <Thread d="M 40 250 H 240" />
      <Fade at={1.6} to={0.25}>
        <Thread d="M 240 250 H 600" />
      </Fade>
      <Beat at={2}>
        <Label x={596} y={284} anchor="end" color={DIM}>
          old history
        </Label>
      </Beat>
      <Move route={[[450, 150], [240, 212]]} dur={0.8}>
        <Note />
      </Move>
      <circle cx="240" cy="250" r="8" fill={RED} />
      <Beat at={0.8}>
        <Tag x={200} y={302} color={RED}>
          a past decision changes
        </Tag>
      </Beat>
      <Draw d="M 240 250 C 340 250, 380 150, 600 150" color={RED} width={4} at={1.2} dur={1.2} />
      <Beat at={2.2}>
        <Tag x={500} y={112} color={RED}>
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
      <Person x={120} y={220} scale={1.5} />
      <path d="M 84 152 A 37 37 0 0 1 156 152" fill="none" stroke={RED} strokeWidth="7" strokeLinecap="round" />
      <rect x="150" y="146" width="12" height="24" rx="3" fill={RED} />
      <Beat at={0.2}>
        <Tag x={290} y={56} color={RED}>
          memories
        </Tag>
      </Beat>
      <Packet x={480} y={170} size={110} plain />
      {[0, 1, 2, 3].map((i) => (
        <Move key={i} route={[[166, 146], [300, 96 + i * 22], [456 + (i % 2) * 48, 150 + Math.floor(i / 2) * 40]]} at={0.5 + i * 0.3} dur={1.1}>
          <Film />
        </Move>
      ))}
      <Beat at={2.3}>
        <Tag x={480} y={262} color={RED}>
          data
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <g opacity="0.3">
        <Packet x={92} y={178} size={96} />
      </g>
      <Hole x={320} y={178} r={90} />
      <Label x={320} y={52}>hacked collider</Label>
      <Move route={[[92, 178], [318, 178]]} at={0.3} dur={1} vanish shrink={0.25}>
        <Packet size={96} />
      </Move>
      <Move route={[[322, 178], [545, 178]]} at={1.5} dur={0.9}>
        <Packet size={26} />
      </Move>
      <Beat at={2.4}>
        <Tag x={540} y={234} color={RED}>
          D-Mail size
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <rect x="60" y="208" width="190" height="42" fill="url(#hatch)" opacity="0.6" />
      <TimeAxis y={250} />
      <line x1="250" x2="250" y1="92" y2="262" stroke={RED} strokeWidth="2.5" strokeDasharray="6 6" />
      <line x1="415" x2="415" y1="241" y2="259" stroke={INK} strokeWidth="2" />
      <Draw d="M 250 86 V 74 H 580 V 86" color={RED} width={2.5} at={0.2} dur={0.6} />
      <Beat at={0.6}>
        <Tag x={415} y={46} color={RED}>
          up to 48 hours
        </Tag>
      </Beat>
      <Phone x={290} y={150} scale={0.7} />
      <Label x={312} y={294} size={16}>
        own phone
      </Label>
      <Move route={[[580, 200], [312, 190]]} at={1} dur={1.4}>
        <Packet size={26} />
      </Move>
    </>
  ),
  () => (
    <>
      <Person x={170} y={226} scale={1.5} />
      <Beat at={0.2}>
        <Phone x={214} y={124} scale={0.6} lit />
      </Beat>
      <Tag x={170} y={320}>past self answers</Tag>
      <Memory x={170} y={74} tone="old" width={120} />
      <g opacity="0.3">
        <Packet x={540} y={150} size={30} />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <Move key={i} route={[[530, 150], [390, 96 + i * 26], [250, 150], [200, 160]]} at={0.8 + i * 0.3} dur={1.2} vanish>
          <Film />
        </Move>
      ))}
      <Beat at={2.4} from={{ opacity: 0, scaleX: 0.3 }}>
        <Memory x={170} y={74} tone="new" width={120} />
      </Beat>
      <Beat at={2.6}>
        <Tag x={450} y={270} color={RED}>
          memories written in
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Meter y={18} value={value(AFTER_FIRST)} />
      <Label x={320} y={98}>
        reading stays the same
      </Label>
      <TimeAxis y={236} />
      <Draw d="M 572 228 C 480 130, 320 130, 246 226 M 262 200 L 246 226 L 274 222" color={RED} at={0.3} dur={1.3} />
      <Beat at={1}>
        <Tag x={410} y={150} color={RED}>
          the leap
        </Tag>
      </Beat>
      <circle cx="240" cy="236" r="7" fill={RED} />
      <Beat at={2}>
        <path d="M 240 236 C 300 236, 330 312, 430 322" fill="none" stroke={INK} strokeWidth="3" strokeDasharray="7 7" />
        <Label x={372} y={348} anchor="start">
          what they do next can
        </Label>
      </Beat>
    </>
  ),
];

const readingSteiner: Frame[] = [
  () => (
    <>
      <MeterSeq y={12} values={[value(OPENING), value(AFTER_FIRST)]} at={1.4} />
      <Label x={44} y={118} anchor="start" size={15} color={DIM}>
        old line
      </Label>
      <Thread d="M 40 136 H 600" width={2} opacity={0.3} />
      <Thread d="M 40 136 H 320" color={RED} width={4} />
      <Label x={44} y={300} anchor="start" size={15} color={DIM}>
        new line
      </Label>
      <Thread d="M 40 270 H 600" width={2} opacity={0.3} />
      <Move route={[[540, 86], [320, 108]]} dur={0.7}>
        <Note scale={0.8} />
      </Move>
      <Draw d="M 320 136 C 326 190, 334 250, 342 270 H 600" color={RED} width={4} at={0.8} dur={1.3} />
      <Beat at={2.1}>
        <Tag x={480} y={220} color={RED}>
          moved to a new line
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <path d="M 70 240 V 130 L 130 90 L 190 130 V 240 Z" fill={DIM} />
      <Person x={320} y={190} color={DIM} />
      <Memory x={500} y={160} tone="old" width={130} />
      <Move route={[[40, 0], [600, 0]]} at={0.5} dur={2} vanish>
        <line y1="56" y2="250" stroke={RED} strokeWidth="3" strokeDasharray="8 6" />
      </Move>
      <Beat at={0.85} from={{ opacity: 0 }}>
        <path d="M 70 240 V 130 L 130 90 L 190 130 V 240 Z M 150 108 V 84 H 168 V 120" fill={RED} />
      </Beat>
      <Beat at={1.5} from={{ opacity: 0 }}>
        <Person x={320} y={190} color={RED} />
      </Beat>
      <Beat at={2.15} from={{ opacity: 0 }}>
        <Memory x={500} y={160} tone="new" width={130} />
      </Beat>
      <Label x={130} y={282}>places</Label>
      <Label x={320} y={282}>people</Label>
      <Label x={500} y={282}>memories</Label>
      <Beat at={2.7}>
        <Tag x={320} y={36} color={RED}>
          all become the new line's
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <rect x="30" y="50" width="240" height="270" fill={SHADE} fillOpacity="0.5" stroke={INK} strokeWidth="2" />
      <rect x="370" y="50" width="240" height="270" fill="none" stroke={RED} strokeWidth="2" />
      <Label x={150} y={82}>old line</Label>
      <Label x={490} y={82} color={RED}>
        new line
      </Label>
      <Person x={150} y={184} />
      <Memory x={150} y={240} tone="old" width={130} />
      <Person x={490} y={184} color={RED} />
      <Memory x={490} y={240} tone="new" width={130} />
      <Move route={[[150, 240], [490, 240]]} at={0.7} dur={1.4}>
        <Memory x={0} y={0} tone="old" width={130} />
      </Move>
      <Beat at={2.2}>
        <Tag x={320} y={296}>copied over</Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Wash at={0.5}>
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={40 + (i % 6) * 95} y={30 + Math.floor(i / 6) * 76} width="85" height="66" fill={[RED_SOFT, SLATE, GEL, OCHRE, RED, DIM][(i * 5 + (i >> 2)) % 6]} opacity="0.6" />
        ))}
      </Wash>
      <Beat at={0.5} from={{ opacity: 0 }}>
        <Spin x={320} y={170} dur={7}>
          <circle r="118" fill="none" stroke={INK} strokeOpacity="0.6" strokeWidth="3" strokeDasharray="34 18" />
          <circle r="94" fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="2" strokeDasharray="14 12" />
        </Spin>
      </Beat>
      <circle cx="320" cy="170" r="78" fill={PAPER} stroke={INK} strokeWidth="2" />
      <Person x={320} y={184} />
      <Beat at={1.8}>
        <Tag x={320} y={330}>a few seconds</Tag>
      </Beat>
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
          <rect x={x - 96} y="50" width="192" height="256" fill={PAPER} stroke={INK} strokeWidth="2" />
          {i === 0 && <path d={`M ${x - 62} 130 H ${x + 62}`} stroke={INK} strokeWidth="3" />}
          {i === 0 && <circle cx={x + 4} cy="130" r="6" fill={INK} />}
          {i === 1 && <Person x={x} y={136} scale={0.9} />}
          {i === 2 && <Draw d={`M ${x + 56} 150 C ${x + 20} 80, ${x - 20} 80, ${x - 56} 150`} at={0.8} />}
          {lines.map((text, n) => (
            <Label key={text} x={x} y={208 + n * 25}>
              {text}
            </Label>
          ))}
          <Cross x={x} y={270} />
        </Beat>
      ))}
    </>
  ),
  () => (
    <>
      <Person x={180} y={236} color={DIM} />
      <Person x={460} y={236} color={DIM} />
      {[180, 460].map((x, i) => (
        <Beat key={x} at={0.5 + i * 0.7} from={{ opacity: 0, scale: 0.6 }}>
          <circle cx={x + 62} cy={140} r="7" fill={PAPER} stroke={INK} strokeWidth="2" />
          <rect x={x - 66} y="48" width="172" height="76" rx="34" fill={PAPER} stroke={INK} strokeWidth="2" />
          <Flicker at={1 + i * 0.7}>
            <Memory x={x + 20} y={76} tone="old" width={110} />
          </Flicker>
        </Beat>
      ))}
      <Tag x={180} y={320}>deja vu</Tag>
      <Tag x={460} y={320}>dreams</Tag>
    </>
  ),
];

const attractorField: Frame[] = [
  () => (
    <>
      <Rope y={108} flatTo={170} knotX={760} />
      <Rope y={256} flatTo={170} knotX={760} at={0.5} />
      <Beat at={1.6}>
        <Label x={320} y={30} size={15} color={DIM}>
          A picture for the idea, not literal
        </Label>
        <Tag x={500} y={170}>one field</Tag>
        <Tag x={500} y={318}>another field</Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Rope y={100} flatTo={200} knotX={490} />
      <Rope y={264} flatTo={200} knotX={490} />
      <Beat at={1.3} from={{ opacity: 0, scale: 0.5 }}>
        <Knot x={490} y={100} />
        <Knot x={490} y={264} />
      </Beat>
      <Beat at={1.6}>
        <Label x={514} y={106} anchor="start">
          Beta
        </Label>
        <Label x={514} y={270} anchor="start">
          Alpha
        </Label>
        <Tag x={500} y={182} color={RED}>
          a fixed outcome
        </Tag>
      </Beat>
    </>
  ),
  () => {
    const y = (i: number) => ropeThread(186, i, 6, 22);
    return (
      <>
        <Rope y={186} spread={22} flatTo={360} knotX={540} opacity={0.4} />
        <Knot x={540} y={186} />
        <Draw d={`M 34 ${y(1)} H 120 L 132 ${y(2)} H 230 L 242 ${y(3)} H 360 C 430 ${y(3)}, 470 186, 536 186`} color={RED} width={4} at={0.7} dur={1.6} />
        <Draw d={`M 34 ${y(5)} H 170 L 182 ${y(4)} H 300 L 312 ${y(5)} H 360 C 430 ${y(5)}, 470 186, 536 186`} color={SLATE} width={4} at={2.5} dur={1.6} />
        <Beat at={2.3}>
          <Tag x={200} y={40}>different time or method</Tag>
        </Beat>
        <Beat at={4.2}>
          <Tag x={520} y={250} color={RED}>
            same outcome
          </Tag>
        </Beat>
      </>
    );
  },
  () => {
    const alpha = (i: number) => ropeThread(280, i, 6, 12);
    const beta = ropeThread(76, 3, 5, 10);
    return (
      <>
        <Rope y={76} count={5} spread={10} flatTo={610} />
        <Rope y={280} spread={12} flatTo={610} />
        <path d="M 30 176 H 610" stroke={RED} strokeWidth="2" strokeDasharray="9 8" />
        <Label x={40} y={164} anchor="start" color={RED} size={16}>
          about 1%
        </Label>
        <Draw
          d={`M 40 ${alpha(5)} H 100 L 108 ${alpha(4)} H 160 L 168 ${alpha(3)} H 220 L 228 ${alpha(2)} H 280 L 288 ${alpha(1)} H 340 L 348 ${alpha(0)} H 400 C 436 ${alpha(0)}, 440 ${beta}, 476 ${beta} H 600`}
          color={RED}
          width={4}
          at={0.8}
          dur={2.6}
        />
        <Beat at={1.6}>
          <Tag x={190} y={214}>undo every D-Mail</Tag>
        </Beat>
        <Beat at={3.4}>
          <Tag x={530} y={130} color={RED}>
            crossed
          </Tag>
        </Beat>
      </>
    );
  },
  () => (
    <>
      <Rope y={70} count={5} spread={10} flatTo={220} knotX={470} />
      <Rope y={290} count={5} spread={10} flatTo={220} knotX={470} />
      <Knot x={470} y={70} />
      <Knot x={470} y={290} />
      <path d="M 30 200 H 610" stroke={RED} strokeWidth="2" strokeDasharray="9 8" strokeOpacity="0.7" />
      <Draw d="M 34 170 H 596" color={RED} width={4} at={0.8} dur={1.6} />
      <Beat at={2.4} from={{ opacity: 0, scale: 0.5 }}>
        <circle cx="600" cy="170" r="9" fill={RED} />
        <Tag x={520} y={136} color={RED}>
          Steins Gate
        </Tag>
      </Beat>
      <Beat at={2.9}>
        <Tag x={300} y={236}>avoids both knots</Tag>
      </Beat>
    </>
  ),
];

const divergenceMeter: Frame[] = [
  () => (
    <>
      <Meter y={104} value={value(AFTER_FIRST)} size="lg" />
      <Draw d="M 246 200 V 214 H 492 V 200" color={RED} width={3} at={0.9} dur={0.8} />
      <Beat at={1.5}>
        <Tag x={369} y={250} color={RED}>
          six decimal places
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <MeterSeq y={40} values={[value(AFTER_FIRST), value(AFTER_LOTTERY)]} at={1.5} size="lg" />
      <Thread d="M 60 226 H 580" width={2} opacity={0.3} />
      <Thread d="M 60 284 H 580" width={2} opacity={0.3} />
      <Thread d="M 60 226 H 300" color={RED} width={4} />
      <Draw d="M 300 226 C 306 245, 314 270, 322 284 H 580" color={RED} width={4} at={0.8} dur={1.3} />
      <Beat at={1.5}>
        <Tag x={470} y={190} color={RED}>
          world line shifts
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Person x={150} y={236} />
      <circle cx="214" cy="172" r="7" fill={PAPER} stroke={INK} strokeWidth="2" />
      <rect x="22" y="22" width="256" height="138" rx="26" fill={PAPER} stroke={INK} strokeWidth="2" />
      <Meter x={150} y={34} value={value(AFTER_FIRST)} />
      <Meter x={150} y={94} value={value(AFTER_LOTTERY)} />
      <Tag x={150} y={304} color={RED}>
        Okabe sees both
      </Tag>
      <Person x={490} y={236} color={DIM} />
      <circle cx="554" cy="146" r="7" fill={PAPER} stroke={INK} strokeWidth="2" />
      <rect x="362" y="56" width="256" height="76" rx="26" fill={PAPER} stroke={INK} strokeWidth="2" />
      <Meter x={490} y={68} value={value(AFTER_LOTTERY)} />
      <Tag x={490} y={304}>everyone else: one</Tag>
    </>
  ),
  () => (
    <>
      <Meter x={166} y={132} value={value(AFTER_FIRST)} />
      <Meter x={474} y={132} value={value(BETA_LINE)} />
      <Beat at={0.6}>
        <rect x="84" y="126" width="30" height="52" fill="none" stroke={RED} strokeWidth="3" />
        <Tag x={166} y={224}>Alpha</Tag>
      </Beat>
      <Beat at={1.4}>
        <rect x="392" y="126" width="30" height="52" fill="none" stroke={RED} strokeWidth="3" />
        <Tag x={474} y={224}>Beta</Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <Meter y={118} value=" .------" size="lg" />
      <Beat at={0.6}>
        <rect x="150" y="110" width="56" height="84" fill="none" stroke={INK} strokeWidth="3" strokeDasharray="7 6" />
        <Tag x={182} y={240}>first digit blank</Tag>
      </Beat>
      <Beat at={1.5}>
        <rect x="496" y="110" width="48" height="84" fill="none" stroke={RED} strokeWidth="3" strokeDasharray="7 6" />
        <Cross x={520} y={152} size={13} />
        <Tag x={470} y={74} color={RED}>
          past the sixth decimal
        </Tag>
      </Beat>
    </>
  ),
];

const timeMachine: Frame[] = [
  () => (
    <>
      <rect x="196" y="60" width="248" height="240" rx="100" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      <Hole x={320} y={180} r={68} />
      <Beat at={0.4}>
        <Tag x={100} y={90}>gravity fields</Tag>
        <Draw d="M 140 108 L 224 150" width={2} at={0.5} dur={0.5} />
      </Beat>
      <Beat at={0.9}>
        <Tag x={550} y={90}>coordinates</Tag>
        <Draw d="M 510 108 L 416 150" width={2} at={1} dur={0.5} />
      </Beat>
      <Beat at={1.5}>
        <Tag x={320} y={332} color={RED}>
          Kerr black holes
        </Tag>
      </Beat>
    </>
  ),
  () => (
    <>
      <rect x="130" y="116" width="340" height="130" rx="6" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      <rect x="470" y="156" width="18" height="50" fill={INK} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={146 + i * 78} y="132" width="68" height="98" fill="none" stroke={INK} strokeWidth="1.5" />
          <Fade at={i > 1 ? 1.2 + (3 - i) * 1.2 : 99} to={i > 1 ? 0 : 1}>
            <rect x={146 + i * 78} y="132" width="68" height="98" fill={GEL} />
          </Fade>
        </g>
      ))}
      {[3, 2].map((i, n) => (
        <Beat key={i} at={1.2 + n * 1.2}>
          <Label x={180 + i * 78} y={104} size={15} color={RED}>{`trip ${n + 1}`}</Label>
        </Beat>
      ))}
      <Beat at={0.5}>
        <Tag x={300} y={56} color={GEL}>
          each trip uses fuel
        </Tag>
      </Beat>
      <Beat at={3.4}>
        <Tag x={300} y={300} color={RED}>
          unused for a year, it stops
        </Tag>
      </Beat>
    </>
  ),
  () => <Rewrite keeper="traveller" keeperLabel="not reconstructed" />,
  () => (
    <>
      <MeterSeq y={36} values={[value('wl-beta-1130205'), value('wl-beta-1130209'), value('wl-beta-1130212')]} at={1.1} every={1.5} size="lg" />
      <Thread d="M 120 262 H 520" width={2} opacity={0.3} />
      {[200, 320, 440].map((x) => (
        <circle key={x} cx={x} cy="262" r="6" fill={INK} />
      ))}
      {[0, 1].map((n) => (
        <g key={n}>
          <Draw d={`M ${200 + n * 120} 262 Q ${260 + n * 120} 196, ${320 + n * 120} 262`} color={RED} at={0.7 + n * 1.5} dur={0.6} />
          <Beat at={1.1 + n * 1.5}>
            <Label x={260 + n * 120} y={212} size={16} color={RED}>{`trip ${n + 1}`}</Label>
          </Beat>
        </g>
      ))}
    </>
  ),
  () => (
    <>
      <TimeAxis y={220} />
      <Arrow from={[400, 104]} to={[130, 104]} color={RED} width={4} at={0.4} dur={0.9} />
      <Beat at={1}>
        <Tag x={265} y={68} color={RED}>
          further into the past
        </Tag>
      </Beat>
      <Move route={[[420, 160], [150, 160]]} at={0.6} dur={1.5}>
        <rect x="-50" y="-22" width="100" height="44" rx="22" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      </Move>
      <Beat at={1.8}>
        <Arrow from={[450, 104]} to={[570, 104]} color={DIM} width={4} at={1.8} dur={0.4} />
        <Cross x={510} y={104} />
        <Tag x={510} y={68} color={RED}>
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
  attractor_field: 1,
  divergence_meter: 0,
  time_machine: 0,
};
