import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { motion, type TargetAndTransition } from 'framer-motion';
import { useReduceMotion } from '../../app/settings';
import { Nixie } from '../../components/Nixie';

// Props for the mechanic stage, drawn like diagrams in a lab notebook: ink lines on graph paper.
// Nothing here depicts a character or official design.
// One rule runs through every frame: ink is how things were, red is what travels or changes.
// Every frame plays once and then holds its last state, so it can be read like a diagram.

export const INK = '#141312';
export const DIM = '#8d867a';
export const RED = '#b3261a';
export const RED_SOFT = '#d98b83';
export const PAPER = '#f4f2ec';
export const SHADE = '#dedad0';
/** A quiet second tone, for the few frames that must tell two unchanged things apart. */
export const SLATE = '#3d5a73';
export const GEL = '#3f8a55';
export const OCHRE = '#b08a1e';

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
    <motion.g initial={from} animate={{ opacity: 1, x: 0, y: 0, scale: 1, scaleX: 1 }} transition={{ delay: at, duration: dur, ease: EASE }}>
      {children}
    </motion.g>
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

/**
 * Carries its children along a route of points, so a thing is seen to go somewhere instead of just
 * appearing there. The children are drawn around 0,0. With `vanish` the thing is gone at the end.
 */
export function Move({ route, at = 0, dur = 1.2, vanish = false, shrink = 1, children }: { route: Array<[number, number]>; at?: number; dur?: number; vanish?: boolean; shrink?: number; children: ReactNode }) {
  const still = useStill();
  const [endX, endY] = route[route.length - 1];
  if (still) return vanish ? null : <g transform={`translate(${endX} ${endY}) scale(${shrink})`}>{children}</g>;
  const last = route.length - 1;
  return (
    <motion.g
      initial={{ x: route[0][0], y: route[0][1], opacity: 0, scale: 1 }}
      animate={{
        x: route.map((p) => p[0]),
        y: route.map((p) => p[1]),
        opacity: route.map((_, i) => (vanish && i === last ? 0 : 1)),
        scale: route.map((_, i) => (i === last ? shrink : 1)),
      }}
      transition={{ delay: at, duration: dur, ease: 'easeInOut' }}
    >
      {children}
    </motion.g>
  );
}

export function Draw({ d, color = INK, width = 3, at = 0, dur = 0.9, dash }: { d: string; color?: string; width?: number; at?: number; dur?: number; dash?: string }) {
  const still = useStill();
  const shape = { d, fill: 'none', stroke: color, strokeWidth: width, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (still) return <path {...shape} strokeDasharray={dash} />;
  // A dashed line cannot also be drawn on by its length, so it fades in instead.
  if (dash) return <motion.path {...shape} strokeDasharray={dash} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: at, duration: 0.4 }} />;
  return <motion.path {...shape} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: at, duration: dur, ease: 'easeInOut' }} />;
}

