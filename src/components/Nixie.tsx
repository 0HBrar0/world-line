import { useEffect, useRef, useState } from 'react';
import { useReduceMotion } from '../app/settings';

const TUBES = 8;

/** Lays a value out over eight tubes: [d][.][d][d][d][d][d][d]. A negative value blanks the first tube. */
export function tubesFor(value: string | null): string[] {
  if (value === null) return ['-', '.', '-', '-', '-', '-', '-', '-'];
  const negative = value.startsWith('-');
  // A negative value drops its sign: the meter leaves the first tube blank instead.
  const digits = (negative ? value.slice(1) : value).padEnd(TUBES, '0').slice(0, TUBES).split('');
  if (negative) digits[0] = ' ';
  return digits;
}

interface NixieProps {
  value: string | null;
  size?: 'sm' | 'md' | 'lg';
  /** Spoken text for assistive tech; the tubes themselves are decorative. */
  label?: string;
}

/** The global readout and the mechanic-player meter are this one component. */
export function Nixie({ value, size = 'md', label }: NixieProps) {
  const reduce = useReduceMotion();
  const target = tubesFor(value);
  const [shown, setShown] = useState(target);
  const timers = useRef<number[]>([]);
  const key = target.join('|');

  useEffect(() => {
    const finalTubes = key.split('|');
    const pending = timers;
    pending.current.forEach(window.clearTimeout);
    pending.current = [];
    if (reduce) {
      setShown(finalTubes);
      return;
    }
    const start = performance.now();
    const roll = () => {
      const elapsed = performance.now() - start;
      let busy = false;
      setShown(
        finalTubes.map((digit, i) => {
          if (digit === '.' || digit === ' ' || digit === '-') return digit;
          if (elapsed > 80 + i * 70) return digit;
          busy = true;
          return String(Math.floor(Math.random() * 10));
        }),
      );
      if (busy) pending.current.push(window.setTimeout(roll, 45));
    };
    roll();
    return () => pending.current.forEach(window.clearTimeout);
  }, [key, reduce]);

  return (
    <span className={`nixie nixie-${size}`} role="img" aria-label={label ?? (value ? `Divergence ${value}` : 'No world line in focus')}>
      {shown.map((digit, i) => (
        <span key={i} className={digit === '.' ? 'tube tube-dot' : 'tube'} aria-hidden="true">
          <span className="tube-digit">{digit}</span>
        </span>
      ))}
    </span>
  );
}
