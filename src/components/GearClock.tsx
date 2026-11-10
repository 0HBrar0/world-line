import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

export interface ClockTime {
  h: number;
  m: number;
  s?: number;
}

/** A sourced clock time such as "12:54". Vague times ("evening") have no hands to show. */
export function parseClockTime(time: string | null): ClockTime | null {
  const match = time?.match(/^(\d{1,2}):(\d{2})$/);
  return match ? { h: Number(match[1]), m: Number(match[2]) } : null;
}

const n1 = (value: number) => value.toFixed(1);

/**
 * Wheels move in small steps, twelve a second and all on the same beat. A turn this slow looks the same as a
 * smooth one, and a machine without a graphics card redraws the page a fifth as often.
 */
const BEAT = 12;
const beats = (seconds: number) => `steps(${Math.round(seconds * BEAT)})`;
const ring = (r: number) => `M${n1(-r)},0a${n1(r)},${n1(r)} 0 1,0 ${n1(r * 2)},0a${n1(r)},${n1(r)} 0 1,0 ${n1(-r * 2)},0`;

export interface WheelSpec {
  /** Number of teeth. Two wheels with the same tooth size mesh when their centres are a pitch apart. */
  teeth: number;
  /** Tooth size. */
  size: number;
  spokes?: number;
  /** Slanted teeth, as on the escape wheel that lets a clock tick. */
  pointed?: boolean;
}

export const pitchRadius = (w: WheelSpec) => (w.size * w.teeth) / 2;
export const wheelRadius = (w: WheelSpec) => pitchRadius(w) + w.size;

/** A clock wheel: a toothed rim, cut-out spokes and a hub, instead of a solid cog. */
export function Wheel({ teeth, size, spokes = 5, pointed = false }: WheelSpec) {
  const shape = useMemo(() => {
    const pitch = (size * teeth) / 2;
    const tip = pitch + size;
    const root = pitch - 1.25 * size;
    const profile: Array<[number, number]> = pointed
      ? [[0, root], [0.62, tip], [0.7, root]]
      : [[0.04, root], [0.2, tip], [0.42, tip], [0.58, root]];
    const points: string[] = [];
    for (let i = 0; i < teeth; i += 1) {
      for (const [at, r] of profile) {
        const angle = ((i + at) / teeth) * Math.PI * 2;
        points.push(`${n1(Math.cos(angle) * r)},${n1(Math.sin(angle) * r)}`);
      }
    }
    const rim = root - Math.max(size * 0.9, pitch * 0.07);
    const hub = Math.max(size * 1.2, pitch * 0.17);
    return { rimPath: `M${points.join('L')}Z ${ring(rim)}`, hubPath: `${ring(hub)} ${ring(hub * 0.42)}`, rim, hub, arm: Math.max(size * 0.6, pitch * 0.09) };
  }, [teeth, size, pointed]);
  return (
    <>
      <path fillRule="evenodd" d={shape.rimPath} />
      <path fillRule="evenodd" d={shape.hubPath} />
      {Array.from({ length: spokes }, (_, i) => (
        <rect key={i} x={shape.hub - 1} y={-shape.arm / 2} width={shape.rim - shape.hub + 2} height={shape.arm} transform={`rotate(${(i * 360) / spokes})`} />
      ))}
    </>
  );
}

interface GearProps extends WheelSpec {
  x: number;
  y: number;
  /** Seconds for one turn. */
  seconds: number;
  reverse?: boolean;
}

/** One wheel inside a drawing. It turns only while motion is allowed; the stylesheet decides that. */
export function Gear({ x, y, seconds, reverse, ...wheel }: GearProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="gear-spin" style={{ animationDuration: `${seconds}s`, animationTimingFunction: beats(seconds), animationDirection: reverse ? 'reverse' : 'normal' }}>
        <Wheel {...wheel} />
      </g>
    </g>
  );
}

function useNow(live: boolean): ClockTime | null {
  const [now, setNow] = useState<ClockTime | null>(null);
  useEffect(() => {
    if (!live) return;
    const read = () => {
      const d = new Date();
      setNow({ h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() });
    };
    read();
    const timer = window.setInterval(read, 1000);
    return () => window.clearInterval(timer);
  }, [live]);
  return now;
}

/** Keeps a hand turning the short way round, so 11:43 to 12:54 sweeps forward instead of back past six. */
function useSweep(angle: number): number {
  const last = useRef(angle);
  const delta = ((((angle - last.current + 180) % 360) + 360) % 360) - 180;
  last.current += delta;
  return last.current;
}