/** A line with an arrowhead at its far end. */
export function Arrow({ from, to, color = INK, width = 3, at = 0, dur = 0.7 }: { from: [number, number]; to: [number, number]; color?: string; width?: number; at?: number; dur?: number }) {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const wing = (turn: number) => `${(to[0] - 13 * Math.cos(angle + turn)).toFixed(1)} ${(to[1] - 13 * Math.sin(angle + turn)).toFixed(1)}`;
  return <Draw d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]} M ${wing(0.5)} L ${to[0]} ${to[1]} L ${wing(-0.5)}`} color={color} width={width} at={at} dur={dur} />;
}

/** A dashed line whose dashes keep running, for a current that stays on. */
export function Flow({ d, color = RED, width = 3 }: { d: string; color?: string; width?: number }) {
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

/** Something that comes and goes, like a half-remembered dream. It holds steady when motion is off. */
export function Flicker({ children, at = 0 }: { children: ReactNode; at?: number }) {
  const still = useStill();
  if (still) return <g opacity="0.6">{children}</g>;
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 0.75, 0.3, 0.8, 0.45] }} transition={{ delay: at, duration: 2.6, repeat: Infinity, repeatType: 'mirror' }}>
      {children}
    </motion.g>
  );
}

export function StageDefs() {
  return (
    <defs>
      <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeWidth="1.4" strokeOpacity="0.5" />
      </pattern>
      <radialGradient id="fill-warm">
        <stop offset="0" stopColor={RED} stopOpacity="0.55" />
        <stop offset="1" stopColor={RED} stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

export function Label({ x, y, children, anchor = 'middle', color = INK, size = 18 }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight="400" fontFamily="var(--font-body)">
      {children}
    </text>
  );
}

/** A slip of paper that names part of the picture. */
export function Tag({ x, y, color = INK, children }: { x: number; y: number; color?: string; children: string }) {
  const width = children.length * 9.7 + 22;
  return (
    <g transform={`translate(${x - width / 2} ${y - 15})`}>
      <rect width={width} height="30" fill={PAPER} stroke={color} strokeWidth="1.5" />
      <text x={width / 2} y="21" textAnchor="middle" fill={color} fontSize="16.5" fontFamily="var(--font-body)">
        {children}
      </text>
    </g>
  );
}

export function Meter({ x = 320, y, value, size = 'md' }: { x?: number; y: number; value: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const width = 400;
  return (
    <foreignObject x={x - width / 2} y={y} width={width} height={size === 'lg' ? 84 : 52}>
      <Nixie value={value} size={size} label="" />
    </foreignObject>
  );
}

/** A meter that moves through several readings, so the change itself is seen. Holds the last one when still. */
export function MeterSeq({ values, at = 0.9, every = 1.3, ...place }: { values: Array<string | null>; at?: number; every?: number; x?: number; y: number; size?: 'sm' | 'md' | 'lg' }) {
  const still = useStill();
  const [shown, setShown] = useState(still ? values.length - 1 : 0);
  useEffect(() => {
    if (still) return;
    const timers = values.slice(1).map((_, i) => window.setTimeout(() => setShown(i + 1), (at + i * every) * 1000));
    return () => timers.forEach(window.clearTimeout);
  }, [still, values, at, every]);
  return <Meter {...place} value={values[Math.min(shown, values.length - 1)]} />;
}

/** A plain line: one stretch of history. */
export function Thread({ d, color = INK, width = 3, opacity = 1 }: { d: string; color?: string; width?: number; opacity?: number }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeOpacity={opacity} />;
}

/** Time running left to right, with the present at the right-hand end. */
export function TimeAxis({ y, ticks = 0, from = 60, to = 580 }: { y: number; ticks?: number; from?: number; to?: number }) {
  return (
    <>
      <Thread d={`M ${from} ${y} H ${to}`} color={INK} width={2.5} />
      {Array.from({ length: ticks }, (_, i) => {
        const x = to - ((to - from) * i) / Math.max(ticks - 1, 1);
        return <line key={i} x1={x} x2={x} y1={y - 9} y2={y + 9} stroke={INK} strokeWidth="2" />;
      })}
      <Label x={from} y={y + 36} color={DIM}>
        past
      </Label>
      <circle cx={to} cy={y} r="8" fill={INK} />
      <Label x={to} y={y + 36}>
        now
      </Label>
    </>
  );
}

const line = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' as const };

export function Microwave({ x, y, timer, on }: { x: number; y: number; timer?: ReactNode; on?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="190" height="118" rx="6" fill={PAPER} {...line} />
      <rect x="12" y="13" width="118" height="92" rx="3" fill={on ? PAPER : 'url(#hatch)'} stroke={on ? RED : INK} strokeWidth="2" />
      {on && <circle cx="71" cy="59" r="42" fill="url(#fill-warm)" />}
      <rect x="140" y="15" width="40" height="22" rx="2" fill={INK} />
      {timer && (
        <text x="160" y="31" textAnchor="middle" fill="#ff9a3c" fontSize="13" fontFamily="var(--font-mono)">
          {timer}
        </text>
      )}
      {[56, 78, 98].map((cy) => (
        <circle key={cy} cx="160" cy={cy} r="7" fill={PAPER} stroke={INK} strokeWidth="2" />
      ))}
    </g>
  );
}

export function Phone({ x, y, lit, scale = 1 }: { x: number; y: number; lit?: boolean; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect width="62" height="112" rx="8" fill={PAPER} stroke={lit ? RED : INK} strokeWidth="2.5" />
      <rect x="7" y="11" width="48" height="56" rx="2" fill={lit ? RED : SHADE} fillOpacity={lit ? 0.18 : 1} stroke={lit ? RED : INK} strokeWidth="1.5" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={10 + c * 15} y={73 + r * 11} width="11" height="7" rx="1.5" fill={INK} fillOpacity="0.55" />))}
    </g>
  );
}

export function Tv({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="170" height="112" rx="10" fill={PAPER} {...line} />
      <rect x="13" y="13" width="144" height="86" rx="18" fill={on ? SLATE : 'url(#hatch)'} fillOpacity={on ? 0.35 : 1} stroke={INK} strokeWidth="2" />
      {on && [30, 44, 58, 72, 86].map((ly) => <line key={ly} x1="24" x2="146" y1={ly} y2={ly} stroke={SLATE} strokeWidth="2" strokeOpacity="0.6" />)}
    </g>
  );
}

/** The ring-shaped vortex, seen a little from above. */
export function Hole({ x, y, r = 64, color = INK }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <>
      <Spin x={x} y={y}>
        <circle r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray="30 12" />
        <circle r={r * 0.72} fill="none" stroke={color} strokeWidth="2" strokeDasharray="12 10" opacity="0.6" />
      </Spin>
      <circle cx={x} cy={y} r={r * 0.42} fill={INK} />
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

/** A memory strip, like a few frames of film: ink for the old history, red for the new. */
export function Memory({ x, y, tone, width = 100 }: { x: number; y: number; tone: 'old' | 'new'; width?: number }) {
  const cell = width / 5;
  const shades = tone === 'old' ? [INK, DIM, INK, INK, DIM] : [RED, RED_SOFT, RED, RED_SOFT, RED];
  return (
    <g transform={`translate(${x - width / 2} ${y})`}>
      <rect x="-5" y="-5" width={width + 7} height="30" fill={PAPER} stroke={INK} strokeWidth="1.5" />
      {shades.map((c, i) => (
        <rect key={i} x={i * cell} width={cell - 3} height="20" fill={c} />
      ))}
    </g>
  );
}

/** A short text message. Drawn around its own middle so it can be carried along a route. */
export function Note({ x = 0, y = 0, color = RED, scale = 1 }: { x?: number; y?: number; color?: string; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-30" y="-20" width="60" height="40" fill={PAPER} stroke={color} strokeWidth="2.5" />
      <path d="M-30 -20 L0 4 L30 -20" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    </g>
  );
}

/** A block of data. */
export function Packet({ x = 0, y = 0, size, color = RED, plain = false }: { x?: number; y?: number; size: number; color?: string; plain?: boolean }) {
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2})`}>
      <rect width={size} height={size} fill={color} fillOpacity="0.16" stroke={color} strokeWidth="2.5" />
      {size > 40 && !plain && <path d={`M${size * 0.25} ${size * 0.36} H${size * 0.75} M${size * 0.25} ${size * 0.64} H${size * 0.75}`} stroke={color} strokeWidth="2.5" strokeLinecap="round" />}
    </g>
  );
}

