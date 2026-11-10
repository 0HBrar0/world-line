import { useEffect, useState } from 'react';

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

function gearPath(teeth: number, outer: number, root: number, hole: number): string {
  const points: string[] = [];
  for (let i = 0; i < teeth * 4; i += 1) {
    const angle = (i / (teeth * 4)) * Math.PI * 2;
    const r = i % 4 < 2 ? outer : root;
    points.push(`${(Math.cos(angle) * r).toFixed(1)},${(Math.sin(angle) * r).toFixed(1)}`);
  }
  return `M${points.join('L')}Z M${-hole},0a${hole},${hole} 0 1,0 ${hole * 2},0a${hole},${hole} 0 1,0 ${-hole * 2},0`;
}

/** One cog. It turns only while motion is allowed; the stylesheet decides that. */
export function Gear({ x, y, r, teeth, reverse, slow }: { x: number; y: number; r: number; teeth: number; reverse?: boolean; slow?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className={`gear-spin${reverse ? ' is-reverse' : ''}${slow ? ' is-slow' : ''}`} fillRule="evenodd" d={gearPath(teeth, r, r * 0.84, r * 0.34)} />
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
  const hour = shown ? ((shown.h % 12) + shown.m / 60) * 30 : 0;
  const minute = shown ? (shown.m + (shown.s ?? 0) / 60) * 6 : 0;
  return (
    <svg className={`gear-clock${className ? ` ${className}` : ''}`} viewBox="-100 -100 200 200" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <g className="clock-gears">
        <Gear x={-34} y={26} r={40} teeth={14} slow />
        <Gear x={36} y={-22} r={30} teeth={11} reverse />
        <Gear x={30} y={44} r={18} teeth={8} />
      </g>
      <circle className="clock-ring" r="96" />
      <circle className="clock-ring is-thin" r="68" />
      {ROMAN.map((numeral, i) => (
        <text key={numeral} className="clock-numeral" transform={`rotate(${i * 30}) translate(0 -76)`} textAnchor="middle" dominantBaseline="middle">
          {numeral}
        </text>
      ))}
      {Array.from({ length: 60 }, (_, i) => (
        <line key={i} className={i % 5 === 0 ? 'clock-tick is-hour' : 'clock-tick'} transform={`rotate(${i * 6})`} y1="-96" y2={i % 5 === 0 ? -88 : -92} />
      ))}
      {shown && (
        <g className="clock-hands">
          <line className="clock-hand is-hour" style={{ transform: `rotate(${hour}deg)` }} y1="8" y2="-42" />
          <line className="clock-hand is-minute" style={{ transform: `rotate(${minute}deg)` }} y1="10" y2="-62" />
          {shown.s !== undefined && <line className="clock-hand is-second" style={{ transform: `rotate(${shown.s * 6}deg)` }} y1="14" y2="-66" />}
          <circle className="clock-pin" r="4" />
        </g>
      )}
    </svg>
  );
}

/** The gears behind every page. Decoration only. */
export function Backdrop() {
  return (
    <svg className="backdrop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(1210 250) scale(3.1)">
        <circle className="clock-ring" r="96" />
        <circle className="clock-ring is-thin" r="68" />
        {ROMAN.map((numeral, i) => (
          <text key={numeral} className="clock-numeral" transform={`rotate(${i * 30}) translate(0 -77)`} textAnchor="middle" dominantBaseline="middle">
            {numeral}
          </text>
        ))}
        <Gear x={0} y={0} r={52} teeth={16} slow />
      </g>
      <Gear x={170} y={790} r={190} teeth={18} reverse slow />
      <Gear x={420} y={930} r={110} teeth={12} />
      <Gear x={1010} y={640} r={84} teeth={10} reverse />
    </svg>
  );
}
