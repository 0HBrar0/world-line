import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MARS_TASKS, type MarsTaskId } from './oddities';
import '../../styles/mars.css';

// Scrolling in on Mars opens a hand-drawn scene of the man who lives there, busy with something silly.
// All of it is SVG shapes moved by CSS, in mars.css. None of it is story content.

const LEAVE_MS = 620;
const WHEEL_REST_MS = 700;
const GROUND = 690;

/** The feet are at 0,0. `arms` are drawn over the body, and `visor` lets a scene change the glass. */
function Spaceman({ arms, visor, seated }: { arms: ReactNode; visor?: string; seated?: boolean }) {
  return (
    <g>
      {seated ? (
        <>
          <rect x="-34" y="-96" width="96" height="30" rx="15" fill="url(#mars-suit)" />
          <rect x="34" y="-92" width="28" height="92" rx="13" fill="url(#mars-suit)" />
          <rect x="24" y="-14" width="52" height="16" rx="8" fill="#3a3436" />
        </>
      ) : (
        <>
          <rect x="-36" y="-108" width="30" height="108" rx="13" fill="url(#mars-suit)" />
          <rect x="6" y="-108" width="30" height="108" rx="13" fill="url(#mars-suit)" />
          <rect x="-42" y="-14" width="42" height="16" rx="8" fill="#3a3436" />
          <rect x="4" y="-14" width="42" height="16" rx="8" fill="#3a3436" />
        </>
      )}
      <g>
        <rect x="-68" y="-214" width="30" height="96" rx="10" fill="#8d8a90" />
        <rect x="-46" y="-218" width="92" height="124" rx="30" fill="url(#mars-suit)" />
        <rect x="-16" y="-178" width="34" height="22" rx="4" fill="#d24a3a" />
        <rect x="-10" y="-172" width="22" height="3" fill="#f3e6d8" />
        <rect x="-10" y="-165" width="14" height="3" fill="#f3e6d8" />
        <circle cx="0" cy="-262" r="52" fill="url(#mars-suit)" />
        <ellipse cx="10" cy="-262" rx="38" ry="31" fill="url(#mars-visor)" />
        {visor && <ellipse className={visor} cx="10" cy="-262" rx="38" ry="31" fill="#dfe0dc" />}
        <path d="M-10 -280 Q6 -292 26 -282" stroke="#fff" strokeOpacity="0.6" strokeWidth="5" fill="none" strokeLinecap="round" />
        {arms}
      </g>
    </g>
  );
}

const Arm = ({ length = 92 }: { length?: number }) => (
  <>
    <rect x="-14" y="-14" width={length} height="28" rx="14" fill="url(#mars-suit)" />
    <circle cx={length - 6} cy="0" r="15" fill="#c8c4bc" />
  </>
);

const Bill = ({ x, y, className }: { x: number; y: number; className?: string }) => (
  <g transform={`translate(${x},${y})`}>
    <g className={className}>
      <rect x="-34" y="-16" width="68" height="32" rx="3" fill="#5f9e62" stroke="#2f6238" strokeWidth="2.5" />
      <circle r="9" fill="#a8d6a4" />
      <text y="6" textAnchor="middle" fontSize="16" fontWeight="700" fill="#2f6238">
        $
      </text>
    </g>
  </g>
);

const MoneyBag = ({ className }: { className?: string }) => (
  <g className={className}>
    <path d="M-38 0 Q-56 -52 -18 -72 L-24 -92 L24 -92 L18 -72 Q56 -52 38 0 Z" fill="#b5905a" stroke="#6e5230" strokeWidth="3" />
    <rect x="-24" y="-78" width="48" height="8" rx="4" fill="#6e5230" />
    <text y="-22" textAnchor="middle" fontSize="42" fontWeight="700" fill="#5a4022">
      $
    </text>
  </g>
);