export function Cross({ x, y, size = 15 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={size + 6} fill={PAPER} stroke={RED} strokeWidth="2" />
      <path d={`M${-size / 2} ${-size / 2} L${size / 2} ${size / 2} M${size / 2} ${-size / 2} L${-size / 2} ${size / 2}`} stroke={RED} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

/** A tied end: every thread that reaches it shares one outcome. The same mark the map uses. */
export function Knot({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={INK} />;
}

const smooth = (a: number, b: number, v: number) => {
  const k = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** Where thread `i` of a rope runs while it is still flat. */
export const ropeThread = (y: number, i: number, count: number, spread: number) => y + (i - (count - 1) / 2) * spread;

/**
 * A rope: threads that run flat, then twist together and pinch shut at `knotX`. With no knot they stay flat.
 * This is the same picture the world line map draws.
 */
export function Rope({ y, count = 6, spread = 16, from = 34, flatTo = 330, knotX, at = 0, opacity = 0.55 }: { y: number; count?: number; spread?: number; from?: number; flatTo?: number; knotX?: number; at?: number; opacity?: number }) {
  return (
    <g opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const flat = ropeThread(y, i, count, spread);
        let d = `M ${from} ${flat} H ${flatTo}`;
        if (knotX !== undefined) {
          const amp = Math.max(7, ((count - 1) * spread) / 4);
          for (let s = 1; s <= 30; s += 1) {
            const u = s / 30;
            const blend = smooth(0, 0.35, u);
            const twist = y + amp * (1 - smooth(0.7, 1, u)) * Math.sin(u * Math.PI * 3 + (i * 2 * Math.PI) / count);
            d += ` L ${(flatTo + (knotX - flatTo) * u).toFixed(1)} ${(flat * (1 - blend) + twist * blend).toFixed(1)}`;
          }
        }
        return <Draw key={i} d={d} width={2} at={at + i * 0.06} dur={1.1} />;
      })}
    </g>
  );
}

/** Drains the colour from its children and blurs them, once. */
export function Wash({ at = 0.6, children }: { at?: number; children: ReactNode }) {
  const still = useStill();
  const end = 'grayscale(1) blur(1.6px)';
  if (still) return <g style={{ filter: end }}>{children}</g>;
  return (
    <motion.g initial={{ filter: 'grayscale(0) blur(0px)' }} animate={{ filter: end }} transition={{ delay: at, duration: 1.2 }}>
      {children}
    </motion.g>
  );
}