/** The dial: two rings, a minute track and tall Roman numerals. */
function Face({ r }: { r: number }) {
  return (
    <>
      <circle className="clock-ring" r={r} />
      <circle className="clock-ring is-thin" r={r * 0.93} />
      <circle className="clock-ring is-thin" r={r * 0.69} />
      <circle className="clock-ring is-mid" r={r * 0.66} />
      {ROMAN.map((numeral, i) => (
        <text key={numeral} className="clock-numeral" style={{ fontSize: r * 0.14 }} transform={`rotate(${i * 30}) translate(0 ${-r * 0.81}) scale(0.62 1.5)`} textAnchor="middle" dominantBaseline="middle">
          {numeral}
        </text>
      ))}
      {Array.from({ length: 60 }, (_, i) => (
        <line key={i} className={i % 5 === 0 ? 'clock-tick is-hour' : 'clock-tick'} transform={`rotate(${i * 6})`} y1={-r * 0.93} y2={-r * (i % 5 === 0 ? 0.985 : 0.96)} />
      ))}
    </>
  );
}

const hourHand = (r: number) => `M${-r * 0.03} ${r * 0.1} L${-r * 0.018} ${-r * 0.28} C${-r * 0.09} ${-r * 0.34} ${-r * 0.06} ${-r * 0.44} 0 ${-r * 0.52} C${r * 0.06} ${-r * 0.44} ${r * 0.09} ${-r * 0.34} ${r * 0.018} ${-r * 0.28} L${r * 0.03} ${r * 0.1}Z`;
const minuteHand = (r: number) => `M${-r * 0.02} ${r * 0.14} L${-r * 0.012} ${-r * 0.5} L${-r * 0.035} ${-r * 0.55} L0 ${-r * 0.78} L${r * 0.035} ${-r * 0.55} L${r * 0.012} ${-r * 0.5} L${r * 0.02} ${r * 0.14}Z`;

interface GearClockProps {
  /** The time to show. Null leaves the face without hands. */
  time?: ClockTime | null;
  /** Runs on the visitor's own clock instead of a given time. */
  live?: boolean;
  /** Spoken description; leave out for a purely decorative clock. */
  label?: string;
  className?: string;
}

/** A gear-backed clock face with Roman numerals, after the clocks that fill the story's title art. */
export function GearClock({ time = null, live = false, label, className }: GearClockProps) {
  const now = useNow(live);
  const shown = live ? now : time;
  const hour = useSweep(shown ? ((shown.h % 12) + shown.m / 60) * 30 : 0);
  const minute = useSweep(shown ? (shown.m + (shown.s ?? 0) / 60) * 6 : 0);
  const second = useSweep((shown?.s ?? 0) * 6);
  return (
    <svg className={`gear-clock${className ? ` ${className}` : ''}`} viewBox="-100 -100 200 200" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <g className="clock-gears">
        <Gear x={-26} y={22} teeth={22} size={3.4} spokes={5} seconds={120} />
        <Gear x={27.4} y={-12.6} teeth={12} size={3.4} spokes={4} seconds={65.5} reverse />
        <Gear x={18} y={40} teeth={10} size={2.6} spokes={3} seconds={40} />
      </g>
      <Face r={96} />
      {shown && (
        <g className="clock-hands">
          <path className="clock-hand is-hour" style={{ transform: `rotate(${hour}deg)` }} d={hourHand(96)} />
          <path className="clock-hand is-minute" style={{ transform: `rotate(${minute}deg)` }} d={minuteHand(96)} />
          {shown.s !== undefined && <line className="clock-hand is-second" style={{ transform: `rotate(${second}deg)` }} y1="16" y2="-80" />}
          <circle className="clock-pin" r="4" />
        </g>
      )}
    </svg>
  );
}

interface Placed extends WheelSpec {
  x: number;
  y: number;
  seconds: number;
  reverse: boolean;
  tone: 1 | 2;
}

/** Lays out a gear train: each wheel sits a pitch away from the one that drives it and turns the other way, in ratio. */
function train(tone: 1 | 2, seconds: number, x: number, y: number, wheels: Array<WheelSpec & { at?: number }>): Placed[] {
  const first = wheels[0];
  let reverse = false;
  return wheels.map((wheel, i) => {
    if (i > 0) {
      const angle = ((wheel.at ?? 0) * Math.PI) / 180;
      const reach = pitchRadius(wheels[i - 1]) + pitchRadius(wheel);
      x += Math.cos(angle) * reach;
      y += Math.sin(angle) * reach;
      reverse = !reverse;
    }
    return { ...wheel, x, y, reverse, tone, seconds: Math.round((seconds * wheel.teeth) / first.teeth) };
  });
}

