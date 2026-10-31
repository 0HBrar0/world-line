import { createContext, useContext, type ReactNode } from 'react';
import { motion, type TargetAndTransition } from 'framer-motion';
import { useReduceMotion } from '../../app/settings';
import { Nixie } from '../../components/Nixie';

// Original props for the mechanic stage. Nothing here depicts a character or official design.
// Every frame plays once and then holds its last state, so it can be read like a diagram.

export const INK = '#c4cbe0';
export const DIM = '#5d6688';
export const NIXIE = '#ff9a3c';
export const GEL = '#7fd1ae';
export const PINK = '#e58ac0';
export const GOLD = '#f0d264';
export const SKY = '#6cc4f5';
export const VIOLET = '#b79cff';
export const DANGER = '#ff6b7e';

export const STAGE = { width: 640, height: 360 };
const EASE = [0.2, 0, 0, 1] as const;

/** Freezes a frame on its last state, for previews on the index tiles. */
export const StillScene = createContext(false);

function useStill() {
  const reduce = useReduceMotion();
  return useContext(StillScene) || reduce;
}

interface BeatProps {
  /** Seconds after the frame opens. */
  at?: number;
  dur?: number;
  from?: TargetAndTransition;
  children: ReactNode;
}

/** Brings its children in once; with reduced motion they simply stand in their final place. */
export function Beat({ at = 0, dur = 0.5, from = { opacity: 0, y: 8 }, children }: BeatProps) {
  const still = useStill();
  if (still) return <g>{children}</g>;
  return (
    <motion.g initial={from} animate={{ opacity: 1, x: 0, y: 0, scale: 1 }} transition={{ delay: at, duration: dur, ease: EASE }}>
      {children}
    </motion.g>
  );
}

/** Children drawn at their destination, arriving from dx, dy away. */
export function Fly({ at = 0, dur = 1.1, dx = 0, dy = 0, children }: { at?: number; dur?: number; dx?: number; dy?: number; children: ReactNode }) {
  return (
    <Beat at={at} dur={dur} from={{ opacity: 0.2, x: dx, y: dy }}>
      {children}
    </Beat>
  );
}

/** Fades its children down to `to` once. */
export function Fade({ at = 0, to = 0, children }: { at?: number; to?: number; children: ReactNode }) {
  const still = useStill();
  if (still) return <g opacity={to}>{children}</g>;
  return (
    <motion.g initial={{ opacity: 1 }} animate={{ opacity: to }} transition={{ delay: at, duration: 0.6 }}>
      {children}
    </motion.g>
  );
}

export function Draw({ d, color = NIXIE, width = 3, at = 0, dur = 0.9 }: { d: string; color?: string; width?: number; at?: number; dur?: number }) {
  const still = useStill();
  const shape = { d, fill: 'none', stroke: color, strokeWidth: width, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (still) return <path {...shape} />;
  return <motion.path {...shape} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: at, duration: dur, ease: 'easeInOut' }} />;
}

