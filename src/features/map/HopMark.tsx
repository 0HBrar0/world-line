import type { Mechanism } from '../../data/schema';

const HOLLOW: Mechanism[] = ['dmail_cancellation', 'database_erasure', 'other'];

function Shape({ mechanism }: { mechanism: Mechanism }) {
  if (mechanism === 'time_machine' || mechanism === 'other') return <rect x="-7.5" y="-7.5" width="15" height="15" />;
  if (mechanism === 'database_erasure') return <path d="M0 -9.5 L9.5 0 L0 9.5 L-9.5 0 Z" />;
  return <circle r="8.5" />;
}

/**
 * The mark on a jump between threads. The shape says how the jump was made, so the map needs only one
 * colour: a filled mark changes the past, a hollow one takes a change back or is not explained.
 */
export function HopMark({ mechanism, number }: { mechanism: Mechanism; number: number | null }) {
  return (
    <g className={HOLLOW.includes(mechanism) ? 'hop-mark is-hollow' : 'hop-mark'}>
      <Shape mechanism={mechanism} />
      {number !== null && (
        <text y="3.4" textAnchor="middle" aria-hidden="true">
          {String(number).padStart(2, '0')}
        </text>
      )}
    </g>
  );
}

/** The same mark for use in ordinary text, such as the key. */
export function HopSwatch({ mechanism }: { mechanism: Mechanism }) {
  return (
    <svg className="hop-swatch" width="20" height="20" viewBox="-10 -10 20 20" aria-hidden="true">
      <HopMark mechanism={mechanism} number={null} />
    </svg>
  );
}
