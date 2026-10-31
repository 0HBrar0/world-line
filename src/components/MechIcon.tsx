import type { Mechanism } from '../data/schema';

export type IconKind = Mechanism | 'time_leap' | 'reconnection';

// Hand-drawn 16×16 glyphs. Unicode symbols differ across fonts, so nothing here relies on them.
function Paths({ kind }: { kind: IconKind }) {
  switch (kind) {
    case 'dmail':
      return (
        <>
          <rect x="2" y="4" width="12" height="9" rx="1" fill="none" />
          <path d="M2 5 L8 9.5 L14 5" fill="none" />
        </>
      );
    case 'dmail_cancellation':
      return (
        <>
          <rect x="2" y="4" width="12" height="9" rx="1" fill="none" />
          <path d="M2 5 L8 9.5 L14 5" fill="none" />
          <path d="M1.5 14.5 L14.5 2.5" fill="none" strokeWidth="2" />
        </>
      );
    case 'time_machine':
      return (
        <>
          <circle cx="8" cy="8" r="6" fill="none" />
          <circle cx="8" cy="8" r="2.5" fill="currentColor" />
        </>
      );
    case 'time_leap':
      return <path d="M3 12 C3 5 7 3 9 3 C12 3 13 6 13 8 C13 11 10 13 8 11 C6 9 8 6 10 7" fill="none" />;
    case 'database_erasure':
      return (
        <>
          <path d="M6 3 H14 V13 H6 L2 8 Z" fill="none" />
          <path d="M8 6 L12 10 M12 6 L8 10" fill="none" />
        </>
      );
    case 'reconnection':
      return <path d="M4 3 L13 8 L4 13 Z" fill="currentColor" />;
    default:
      return <circle cx="8" cy="8" r="5" fill="none" />;
  }
}

/** For HTML contexts. */
export function MechIcon({ kind, size = 16 }: { kind: IconKind; size?: number }) {
  return (
    <svg className="mech-icon" width={size} height={size} viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <Paths kind={kind} />
    </svg>
  );
}

/** For use inside an SVG scene: positioned by the caller's transform. */
export function MechIconGroup({ kind, color, scale = 0.8 }: { kind: IconKind; color: string; scale?: number }) {
  return (
    <g transform={`scale(${scale}) translate(-8 -8)`} stroke={color} color={color} strokeWidth="1.6" aria-hidden="true">
      <Paths kind={kind} />
    </g>
  );
}