/** A dashed line whose dashes keep running, for a current that stays on. */
export function Flow({ d, color = NIXIE, width = 3 }: { d: string; color?: string; width?: number }) {
  const still = useStill();
  const shape = { d, fill: 'none', stroke: color, strokeWidth: width, strokeDasharray: '7 7', strokeLinecap: 'round' as const };
  if (still) return <path {...shape} />;
  return <motion.path {...shape} animate={{ strokeDashoffset: -28 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />;
}

export function Spin({ x, y, dur = 5, children }: { x: number; y: number; dur?: number; children: ReactNode }) {
  const still = useStill();
  return (
    <g transform={`translate(${x} ${y})`}>
      {still ? children : (
        <motion.g animate={{ rotate: 360 }} transition={{ duration: dur, repeat: Infinity, ease: 'linear' }}>
          {children}
        </motion.g>
      )}
    </g>
  );
}

export function StageDefs() {
  return (
    <defs>
      <linearGradient id="fill-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#343b5e" />
        <stop offset="1" stopColor="#1a1e36" />
      </linearGradient>
      <linearGradient id="fill-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#10142a" />
        <stop offset="1" stopColor="#1e2546" />
      </linearGradient>
      <radialGradient id="fill-warm">
        <stop offset="0" stopColor="#ff9a3c" stopOpacity="0.5" />
        <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

export function Label({ x, y, children, anchor = 'middle', color = INK, size = 19 }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight="500" fontFamily="var(--font-body)">
      {children}
    </text>
  );
}

/** A pill that names part of the picture. */
export function Tag({ x, y, color = INK, children }: { x: number; y: number; color?: string; children: string }) {
  const width = children.length * 10 + 26;
  return (
    <g transform={`translate(${x - width / 2} ${y - 16})`}>
      <rect width={width} height="32" rx="16" fill={color} fillOpacity="0.14" stroke={color} strokeOpacity="0.5" />
      <text x={width / 2} y="22" textAnchor="middle" fill={color} fontSize="18" fontWeight="500" fontFamily="var(--font-body)">
        {children}
      </text>
    </g>
  );
}

export function Meter({ x = 320, y, value, size = 'md' }: { x?: number; y: number; value: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const width = 400;
  return (
    <foreignObject x={x - width / 2} y={y} width={width} height={size === 'lg' ? 72 : 44}>
      <Nixie value={value} size={size} label="" />
    </foreignObject>
  );
}

/** A glowing line: the app's picture of a stretch of history. */
export function Thread({ d, color = INK, width = 3 }: { d: string; color?: string; width?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={color} strokeWidth={width * 3.4} strokeOpacity="0.14" strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
    </>
  );
}

/** Time running left to right, with the present at the right-hand end. */
export function TimeAxis({ y, ticks = 0, from = 60, to = 580 }: { y: number; ticks?: number; from?: number; to?: number }) {
  return (
    <>
      <Thread d={`M ${from} ${y} H ${to}`} color={DIM} />
      {Array.from({ length: ticks }, (_, i) => {
        const x = to - ((to - from) * i) / Math.max(ticks - 1, 1);
        return <line key={i} x1={x} x2={x} y1={y - 8} y2={y + 8} stroke={DIM} strokeWidth="2" />;
      })}
      <Label x={from} y={y + 34} color={INK}>
        past
      </Label>
      <circle cx={to} cy={y} r="8" fill={NIXIE} />
      <Label x={to} y={y + 34} color={NIXIE}>
        now
      </Label>
    </>
  );
}

export function Microwave({ x, y, timer, on }: { x: number; y: number; timer?: ReactNode; on?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="190" height="118" rx="14" fill="url(#fill-body)" stroke={INK} strokeOpacity="0.4" />
      <rect x="12" y="13" width="118" height="92" rx="8" fill={on ? '#3b2410' : 'url(#fill-glass)'} stroke={on ? NIXIE : INK} strokeOpacity={on ? 1 : 0.35} />
      {on && <circle cx="71" cy="59" r="40" fill="url(#fill-warm)" />}
      <rect x="140" y="15" width="40" height="22" rx="5" fill="#0a0c18" />
      {timer && (
        <text x="160" y="31" textAnchor="middle" fill={NIXIE} fontSize="13" fontFamily="var(--font-mono)">
          {timer}
        </text>
      )}
      {[56, 78, 98].map((cy) => (
        <circle key={cy} cx="160" cy={cy} r="7" fill="#0a0c18" stroke={INK} strokeOpacity="0.4" />
      ))}
    </g>
  );
}

export function Phone({ x, y, lit, scale = 1 }: { x: number; y: number; lit?: boolean; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect width="62" height="112" rx="12" fill="url(#fill-body)" stroke={lit ? NIXIE : INK} strokeOpacity={lit ? 1 : 0.4} strokeWidth="2" />
      <rect x="7" y="11" width="48" height="76" rx="4" fill={lit ? '#3b2410' : 'url(#fill-glass)'} />
      <circle cx="31" cy="99" r="6" fill="#0a0c18" />
      {lit && <circle cx="31" cy="49" r="14" fill={NIXIE} opacity="0.75" />}
    </g>
  );
}

export function Tv({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="170" height="112" rx="16" fill="url(#fill-body)" stroke={INK} strokeOpacity="0.4" />
      <rect x="13" y="13" width="144" height="86" rx="20" fill={on ? '#3d6e96' : 'url(#fill-glass)'} />
      {on && <rect x="13" y="13" width="144" height="86" rx="20" fill={SKY} opacity="0.2" />}
    </g>
  );
}

/** The ring-shaped vortex, seen a little from above. */
export function Hole({ x, y, r = 64, color = NIXIE }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx={r * 1.25} ry={r * 0.82} fill={color} opacity="0.08" />
      <Spin x={x} y={y}>
        <ellipse rx={r} ry={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray="30 12" opacity="0.9" />
        <ellipse rx={r * 0.72} ry={r * 0.72} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="12 10" opacity="0.6" />
      </Spin>
      <circle cx={x} cy={y} r={r * 0.42} fill="#04050c" stroke={color} strokeWidth="2" />
    </>
  );
}

export function Person({ x, y, color = INK, scale = 1, opacity = 1 }: { x: number; y: number; color?: string; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <circle cy="-40" r="21" fill={color} />
      <path d="M-36 34 C-36 -4 -18 -12 0 -12 C18 -12 36 -4 36 34 Z" fill={color} />
    </g>
  );
}

/** A memory strip: coloured frames standing for what a person remembers. */
export const MEMORY_OLD = [NIXIE, GOLD, NIXIE, NIXIE, GOLD];
export const MEMORY_NEW = [SKY, GEL, SKY, VIOLET, SKY];

export function Memory({ x, y, colors, width = 100 }: { x: number; y: number; colors: string[]; width?: number }) {
  const cell = width / colors.length;
  return (
    <g transform={`translate(${x - width / 2} ${y})`}>
      <rect x="-5" y="-5" width={width + 8} height="30" rx="7" fill="#0a0c18" />
      {colors.map((c, i) => (
        <rect key={i} x={i * cell} width={cell - 3} height="20" rx="3" fill={c} />
      ))}
    </g>
  );
}

/** A short text message. */
export function Note({ x, y, color = NIXIE, scale = 1 }: { x: number; y: number; color?: string; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-27 -19 H27 a7 7 0 0 1 7 7 V10 a7 7 0 0 1 -7 7 H-8 L-19 28 V17 H-27 a7 7 0 0 1 -7 -7 V-12 a7 7 0 0 1 7 -7 Z" fill={color} />
      <path d="M-22 -6 H22 M-22 5 H8" stroke="#1c1006" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  );
}

export function Cross({ x, y, size = 15 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={size + 7} fill={DANGER} fillOpacity="0.16" />
      <path d={`M${-size / 2} ${-size / 2} L${size / 2} ${size / 2} M${size / 2} ${-size / 2} L${-size / 2} ${size / 2}`} stroke={DANGER} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

/** A tied end: every strand that reaches it shares one outcome. */
export function Knot({ x, y, color, r = 26 }: { x: number; y: number; color: string; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 12} fill={color} opacity="0.12" />
      <circle r={r} fill="#0a0c18" stroke={color} strokeWidth="4" />
      <path d="M-12 -12 C 12 -2, -12 2, 12 12 M 12 -12 C -12 -2, 12 2, -12 12" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    </g>
  );
}

/** Strands drawn in from the left, gathering into one bundle. */
export function Bundle({ y, color, end = 490, count = 9, spread = 15, at = 0 }: { y: number; color: string; end?: number; count?: number; spread?: number; at?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const off = i - (count - 1) / 2;
        return <Draw key={i} d={`M 34 ${y + off * spread} C 190 ${y + off * spread}, 280 ${y + off * 2}, ${end} ${y + off * 0.8}`} color={color} width={2} at={at + i * 0.05} dur={1.1} />;
      })}
    </>
  );
}