function Dig() {
  return (
    <>
      <ellipse cx="880" cy={GROUND + 8} rx="150" ry="34" fill="#1d0a08" />
      <ellipse cx="880" cy={GROUND + 2} rx="150" ry="30" fill="#34130d" />
      <g transform={`translate(1130,${GROUND + 26})`}>
        <path className="m-mound" d="M-110 0 Q0 -130 110 0 Z" fill="#7a3019" />
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(880,${GROUND})`}>
          <circle className={`m-dirt m-dirt-${i}`} r={8 + i} fill="#8e3d22" />
        </g>
      ))}
      <g transform={`translate(1010,${GROUND + 18})`}>
        <MoneyBag className="m-bag" />
      </g>
      <g transform={`translate(1010,${GROUND + 18})`}>
        <MoneyBag className="m-bag m-bag-2" />
      </g>
      <g transform={`translate(640,${GROUND})`}>
        <Spaceman
          arms={
            <g transform="translate(14,-180)">
              <g className="m-shovel">
                <Arm length={84} />
                <rect x="-46" y="-6" width="300" height="12" rx="6" fill="#9a7a4c" transform="rotate(14 70 0)" />
                <path d="M238 34 L300 52 L290 110 L226 92 Z" fill="#b8bcc4" stroke="#5f636c" strokeWidth="3" />
              </g>
            </g>
          }
        />
      </g>
    </>
  );
}

function Blunt() {
  return (
    <>
      <rect x="596" y={GROUND - 74} width="124" height="96" rx="8" fill="#a97d44" stroke="#5e4324" strokeWidth="4" />
      <path d="M596 646 H720 M596 676 H720" stroke="#5e4324" strokeWidth="3" />
      <g transform={`translate(660,${GROUND + 22})`}>
        <Spaceman
          seated
          visor="m-fog"
          arms={
            <>
              <g transform="translate(14,-180)">
                <g className="m-roll-arm">
                  <Arm length={106} />
                </g>
              </g>
              <g transform="translate(116,-150)">
                <g className="m-blunt">
                  <rect x="-56" y="-9" width="112" height="18" rx="9" fill="#8a5a30" stroke="#54351a" strokeWidth="2.5" />
                  <path d="M-34 -9 L-20 9 M-4 -9 L10 9 M24 -9 L38 9" stroke="#54351a" strokeWidth="2" />
                </g>
                <g className="m-sheet">
                  <rect x="-60" y="-34" width="120" height="68" rx="4" fill="#efe6cf" stroke="#b7a884" strokeWidth="2" />
                </g>
                <circle className="m-ember" cx="58" cy="0" r="10" fill="#ff7a2e" />
                {[0, 1, 2, 3].map((i) => (
                  <g key={i} transform="translate(60,-8)">
                    <circle className={`m-puff m-puff-${i}`} r={14 + i * 3} fill="#efece4" />
                  </g>
                ))}
              </g>
            </>
          }
        />
      </g>
    </>
  );
}

function Stack() {
  return (
    <>
      <g transform={`translate(890,${GROUND + 14})`}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <g key={i} className={`m-layer m-layer-${i}`} style={{ '--up': `${-i * 20}px` } as CSSProperties}>
            <rect x="-96" y="-20" width="192" height="20" rx="3" fill={i % 2 ? '#5f9e62' : '#6fae70'} stroke="#2f6238" strokeWidth="2.5" />
            <rect x="-18" y="-20" width="36" height="20" fill="#e7dfc4" />
          </g>
        ))}
      </g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Bill key={i} x={900} y={GROUND - 120 - i * 16} className={`m-blown m-blown-${i}`} />
      ))}
      <g transform={`translate(650,${GROUND})`}>
        <Spaceman
          arms={
            <g transform="translate(14,-180)">
              <g className="m-place">
                <Arm length={132} />
                <rect x="98" y="-26" width="68" height="16" rx="3" fill="#5f9e62" stroke="#2f6238" strokeWidth="2.5" />
              </g>
            </g>
          }
        />
      </g>
    </>
  );
}

const X_BLOCKS: Array<[number, number]> = [[-150, -320], [-100, -256], [-50, -192], [0, -128], [50, -64], [100, 0], [150, 64], [150, -320], [100, -256], [50, -192], [-50, -64], [-100, 0], [-150, 64]];

function RenamePlanet() {
  return (
    <>
      <g transform={`translate(1000,${GROUND - 70})`}>
        {X_BLOCKS.map(([x, y], i) => (
          <g key={`${x}${y}`} transform={`translate(${x},${y})`}>
            <g className="m-block" style={{ animationDelay: `${i * 0.34}s` }}>
              <rect x="-30" y="-30" width="60" height="60" rx="9" fill="#d9d5cc" stroke="#6d6a66" strokeWidth="3" />
              <path d="M-16 -14 H10" stroke="#fff" strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round" />
            </g>
          </g>
        ))}
      </g>
      <g transform={`translate(560,${GROUND})`}>
        <g className="m-hop">
          <Spaceman
            arms={
              <g transform="translate(14,-180)">
                <g className="m-point">
                  <Arm length={104} />
                </g>
              </g>
            }
          />
        </g>
      </g>
    </>
  );
}

const SCENES: Record<MarsTaskId, () => ReactNode> = { dig: Dig, blunt: Blunt, stack: Stack, rename: RenamePlanet };

function MarsScene({ task }: { task: MarsTaskId }) {
  const Scene = SCENES[task];
  return (
    <svg className="mars-art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="mars-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a0d1c" />
          <stop offset="0.42" stopColor="#6d2a26" />
          <stop offset="0.78" stopColor="#d1793f" />
          <stop offset="1" stopColor="#f0b777" />
        </linearGradient>
        <linearGradient id="mars-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a84a26" />
          <stop offset="1" stopColor="#4d1c12" />
        </linearGradient>
        <linearGradient id="mars-suit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c9c3ba" />
        </linearGradient>
        <linearGradient id="mars-visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4c35a" />
          <stop offset="1" stopColor="#7a4a16" />
        </linearGradient>
        <radialGradient id="mars-earth">
          <stop offset="0" stopColor="#9fdcff" />
          <stop offset="1" stopColor="#2c6fb4" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#mars-sky)" />
      {[[120, 70], [260, 150], [430, 60], [620, 120], [810, 50], [980, 140], [1170, 60], [1500, 110], [70, 220], [720, 210]].map(([x, y]) => (
        <circle key={`${x}`} className="mars-star" cx={x} cy={y} r="2.2" fill="#fff" />
      ))}
      <circle cx="1340" cy="150" r="46" fill="#9fdcff" opacity="0.18" />
      <circle cx="1340" cy="150" r="24" fill="url(#mars-earth)" />
      <circle cx="250" cy="420" r="30" fill="#ffe9c4" opacity="0.9" />
      <circle cx="250" cy="420" r="90" fill="#ffe9c4" opacity="0.14" />
      <path d="M0 560 Q200 470 430 540 T860 520 T1300 500 T1600 540 V900 H0 Z" fill="#7d3a26" opacity="0.65" />
      <path d="M0 620 Q300 580 620 620 T1200 600 T1600 620 V900 H0 Z" fill="#8f4024" />
      <g transform={`translate(190,${GROUND - 10})`}>
        <path d="M-120 0 A120 120 0 0 1 120 0 Z" fill="#c9c5be" stroke="#6d6a66" strokeWidth="3" />
        <path d="M-120 0 A120 120 0 0 1 -60 -104 M60 -104 A120 120 0 0 1 120 0 M0 -120 V0" stroke="#6d6a66" strokeWidth="2" fill="none" />
        <rect x="-26" y="-58" width="52" height="58" rx="26" fill="#3a3436" />
      </g>
      <g transform={`translate(1420,${GROUND})`}>
        <path d="M-40 -60 V-300 Q0 -420 40 -300 V-60 Z" fill="#d7dbe2" stroke="#6d7078" strokeWidth="3" />
        <rect x="-41" y="-250" width="82" height="9" fill="#2a2d35" />
        <path d="M-40 -130 L-84 0 L-40 -40 Z M40 -130 L84 0 L40 -40 Z" fill="#2a2d35" />
        <rect x="-26" y="-60" width="52" height="60" fill="#2a2d35" />
      </g>
      <path d="M0 700 Q400 660 800 690 T1600 680 V900 H0 Z" fill="url(#mars-ground)" />
      {[[120, 790, 46], [420, 830, 30], [1240, 800, 38], [1500, 840, 54], [760, 840, 22]].map(([x, y, r]) => (
        <ellipse key={x} cx={x} cy={y} rx={r} ry={r * 0.5} fill="#3e160e" />
      ))}
      <Scene />
      {[0, 1, 2].map((i) => (
        <path key={i} className={`mars-dust mars-dust-${i}`} d="M0 780 Q200 740 460 780 T900 770" stroke="#f0b777" strokeOpacity="0.22" strokeWidth="26" fill="none" strokeLinecap="round" />
      ))}
    </svg>
  );
}

interface MarsCloseUpProps {
  from: { x: number; y: number; r: number };
  onClose: () => void;
}

export function MarsCloseUp({ from, onClose }: MarsCloseUpProps) {
  const [at, setAt] = useState(() => Math.floor(Math.random() * MARS_TASKS.length));
  const [leaving, setLeaving] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  const rested = useRef(0);
  const task = MARS_TASKS[at];

  const leave = useCallback(() => {
    setLeaving(true);
    window.setTimeout(onClose, LEAVE_MS);
  }, [onClose]);

  useEffect(() => {
    close.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leave();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [leave]);

  return createPortal(
    <div
      className={leaving ? 'mars-close is-leaving' : 'mars-close'}
      role="dialog"
      aria-modal="true"
      aria-label={`Close-up of Mars: ${task.title}`}
      style={{ '--x': `${from.x}px`, '--y': `${from.y}px`, '--r': `${from.r}px` } as CSSProperties}
      onWheel={(e) => {
        const now = performance.now();
        if (now < rested.current) return;
        rested.current = now + WHEEL_REST_MS;
        if (e.deltaY > 0) leave();
        else if (e.deltaY < 0) setAt((i) => (i + 1) % MARS_TASKS.length);
      }}
    >
      <div key={task.id} className="mars-stage">
        <MarsScene task={task.id} />
      </div>
      <div key={`${task.id}-words`} className="mars-words">
        <span className="mars-kicker">Meanwhile, on Mars</span>
        <strong>{task.title}</strong>
        <p>{task.line}</p>
      </div>
      <p className="mars-keys">Scroll up for his next job. Scroll down to leave.</p>
      <button ref={close} type="button" className="btn mars-back" onClick={leave}>
        Back to space
      </button>
    </div>,
    document.body,
  );
}

/** A mouse with its wheel rolling upward, shown beside Mars while it is pointed at. */
export function MarsHint({ x, y }: { x: number; y: number }) {
  return createPortal(
    <div className="mars-hint" style={{ left: x, top: y }}>
      <svg width="26" height="38" viewBox="0 0 26 38" aria-hidden="true">
        <rect x="1.5" y="1.5" width="23" height="35" rx="11.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect className="mars-hint-wheel" x="11" y="9" width="4" height="9" rx="2" fill="currentColor" />
      </svg>
      <span>Scroll up</span>
    </div>,
    document.body,
  );
}