const ART = { w: 1440, h: 810 };
const DIAL = { x: 1130, y: 400, r: 330 };
const ESCAPE: WheelSpec = { teeth: 30, size: 7, spokes: 5, pointed: true };
const WHEELS: Placed[] = [
  ...train(1, 220, 150, 700, [
    { teeth: 54, size: 9, spokes: 6 },
    { teeth: 20, size: 9, spokes: 4, at: -38 },
    { teeth: 30, size: 9, spokes: 5, at: -8 },
    { teeth: 14, size: 9, spokes: 3, at: -70 },
  ]),
  ...train(2, 150, 640, -40, [
    { teeth: 40, size: 7, spokes: 5 },
    { teeth: 16, size: 7, spokes: 4, at: 28 },
  ]),
  ...train(1, 110, 1390, 760, [
    { teeth: 26, size: 8, spokes: 5 },
    { teeth: 12, size: 8, spokes: 3, at: 205 },
  ]),
];

function box(x: number, y: number, r: number): CSSProperties {
  return { left: x - r, top: y - r, width: r * 2, height: r * 2 };
}

/**
 * The clockwork behind every page. Each wheel is its own small picture, so the browser only has to turn
 * it, never redraw it. The dial keeps the visitor's own time. Decoration only.
 */
export function Backdrop() {
  const art = useRef<HTMLDivElement>(null);
  const [start] = useState(() => {
    const d = new Date();
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  });

  useEffect(() => {
    const fit = () => art.current?.style.setProperty('--bd-scale', String(Math.max(window.innerWidth / ART.w, window.innerHeight / ART.h)));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // A hand that is not allowed to move still points at the right time.
  const hand = (className: string, period: number, shape: JSX.Element, steps?: number) => (
    <svg
      className={`bd-wheel bd-clock gear-spin ${className}`}
      viewBox={`${-DIAL.r} ${-DIAL.r} ${DIAL.r * 2} ${DIAL.r * 2}`}
      style={{
        ...box(DIAL.x, DIAL.y, DIAL.r),
        transform: `rotate(${((start % period) / period) * 360}deg)`,
        animationDuration: `${period}s`,
        animationDelay: `${-(start % period)}s`,
        animationTimingFunction: `steps(${steps ?? Math.round(period / 5)})`,
      }}
    >
      {shape}
    </svg>
  );

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-art" ref={art}>
        {WHEELS.map((w, i) => {
          const r = wheelRadius(w) + 1;
          return (
            <svg
              key={i}
              className={`bd-wheel gear-spin bd-tone-${w.tone}`}
              viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`}
              style={{ ...box(w.x, w.y, r), animationDuration: `${w.seconds}s`, animationTimingFunction: beats(w.seconds), animationDirection: w.reverse ? 'reverse' : 'normal' }}
            >
              <Wheel {...w} />
            </svg>
          );
        })}
        <svg className="bd-wheel bd-clock bd-dial" viewBox={`${-DIAL.r} ${-DIAL.r} ${DIAL.r * 2} ${DIAL.r * 2}`} style={box(DIAL.x, DIAL.y, DIAL.r)}>
          <Face r={DIAL.r - 4} />
        </svg>
        <svg
          className="bd-wheel bd-clock gear-spin bd-tone-2"
          viewBox={`${-wheelRadius(ESCAPE) - 1} ${-wheelRadius(ESCAPE) - 1} ${wheelRadius(ESCAPE) * 2 + 2} ${wheelRadius(ESCAPE) * 2 + 2}`}
          style={{ ...box(DIAL.x, DIAL.y, wheelRadius(ESCAPE) + 1), animationDuration: '30s', animationTimingFunction: 'steps(30)' }}
        >
          <Wheel {...ESCAPE} />
        </svg>
        {hand('bd-dial', 43200, <path d={hourHand(DIAL.r)} />)}
        {hand('bd-dial', 3600, <path d={minuteHand(DIAL.r)} />)}
        {hand(
          'bd-second',
          60,
          <>
            <rect x="-1.2" y={-DIAL.r * 0.84} width="2.4" height={DIAL.r * 1.04} />
            <circle cy={DIAL.r * 0.14} r="6" />
          </>,
          60,
        )}
      </div>
    </div>
  );
}
