import type { ReactNode } from 'react';
import { motion, type TargetAndTransition, type Transition } from 'framer-motion';
import { Nixie } from '../../components/Nixie';

// Original abstract props for the mechanic stage. Nothing here depicts a character or official design.

export const INK = '#a9b4bf';
export const NIXIE = '#ff8a1f';
export const GEL = '#7fd1ae';
export const PINK = '#cc79a7';
export const GOLD = '#e6c84a';
export const SKY = '#56b4e9';

export interface SceneProps {
  reduce: boolean;
}

/** Spreads motion props only when motion is allowed, so reduced motion renders a still frame. */
export function moving(reduce: boolean, animate: TargetAndTransition, transition?: Transition, initial?: TargetAndTransition) {
  return reduce ? {} : { initial, animate, transition };
}

export const LOOP = (duration: number): Transition => ({ duration, repeat: Infinity, ease: 'linear' });

export function Label({ x, y, children, anchor = 'middle', color = INK, size = 15 }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontFamily="var(--font-body)">
      {children}
    </text>
  );
}

export function Meter({ x, y, value, width = 240 }: { x: number; y: number; value: string | null; width?: number }) {
  return (
    <foreignObject x={x} y={y} width={width} height="44">
      <Nixie value={value} size="md" label="" />
    </foreignObject>
  );
}

export function Microwave({ x, y, timer }: { x: number; y: number; timer?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="140" height="88" rx="6" fill="#1a2027" stroke={INK} strokeWidth="2" />
      <rect x="10" y="10" width="88" height="68" rx="3" fill="#0b0d10" stroke={INK} />
      <rect x="106" y="12" width="26" height="14" fill="#0b0d10" stroke={NIXIE} />
      {timer && (
        <text x="119" y="23" textAnchor="middle" fill={NIXIE} fontSize="10" fontFamily="var(--font-mono)">
          {timer}
        </text>
      )}
      {[34, 48, 62].map((cy) => (
        <circle key={cy} cx="119" cy={cy} r="4" fill="none" stroke={INK} />
      ))}
    </g>
  );
}

export function Phone({ x, y, lit, reduce }: { x: number; y: number; lit?: boolean; reduce: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.g {...moving(reduce || !lit, { rotate: [0, -4, 4, 0] }, { duration: 0.5, repeat: Infinity, repeatDelay: 1 })}>
      <rect width="42" height="72" rx="6" fill="#1a2027" stroke={lit ? NIXIE : INK} strokeWidth="2" />
      <rect x="6" y="8" width="30" height="42" fill="#0b0d10" />
      <circle cx="21" cy="60" r="5" fill="none" stroke={INK} />
      </motion.g>
    </g>
  );
}

export function Crt({ x, y, on, reduce }: { x: number; y: number; on: boolean; reduce: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="130" height="86" rx="10" fill="#1a2027" stroke={INK} strokeWidth="2" />
      <motion.rect x="12" y="10" width="106" height="66" rx="14" fill={on ? '#36506a' : '#0b0d10'} {...moving(reduce || !on, { opacity: [0.7, 1, 0.7] }, { duration: 2, repeat: Infinity })} />
    </g>
  );
}

/** The ring-shaped vortex. */
export function Ring({ x, y, r = 34, color = NIXIE, reduce }: { x: number; y: number; r?: number; color?: string; reduce: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.g {...moving(reduce, { rotate: 360 }, LOOP(4))}>
        <ellipse rx={r} ry={r * 0.42} fill="none" stroke={color} strokeWidth="5" strokeDasharray="14 6" />
      </motion.g>
      <circle r={r * 0.2} fill="#0b0d10" stroke={color} />
    </g>
  );
}

export function Figure({ x, y, color = INK, opacity = 1 }: { x: number; y: number; color?: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <circle cx="0" cy="-34" r="13" fill="#12161b" stroke={color} strokeWidth="2.5" />
      <path d="M-20 22 C-20 -8 -10 -18 0 -18 C10 -18 20 -8 20 22 Z" fill="#12161b" stroke={color} strokeWidth="2.5" />
    </g>
  );
}

/** A memory strip: coloured frames standing for what a person remembers. */
export function Tape({ x, y, colors, width = 120 }: { x: number; y: number; colors: string[]; width?: number }) {
  const cell = width / colors.length;
  return (
    <g transform={`translate(${x} ${y})`}>
      {colors.map((c, i) => (
        <rect key={i} x={i * cell} width={cell - 2} height="16" fill={c} rx="2" />
      ))}
    </g>
  );
}

export function DayTiles({ x, y, count, lit, labels }: { x: number; y: number; count: number; lit: number[]; labels?: string[] }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: count }, (_, i) => (
        <g key={i} transform={`translate(${i * 52} 0)`}>
          <rect width="48" height="40" rx="4" fill={lit.includes(i) ? '#3a2a18' : '#1a2027'} stroke={lit.includes(i) ? NIXIE : '#4a5763'} />
          {labels?.[i] && (
            <text x="24" y="25" textAnchor="middle" fill={INK} fontSize="11" fontFamily="var(--font-mono)">
              {labels[i]}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

export function Packet({ x, y, color = NIXIE, size = 18 }: { x: number; y: number; color?: string; size?: number }) {
  return <rect x={x - size / 2} y={y - size / 2} width={size} height={size} rx="3" fill={color} />;
}

export function Crossed({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {children}
      <path d="M-34 -34 L34 34" stroke="#ff5a6e" strokeWidth="4" />
    </g>
  );
}

export function Rope({ y, color, reduce, offset = 0 }: { y: number; color: string; reduce: boolean; offset?: number }) {
  return (
    <>
      {[-8, 0, 8].map((d, i) => (
        <motion.path
          key={d}
          d={`M 40 ${y + d} C 180 ${y - d * 2}, 320 ${y + d * 2}, 470 ${y + offset}`}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          {...moving(reduce, { pathLength: 1 }, { duration: 1, delay: i * 0.04 }, { pathLength: 0 })}
        />
      ))}
    </>
  );
}

export function Knot({ x, y, color, label }: { x: number; y: number; color: string; label?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="24" fill="#12161b" stroke={color} strokeWidth="4" />
      <path d="M-11 -11 C 11 -2, -11 2, 11 11 M 11 -11 C -11 -2, 11 2, -11 11" fill="none" stroke={color} strokeWidth="3" />
      {label && (
        <text x="36" y="6" fill={color} fontSize="16" fontFamily="var(--font-display)" fontWeight="700">
          {label}
        </text>
      )}
    </g>
  );
}
